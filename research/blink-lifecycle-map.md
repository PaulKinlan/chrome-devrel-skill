# Blink lifecycle and proposed DevRel interventions

Status: initial public-source research, 2026-07-19. This is a working map, not a replacement for Chromium's canonical launch documentation.

## Canonical public sources

- [The Chromium process to launch a new feature](https://www.chromium.org/blink/launching-features/)
- [Getting wide review](https://www.chromium.org/blink/launching-features/wide-review/)
- [Documenting review from web and framework developers](https://www.chromium.org/blink/launching-features/wide-review/web-developers/)
- [Let web developers know about new features](https://www.chromium.org/blink/launching-features/let-developers-know/)
- [How Chrome Status communicates with web developers](https://www.chromium.org/blink/launching-features/how-chrome-status-communicates/)
- [ChromeStatus concepts](https://github.com/GoogleChrome/chromium-dashboard/wiki/Concepts)
- [ChromeStatus feature-owner tasks](https://github.com/GoogleChrome/chromium-dashboard/wiki/Feature-Owner-Tasks)
- [ChromeStatus review gates](https://github.com/GoogleChrome/chromium-dashboard/wiki/Overview-of-Review-Gates)
- [Origin trials](https://web.dev/origin-trials/)

## Working lifecycle

| Stage | Canonical process signal | DevRel questions | Candidate DevRel outputs | Do not advance the DevRel work as “ready” when… |
|---|---|---|---|---|
| 0. Intake and classification | Before or alongside ChromeStatus creation | Is this a feature, initiative, deprecation, adoption problem, or support problem? Who experiences the problem? Why is browser/platform intervention appropriate? | Intake record; stakeholder map; evidence inventory; lifecycle diagnosis | The problem, audience, decision, owner, or data boundary is unclear |
| 1. Incubation | ChromeStatus entry; use cases/scenarios in a public explainer; incubation venue | Are use cases concrete, important, and currently painful? What do developers do today? What alternatives were considered? | Use-case critique; ecosystem/problem research; developer interview/survey plan; alternative-solutions map | The proposal starts from an API shape rather than a validated problem |
| 2. Prototype | Start Prototyping; Intent to Prototype; public design work; runtime flag | Can developers understand and integrate it? Does it compose with frameworks, build tools, servers, security models, and deployment constraints? | Minimal examples; framework/server integration spikes; API ergonomics study; early narrative; partner candidates | Only toy examples work, or essential integration paths are unknown |
| 3. Developer trials | Feature complete behind a flag; Ready for Developer Testing; iterate on design | What must be learned before design settles? Which developers can exercise realistic workflows? | Trial guide; feedback rubric; showcase demos; office hours; issue routing; developer cohort | Feedback asks only “do you like it?” or lacks representative production use cases |
| 4. Widen review / readiness | TAG and vendor review; web/framework developer signal; documentation coordination; specification work | Is there a credible interoperability path? What do WebKit, Gecko, frameworks, libraries, enterprises, and affected communities need? | Evidence-backed developer signal; framework compatibility matrix; Baseline expectation; docs plan; migration/integration risk register | “No signal” is presented as support, or outreach evidence cannot be traced |
| 5. Experiment | Origin Trial and Intent to Experiment where warranted | What explicit uncertainty requires field testing? Which metrics and qualitative evidence answer it? Which partners will participate? | Recruitment and enablement kit; OT sample; feedback survey/interview plan; support plan; experiment readout | The trial has no learning goals, committed users, fallback, support route, or exit criteria |
| 6. Prepare to ship | Complete spec; final reviews/sign-offs; Prepare to Ship; Intent to Ship; target milestone | Is the feature teachable, adoptable, supportable, and honestly positioned? What can ship together? | Launch brief; reference/docs gap analysis; intro article; complete samples; FAQ/troubleshooting; compatibility and fallback guidance; announcement plan | Core docs, realistic examples, known limitations, migration guidance, or support ownership are missing |
| 7. Release communication | Feature freeze; beta/stable release coordination | What is the developer outcome, not merely the API? Which audiences and channels matter? | Release-note text; article/video; canonical deck; demo; speaker notes; social copy; press/developer-marketing brief | Claims exceed evidence, or assets conflict on terminology, support, or value |
| 8. Adoption and scale | Post-ship ecosystem work | What prevents adoption? Which multipliers—tools, frameworks, GDEs, partners, events, education, diagnostics—remove that friction? | “DevRel in a box”; workshops; framework adapters; Lighthouse/DevTools checks; partner plan; GDE kit; ecosystem campaign | The plan is only broadcasting, with no distribution/adoption mechanism |
| 9. Support, measurement, and iteration | Monitor crashes/regressions, UseCounters, compatibility and design feedback | What are developers failing to do? Is the root cause product, docs, tooling, implementation, compatibility, or messaging? | Public FAQ/troubleshooting; issue taxonomy; reproductions; support dashboard; product feedback; adoption and quality review | Support learning is not fed back to product, docs, samples, or standards work |
| 10. Deprecation/removal | Intent to Deprecate/Remove and migration process | Who breaks, how can they detect it, and what migration time/tooling is required? | Compatibility impact study; migration guide; detection/audit tooling; outreach plan; reverse-trial support where applicable | Affected developers cannot identify impact or complete a supported migration |

## Evidence types the skill should distinguish

- **Fact:** linked public source, measured data, or verified implementation behavior.
- **Developer signal:** attributable evidence from developers or framework/ecosystem representatives.
- **Partner commitment:** a named party has agreed to trial, ship, integrate, or publicly support something; interest alone is not commitment.
- **Hypothesis:** a claim that still needs a test.
- **Recommendation:** a proposed action with rationale, owner, timing, and expected outcome.
- **Unknown / blocked:** required information is missing or inaccessible.

## Early design implications for the skill

1. It should begin by classifying mode, stage, audience, decision, and evidence boundary.
2. It should ask only the highest-leverage unanswered questions for that stage.
3. It should maintain an evidence ledger and never turn absence of criticism into positive signal.
4. It should recommend tactics based on the adoption bottleneck, not produce the same checklist for every feature.
5. Artifact generation should be gated: drafts can be produced early, but must carry unresolved assumptions and may not claim readiness.
6. Initiative mode must connect individual APIs to a coherent developer job, business lifecycle, and platform narrative.
7. Post-launch support and adoption are part of the lifecycle, not an afterthought.
