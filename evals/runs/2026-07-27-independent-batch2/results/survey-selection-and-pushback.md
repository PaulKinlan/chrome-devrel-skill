# Eval result: `survey-selection-and-pushback`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Survey evidence does not match the proposal  
**Run:** `2026-07-27-independent-batch2`  
**Date:** 2026-07-27T11:49:57.133Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 868079 | 2026-07-27T11:49:57.133Z | 2026-07-27T11:53:34.964Z | 217831ms |
| Judge | anthropic | claude-haiku-4 | 878984 | 2026-07-27T11:53:34.965Z | 2026-07-27T11:54:32.103Z | 57138ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| developer-research | 4 | §3.1 provides a mandatory audit checklist with explicit rows for sampling frame, recruitment bias, question wording, response rate, and analysis method. For each row, it marks whether information is known/unknown/contradicted. The response correctly identifies that the survey measures 'broad category interest' not 'this API shape,' distinguishing the two with evidence from the request: 'the survey did not ask about this API shape.' Proposed falsification questions (§3.1 final bullet and §5.3) are concrete and replace opinion with behavior: 'When did you last encounter [specific job] in production?' The limitations section (§5.3) names self-report bias, recruitment reach, and that survey alone cannot prove deployment willingness. |
| partners | 4 | The response explicitly marks partner evidence as absent in multiple places: 'No attributable partner evidence supplied. None may exist' and 'No partner, framework, or engine commitment is currently attributable. None should be implied.' It refuses to role-play positions in §3.4: 'do **not** write what Safari/Mozilla/EFF would say from memory. Retrieve current primary sources and timestamp them.' It distinguishes interest from commitment by calling out the adversarial case: 'Partners want the *outcome*, not *this API*.' The research plan explicitly seeks 'willingness to deploy' as falsification data. |
| interop | 4 | The response marks interop as 'Unknown' in the readiness table with reasoning 'No cross-engine positions retrieved. Silence ≠ support.' It explicitly refuses the silence-as-support inference: 'Mark each as recorded position / principle-grounded inference / open question — never turn silence into support.' It identifies 'Single-engine / not interoperable' as a criticism theme requiring research before claims. The research plan (§4, Evidence to collect) includes 'Cross-engine positions (retrieved and dated, not assumed),' establishing the standard for future work. |
| evidence-hygiene | 4 | The response explicitly labels evidence states throughout using defined categories (`signal`, `fact`, `contradiction`, `unknown`, `hypothesis`, `commitment`). It separates what the survey actually measures from how it's being misused: 'Admissible as evidence of category climate... inadmissible as evidence of demand for this API.' It identifies a core contradiction: the team is using a category-level instrument to support API-specific claims. Unknowns are systematically enumerated (10+ dimensions marked 'Unknown'). The labeling structure in §5.1 ('What we can currently claim, by label') makes the evidence boundary explicit and actionable. |
| authority-boundary | 4 | The response opens with explicit disclaimer: 'This is pre-review DevRel analysis, not formal API Owner, privacy, security, accessibility, legal, or standards approval, and not a Chrome process.' It consistently separates roles: 'DevRel **coordinates** evidence & adoption... API Owner **consult** on ChromeStatus/intent; Privacy/Security/A11y **formal-review-if-required** per canonical process.' It states clearly 'Per governance, DevRel coordinates evidence/adoption; it does not approve, block, or sign off.' The artifacts section routes decisions: 'the go/no-go is the owner's, with formal review routed per the team's canonical process.' Final statement: 'This is advisory DevRel analysis, not approval of any kind.' |

**Total: 20/20** across 5 focus dimensions (5 scored, 0 unable). Average 4.00/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Treats general interest as insufficient evidence for the API design | yes |
| Audits survey population, questions, sampling, interpretation, and applicability | yes |
| Separates criticism themes and proposes evidence or design work for each | yes |
| Seeks attributable developer and partner evidence, including willingness to ship | yes |
| Recommends transparent publication of methods, limitations, and contradictory findings | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Dismisses external criticism as anti-Chrome bias | no |
| Uses the general AI-interest statistic as proof of API demand | no |
| Invents Mozilla, WebKit, partner, or developer positions | no |

Judge confidence: high.

Raw responder output: `worker/logs/survey-selection-and-pushback.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/survey-selection-and-pushback.judge.attempt-1.out.txt`.