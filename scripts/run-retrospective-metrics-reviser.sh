#!/usr/bin/env bash
set -uo pipefail

ROOT="${ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
RUN_ID="${RUN_ID:-2026-07-19-v140-v150}"
RUN_ROOT="$ROOT/retrospectives/runs/$RUN_ID"
MODEL="${MODEL:-zai/glm-5.2}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-900}"
REVISION_DATE="${REVISION_DATE:-$(date -u +%Y-%m-%d)}"
ARCHIVE="$RUN_ROOT/revisions/$REVISION_DATE-pre-metrics"
mkdir -p "$ARCHIVE" "$RUN_ROOT/worker/metrics-revision-status" "$RUN_ROOT/worker/logs" "$RUN_ROOT/worker/tmp"

if [ "$#" -eq 0 ]; then
  echo "usage: $0 FEATURE_ID..." >&2
  exit 2
fi

write_status() {
  local id="$1" status="$2" attempt="$3" message="$4"
  local tmp="$RUN_ROOT/worker/metrics-revision-status/$id.json.tmp-$$"
  python - "$id" "$status" "$attempt" "$message" > "$tmp" <<'PY'
import json,sys,datetime
print(json.dumps({"featureId":int(sys.argv[1]),"status":sys.argv[2],"attempt":int(sys.argv[3]),"message":sys.argv[4],"updatedAt":datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2))
PY
  mv "$tmp" "$RUN_ROOT/worker/metrics-revision-status/$id.json"
}

for id in "$@"; do
  report="$RUN_ROOT/reports/$id.json"
  metrics="$RUN_ROOT/evidence/metrics/features/$id.json"
  archived="$ARCHIVE/$id.json"
  if [ ! -s "$report" ]; then write_status "$id" blocked 0 "missing existing report"; continue; fi
  if [ ! -s "$metrics" ]; then write_status "$id" blocked 0 "missing metrics evidence"; continue; fi
  mapping_status="$(python - "$metrics" <<'PY'
import json,sys
print(json.load(open(sys.argv[1]))['mappingStatus'])
PY
)"
  if [ "$mapping_status" = "no-public-counter-mapped" ]; then
    write_status "$id" needs-mapping 0 "no mapped public counter; requires mapping research"
    echo "[$id] needs mapping research"
    continue
  fi
  if [ ! -s "$archived" ]; then cp "$report" "$archived"; fi

  success=0
  for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
    prompt="$RUN_ROOT/worker/tmp/$id.metrics-revision.prompt.txt"
    raw="$RUN_ROOT/worker/tmp/$id.metrics-revision.attempt-$attempt.raw.txt"
    normalized="$RUN_ROOT/worker/tmp/$id.metrics-revision.attempt-$attempt.json"
    log="$RUN_ROOT/worker/logs/$id.metrics-revision.attempt-$attempt.log"
    cat > "$prompt" <<EOF
Revise one existing Chrome launch retrospective using newly cached first-party Chrome usage telemetry.

Feature ID: $id
Existing report (read-only input): $archived
Current report schema: $ROOT/retrospectives/report.schema.json
Cached metrics evidence: $metrics
Metrics method: $ROOT/modules/launch-retrospective.md

Requirements:
- Read the archived report, metrics evidence, schema and method. Return a complete replacement report, not a patch.
- Preserve every non-metrics finding and citation unless the metrics directly contradict it. Do not weaken evidence gaps unrelated to usage.
- Add one usage source for each materially used ChromeStatus timeline URL. Give each a new unique source ID, retrieval/observation date from the evidence, supported claim, and limitations.
- Update adoption-phase and adoption-outcome findings/evidence IDs/limitations using exact observed percentages and launch-relative checkpoints where available.
- Preserve metric scope: exact, broader WebDX/property family, origin-trial, or multiple. A family/property/trial counter is not exact feature adoption.
- Interpret values only as the share of measured Chrome HTTP/HTTPS page loads where a counter fired. Do not call them unique developers, sites, users, successful tasks, satisfaction, production deployment, or end-user benefit.
- Low usage is not automatically failure; high usage is not automatically success. Compare against stated launch expectations/targets if the report has them. If there is no predeclared target and no corroborating production/retention evidence, keep the adoption outcome unscored and describe the measured level/trend; do not use mixed as a substitute for an absent threshold.
- Remove missing-evidence claims that say no Chrome usage telemetry exists when the cached evidence provides it. Retain narrower gaps such as no unique-site, production, retention, task-success, user-benefit, or target evidence.
- Update successes, failures, counterfactuals and skillImprovements only when the telemetry materially changes them.
- Later telemetry informs outcomes only; never use it as if known during intake/review/ship decisions.
- Keep completion honest. Return ONLY one JSON object conforming to the existing schema, without Markdown.
EOF
    write_status "$id" active "$attempt" "revising report with Chrome usage metrics"
    echo "[$id] metrics revision attempt $attempt"
    if timeout "$TIMEOUT_SECONDS" pi -p --no-session --no-context-files --no-extensions \
      --model "$MODEL" --thinking high --tools read --skill "$ROOT" "$(cat "$prompt")" > "$raw" 2> "$log"; then
      if python - "$id" "$raw" "$normalized" <<'PY'
import json,sys
expected=int(sys.argv[1]); raw=open(sys.argv[2]).read(); start=raw.find('{'); end=raw.rfind('}')
if start<0 or end<start: raise SystemExit('no JSON object')
data=json.loads(raw[start:end+1])
phases=['intake','incubation','prototype','developerTrials','wideReview','experiment','prepareToShip','release','adoption','support','deprecation']
outcomes=['developerValue','endUserImpact','adoption','interoperability','implementationQuality','evidenceAndCommunication','support','overall']
assert data.get('schemaVersion')==1 and data.get('feature',{}).get('id')==expected
assert all(k in data.get('phaseReview',{}) for k in phases)
assert all(k in data.get('outcomes',{}) for k in outcomes)
assert data.get('completion',{}).get('status') in ['complete','partial','blocked']
assert any(s.get('sourceType')=='usage' and 'chromestatus.com' in s.get('url','') for s in data.get('sources',[]))
open(sys.argv[3],'w').write(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
PY
      then
        mv "$normalized" "$report"
        write_status "$id" complete "$attempt" "report revised with cached Chrome usage metrics"
        echo "[$id] metrics revision complete"
        success=1
        break
      fi
    fi
    write_status "$id" failed-retryable "$attempt" "metrics revision failed"
  done
  if [ "$success" -eq 0 ]; then
    write_status "$id" blocked "$MAX_ATTEMPTS" "all metrics revision attempts failed; archived report preserved"
  fi
done
