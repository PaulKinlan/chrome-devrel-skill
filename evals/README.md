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

A model runner and judge calibration set are still to be implemented.

## Baselines

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

## Scoring status summary

| Status                                 | Count  | Definition                                                      |
| -------------------------------------- | ------ | --------------------------------------------------------------- |
| Independently verified                 | 0      | Fresh-context responder + separate fresh-context judge          |
| Provisional (same-session self-scored) | 9      | Same session produced response and scoring; shares context bias |
| Unscored (case exists, no result)      | 1      | Eval case defined but no response/judgment retained             |
| No retained result                     | 8      | Case exists in cases.json but no result file was produced       |
| **Total cases**                        | **18** |                                                                 |

All provisional results share context bias and require fresh-context
verification before citing as defensible baselines.
