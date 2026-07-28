# Eval result: `deep-ecosystem-native-miniapp-agent-research`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Research a capability across web and adjacent ecosystems  
**Run:** `2026-07-28-independent-batch5`  
**Date:** 2026-07-28T15:07:29.745Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 1085788 | 2026-07-28T15:07:29.745Z | 2026-07-28T15:11:00.712Z | 210967ms |
| Judge | anthropic | claude-haiku-4 | 1089443 | 2026-07-28T15:11:00.713Z | 2026-07-28T15:12:25.780Z | 85067ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| research-breadth-quality | 2 | The response acknowledges varied source families (web, iOS, Android, mini-app, chat, LLM/agent, framework/server, standards) and provides a seed query matrix (F.4) with problem language, workaround language, skeptical language, adjacent patterns, and regional/non-English queries. However, it does NOT execute the research—it frames this as 'To be populated by the team from primary sources; do not infer cells' (F.3). It plans deduplication and saturation rules (E, item 4: 'explicit supportive + skeptical + failure queries and a saturation stopping rule') but does not demonstrate actual breadth across varied source families. For a plan-stage artifact, this is appropriate scaffolding, but it falls short of demonstrating real breadth across evidence sources. |
| adjacent-platform-analysis | 3 | Section D.3 explicitly identifies iOS, Android, WeChat/Alipay/Douyin mini-programs, chat/messaging, LLM/agent platforms, and framework/server stacks. For each, it specifies patterns to extract (job, permission/control model, lifecycle, distribution, incentives, user cost, failure modes, abuse, web-fit): 'extract the job, permission/control model, lifecycle, distribution, user control, cost, adoption and failure patterns rather than copying native API shapes.' It warns against API-shape copying ('Copying native lifecycle without adaptation') and extracts relevant patterns like mini-app precedent of *gating* re-engagement (not expanding it). However, it provides only the matrix scaffold (F.3) with instruction 'To be populated by the team from primary sources; do not infer cells' — the actual adjacent-platform analysis is planned, not executed. |
| counterevidence | 3 | Section D.4 is dedicated entirely to 'the strongest case against adding a browser API,' providing seven steelmanned objections: (1) conservative background model is a feature, (2) re-engagement is values-laden (site vs. user benefit), (3) browser may be wrong layer (server already serves it), (4) interoperability risks, (5) copying native lifecycle, (6) mini-app precedents argue for gating not expansion, (7) user cost asymmetry. It tests the hypothesis that AI agents are the real driver but labels this as hypothesis requiring evidence: 'Hypothesis (leading candidate)' with contradiction noted: 'most of this work already runs server-side.' It frames falsification (F.2: 'What evidence would show the problem is rare, already solved, server-layer, or too costly/risky?'). The response does not search only for support; it actively tests disconfirmation. |
| end-user-impact | 3 | The response explicitly separates developer/site benefit from end-user benefit: 'The **user** may not want "more re-engagement"; the **site** does' (D.4.2). It identifies concrete resource costs: 'battery; **metered-data**; memory/thermal; notification fatigue and compulsive-use risk; **covert background activity** (privacy); accessibility; low-end-device slowdown' (D.6). It tests low-end configurations: 'on low-end devices and metered networks — where most of the next billion users are — this asymmetry is sharpest' (D.4). It asks about consent/control ('What is the exact consent/refusal/revocation model?'). However, it does not actually measure or analyze these impacts—it frames them as 'Unknown' in the readiness table and flags them for investigation, which is appropriate for intake stage but means impact analysis is planned, not demonstrated. |
| phase-transition | 3 | The response explicitly diagnoses lifecycle stage: 'Lifecycle stage: Intake, transitioning into Incubation research.' Section E provides 'Outcome & exit criteria for this research phase' with testable conditions (C1-C5 claims under test) and 'Activities & artifacts (sequence)' listing 8 deliverables with owners (existing-web matrix, adjacent-platform matrix, 'why not' brief, developer evidence pass, stakeholder sources, interviews, problem brief, user-impact brief). It identifies dependencies and risks ('Without a named product/eng owner who can state the concrete job, items 1–3 cannot be scoped precisely'). It specifies 'continue / narrow / park / stop' decision triggers (E). Section B provides 'Recommended next intervention' and 'Key strategic framing.' However, owners are generic ('DevRel + Eng') without named individuals, and dates/timelines are absent—appropriate unknowns for this stage but mean the handoff is structured but not fully operationalized. |

**Total: 14/20** across 5 focus dimensions (5 scored, 0 unable). Average 2.80/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Frames jobs and decision questions before searching and includes falsification questions | yes |
| Builds a varied public source/query map across existing web, iOS, Android, mini-app/super-app, chat, LLM/agent, framework/server, standards and developer communities | yes |
| Extracts lifecycle, permission, distribution, user control, cost, adoption and failure patterns rather than copying native API shapes | yes |
| Deduplicates evidence, records source quality/selection limits, uses relevant regions/languages, and defines a saturation/stopping rule | yes |
| Tests library/server/no-change/extension/new-primitive alternatives and the strongest why-not case | yes |
| Turns results into a web-fit recommendation, research gaps, candidate segments and next phase tasks | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Returns a promotional list of native features | no |
| Assumes iOS or Android behavior belongs on the web | no |
| Uses hundreds of searches as proof of research quality | no |
| Ignores mini-app or non-Western ecosystems because sources are less familiar | no |

Judge confidence: high.

Raw responder output: `worker/logs/deep-ecosystem-native-miniapp-agent-research.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/deep-ecosystem-native-miniapp-agent-research.judge.attempt-1.out.txt`.