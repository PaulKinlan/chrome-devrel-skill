# Eval result: `editorial-blog-hype-and-house-style`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Blog post draft with hype, wrong publication, and missing evidence  
**Run:** `2026-07-28-independent-batch6`  
**Date:** 2026-07-28T15:21:23.308Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 1100779 | 2026-07-28T15:21:23.308Z | 2026-07-28T15:23:46.646Z | 143338ms |
| Judge | anthropic | claude-haiku-4 | 1104690 | 2026-07-28T15:25:04.188Z | 2026-07-28T15:26:12.325Z | 68137ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| evidence-hygiene | 4 | The response explicitly separates facts ('from the request'), working assumptions ('inferred; confirm'), hypotheses, and unknowns throughout. §6 systematically audits the survey failure across sampling frame, selection bias, n, measurement validity, and methods — demonstrating methodological rigor rather than accepting a weak claim. Every placeholder is marked '[needs evidence]' with an instruction 'must not be invented.' The boundary contract distinction (private n=3 poll vs. public evidence) is stated clearly: 'private input with no consent → cannot appear in a public artifact at all.' Unknown evidence is consistently labeled 'unknown, not inferred' rather than inferred as support. |
| artifact-publication-safety | 4 | The draft front-matter carries required metadata (artifactType, lifecycleStage, status: 'draft (provisional)', unresolvedAssumptions, reviewRequirements). Every [BRACKETS] placeholder is tagged '[needs evidence]' with an instruction to prevent launch-ready unsupported claims. The response explicitly states 'DevRel cannot block or approve shipment' and coordinates Privacy/Security/A11y as 'formal-review-if-required per canonical process' rather than claiming advisory authority. The draft is marked conditional ('draft… placeholders unfilled') and each review requirement lists the responsible party (API Owner, Standards liaison, etc.). Private material (the poll) is explicitly excluded, not leaked. |
| narrative-linkage | 3 | The response connects features upward to developer jobs ('the concrete developer outcome — [USECASE]') and downward to capabilities via the feature-detection + fallback + testing requirement. It tests narratives against evidence: 'If no public demand evidence exists, the post cannot make any demand claim.' The measurement section ties trial data to decisions: 'token registrations ≠ adoption.' However, the response does not deeply explore Chrome's longer-term platform narrative or positioning beyond the single API — the linkage is feature-focused rather than platform-strategic. |
| interop | 4 | The response enforces A5 ('silence ≠ support') explicitly in §3 and in the draft's Interop section, requiring Mozilla and WebKit statements to be researched or labeled 'unknown' with language '[no public position found as of date — unknown, not opposition. Never infer support from silence.]' Baseline status is stated ('Not yet available'). The venue/voice problem is identified ('Chrome-only marketing violates [web.dev's] voice') and resolved with a conditional recommendation to move to Chrome for Developers or reframe with 'Limited availability' and explicit other-engine unknowns. The statement 'most of your users will hit the fallback. Plan for that.' acknowledges interop reality. |
| end-user-impact | 3 | The response separates developer value (solving a job) from end-user benefit (fallback viability). It tests resource costs via fallback verification: 'every snippet… should be in a runnable [sample repo URL] tested on Chrome, Firefox, and Safari so the fallback is verified, not assumed.' Low-end configurations are addressed implicitly ('most of your users will hit the fallback'). Consent/control and accessibility are listed in review requirements but marked '[needs review]' rather than analyzed in depth. The response does not explicitly address hostile use or reversibility, though 'Known limitations' includes policy and context constraints. |

**Total: 18/20** across 5 focus dimensions (5 scored, 0 unable). Average 3.60/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Routes to developer.chrome.com (not web.dev) because the feature is Chrome-only experimental | yes |
| Removes 'revolutionary' and 'developers love it' as unsupported hype | yes |
| Discloses experimental/origin-trial status prominently | yes |
| Requires code examples and demo links before publication | yes |
| Applies house-style structure: lead, problem, solution, code, limitations, CTA | yes |
| Replaces 'Stay tuned!' with a specific actionable CTA | yes |
| Does not mimic an individual author's voice or plagiarize corpus posts | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Keeps unsupported superlatives or hype words | no |
| Publishes Chrome-only content on web.dev without cross-browser context | no |
| Uses an internal 3-person poll as evidence of developer sentiment | no |
| Omits experimental/trial status | no |
| Ends with vague 'stay tuned' instead of specific CTA | no |
| Copies or closely mimics a specific author's writing | no |

Judge confidence: high.

Raw responder output: `worker/logs/editorial-blog-hype-and-house-style.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/editorial-blog-hype-and-house-style.judge.attempt-2.out.txt`.