# Chrome DevRel Skill

A stage-aware copilot for Chrome Developer Relations work across a feature or initiative's full lifecycle.

This project is in public discovery and will be iterated in the open. It is not a canonical Chrome process document.

## Intended users

- Developer relations engineers / developer advocates
- Technical writers
- Product managers
- Engineers and feature owners
- Developer marketing, partnerships, standards, and ecosystem collaborators

## Proposed outcomes

The skill should help a user:

1. Identify the lifecycle stage and the decision they need to make.
2. Test whether the underlying developer problem and demand are real.
3. Find missing evidence, stakeholders, integration risks, and adoption barriers.
4. Choose appropriate DevRel tactics rather than defaulting to an article.
5. Produce a coherent, reusable asset pack when the evidence is ready.
6. Measure adoption, support burden, and learning after launch.

## Architecture

The project will use a **public core**: public process sources, reusable reasoning, evidence discipline, artifact templates, and public-safe evals. If private Chrome overlays are added later, they must remain separate and must never leak internal evidence into public outputs.

The skill supports both directions:

- **Evidence first:** investigate a feature or initiative, expose gaps, and build a credible readiness plan.
- **Artifact first:** accept a request such as “make the launch deck,” but inspect and research the evidence needed to make that artifact accurate and useful before drafting it.

It does not impose a fictional DevRel veto. It records readiness by dimension, explains consequences of missing evidence, and helps teams make better-informed decisions even when Chrome chooses to proceed.

## Initial modes

- `feature`: an individual API or developer-facing change
- `initiative`: a group of capabilities with one developer outcome or platform narrative
- `deprecation`: removal, migration, or behavior change
- `adoption`: scaling an already-shipped capability
- `support`: diagnosing recurring developer problems and feeding them back into product/docs
- `event`: talk, meetup, workshop, conference, or GDE enablement
- `continuous portfolio`: recurring improvement across multiple features, stages, and releases

## Principles

- Interrogate before generating.
- Treat absent evidence as unknown, never positive.
- Separate facts, hypotheses, commitments, and recommendations.
- Fit the work to its lifecycle stage.
- Design for interoperability, framework adoption, server integration, and real deployment—not only an isolated demo.
- Prefer reusable systems and enablement packs over one-off assets.
- Preserve a public/private evidence boundary.
- Never imply that DevRel endorsement replaces API Owner, standards, privacy, security, accessibility, legal, or engineering review.

The skill should nevertheless **rehearse every relevant review perspective** and seek the real user impact before formal review. The boundary means “do not claim sign-off,” not “ignore these concerns until another team finds them.”

## Example prompts

You do not need to know the Chrome launch process or DevRel terminology. A rough idea or one public link is enough to start; the skill should classify the work, research public evidence, and ask the next useful questions.

### Assess a feature

> Assess this feature from a Chrome DevRel perspective: [ChromeStatus, explainer, spec, intent, or rough description]. Work out its lifecycle stage, developer problem, evidence quality, affected users, interoperability path, integration risks, likely stakeholder critiques, missing work, and the next five highest-leverage actions. Research public evidence rather than making me collect it all.

### Prepare a phase transition

> This feature is currently in [incubation / prototype / developer trial / wide review / origin trial / prepare-to-ship]. Diagnose whether that is accurate, load the detailed phase guidance, and build the full transition packet for the next phase: evidence, research, users, partners, risks, integrations, review state, artifacts, learning goals, unknowns, contradictions and human decisions. Do not reduce the transition to an Intent email.

### Run ecosystem and customer research

> Run deep ecosystem/customer research for [problem or proposed capability]. Search multiple independent public source families and relevant languages/regions; find developer jobs, workarounds, failures, communities, candidate customers/partners, frameworks, existing web solutions, iOS/Android/desktop equivalents, mini-app/super-app patterns, chat/LLM/agent approaches, and evidence against the proposal. Deduplicate the evidence, assess source quality and bias, state saturation and gaps, and turn it into product/design, outreach and phase-transition recommendations—not a link dump.

### Start with an artifact

> I need a launch presentation for [feature]. Treat the deck as the entry point: determine what evidence and decisions it needs, research what is public, ask me only for information you cannot obtain, flag unsupported claims, and then create a coherent outline, slide content, speaker notes, demo plan, sources, and review checklist.

### Build a connected narrative

> Help me build a narrative for [theme, for example web monetisation or user experience]. Connect “why the web” and “why Chrome” to concrete developer jobs, APIs, integrations, evidence, limitations, partner/adoption paths, and measurable outcomes. Identify missing pieces instead of pretending the existing features tell a complete story.

### Prepare a talk or workshop

> I am new to DevRel and need a [20-minute talk / workshop] for [audience] about [topic]. Help me define the audience outcome and narrative first, then create the presentation, speaker notes, demos/exercises, timings, accessibility requirements, fallback plan, source list, expected questions, and rehearsal checklist.

### Plan social and promotion

> Create a developer-facing promotion plan for [feature/initiative]. First check the claims, audience, support state, partner evidence, risks and likely criticism. Then propose channel-specific posts, timing, calls to action, replies/FAQ, owners, measurements, and a correction/hold plan. Do not turn uncertain evidence into launch hype.

### Run a friction log

> Run a friction log for [API/demo/docs URL] as a developer trying to accomplish [real task]. Test discovery, setup, first success, realistic framework/server integration, mobile and desktop, controls, edge/failure/recovery paths, console/network behavior, accessibility, performance, visual output, docs/explainer/implementation mismatches, and cleanup. Preserve evidence and produce exact tested/fixed/remaining/blocked counts.

### Rehearse reviews and user impact

> Before formal review, rehearse the accessibility, privacy, security, standards/interoperability, legal/regulatory, competition, engineering/performance, enterprise, and real end-user perspectives for [feature]. Include downloads, storage, memory, battery, bandwidth, consent, low-end devices, refusal/revocation, hostile use, fallback and rollback. Mark everything as pre-review analysis, not approval.

### Red-team a contentious proposal

> Build a source-grounded stakeholder critique for [proposal]. Discover everyone materially affected; retrieve their current published principles and positions; separate recorded positions from inference; steelman the strongest cases for and against; analyze power and incentives; and map each concern to evidence, design changes, mitigation, outreach, narrower scope, delay, rollback, abandonment, or accepted risk.

### Plan an origin trial or developer trial

> Design a developer/origin trial for [feature]. Define the uncertainties the trial must resolve, representative participants and partners, recruitment, realistic tasks, samples, support, survey/interview instruments, telemetry and privacy, success/failure criteria, feedback publication, and the decision paths after the trial.

### Create “DevRel in a box”

> Create a reusable enablement pack for [feature/initiative] for Chrome staff, GDEs, partners and meetups. Include rationale, audience variants, canonical deck and notes, tested demos, workshop, reference links, FAQs/troubleshooting, social copy, accessibility/localization, versioning, ownership, feedback channels, and reuse/adoption measures.

### Improve support

> Developers repeatedly struggle with [problem]. Separate product bugs, implementation differences, framework/server integration, docs, samples and messaging. Build reproductions, issue routing, troubleshooting/FAQ improvements, regression tests, product feedback, owners and measures for recurrence and resolution time.

### Run continuously

> Put [feature, initiative, or portfolio] into the continuous DevRel loop. Build an explicit inventory and denominator; gather current evidence; run friction, stakeholder and user-impact reviews; create questions and goals; improve the right product/docs/demo/tooling/enablement layers; validate fixes; update the public source of truth; and define event-driven, weekly, milestone and post-launch monitoring.

### Run launch retrospectives

> Build a fixed ChromeStatus inventory for milestones [range] and run one evidence-backed retrospective per feature. Replay every lifecycle phase; retain ChromeStatus, specs/explainers, intents/reviews, implementation/issues, docs/demos, usage, interoperability, frameworks, case studies, support, positive and critical ecosystem evidence, user impact and communication. Score outcomes by dimension, preserve missing/blocked evidence, store every report publicly, and turn recurring lessons into skill changes and regression evals. Make the run resumable if any search provider or agent fails.

### Prepare for a difficult launch

> Create a launch-resilience plan for [feature]. Preserve legitimate criticism while preparing for press scrutiny, issue-volume spikes, moderation, harassment, doxxing and threats. Define roles, escalation, source of truth, structured feedback, moderation, staff privacy, spokesperson coverage, hold/correction/rollback language, team support and post-incident learning. Do not make individual engineers absorb abuse.

## Current work

- [Detailed lifecycle phase modules and transition packets](phases/README.md)
- [Lifecycle and DevRel intervention map](research/blink-lifecycle-map.md)
- [Stakeholder critique module](modules/stakeholder-critique.md)
- [Ecosystem, customer, adjacent-platform, and counterevidence research](modules/ecosystem-and-customer-research.md)
- [User-impact and formal-review rehearsal](modules/user-impact-and-review-rehearsal.md)
- [Evidence-based friction logs](modules/friction-log.md)
- [Launch resilience and team safety](modules/launch-resilience.md)
- [Continuous DevRel improvement loop](modules/continuous-loop.md)
- [Evidence-based launch retrospective method](modules/launch-retrospective.md)
- [Chrome 140–150 retrospective run](retrospectives/README.md)
- [Public case notes: HTML-in-Canvas, Baseline, Prompt API, and WEI](research/public-case-notes.md)
- [Discovery questions](research/discovery-questions.md)
- [Early skill scaffold](SKILL.md)
- [Evaluation design and fixtures](evals/README.md)

Rigorous criticism is welcome. See the [community conduct policy](CODE_OF_CONDUCT.md), which explicitly protects substantive disagreement while prohibiting harassment, threats, and doxxing.
