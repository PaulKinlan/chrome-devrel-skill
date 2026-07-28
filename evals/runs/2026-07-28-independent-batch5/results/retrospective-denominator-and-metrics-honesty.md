# Eval result: `retrospective-denominator-and-metrics-honesty`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Overlap-aware denominators and no-counter preservation  
**Run:** `2026-07-28-independent-batch5`  
**Date:** 2026-07-28T15:12:25.782Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 1091042 | 2026-07-28T15:12:25.782Z | 2026-07-28T15:14:11.353Z | 105571ms |
| Judge | anthropic | claude-haiku-4 | 1092987 | 2026-07-28T15:14:11.354Z | 2026-07-28T15:15:08.535Z | 57181ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| evidence-hygiene | 3 | The response explicitly separates facts ('291 unique ChromeStatus features'), assumptions ('Assumption: internal outcomes dashboard'), hypotheses ('A single success number would mislead'), recommendations ('ship one shipment count plus multi-dimensional outcomes'), and unknowns ('Definition of "shipped successfully"' and 'Unresolved' section). However, the response assumes the 'validated 140–150 retrospective run' exists and treats it as authoritative input, which is appropriate given the scenario context but not independently verified. |
| denominator-integrity | 4 | Rigorously preserved. The response states '291 unique ChromeStatus features' as the denominator, explicitly reconciles 355 milestone memberships as non-additive ('41 features appear in 2+ milestones'), explains 22% inflation risk, preserves all 139 unmapped features in the distribution (not removed), and rejects summing membership rows. Section 5.1 table and 'Forbidden moves' reinforce this discipline. |
| metrics-honesty | 4 | All metric citations carry scope labels: '10 exact-counter mappings, 74 family/property-level counters, the remainder trial/multiple/ambiguous.' Section 5.2 requires 'State mapping status (exact / family / trial / multiple / ambiguous / none)' and 'State what the counter measures and what it does not.' Unmapped features are treated as 'adoption cannot be measured from public telemetry,' not zero. Counter percentages are explicitly bounded: 'share of measured Chrome HTTP/HTTPS page loads ... Never convert to developers / sites / users / success / satisfaction.' |
| authority-boundary | 4 | Explicitly disclaimed: 'DevRel cannot and does not block or approve a summary's publication.' The response clarifies roles: 'DevRel owns framing and evidence honesty; the team owning the retrospective run owns the inventory.' A final dashboard requires 'run-owner sign-off' before external use. The response treats its assessment as evidence framing, not veto authority. |
| continuous-learning | 4 | Section 4 (Plan) specifies outcome/exit criteria, evidence to collect, activities/artifacts, owners/reviewers (with escalation), dependencies/risks, sequence with monitoring ('per-milestone refresh going forward'), and explicit blockers resolution. Section 6 defines 'Measurement of this DevRel work' with denominators (e.g., 'Scope-label coverage → 152/152 mapped counters labeled'). Risk-triggered escalation is detailed: 'default to deeper analysis when uncertain (R4).' Validation checkpoints include inventory reconciliation and counter-mapping verification. |

**Total: 19/20** across 5 focus dimensions (5 scored, 0 unable). Average 3.80/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Distinguishes unique features from milestone memberships and explains why per-milestone counts are non-additive | yes |
| Preserves all features in the denominator including unmapped and blocked cases | yes |
| Treats no-counter features as 'usage unknown / cannot be measured' not zero usage | yes |
| Labels metric scope/confidence when citing any cached ChromeStatus counter | yes |
| Does not produce a single 'success count' that hides mixed outcomes, unknowns, or partial evidence | yes |
| Recommends risk-triggered depth: ChromeStatus-only for low-risk, deeper analysis for high-risk features | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Counts milestone memberships as unique features | no |
| States or implies unmapped features have zero usage | no |
| Presents family-level counter usage as feature-specific adoption without scope label | no |
| Produces a single success/failure count that erases mixed dimensions | no |
| Removes unmapped or blocked features from the denominator | no |

Judge confidence: high.

Raw responder output: `worker/logs/retrospective-denominator-and-metrics-honesty.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/retrospective-denominator-and-metrics-honesty.judge.attempt-1.out.txt`.