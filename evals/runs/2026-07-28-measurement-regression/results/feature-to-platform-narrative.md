# Eval result: `feature-to-platform-narrative`

**Status: COMPLETE** — independent fresh-context responder + separate fresh-context judge.

**Case:** Connect an API to a broader monetisation narrative  
**Run:** `2026-07-28-measurement-regression`  
**Date:** 2026-07-28T15:40:53.403Z

## Provenance

| Role | Provider | Model | PID | Started | Ended | Duration |
| ---- | -------- | ----- | --- | ------- | ----- | -------- |
| Responder | zai | glm-5.2 | 1122230 | 2026-07-28T15:40:53.403Z | 2026-07-28T15:44:15.887Z | 202484ms |
| Judge | anthropic | claude-haiku-4 | 1125780 | 2026-07-28T15:44:15.887Z | 2026-07-28T15:46:02.994Z | 107107ms |

- **Independent contexts:** yes (distinct PIDs, separate `--no-session` invocations)
- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**

> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.

## Focus dimensions (0–4)

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| problem-use-cases | 2 | Identifies the core problem—'Publishers/creators on the open web have limited, ad-dominated, gatekeeper-prone monetisation options'—and surfaces key uncertainties (unmet demand for streaming micropayments, wallet liquidity, user willingness). Explores micropayments-failure history and stakeholder critique. However, lacks concrete use-case testing against specific publisher workflows (newsletter platforms, news organizations, creator sites) and does not rigorously compare realistic monetisation alternatives (native in-app purchase, social platforms, subscription services) beyond surface acknowledgment in §4.3 and a deferred research task in §5. |
| ecosystem-integration | 1 | Names specific tools (WordPress, Ghost, Astro, React, Vue) and identifies framework-integration as a bottleneck in §4.5. Acknowledges CMS/framework maintainers as stakeholders with concerns. However, does not examine integration mechanics, deployment constraints, payment-processor ecosystem, or business-workflow impacts. The readiness assessment for 'Framework/CMS fit' is marked 'Partial/Unknown' with only 'Some early integrations existed historically.' No friction analysis, plugin specifications, or hosted/self-hosted deployment implications are explored. |
| narrative-linkage | 3 | Establishes a clear spine in §4.1: API delivers 'a missing, open, provider-neutral money rail' paired with the web's 'distribution advantages.' §4.3 constructs a detailed table pairing each web strength ('distribution without a gatekeeper tax') with its corresponding weakness and the API's role. §3.1 and §3.3 distinguish the primitive layer (what the browser does) from wallet/identity/business-model design (what it does not). The audit pass explicitly surfaces the load-bearing claim ('The web wins on distribution, loses on monetisation primitives') and marks it as hypothesis requiring evidence. Correctly and usefully traces features to platform narratives and identifies evidence gaps. |
| tactic-fit | 3 | §4.5 diagnoses bottlenecks explicitly—user-side liquidity, publisher integration friction, ecosystem signal, interop signal—and maps tactics to each: CMS plugins for friction, partner pilots for demand evidence, GDE enablement for ecosystem signal, standards work for interop. §5 sequences activities (evidence close → integration enablement → trials → case studies → scale) and lists explicit blockers. Tactic selection is bottleneck-first, not broadcast-driven. However, tactics remain generic (which partners? which CMS?) and are hypothesis-driven; no field research demonstrates these are the real bottlenecks. Correctly handled and usefully sequenced, but not rigorously executed against evidence. |
| measurement | 3 | §6 pairs leading indicators (framework/CMS integrations, integration time, partner progress stages) with lagging indicators (production deployments, publisher-reported revenue, engine movement, Baseline availability) and diagnostics (abandonment reasons, objection themes). Defines guardrails (privacy, no coercive patterns, accessibility). Explicitly states 'all numerators/denominators/baselines marked **to be set** — I do not invent baselines.' Includes an anti-pattern warning: 'do **not** report posts, talks, GitHub stars, or raw interest as adoption outcomes.' Leading/lagging distinction is clear, data limitations are flagged, and feedback loops are implicit in the phased sequence. Correctly and usefully handled; framework is sound. |

**Total: 12/20** across 5 focus dimensions (5 scored, 0 unable). Average 2.40/4.0.

### Expected behaviors

| Behavior | Met? |
| -------- | ---- |
| Separates the individual API value proposition from the broader platform narrative | yes |
| Tests whether the API materially supports publisher workflows and business outcomes | yes |
| Connects the narrative to concrete capabilities, integrations, evidence, limitations, and adoption paths | yes |
| Compares relevant alternatives without straw-manning native, social, or chat platforms | no |
| Identifies missing capabilities rather than pretending one API completes the story | yes |

### Forbidden behaviors

| Behavior | Present? |
| -------- | -------- |
| Treats one API as proof of the web's entire value | no |
| Produces only high-level messaging with no implementation or adoption path | no |

Judge confidence: high.

Raw responder output: `worker/logs/feature-to-platform-narrative.responder.attempt-1.out.txt`. Raw judge output: `worker/logs/feature-to-platform-narrative.judge.attempt-1.out.txt`.