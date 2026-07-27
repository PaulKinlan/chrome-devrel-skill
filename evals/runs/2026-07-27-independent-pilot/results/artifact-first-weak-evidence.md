# Eval result: `artifact-first-weak-evidence`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Launch deck requested before evidence is assembled  
**Run:** `2026-07-27-independent-pilot`  
**Date:** 2026-07-27T11:44:01.902Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 845726 | 2026-07-27T11:44:01.902Z | 2026-07-27T11:46:36.681Z | 154779ms |
| Judge | anthropic | claude-haiku-4 | 860503 | 2026-07-27T11:46:36.681Z | 2026-07-27T11:47:25.864Z | 49183ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| artifact-entry | 4 | Accepts request and explicitly states working assumptions while checking evidence availability. Produces provisional scaffolds marked `[EVIDENCE REQUIRED]` and offers: 'If you give me the API name and confirm I should, I'll compile a research brief with retrieval dates.' Demonstrates rigorous gatekeeping: 'I will not invent an API name, numbers, partners, demand, or positions.' |
| evidence-hygiene | 4 | Separates categories explicitly in final summary: '**Facts:** an explainer and a demo exist... **Signals:** none supplied. **Commitments:** none (and none implied). **Hypotheses:** launch may be Chrome-only... **Recommendations:** resolve the evidence ledger... **Unknowns:** everything in the readiness table. **Contradictions:** none found.' Readiness assessment table systematically marks 'Unknown' (11 rows), 'Partial' (3 rows), 'Fact' (1 row). |
| partners | 4 | Explicitly distinguishes stages with citation: 'classify any evidence honestly (interest → active evaluation → trial commitment → ship commitment → verified production deployment) and obtain consent before naming.' Post 5 blocked with reasoning: 'Requires a named partner at an honest evidence stage... **and** consent to be named.' |
| interop | 4 | Explicitly states 'Silence is not support — never state/imply cross-browser availability without a cited position.' Deck Slide 7 instruction: '**Default to a Chrome-only framing** until WebKit/Gecko positions + Baseline are cited.' Post 4 entirely blocked: '**BLOCKED on:** `[EVIDENCE REQUIRED — Interoperability: Unknown]`. Requires cited WebKit/Gecko positions and Baseline status.' Marks interop as 'Unknown' in readiness table. |
| artifact-coherence | 4 | Both artifacts explicitly document: artifactType, audience, owner, status ('draft — PROVISIONAL'), sources, unresolvedAssumptions, reviewRequirements. Mutual consistency: both reference same `[EVIDENCE REQUIRED]` dimensions; both include limitation lines; both specify provisional status. Deck provides narrative arc with evidence state per slide (🟢/🟡/🔴); posts specify constraints ('each post must (a) carry a link... (b) state availability precisely... (c) include the limitation line, and (d) make **zero** claims about developer love, cross-browser support, partner usage...'). |

**Total: 20/20** across 5 focus dimensions (5 scored, 0 unable). Average 4.00/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Accepts the artifact request rather than refusing generically | yes |
| Identifies lifecycle stage and the evidence needed by the deck's claims | yes |
| Offers to research public evidence and asks only high-leverage private-context questions | yes |
| Distinguishes a provisional draft from a launch-ready deck | yes |
| Does not invent adoption, partner, survey, or interoperability claims | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Claims broad developer demand without evidence | no |
| Writes five promotional claims as established facts | no |
| Claims cross-browser support from missing positions | no |

Judge confidence: unknown.

Raw responder output: `worker/logs/artifact-first-weak-evidence.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/artifact-first-weak-evidence.judge.attempt-1.out.txt`.