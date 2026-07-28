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

The current baseline is **21/21 complete and independently judged**, with zero
unscored, blocked, pending, duplicate, or missing authoritative case IDs. See the
[fixed-denominator disposition and provenance audit](results/2026-07-28-independent-21-case-disposition.md).

| Authoritative run | Complete | Runner | Validator |
| --- | ---: | ---: | --- |
| `2026-07-27-independent-pilot` | 3/3 | v1 | 0 errors, 2 legacy warnings |
| `2026-07-27-independent-batch2` | 5/5 | v1 | 0 errors, 1 legacy warning |
| `2026-07-28-independent-batch3` | 4/4 | v2 | 0 errors, 0 warnings |
| `2026-07-28-independent-batch4` | 4/4 | v2 | 0 errors, 0 warnings |
| `2026-07-28-independent-batch5` | 3/3 | v2 | 0 errors, 0 warnings |
| `2026-07-28-independent-batch6` | 2/2 | v2 | 0 errors, 0 warnings |

The v1 runs cover 8 cases and retain documented runner-reproducibility caveats;
the v2 runs cover 13 cases with runner and staged-skill-tree binding. The details
below preserve the first 8 independent results and older provisional history.

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
> is correct. All 21 fixtures now have independent dispositions, but one judge
> model does not establish inter-judge agreement and high scores are not passes.

### Historical provisional results (same-session self-scored)

> Every case below now has a fresh-context independent rerun in one of the six
> authoritative runs above. These same-session numbers remain unchanged as
> historical evidence only; cite the independent results as baselines.

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

Historical note: `governance-routing-and-measurement-design`,
`mdn-docs-bcd-spec-disagreement`, `youtube-unsupported-hype-rejection`, and
`editorial-blog-hype-and-house-style` previously had no retained independent
result. All four now have complete independent results in the authoritative runs.

## Scoring status summary

| Status | Count | Definition |
| --- | ---: | --- |
| Complete and independently judged | 21 | Fresh responder plus separate blind judge; exact case-ID reconciliation |
| Unscored | 0 | No parseable complete judgment |
| Blocked | 0 | Responder produced no usable output after bounded attempts |
| Pending | 0 | No terminal disposition |
| Duplicate or missing authoritative IDs | 0 | Exact match to `cases.json` |
| **Fixed denominator** | **21** | Calibration and aborted attempts excluded |

One editorial case required a second judge attempt; both attempt logs are retained.
There were no critical-failure hits, forbidden-behavior findings, capped results,
or unable-to-score dimensions. Non-max scores and the two v1 provenance caveats
remain visible in the disposition audit.
