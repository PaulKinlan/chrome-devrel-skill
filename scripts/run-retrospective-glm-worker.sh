#!/usr/bin/env bash
set -uo pipefail

ROOT="${ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
RUN_ID="${RUN_ID:-2026-07-19-v140-v150}"
RUN_ROOT="$ROOT/retrospectives/runs/$RUN_ID"
MODEL="${MODEL:-zai/glm-5.2}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-1500}"
PI_AGENT_DIR="${PI_CODING_AGENT_DIR:-${PI_AGENT_DIR:-$HOME/.pi/agent}}"
MCP_ADAPTER="${MCP_ADAPTER:-$PI_AGENT_DIR/npm/node_modules/pi-mcp-adapter/index.ts}"
mkdir -p "$RUN_ROOT/reports" "$RUN_ROOT/worker/logs" "$RUN_ROOT/worker/status" "$RUN_ROOT/worker/tmp"

# The default MCP config is generated per run and contains endpoints plus an env-var
# reference only—never credentials. Set MCP_CONFIG to use a team-managed config instead.
if [ -z "${MCP_CONFIG:-}" ]; then
  MCP_CONFIG="$RUN_ROOT/worker/tmp/zai-retrospective-mcp.json"
  cat > "$MCP_CONFIG" <<'JSON'
{
  "mcpServers": {
    "zai-web-search": {
      "url": "https://api.z.ai/api/mcp/web_search_prime/mcp",
      "auth": "bearer",
      "bearerTokenEnv": "ZAI_API_KEY",
      "lifecycle": "lazy",
      "requestTimeoutMs": 90000,
      "directTools": false
    },
    "zai-web-reader": {
      "url": "https://api.z.ai/api/mcp/web_reader/mcp",
      "auth": "bearer",
      "bearerTokenEnv": "ZAI_API_KEY",
      "lifecycle": "lazy",
      "requestTimeoutMs": 90000,
      "directTools": false
    }
  }
}
JSON
  chmod 600 "$MCP_CONFIG"
fi

# Prefer an explicitly supplied key; otherwise reuse this user's Pi Z.AI credential.
# The value never enters arguments, prompts, logs, reports, or the repository.
if [ -z "${ZAI_API_KEY:-}" ] && [ -s "$PI_AGENT_DIR/auth.json" ]; then
  export ZAI_API_KEY="$(python - "$PI_AGENT_DIR/auth.json" <<'PY'
import json,sys
print(json.load(open(sys.argv[1]))['zai']['key'])
PY
)"
fi
if [ -z "${ZAI_API_KEY:-}" ] || [ ! -s "$MCP_CONFIG" ] || [ ! -s "$MCP_ADAPTER" ]; then
  echo "Z.AI MCP search is not configured; set ZAI_API_KEY and install pi-mcp-adapter (or set MCP_ADAPTER/MCP_CONFIG)" >&2
  exit 3
fi
trap 'unset ZAI_API_KEY' EXIT

if [ "$#" -eq 0 ]; then
  echo "usage: $0 FEATURE_ID..." >&2
  exit 2
fi

write_status() {
  local id="$1" status="$2" attempt="$3" message="$4"
  local tmp="$RUN_ROOT/worker/status/$id.json.tmp-$$"
  python - "$id" "$status" "$attempt" "$message" > "$tmp" <<'PY'
import json,sys,datetime
print(json.dumps({"featureId":int(sys.argv[1]),"status":sys.argv[2],"attempt":int(sys.argv[3]),"message":sys.argv[4],"updatedAt":datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2))
PY
  mv "$tmp" "$RUN_ROOT/worker/status/$id.json"
}

for id in "$@"; do
  report="$RUN_ROOT/reports/$id.json"
  if [ -s "$report" ]; then
    write_status "$id" complete 0 "existing report"
    echo "[$id] skip existing"
    continue
  fi
  detail="$RUN_ROOT/evidence/chromestatus/features/$id.json"
  if [ ! -s "$detail" ]; then
    write_status "$id" blocked 0 "missing ChromeStatus detail"
    echo "[$id] blocked: no detail" >&2
    continue
  fi

  success=0
  for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
    write_status "$id" active "$attempt" "GLM retrospective research"
    prompt="$RUN_ROOT/worker/tmp/$id.prompt.txt"
    raw="$RUN_ROOT/worker/tmp/$id.attempt-$attempt.raw.txt"
    normalized="$RUN_ROOT/worker/tmp/$id.attempt-$attempt.json"
    log="$RUN_ROOT/worker/logs/$id.attempt-$attempt.log"
    cat > "$prompt" <<EOF
Research one evidence-based Chrome feature launch retrospective.

Feature ID: $id
Authoritative cached ChromeStatus detail: $detail
Feature/event manifest: $RUN_ROOT/manifest.features.jsonl
Report schema: $ROOT/retrospectives/report.schema.json
Method: $ROOT/modules/launch-retrospective.md
Lifecycle phase modules: $ROOT/phases/
Evidence cutoff: current UTC time; distinguish what was knowable at each launch event from later outcomes.

Requirements:
- Read the cached record first and follow its direct explainer/spec/intent/review/docs/sample/bug links through the Z.AI Web Reader MCP.
- Treat the run manifest, cached evidence, schema, method, and phase modules as immutable read-only inputs. Never rewrite, reformat, regenerate, or modify them. Return the report only through stdout.
- For all general search, use ONLY the Z.AI MCP proxy: connect to server "zai-web-search" and call "webSearchPrime"; use server "zai-web-reader" and tool "webReader" when full page content is needed. Do NOT call pi-web-access/web_search.
- Keep Z.AI searches bounded and varied. If a search/read call fails, continue with direct URLs and mark missing evidence; never abort or invent.
- Research independent ecosystem evidence: usage/adoption, frameworks/tools, case studies, support/friction, positive and critical press/community evidence, user impact and interoperability.
- Keep all launch events for this feature.
- Replay every lifecycle phase. Use not-relevant only with rationale, never to mean untested.
- Score outcomes by dimension as success/mixed/failure/unscored; do not infer success from shipment, usage alone, press sentiment, or absent criticism.
- Every material finding must cite source IDs. Include URL, publisher, publication/observation date if known, retrieval timestamp, source type, supported claims and limitations.
- Record counterfactuals and concrete skill improvements.
- Use completion partial or blocked whenever material evidence is missing. Complete requires defensible evidence across every relevant dimension.
- Return ONLY one JSON object conforming to report.schema.json. No Markdown fences or commentary.
EOF
    echo "[$id] attempt $attempt"
    if timeout "$TIMEOUT_SECONDS" pi -p --no-session --no-context-files --no-extensions \
      --extension "$MCP_ADAPTER" --mcp-config "$MCP_CONFIG" \
      --model "$MODEL" --thinking high --tools read,mcp \
      --skill "$ROOT" "$(cat "$prompt")" > "$raw" 2> "$log"; then
      if python - "$id" "$raw" "$normalized" <<'PY'
import json,sys
expected=int(sys.argv[1]); raw=open(sys.argv[2]).read(); start=raw.find('{'); end=raw.rfind('}')
if start<0 or end<start: raise SystemExit('no JSON object')
data=json.loads(raw[start:end+1])
required_phases=['intake','incubation','prototype','developerTrials','wideReview','experiment','prepareToShip','release','adoption','support','deprecation']
required_outcomes=['developerValue','endUserImpact','adoption','interoperability','implementationQuality','evidenceAndCommunication','support','overall']
assert data.get('schemaVersion')==1
assert data.get('feature',{}).get('id')==expected
assert all(k in data.get('phaseReview',{}) for k in required_phases)
assert all(k in data.get('outcomes',{}) for k in required_outcomes)
assert data.get('completion',{}).get('status') in ['complete','partial','blocked']
assert isinstance(data.get('sources'),list)
open(sys.argv[3],'w').write(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
PY
      then
        mv "$normalized" "$report"
        write_status "$id" complete "$attempt" "report written"
        echo "[$id] complete"
        success=1
        break
      else
        echo "[$id] invalid JSON/schema on attempt $attempt" >> "$log"
      fi
    else
      code=$?
      echo "[$id] pi exited $code on attempt $attempt" >> "$log"
    fi
    write_status "$id" failed-retryable "$attempt" "attempt failed; will retry if budget remains"
  done
  if [ "$success" -eq 0 ]; then
    write_status "$id" blocked "$MAX_ATTEMPTS" "all GLM attempts failed; safe to resume"
    echo "[$id] blocked after $MAX_ATTEMPTS attempts" >&2
  fi
done
