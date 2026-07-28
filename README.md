# Chrome DevRel Skill

A stage-aware copilot for Chrome Developer Relations work across a feature or
initiative's full lifecycle.

This project is in public discovery and will be iterated in the open. It is not
a canonical Chrome process document.

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
3. Find missing evidence, stakeholders, integration risks, and adoption
   barriers.
4. Choose appropriate DevRel tactics rather than defaulting to an article.
5. Produce a coherent, reusable asset pack when the evidence is ready.
6. Measure adoption, support burden, and learning after launch.

## Architecture

The project uses a **public core**: public process sources, reusable reasoning,
evidence discipline, artifact templates, and public-safe evals. Private overlays
remain separate and never leak internal evidence into public outputs (see
`modules/private-overlay-contract.md`).

### What is shipped vs what teams must configure

| Item                   | Shipped (public core)                                                                  | Team configures                                 | Human decision                  |
| ---------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------- |
| Governance/roles       | `modules/governance-and-roles.md` + `templates/owner-map.template.json`                | Owner names, authority source                   | Who holds each role             |
| Readiness expectations | `modules/readiness-expectations.md`                                                    | Calibration to team context                     | Whether a dimension is relevant |
| Private overlay        | `modules/private-overlay-contract.md` + `schemas/private-overlay-manifest.schema.json` | Manifest instance, consent registry, pub review | What is public-safe             |
| Artifact templates     | `modules/artifact-templates.md` + `templates/*.json`                                   | Content per artifact                            | What to publish                 |
| Publishing targets     | `templates/publishing-targets.manifest.json`                                           | Custom targets                                  | Review routing                  |
| Role routing           | `phases/README.md` (table)                                                             | Governance calibration                          | Phase ownership                 |
| Measurement            | `modules/measurement-framework.md` + `templates/metric-definition.template.json`       | Baselines, targets, owners                      | What to measure                 |
| Exemplars              | `research/exemplars-and-antipatterns.md`                                               | Team-specific cases                             | Pattern applicability           |

**New user:** copy a [one-line role prompt](#start-in-one-line); no process
terminology or template setup is required to begin. Use `SKILL.md` and the
module matching your task when you need more precision. Fill in
`templates/owner-map.template.json` before relying on role routing. Items marked
"Team configures" need organization-local input before they are useful.

The skill supports both directions:

- **Evidence first:** investigate a feature or initiative, expose gaps, and
  build a credible readiness plan.
- **Artifact first:** accept a request such as “make the launch deck,” but
  inspect and research the evidence needed to make that artifact accurate and
  useful before drafting it.

It does not impose a fictional DevRel veto. It records readiness by dimension,
explains consequences of missing evidence, and helps teams make better-informed
decisions even when Chrome chooses to proceed.

## Initial modes

- `feature`: an individual API or developer-facing change
- `initiative`: a group of capabilities with one developer outcome or platform
  narrative
- `deprecation`: removal, migration, or behavior change
- `adoption`: scaling an already-shipped capability
- `support`: diagnosing recurring developer problems and feeding them back into
  product/docs
- `event`: talk, meetup, workshop, conference, or GDE enablement
- `continuous portfolio`: recurring improvement across multiple features,
  stages, and releases

## Principles

- Interrogate before generating.
- Treat absent evidence as unknown, never positive.
- Separate facts, hypotheses, commitments, and recommendations.
- Fit the work to its lifecycle stage.
- Design for interoperability, framework adoption, server integration, and real
  deployment—not only an isolated demo.
- Prefer reusable systems and enablement packs over one-off assets.
- Preserve a public/private evidence boundary.
- Never imply that DevRel endorsement replaces API Owner, standards, privacy,
  security, accessibility, legal, or engineering review.

The skill should nevertheless **rehearse every relevant review perspective** and
seek the real user impact before formal review. The boundary means “do not claim
sign-off,” not “ignore these concerns until another team finds them.”

## Use it while developing a feature

Engineers and PMs can keep one feature packet alive from the first idea through
support. The packet holds the evidence ledger, readiness matrix, stable risks and
questions, asset/data inventory, owners, decisions and phase history. Later
prompts update that packet instead of replacing prior failures with a fresh plan.

The full [feature-development prompt guide](modules/feature-development-prompts.md)
contains copy-paste prompts for API-shape review, implementation changes,
developer/partner feedback, trials, phase transitions, prepare-to-ship, release
monitoring and a complete asset/data audit.

### Start in one line

You do not need to describe the packet or process. Give the skill a role, a
feature and a decision; it should infer the rest.

> Help me progress [feature/link]. I’m the [PM / engineer / DevRel / stakeholder].
> The decision is [decision, or “work out the next decision”]. Start from [links,
> or “public evidence only”]. Give me the three biggest gaps, three next actions,
> and ask only what you cannot responsibly find.

Shortest role prompts:

- **PM:** `Assess [feature] for [next phase/release]. What is the next decision, and what is the smallest evidence needed?`
- **Engineer:** `Review [feature/API change] for readiness. What can break, what must be tested, and what should I change next?`
- **DevRel:** `Assess [feature] at its current stage for developer enablement. What is the next decision, and what evidence, integration work, docs, demos, or support are missing?`
- **Stakeholder:** `Challenge [feature] from a [user/privacy/security/standards/partner/enterprise] perspective. What is unsupported, risky, or unanswered?`
- **Continue:** `Continue [feature] from [packet/link] using these changes: [changes]. Show the delta, the next decision, and the three smallest actions.`

The longer prompts below are optional precision prompts, not the front door.

If the request says **manage the launch**, **prepare to ship**, **validate for
release**, or **deliver developer enablement for a named launch/release**, the
default is execution rather than a plan. A general early-stage enablement
assessment remains diagnostic unless the user asks to build or test assets. For
launch execution, the skill inventories the feature contract, creates missing standalone
samples and a realistic demo, runs them against the browser, records friction
from observed evidence, fully analyzes Mozilla/WebKit/TAG/incubation threads and
their substantive cross-links, audits MDN/BCD and Chrome-owned documentation,
creates patch-ready documentation where absent or stale, and reports exact
pass/fail/blocked totals. `No signal`, an open position request, no response, or
silence is never rewritten as neutral or support. External publication and formal
approval remain human controlled. See [launch execution](modules/launch-execution.md)
and [standards/incubation analysis](modules/standards-and-incubation-analysis.md).

### Engineer: detailed start

> I am the engineer or feature owner for [feature]. Here are the materials I
> have: [issue, explainer, spec, prototype, ChromeStatus entry, implementation,
> demo, tests]. Start a feature-development packet. Test the developer and
> end-user jobs, whether the browser is the right layer, smaller alternatives,
> API/implementation risks, hostile use, interoperability,
> framework/server/deployment fit, accessibility, privacy, security,
> performance/resource cost, fallback and reversibility. Research public
> evidence you can retrieve. Return the current stage and decision, five
> highest-risk assumptions, readiness matrix, smallest tests or prototypes that
> could retire them, initial asset/data inventory and next three actions. Do not
> invent demand, browser positions or approval.

### PM: detailed start

> I am the PM for [feature/problem]. The proposed outcome is [outcome], the
> current proposal is [link/description], and the decision is [fund research /
> prototype / start a trial / request wide review / prepare to ship / invest in
> adoption / narrow or stop]. Build the feature-development packet from that
> decision backward. Validate the problem, segments, alternatives, developer and
> end-user evidence, counterevidence, affected constituencies, integration and
> support cost, review questions and measures. Classify partner evidence as
> candidate, interest, active evaluation, trial commitment, ship commitment or
> verified production use. Return the strongest case for and against, readiness
> matrix, decision options, missing evidence/owners, asset/data inventory and
> sequenced plan with exit, failure and stop criteria. Preserve a real stop
> option; an intent email, prototype, partner meeting or shipment is not proof of
> success.

### Detailed continuation without restarting

> Continue the feature-development packet for [feature]. Do not restart the
> analysis or replace history with a cleaner summary. Previous packet:
> [link/file]. New evidence or changes: [CLs, issues, research, standards
> positions, review feedback, trial data, metrics, docs, demos, support]. Decision
> now required: [decision]. Verify the new material, preserve stable IDs and add
> IDs only for genuinely new findings. Show the delta first: evidence added or
> weakened, assumptions retired or reopened, contradictions, scope/API changes,
> resolved and remaining risks, and asset/data changes. Then give the next
> decision packet and smallest actions that can change the decision. Missing or
> stale evidence stays unknown. Do not promote interest to commitment, count a
> runbook as executed evidence or call a formal review complete without the
> owner's attributable approval.

### Check progression and everything it depends on

> Assess whether [feature] should move from [current phase] to [proposed phase].
> Load the matching guidance in `phases/README.md` and update the existing packet.
> For every relevant dimension, report Supported, Partial, Unknown, Contradicted
> or Not relevant, with a reason and source; distinguish advisory evidence from
> formal approval. Audit the implementation, tests, interoperability, standards
> positions, framework/server/deployment paths, user/review risks, developer and
> partner evidence, docs/BCD, samples, demos, support, measurements and owners.
> Give every asset/data item a canonical location, status, source, public/private
> boundary, review requirement and next action. Return progress / progress with
> accepted risk / remain / redesign / narrow / park / stop, with the full
> transition packet and exact open/blocked/unknown denominator. State what
> remains a human decision and the smallest missing work that could change it.
> Do not reduce this to an Intent email or launch checklist.

## Example prompts

You do not need to know the Chrome launch process or DevRel terminology. A rough
idea or one public link is enough to start; the skill should classify the work,
research public evidence, and ask the next useful questions.

### Assess a feature

> Assess this feature from a Chrome DevRel perspective: [ChromeStatus,
> explainer, spec, intent, or rough description]. Work out its lifecycle stage,
> developer problem, evidence quality, affected users, interoperability path,
> integration risks, likely stakeholder critiques, missing work, and the next
> five highest-leverage actions. Research public evidence rather than making me
> collect it all.

### Prepare a phase transition

> This feature is currently in [incubation / prototype / developer trial / wide
> review / origin trial / prepare-to-ship]. Diagnose whether that is accurate,
> load the detailed phase guidance, and build the full transition packet for the
> next phase: evidence, research, users, partners, risks, integrations, review
> state, artifacts, learning goals, unknowns, contradictions and human
> decisions. Do not reduce the transition to an Intent email.

### Run ecosystem and customer research

> Run deep ecosystem/customer research for [problem or proposed capability].
> Search multiple independent public source families and relevant
> languages/regions; find developer jobs, workarounds, failures, communities,
> candidate customers/partners, frameworks, existing web solutions,
> iOS/Android/desktop equivalents, mini-app/super-app patterns, chat/LLM/agent
> approaches, and evidence against the proposal. Deduplicate the evidence,
> assess source quality and bias, state saturation and gaps, and turn it into
> product/design, outreach and phase-transition recommendations—not a link dump.

### Start with an artifact

> I need a launch presentation for [feature]. Treat the deck as the entry point:
> determine what evidence and decisions it needs, research what is public, ask
> me only for information you cannot obtain, flag unsupported claims, and then
> create a coherent outline, slide content, speaker notes, demo plan, sources,
> and review checklist.

### Build a connected narrative

> Help me build a narrative for [theme, for example web monetisation or user
> experience]. Connect “why the web” and “why Chrome” to concrete developer
> jobs, APIs, integrations, evidence, limitations, partner/adoption paths, and
> measurable outcomes. Identify missing pieces instead of pretending the
> existing features tell a complete story.

### Prepare a talk or workshop

> I am new to DevRel and need a [20-minute talk / workshop] for [audience] about
> [topic]. Help me define the audience outcome and narrative first, then create
> the presentation, speaker notes, demos/exercises, timings, accessibility
> requirements, fallback plan, source list, expected questions, and rehearsal
> checklist.

### Plan social and promotion

> Create a developer-facing promotion plan for [feature/initiative]. First check
> the claims, audience, support state, partner evidence, risks and likely
> criticism. Then propose channel-specific posts, timing, calls to action,
> replies/FAQ, owners, measurements, and a correction/hold plan. Do not turn
> uncertain evidence into launch hype.

### Run a friction log

> Run a friction log for [API/demo/docs URL] as a developer trying to accomplish
> [real task]. Test discovery, setup, first success, realistic framework/server
> integration, mobile and desktop, controls, edge/failure/recovery paths,
> console/network behavior, accessibility, performance, visual output,
> docs/explainer/implementation mismatches, and cleanup. Preserve evidence and
> produce exact tested/fixed/remaining/blocked counts.

### Rehearse reviews and user impact

> Before formal review, rehearse the accessibility, privacy, security,
> standards/interoperability, legal/regulatory, competition,
> engineering/performance, enterprise, and real end-user perspectives for
> [feature]. Include downloads, storage, memory, battery, bandwidth, consent,
> low-end devices, refusal/revocation, hostile use, fallback and rollback. Mark
> everything as pre-review analysis, not approval.

### Red-team a contentious proposal

> Build a source-grounded stakeholder critique for [proposal]. Discover everyone
> materially affected; retrieve their current published principles and
> positions; separate recorded positions from inference; steelman the strongest
> cases for and against; analyze power and incentives; and map each concern to
> evidence, design changes, mitigation, outreach, narrower scope, delay,
> rollback, abandonment, or accepted risk.

### Plan an origin trial or developer trial

> Design a developer/origin trial for [feature]. Define the uncertainties the
> trial must resolve, representative participants and partners, recruitment,
> realistic tasks, samples, support, survey/interview instruments, telemetry and
> privacy, success/failure criteria, feedback publication, and the decision
> paths after the trial.

### Create “DevRel in a box”

> Create a reusable enablement pack for [feature/initiative] for Chrome staff,
> GDEs, partners and meetups. Include rationale, audience variants, canonical
> deck and notes, tested demos, workshop, reference links, FAQs/troubleshooting,
> social copy, accessibility/localization, versioning, ownership, feedback
> channels, and reuse/adoption measures.

### Improve support

> Developers repeatedly struggle with [problem]. Separate product bugs,
> implementation differences, framework/server integration, docs, samples and
> messaging. Build reproductions, issue routing, troubleshooting/FAQ
> improvements, regression tests, product feedback, owners and measures for
> recurrence and resolution time.

### Run continuously

> Put [feature, initiative, or portfolio] into the continuous DevRel loop. Build
> an explicit inventory and denominator; gather current evidence; run friction,
> stakeholder and user-impact reviews; create questions and goals; improve the
> right product/docs/demo/tooling/enablement layers; validate fixes; update the
> public source of truth; and define event-driven, weekly, milestone and
> post-launch monitoring.

### Run launch retrospectives

> Build a fixed ChromeStatus inventory for milestones [range] and run one
> evidence-backed retrospective per feature. Replay every lifecycle phase;
> retain ChromeStatus, specs/explainers, intents/reviews, implementation/issues,
> docs/demos, usage, interoperability, frameworks, case studies, support,
> positive and critical ecosystem evidence, user impact and communication. Score
> outcomes by dimension, preserve missing/blocked evidence, store every report
> publicly, and turn recurring lessons into skill changes and regression evals.
> Make the run resumable if any search provider or agent fails.

### Prepare for a difficult launch

> Create a launch-resilience plan for [feature]. Preserve legitimate criticism
> while preparing for press scrutiny, issue-volume spikes, moderation,
> harassment, doxxing and threats. Define roles, escalation, source of truth,
> structured feedback, moderation, staff privacy, spokesperson coverage,
> hold/correction/rollback language, team support and post-incident learning. Do
> not make individual engineers absorb abuse.

## Current work

- [Engineer/PM feature-development prompt guide](modules/feature-development-prompts.md)
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

Rigorous criticism is welcome. See the
[community conduct policy](CODE_OF_CONDUCT.md), which explicitly protects
substantive disagreement while prohibiting harassment, threats, and doxxing.
