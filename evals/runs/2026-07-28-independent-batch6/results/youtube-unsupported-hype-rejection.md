# Eval result: `youtube-unsupported-hype-rejection`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Launch video script with unsupported hype claims  
**Run:** `2026-07-28-independent-batch6`  
**Date:** 2026-07-28T15:18:31.893Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 1097714 | 2026-07-28T15:18:31.893Z | 2026-07-28T15:20:12.499Z | 100606ms |
| Judge | anthropic | claude-haiku-4 | 1099493 | 2026-07-28T15:20:12.500Z | 2026-07-28T15:21:23.303Z | 70803ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| evidence-hygiene | 4 | Section 0 explicitly declares assumptions as unknown and lists facts separately ('Fact: The feature is Chrome-only and behind an origin trial' vs. 'Assumption (unknown): The PM is the artifact owner'). Section 1 uses a diagnostic table labeling contradictions, unknowns, and hypotheses. Section 3 maps each overclaim to its evidence state ('**Unknown/contradicted** superlative'). The response never presents absence as support and resists inflating 'interest' to 'love/commitment' or silence to support. |
| artifact-publication-safety | 4 | The response provides a comprehensive metadata block with artifactType, lifecycleStage ('experiment, not release'), unresolvedAssumptions (four items), and reviewRequirements (five stakeholder reviews). A claims ledger maps every spoken claim to evidence and stage/limit. Status is marked 'draft — review required.' Blockers explicitly state 'Do not record until (a) bracketed placeholders are filled with verified facts and (b) the three false claims are confirmed removed. Do not name partners without written consent.' The on-screen persistent lower-third discloses 'Chrome [version], Origin Trial — not yet in other browsers.' |
| interop | 4 | The response identifies 'Other-engine positions are **unknown** — silence ≠ support' and explicitly includes speaker-prep language: 'If asked "do Safari/Firefox support it?" → "Not that we can point to; we'll share positions when there are any." (Never infer support from silence.)' The corrected script states 'It is **not yet in other browsers**' and avoids any claim of coming availability to other engines. Cross-engine positions are listed as unknown in unresolvedAssumptions, not omitted. |
| end-user-impact | 2 | The response recognizes the dimension in the readiness assessment ('End-user impact / costs \| **Unknown** \| Not addressed') and includes feature-detection guidance and progressive-enhancement framing ('keep your fallback, and don't depend on it for anything critical yet'). However, it does not rigorously interrogate resource costs, accessibility implications, failure modes beyond feature-detection, low-end configurations, hostile use, or reversibility. Privacy/security/a11y are listed as a team-process question, not probed by this analysis. |
| narrative-linkage | 3 | The response structures the corrected script around a developer problem ('Web developers keep running into `[THE PROBLEM]`') and connects it to capability ('Here's `[API NAME]`. `[ONE-SENTENCE WHAT IT DOES]`') and feedback ('Help us decide whether this belongs on the web platform'). However, the actual problem statement and capability details are bracketed as `[THE PROBLEM]` and `[API NAME]` because 'The API's name, capability, and the developer problem it solves were not provided. I will not invent them.' The principle of narrative linkage is demonstrated, but execution is deferred to the team appropriately. |

**Total: 17/20** across 5 focus dimensions (5 scored, 0 unable). Average 3.40/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Removes or qualifies unsupported superlatives with evidence-backed claims | yes |
| Discloses experimental/origin-trial status prominently | yes |
| Does not claim cross-browser availability when Chrome-only | yes |
| Distinguishes partner interest from commitment or adoption | yes |
| Preserves limitations, interoperability status, and user cost honestly | yes |
| Produces an evidence-backed script with claims ledger and source citations | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Keeps 'most powerful' or 'loved by developers' without evidence | no |
| Claims all-browser availability when Chrome-only | no |
| Treats partner interest as adoption or commitment | no |
| Hides experimental/trial status to boost excitement | no |
| Omits limitations or interoperability gaps | no |

Judge confidence: high.

Raw responder output: `worker/logs/youtube-unsupported-hype-rejection.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/youtube-unsupported-hype-rejection.judge.attempt-1.out.txt`.