# Eval result: `fixed-denominator-launch-retrospective`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Review multiple milestones without hiding failures or losing work when search crashes  
**Run:** `2026-07-28-independent-batch4`  
**Date:** 2026-07-28T07:41:05.629Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 159167 | 2026-07-28T07:41:05.629Z | 2026-07-28T07:47:26.570Z | 380941ms |
| Judge | anthropic | claude-haiku-4 | 169854 | 2026-07-28T07:47:26.571Z | 2026-07-28T07:48:55.134Z | 88563ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| retrospective-coverage | 2 | The response identifies the correct denominator (291 unique / 355 memberships / 41 multi-milestone) and cites the prior run's fixed inventory from 'modules/launch-retrospective.md R1–R5,' explicitly distinguishing non-additive membership counts. However, it does not rebuild or regenerate the 291 per-feature reports this session: 'The per-feature artifacts... are **not present** at the worker path... I cannot enumerate directories.' The response cites the prior aggregates as facts *about that run* but states 'not re-verified this session (no data store reachable).' For a retrospective that must replay phases 0–10 per feature and retain all 291 including partial/blocked targets, relying on unverified documented aggregates is a material omission. |
| outcome-evidence | 2 | The response proposes nine outcome dimensions (developer value, user impact, adoption, interoperability, implementation, evidence quality, documentation, support, team resilience) in §5 Assessment B and explicitly separates each with verdicts (Unknown, Mixed, Partial) and limitation statements. However, the grounding is predominantly statements of *absence* rather than cited *evidence*: 'Developer problem: Unknown \| No post-hoc value measurement documented'; 'End-user impact: Unknown \| Not measured.' For most dimensions, the response acknowledges 'cannot certify' rather than assessing with sources. The adoption dimension cites specific counts (152 mapped, 74 family-level, 10 exact), but the portfolio is documented as having no defensible adoption signal for the majority. |
| research-resilience | 2 | The response provides a detailed runner specification in §7 with explicit design for failure isolation: 'Status enum: pending \| active \| complete \| partial \| blocked \| failed-retryable; One provider/search failure must affect only one job, not the run' plus 'atomic writes (temp file + rename),' exponential backoff, bounded concurrency, and cache-first strategy. However, this is a specification for future execution by 'a worker with write access,' not demonstrated resilience in this session. The response states upfront '[BLOCKER] no write tool' and '[BLOCKER] No readable inventory/data store reachable,' and does not execute its own resilience architecture. The actual behaviors are honest disclosure of constraints, not active resilient research. |
| continuous-learning | 3 | The response maintains explicit inventory (291 unique features, 355 memberships, 41 multi-milestone, 152 mapped, 139 unmapped, 74 family-level), surfaces contradictions (§5: 'process-rich but outcome-poor'), states questions upfront (§1 Q1–Q5), proposes monitoring triggers (per-milestone incremental runs, quarterly outcome refresh, append-only revisions with dated changes), and identifies owners as 'config-required' stakes. Unknowns are labeled throughout (§4 phases rated Unknown, Partial, Supported). However, the actual outcomes are predominantly Unknown, which limits the dimension's 'learning outcomes' aspect; the loop structure is inherited from existing modules rather than fully specified. |
| evidence-hygiene | 3 | The response rigorously labels facts ('[FACT — tooling],' '[FACT — data],' '[FACT — what IS available]'), signals ('[SIGNAL]'), hypotheses ('[HYPOTHESIS]'), recommendations ('[RECOMMENDATION]'), unknowns (explicit throughout §4–§5), and contradictions ('[CONTRADICTION surfaced]' in §5). For example: 'Highest-risk assumption: that the prior run's documented aggregates are faithful to the underlying 291 reports. I treat them as facts *about the run* but cannot re-verify the 291 underlying rows without the data store.' The §4 assessment table assigns each phase a rating (Unknown, Partial, Supported, Contradicted) with explicit grounds. However, the labeling is embedded in prose rather than consistently formatted, and a full audit of which statements are which category is not systematic. |
| counterevidence | 2 | The response tests contrary hypotheses in §6 'Challenge' across five lenses: problem/use-case validity questions whether 71% prototype-unknown features are genuinely 'low-risk catchup'; interoperability raises 'interop is the dimension most likely to be silently over-credited' and argues for steeper skepticism; measurement flags family-level counters as 'dominant overclaim risk'; survey/demand asks 'how many 140–150 features rested on category-survey demand'; and counterfactual argues 'would instrumenting outcome metrics at launch have let us answer this retrospective at all?' (the core meta-challenge). However, these are portfolio-level and methodological critiques, not systematic per-feature tests of whether specific features 'should not exist' or specific narrowings. The final verdict resolves cleanly to 'Unscored / predominantly Unknown' without retaining feature-specific contradictions. |

**Total: 14/24** across 6 focus dimensions (6 scored, 0 unable). Average 2.33/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Builds the authoritative ChromeStatus inventory before analysis and distinguishes launch-event denominator from unique-feature/report denominator | yes |
| Keeps every feature including partial, blocked, deprecated and low-evidence targets visible | yes |
| Caches ChromeStatus and direct primary evidence before bounded external search jobs | yes |
| Uses per-feature resumable jobs, atomic output, retries/backoff, provider fallback, validation and explicit pending/partial/blocked statuses so one failure cannot stop the run | yes |
| Replays every lifecycle phase using evidence available at the relevant time and separates hindsight | yes |
| Assesses multidimensional outcomes with sources/limitations instead of one success score | yes |
| Stores every report and source record publicly, preserves revisions, publishes exact completion counts, and converts recurring findings into phase/skill/eval changes | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Samples only prominent or successful features | no |
| Drops blocked research targets from the denominator | no |
| Calls shipment or usage alone success | no |
| Treats no critical press or missing data as a positive result | no |
| Lets one search-provider or agent failure abort or corrupt the run | no |
| Publishes an aggregate before every target has a terminal complete, partial or blocked state | no |

Judge confidence: high.

Raw responder output: `worker/logs/fixed-denominator-launch-retrospective.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/fixed-denominator-launch-retrospective.judge.attempt-1.out.txt`.