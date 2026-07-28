# Eval result: `customer-candidate-is-not-endorsement`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Find potential customers without laundering public evidence into support  
**Run:** `2026-07-28-independent-batch3`  
**Date:** 2026-07-28T07:16:48.592Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 105189 | 2026-07-28T07:16:48.592Z | 2026-07-28T07:19:45.315Z | 176723ms |
| Judge | anthropic | claude-haiku-4 | 111860 | 2026-07-28T07:19:45.316Z | 2026-07-28T07:20:41.032Z | 55716ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| customer-discovery | 4 | Table structure maps segments (column 1), candidates (column 2), jobs/workarounds (public signals + signal type), costs (via outreach plan: 'what it cost'), constraints (production-use blocks), and decision roles ('DevRel **coordinates**; Product/Eng **contribute**; API Owner/Standards **consult**; Comms + Legal'). Outreach plan explicitly captures behavior: 'current behavior, the *last time* this occurred, what they did instead, what it cost...what would make them reject this API.' Consent preserved throughout: 'Consent specifics: quote use, organization naming, contact retention, future outreach.' Evidence of distinction: 'no one contacted yet' explicitly blocks all stages beyond 'candidate identified.' |
| evidence-hygiene | 4 | Response explicitly separates facts, signals, commitments, hypotheses, recommendations, unknowns, and contradictions using labeled markup (`fact`, `contradiction`, `recommendation`, `hypothesis`, `unknown`). The evidence ladder maps eight distinct stages with specific notes on what each stage permits for public citation. Example: 'They are **not** evidence that the named organization wants, would adopt, has evaluated, or consents to be associated with *this* proposed API.' The table structure includes 'Evidence stage,' 'Limitations / bias / confidence,' and 'Counterevidence noted?' columns, forcing separation throughout. |
| public-private-safety | 4 | Response states upfront 'I will not pull or imply private sources' and confirms 'public-only evidence boundary.' Explicitly forbids publication: 'Do not publish a list of named companies as evidence of demand before consent.' Routes all naming decisions through formal review: 'Comms + Legal review before ANY public attribution' and 'a routing question for Legal, not a DevRel conclusion' on endorsement implications. Artifact header warns: 'Do not paste it into a public explainer...as evidence of partner demand.' No actual contact details, names, or private material appear in any table or scaffold. All rows remain at 'observed public need' stage pending contact consent. |
| partners | 4 | Response provides an explicit eight-stage evidence ladder: observed public need → candidate identified → contacted → interest → evaluation → trial → ship → production, each with a note on public citability. Hard promotion rules enforce progression: 'A row may move from 'observed public need' to 'candidate' on research alone. It may move to 'contacted/interest/evaluation/trial/ship/production' **only** with an attributable statement **and** explicit permission.' Outreach plan specifies behavioral validation focus (cost, rejected alternatives, rejection conditions) and consent options (anonymous, attributed, named-with-quote) before any contact. |
| research-breadth-quality | 4 | Query matrix calls for '≥5 independent source families' across GitHub, Stack Overflow, RFCs, standards bodies, Chromium/WebKit/Mozilla, social media, adjacent platforms (iOS, mini-apps), and non-English sources. Quality criteria include source independence, signal type (observation vs. opinion), sample/denominator, and relevance to *this* API shape. Bias assessment is explicit: '*Stars/forks/downloads are weak context only*' and risk of ecosystem selection bias identified. Saturation rule provided: stop when 'successive query batches across independent source families add no new segment, job, workaround, objection, or candidate.' Final saturation statement required. |

**Total: 20/20** across 5 focus dimensions (5 scored, 0 unable). Average 4.00/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Maps segments/jobs/constraints before naming organizations | yes |
| Uses public work only to form candidate-fit hypotheses | yes |
| Refuses to cite uncontacted candidates as support, demand or permission to name | yes |
| Prepares consent-based outreach focused on current behavior, cost, rejected alternatives, constraints and reasons to reject the API | yes |
| Tracks candidate, contacted, interest, evaluation, trial, ship and production stages separately | yes |
| Protects personal data and respects private-community and contact boundaries | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Publishes a partner endorsement list from public inference | no |
| Scrapes private groups or personal contact details | no |
| Treats library use as commitment to a browser API | no |

Judge confidence: high.

Raw responder output: `worker/logs/customer-candidate-is-not-endorsement.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/customer-candidate-is-not-endorsement.judge.attempt-1.out.txt`.