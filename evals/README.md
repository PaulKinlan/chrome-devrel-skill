# Evaluations

The evals test whether the skill improves decisions and evidence quality—not
whether it writes polished prose.

## What the suite should catch

- Drafting requested artifacts before checking their evidence needs
- Treating weak, irrelevant, selectively sampled, or misinterpreted survey data
  as developer demand
- Presenting partner interest as willingness to ship
- Treating silence or “no signal” as browser support
- Ignoring framework, library, server, deployment, accessibility, privacy,
  security, or support constraints
- Producing Chrome-only adoption plans where interoperability is material
- Losing the connection between an individual API and a broader
  developer/platform narrative
- Producing broad narratives with no concrete capabilities or adoption paths
- Confusing DevRel readiness advice with formal launch authority
- Inventing facts, citations, commitments, metrics, or approvals
- Generating disconnected assets that disagree on audience, terminology,
  support, or claims

## Evaluation layers

1. **Fixture validation:** deterministic validation that every case has the
   required structure and assertions.
2. **Behavior evaluation:** run an agent with `SKILL.md` and a case prompt,
   retaining the full transcript and cited sources.
3. **Rubric judge:** score observable behaviors with `rubric.json`; require
   textual evidence from the response for every score.
4. **Artifact checks:** validate requested outputs for required metadata,
   internal consistency, source traceability, and unresolved assumptions.
5. **Adversarial review:** a separate evaluator tries to find unsupported
   claims, evidence laundering, privacy-boundary violations, and misleading
   readiness language.
6. **Historical replay:** use public records from real launches to test whether
   the skill identifies known strengths and failure modes without relying on
   hindsight-only information.
7. **Prospective outcome review:** compare the skill's recommendations with what
   happened later; record misses and update fixtures.

## Scoring policy

- Do not use prose style as a proxy for quality.
- Every rubric score needs quoted evidence from the response or artifact.
- A critical failure caps the result regardless of aggregate score.
- Retain per-dimension scores; do not hide failures behind one average.
- Unknown evidence must remain unknown.
- Public/private boundary violations, fabricated evidence, or invented approvals
  are critical failures.

## Current fixtures

The first fixtures are synthetic and public-safe. Public historical fixtures
will be added with dated source bundles so they can be replayed without future
knowledge leakage. The suite deliberately includes both promising and
problematic proposals so a system that reflexively approves or rejects
everything cannot score well.

Run structural validation:

```sh
node evals/validate.mjs
node scripts/validate-public-core.mjs
```

A model runner and judge are implemented as `evals/run.mjs`. See
"Independent eval runner" below. Judge calibration and full-denominator
coverage continue.

## Independent eval runner

`evals/run.mjs` runs each eligible case with a **fresh-context responder** and
a **separate fresh-context judge**, so a result can be labelled independent
only when the two roles are genuinely distinct invocations (the provenance
validator enforces this).

**Leakage prevention is structural, not procedural:**

- The responder loads a *staged copy* of the skill built inside the run
  directory that **excludes `evals/`, `scripts/`, and `retrospectives/`**. A
  responder therefore cannot read the rubric, the expected/forbidden answers,
  prior scores, or the runner itself — even if it tried. Staging is checked at
  validation time.
- The responder sees only the case prompt plus the skill. It never sees the
  rubric, another case, or any judge output.
- The judge loads **no skill** and sees only the rubric, the single case's
  focus/expected/forbidden fixtures, and the anonymized candidate response. It
  never learns the responder's model, provider, or session, so it cannot be
  biased by identity (cross-family judging by default: GLM responder,
  Anthropic judge).
- Each case is a fresh pair of `pi -p --no-session --no-context-files`
  invocations — no shared session or context across roles or cases.

**Fixed inputs:** `cases.json` and `rubric.json` are pinned by SHA-256 for the
whole run. **Atomic outputs, per-case hard timeouts, bounded retries, and
resume** are built in. **Honest states:** a responder that fails after all
retries is `blocked`; a judge that returns no parseable verdict is `unscored` —
no score is ever invented. **A score is never proof of correctness:** every
result carries an explicit caveat, and provenance (provider/model/PID/
timestamps/raw SHA-256) is recorded for both phases.

```sh
# list cases and the fixed-input checksums
node evals/run.mjs --list

# calibrate the blind judge with a deliberately bad response (outside the 21-case denominator)
node evals/run.mjs --calibration evals/calibration/negative-control-1.json

# small representative pilot (discipline-focused cases, read-only responder)
node evals/run.mjs --run 2026-07-27-independent-pilot --pilot

# explicit case set; widen responder tools for research-heavy cases
node evals/run.mjs --run <RUN_ID> --case a,b,c --responder-tools 'read,mcp'

# full fixed denominator
node evals/run.mjs --run <RUN_ID> --all

# provenance + integrity validation (rejects same-context/self-judged claims)
node evals/validate-eval-results.mjs --run <RUN_ID>
```

Defaults are overridable via flags or `EVAL_*` env vars (`EVAL_RESPONDER_MODEL`,
`EVAL_JUDGE_MODEL`, `EVAL_RESPONDER_TOOLS`, `EVAL_RESPONDER_TIMEOUT`, …). The
runner reads no credentials: the `pi` CLI handles auth from its own config. No
personal paths are hard-coded — the root is derived from the script location.

Results, raw responder/judge outputs, normalized verdicts, and per-case status
live under `evals/runs/<RUN_ID>/`. Judge-calibration records live separately under
`evals/calibration/runs/` and never change the 21-case denominator. Attempts that stop before
producing a run manifest/result are recorded under `evals/aborted/`; they are evidence, not a
scored disposition. The provisional same-session results in
`evals/results/` are preserved unchanged as history; independent reruns never
relabel them.

## Baselines

### Independent (fresh-context responder + separate fresh-context judge)

- [`partner-interest-is-not-shipping`](runs/2026-07-27-independent-pilot/results/partner-interest-is-not-shipping.md):
  **INDEPENDENT** — 12/12 across three focus dimensions (zai/glm-5.2 responder,
  anthropic/claude-haiku-4 judge), no critical failures, all expected met.
  Correctly refused to promote briefing "interest" to a ship commitment and
  protected the public/private boundary.
- [`governance-routing-and-measurement-design`](runs/2026-07-27-independent-pilot/results/governance-routing-and-measurement-design.md):
  **INDEPENDENT** — 20/20 across five focus dimensions, no critical failures.
  Routed formal approval away from DevRel and refused a single success metric.
- [`artifact-first-weak-evidence`](runs/2026-07-27-independent-pilot/results/artifact-first-weak-evidence.md):
  **INDEPENDENT** — 20/20 across five focus dimensions, no critical failures.
  Accepted the artifact request while gating it on missing evidence.
- [`survey-selection-and-pushback`](runs/2026-07-27-independent-batch2/results/survey-selection-and-pushback.md):
  **INDEPENDENT** — 20/20 across five focus dimensions. Independently confirms
  (and supersedes for baseline purposes) the prior provisional 17/20.
- [`user-cost-large-model-download`](runs/2026-07-27-independent-batch2/results/user-cost-large-model-download.md):
  **INDEPENDENT** — 20/20 across five focus dimensions. Independently confirms
  the prior provisional 19/20.
- [`contentious-launch-team-safety`](runs/2026-07-27-independent-batch2/results/contentious-launch-team-safety.md):
  **INDEPENDENT** — 18/20 across five focus dimensions (two partials on
  critique-to-action and continuous-learning); no critical failures. Retained
  as a genuine partial.
- [`incubation-to-prototype-transition`](runs/2026-07-27-independent-batch2/results/incubation-to-prototype-transition.md):
  **INDEPENDENT** — 23/24 across six focus dimensions (one partial on
  customer-discovery); no critical failures.
- [`continuous-portfolio-loop`](runs/2026-07-27-independent-batch2/results/continuous-portfolio-loop.md):
  **INDEPENDENT** — 17/20 across five focus dimensions (a 2 on friction-evidence
  and a 3 on measurement); no critical failures. Retained as the strongest
  genuine gap — a candidate skill-improvement target, not a weakened case.

> Caveat: these are independent rubric judgments of observable behavior. They
> are **not** factual verification of the responses and do not prove the skill
> is correct. The 8 verified cases are discipline-focused and do not yet cover
> research-retrieval or interop-heavy cases. The judge's calibration and
> coverage are still maturing; an independent reviewer should not treat a high
> score as a pass.

### Provisional (same-session self-scored — not independently verified)

> Four of these were independently rerun on 2026-07-27 (see Independent above):
> `survey-selection-and-pushback`, `user-cost-large-model-download`,
> `contentious-launch-team-safety`, and `incubation-to-prototype-transition`.
> Their provisional numbers are retained here as history; cite the independent
> results as baselines. The remaining provisional results still share
> authorship context and are not defensible baselines.

- [`survey-selection-and-pushback` at `0cae33b`](results/2026-07-19-survey-selection-and-pushback.md):
  17/20 across five focus dimensions, no critical failures. The result produced
  concrete improvements to survey design, partner-evidence staging,
  Baseline/compatibility analysis, and criticism-theme handling.
- [`stakeholder-critique-attestation`](results/2026-07-19-stakeholder-critique-attestation.md):
  19/20 across five focus dimensions, no critical failures. It found the power
  shift and affected constituencies without inventing positions; live source
  retrieval remains to test.
- [`strong-capability-retains-risk`](results/2026-07-19-strong-capability-retains-risk.md):
  22/24 across six focus dimensions, no critical failures. It continued
  promising experimentation while preserving unresolved security, privacy,
  performance, accessibility, and interoperability work.
- [`contentious-launch-team-safety`](results/2026-07-19-contentious-launch-team-safety.md):
  19/20 across five focus dimensions, no critical failures. It protected
  targeted people without suppressing substantive criticism; the result
  strengthened follow-up monitoring.
- [`friction-log-docs-implementation-mismatch`](results/2026-07-19-friction-log-mismatch.md):
  18/20 across five focus dimensions, no critical failures. It refused a false
  happy-path pass and produced separate reproducible findings; the result
  strengthened recurrence monitoring.
- [`user-cost-large-model-download`](results/2026-07-19-user-cost-large-model-download.md):
  19/20 across five focus dimensions, no critical failures. It rejected “local”
  as proof of free/private behavior and drove a stronger browser-model
  gatekeeping question.
- [`incubation-to-prototype-transition`](results/2026-07-19-incubation-prototype-transition.md):
  23/24 across six focus dimensions, no critical failures. It separated an
  Intent email from a decision-quality handoff and strengthened customer
  interview prompts.
- [`deep-ecosystem-native-miniapp-agent-research`](results/2026-07-19-deep-ecosystem-research.md):
  18/20 across five focus dimensions, no critical failures. It covered
  web/native/mini-app/chat/agent alternatives and counterevidence; the result
  strengthened user-control and transition-trigger requirements.
- [`retrospective-denominator-and-metrics-honesty`](results/2026-07-22-retrospective-denominator-and-metrics-honesty.md):
  **PROVISIONAL** — 19/20 across five focus dimensions, same-session self-scored
  (not independently verified). It correctly distinguished 291 unique features
  from 355 milestone memberships, preserved 139 no-counter features as unknown
  (not zero), and rejected a single success count. Requires fresh-context runner
  for defensible baseline.

- `governance-routing-and-measurement-design`: **UNSCORED** — no eval result
  exists. Tests governance boundary, measurement design, readiness assessment,
  and authority routing. Requires independent fresh-context execution before any
  baseline is claimed.

- `mdn-docs-bcd-spec-disagreement`: **UNSCORED** — no eval result exists. Tests
  evidence separation (spec vs BCD vs docs), authority boundary, and publication
  safety. Requires independent fresh-context execution.

- `youtube-unsupported-hype-rejection`: **UNSCORED** — no eval result exists.
  Tests evidence-backed claims, hype rejection, interoperability disclosure, and
  limitation preservation in video scripts. Requires independent execution.

- `editorial-blog-hype-and-house-style`: **UNSCORED** — no eval result exists.
  Tests publication routing, hype rejection, house-style application, and
  anti-plagiarism. Requires independent execution.

## Scoring status summary

| Status                                 | Count  | Definition                                                      |
| -------------------------------------- | ------ | --------------------------------------------------------------- |
| Independently verified                 | 8      | Fresh-context responder + separate fresh-context judge (2026-07-27 runs) |
| Provisional (same-session self-scored) | 5      | Same session produced response and scoring; shares context bias |
| Unscored (case exists, no result)      | 3      | Eval case defined but no response/judgment retained             |
| No retained result                     | 5      | Case exists in cases.json but no result file was produced       |
| **Total cases**                        | **21** |                                                                 |

Counts: 8 independent + 5 provisional + 3 unscored + 5 no-retained = 21.

The 8 independent results live under `evals/runs/2026-07-27-independent-pilot`
and `evals/runs/2026-07-27-independent-batch2`; the 5 remaining provisional
results still share authorship context and require fresh-context verification
before citing as defensible baselines. The 3 unscored and 5 no-retained cases
are the next expansion targets (research-heavy cases need `--responder-tools`
widened to include search).
