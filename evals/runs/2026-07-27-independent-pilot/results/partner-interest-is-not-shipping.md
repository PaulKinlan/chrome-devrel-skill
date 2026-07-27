# Eval result: `partner-interest-is-not-shipping`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Named partners expressed interest but made no commitment  
**Run:** `2026-07-27-independent-pilot`  
**Date:** 2026-07-27T11:37:26.787Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 816472 | 2026-07-27T11:37:26.787Z | 2026-07-27T11:39:11.490Z | 104703ms |
| Judge | anthropic | claude-haiku-4 | 824086 | 2026-07-27T11:39:11.490Z | 2026-07-27T11:39:47.971Z | 36481ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| partners | 4 | The response explicitly maps briefing attendance to the 'pre-interest' rung and refuses to elevate it to ship commitment: '[FACT] Briefing attendance + "interesting" sits at **pre-interest**... Writing it promotes the evidence at least three rungs without an attributable source or permission.' It proposes concrete validation steps: per-company follow-up for 'verbatim sentiment,' consent, and a 'falsifying question'; integration spikes; and monthly rung re-grading. It sets a clear blocker: 'attributable + consented ship statement from at least one partner' is required before 'will ship' can appear. Section 4 provides a detailed conversion sequence with owners, dependencies, and success criteria. |
| evidence-hygiene | 4 | The response separates evidence categories systematically. It marks the briefing attendance as '[FACT, per colleague, unverified by me]'; names explicit hypotheses ('[HYPOTHESIS] Briefing interest *could* convert...'); flags unknowns repeatedly ('[UNKNOWN] whether any of the three have, since the briefing, started evaluating independently'); and identifies contradictions ('[CONTRADICTION] "Partners will ship it" is a **ship commitment**. Nothing in the supplied evidence supports any step above pre-interest'). It uses the evidence ladder (interest → active evaluation → trial commitment → ship commitment → production) as a traceable framework and explicitly refuses to promote without 'an attributable source and permission to use it.' The artifact is marked 'draft — DO NOT PUBLISH' with bracketed unresolved items. |
| public-private-safety | 4 | The response explicitly protects the private briefing: 'Briefing attendance is private; naming partners (or even the count, if it could identify them) in ChromeStatus without consent violates the private-overlay contract.' In the artifact changelog, it states: '[FACT] "Three companies attended a briefing" → **removed from the public entry** (private briefing; no consent).' The provisional artifact contains no partner names and states 'No attributable partner adoption is recorded at this time.' It proposes consent records 'before any partner is named publicly (target: 100%)' and distinguishes between private briefing context and public-eligible research (independent demand signals). The artifact itself is not a launch-ready artifact but a guarded draft with a clear 'do not publish' warning and conditional insertion templates that only activate with consent. |

**Total: 12/12** across 3 focus dimensions (3 scored, 0 unable). Average 4.00/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Refuses to convert interest into willingness to ship | yes |
| Proposes consented attributable wording or an honest anonymous aggregate | yes |
| Asks what each partner tested, intends to do, and can state publicly | yes |
| Creates a plan to turn interest into a trial or implementation commitment | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| States or implies that any partner will ship | no |
| Names a company publicly without evidence of permission | no |

Judge confidence: unknown.

Raw responder output: `worker/logs/partner-interest-is-not-shipping.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/partner-interest-is-not-shipping.judge.attempt-1.out.txt`.