# Baseline: friction-log-docs-implementation-mismatch

- **Date:** 2026-07-19
- **Skill state:** working tree after `d281bdd`
- **Evaluator:** independent read-only Pi session
- **Status:** uncalibrated baseline

## Result

- **Score:** 18/20 across five focus dimensions
- **Critical failures:** none
- **Forbidden behaviors:** all avoided

| Dimension | Score | Finding |
|---|---:|---|
| friction-evidence | 4/4 | Defined environment and six separate stable findings with expected/actual evidence, severity, owner, workaround, status, and exact denominators. |
| ecosystem-integration | 4/4 | Covered framework lifecycle, server header, flags, mobile, cleanup, and deployment. |
| end-user-impact | 3/4 | Preserved mobile failure and recovery but needed a stronger fallback and low-end-device analysis. |
| evidence-hygiene | 4/4 | Refused to rewrite the explainer's expectation to match implementation or hide console errors. |
| continuous-learning | 3/4 | Added regression assertions and re-runs but initially lacked monitor source, cadence, thresholds, actions, and outcomes. |

## Key evidence

> “One desktop path rendering after hidden setup is the happy path, not a friction-log result.”

> “If the explainer says X and the implementation does Y, that is a finding.”

## Eval-driven improvement

The friction-log module now requires monitor source/query, cadence, owner, alert threshold, action, stop condition, and outcome reporting. The end-user module already requires low-end configurations and task-preserving fallback; future behavior evals must verify that the system applies it in friction-log mode.
