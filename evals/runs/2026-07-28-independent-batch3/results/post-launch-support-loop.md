# Eval result: `post-launch-support-loop`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Recurring support failures after shipment  
**Run:** `2026-07-28-independent-batch3`  
**Date:** 2026-07-28T07:12:30.261Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 90796 | 2026-07-28T07:12:30.261Z | 2026-07-28T07:15:29.623Z | 179362ms |
| Judge | anthropic | claude-haiku-4 | 102132 | 2026-07-28T07:15:29.624Z | 2026-07-28T07:16:48.590Z | 78966ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| ecosystem-integration | 4 | The response systematically enumerates integration domains (framework fit, server/deployment, API ergonomics, permission-policy, CSP, SSR/hydration, bundler behavior, reverse-proxy behavior, origin-trial tokens, version detection) and explicitly separates facts ('API is shipped; docs are minimal reference example only'), signals ('usage is growing; repeated reports'), and unknowns ('Which API, which framework(s), which server stack? → unknown'). Lens B lists testable technical vectors (secure context, CORS, service worker, CSP, proxy behavior) and proposes explicit hypotheses to test rather than inventing answers. The readiness assessment table itemizes 20+ integration dimensions with rationale for each being unknown. This is rigorous and actionable. |
| tactic-fit | 4 | The response correctly diagnoses the bottleneck as root-cause classification, not documentation, and explicitly rejects the phase-09 trap: 'Do not start by writing more docs. Start by classifying whether the framework failures and server-config pain are product/implementation/compatibility problems wearing a documentation costume.' The tactic sequence (deduplicate → friction-log → classify → route → fix → docs) matches the diagnosis. Lens A proposes testing whether the framework and server failures share a root cause. The response routes external engagement (framework maintainers) to 'permission required' and privacy/security review to 'team canonical process decides.' This demonstrates diagnosis-driven tactic selection. |
| artifact-coherence | 4 | The artifact is produced as a single combined deliverable with YAML metadata including artifactType, audience (internal), status (draft), owner (role specified, name unknown), unresolvedAssumptions (listed, four items), and reviewRequirements. Part 1 defines the friction-log manifest; Part 2 provides a nine-step journey to be executed; Part 3 creates a starter taxonomy with stable IDs (F-001, F-002, F-003), each marked 'Reproduced? No — unknown,' avoiding false certainty. Part 4 documents the doc gap analysis with status (missing) and blocker (Blocked on friction-log root cause). All hypotheses are labeled 'unverified' or 'hypothesis.' Artifact is marked internal/draft, not launch-ready. Sources are marked empty (appropriate for a plan). The taxonomy is reusable across milestones via stable IDs. |
| measurement | 4 | Section 6 defines denominators explicitly: 'total recurring issues by stable ID,' 'testers/interviewees with stated stack,' 'per milestone.' Leading indicators include friction-log step failures and duplicate-issue rate. Lagging indicators include issue resolution rate, task success %, recurrence (reappearing error signatures), and regression count. The response explicitly flags data limitations: 'growing usage without a denominator is a weak signal' and 'Until segments/churn are available, do not report adoption as healthy.' Feedback loops are defined: 're-run the friction log every milestone and after implementation/docs changes.' Measurement scope matches the work (linking to stable issue IDs F-001…). |

**Total: 16/16** across 4 focus dimensions (4 scored, 0 unable). Average 4.00/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Separates implementation bugs, framework integration, server configuration, docs, and product-design causes | yes |
| Proposes reproducible cases and issue routing | yes |
| Creates framework/server guidance, troubleshooting, and FAQ work without abandoning canonical docs | yes |
| Feeds patterns back into product, samples, tests, and standards work | yes |
| Measures resolution time, recurrence, successful integration, and support burden | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Treats publication of a new article as the complete solution | no |
| Blames developers without validating the integration path | no |

Judge confidence: high.

Raw responder output: `worker/logs/post-launch-support-loop.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/post-launch-support-loop.judge.attempt-1.out.txt`.