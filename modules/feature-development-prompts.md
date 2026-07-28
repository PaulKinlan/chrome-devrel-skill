# Feature-development prompt guide

This guide turns the skill into an ongoing companion for engineers and product managers developing a browser feature. Use one start prompt, then continue from the same evidence packet as the feature changes.

The skill remains advisory. It can expose missing evidence, rehearse reviews, run public research, and prepare artifacts; it cannot grant API Owner, standards, engineering, privacy, security, accessibility, legal, or release approval.

## Start in one line

A feature link and one sentence are enough. The skill should infer the packet structure, likely lifecycle stage, evidence categories, risks, and assets rather than making the user specify them.

> Help me progress [feature/link]. I’m the [PM / engineer / DevRel / stakeholder]. The decision is [decision, or “work out the next decision”]. Start from [links, or “public evidence only”]. Give me the three biggest gaps, three next actions, and ask only what you cannot responsibly find.

Use an even shorter role prompt when the decision is obvious:

- **PM:** `Assess [feature] for [next phase/release]. What is the next decision, and what is the smallest evidence needed?`
- **Engineer:** `Review [feature/API change] for readiness. What can break, what must be tested, and what should I change next?`
- **DevRel:** `Assess [feature] at its current stage for developer enablement. What is the next decision, and what evidence, integration work, docs, demos, or support are missing?`
- **Stakeholder or reviewer:** `Challenge [feature] from a [user/privacy/security/standards/partner/enterprise] perspective. What is unsupported, risky, or unanswered?`
- **Continue:** `Continue [feature] from [packet/link] using these changes: [changes]. Show the delta, the next decision, and the three smallest actions.`

These are the default front door. Use the longer prompts below only when the user needs tighter scope, a particular deliverable, or a reproducible audit contract.

## Keep one feature packet

Ask the agent to maintain one packet rather than starting a new assessment in every conversation. The packet should contain:

- feature identity, scope, owner, lifecycle stage, and current decision;
- developer and end-user jobs, alternatives, and highest-risk assumptions;
- evidence ledger with facts, signals, commitments, hypotheses, recommendations, unknowns, contradictions, blockers, sources, and retrieval dates;
- readiness matrix by relevant dimension;
- affected constituencies and review/user-impact questions;
- implementation, interoperability, framework/server/deployment, docs/demo, support, and measurement state;
- asset and data inventory with owner, status, source, review requirement, and next use;
- stable action/risk/question IDs, dependencies, and the next decision date;
- phase history: what changed, why it changed, and what evidence supported the change.

On later runs, tell the agent to update this packet in place, preserve resolved and rejected items, and report the delta. A polished new plan that loses prior failures is not progress.

## Keep partner evidence stages concrete

Use the highest stage supported by an attributable record and permission to use it:

- **Observed public need:** a sourced problem or workaround; no relationship or endorsement is implied.
- **Candidate:** public evidence suggests a relevant job or constraint; the organization has not expressed interest.
- **Interest:** an attributable person agreed to discuss or learn more; no testing or delivery is promised.
- **Active evaluation:** named participants are examining the proposal or prototype, with the scope and current evidence recorded.
- **Trial commitment:** authorized participants agreed to a defined trial, tasks, owners and decision criteria. Record timing only when supplied.
- **Ship commitment:** an authorized organization representative made a scoped implementation or production commitment that may be attributed for the stated purpose.
- **Verified production use:** dated evidence shows the agreed capability in production; a launch announcement, prototype or private claim alone is insufficient.

Record who supplied the evidence, when, exact scope, public/private status, permission to name or quote, expiry/recheck date and contradictions. Never infer a later stage from enthusiasm, attendance, silence, an unlabeled issue or a successful demo.

## Start as an engineer

Use this when an implementation idea, prototype, explainer, issue, or ChromeStatus entry first exists.

> I am the engineer or feature owner for [feature]. Here are the materials I have: [rough description, issue, explainer, spec, prototype, ChromeStatus entry, intent thread, implementation, demo, tests]. Treat them as evidence, not proof that the current API shape is right.
>
> Start a feature-development packet. Identify the likely lifecycle stage and the decision we actually face. Test the developer and end-user jobs, current workarounds, whether the browser is the right layer, smaller alternatives, hostile or unintended uses, interoperability path, framework/server/deployment implications, accessibility/privacy/security/performance/resource costs, fallback and reversibility.
>
> Research public evidence you can retrieve. Separate facts, developer signals, partner commitments, hypotheses, recommendations, unknowns, contradictions, and blockers. Do not invent demand, browser positions, approval, compatibility, or launch readiness.
>
> Return: a compact diagnosis; the five highest-risk assumptions; a readiness matrix; the smallest prototype or research needed to retire each assumption; the relevant formal-review questions to rehearse; an initial asset/data inventory; and the next three actions with owners or `owner required`. Ask me only for material you cannot obtain or infer responsibly.

A useful answer should say what to test or change in the feature, not jump directly to launch content.

## Start as a product manager

Use this before committing to a solution, origin trial, launch milestone, or adoption plan.

> I am the PM for [feature/problem]. The proposed outcome is [outcome], the current proposal is [description/link], and the decision is [fund research / prototype / start a developer trial / request wide review / prepare to ship / invest in adoption / narrow or stop].
>
> Build the feature-development packet from the decision backward. Validate the developer and end-user problem, segments, frequency and cost; compare existing web, library, framework, server, native, and no-change alternatives; distinguish public need from candidate, interest, active evaluation, trial commitment, ship commitment, and verified production use; find counterevidence and affected constituencies; and identify who benefits, who bears cost, and what could make the proposal unworthy of progression.
>
> Map the evidence needed for this decision, including developer research, partner trials, technical feasibility, interoperability, review perspectives, integration friction, docs/support burden, adoption mechanics, and leading, lagging, diagnostic, and guardrail measures with denominators and limitations.
>
> Return: current stage and decision; strongest case for and against; evidence ledger; readiness matrix; candidate segments without claiming endorsement; decision options (continue, change, narrow, park, or stop); missing owners/reviewers; initial asset/data inventory; and a sequenced plan with explicit exit, failure, and stop criteria.

A useful answer preserves a real stop option and does not treat an intent email, prototype, partner meeting, or shipment as proof of success.

## Resume work already in progress

Use this when a feature already has history. Supply the previous packet or the current artifact directory and recent changes.

> Continue the feature-development packet for [feature]. Do not restart the analysis or replace history with a cleaner summary.
>
> Previous packet: [link/file/text].
> New evidence or changes since the last review: [CLs, issues, research, interviews, standards positions, review feedback, trial data, metrics, docs, demos, support incidents].
> Decision now required: [decision].
>
> Verify the new material, update existing stable IDs, and add IDs only for genuinely new findings. Show a delta first: evidence added or weakened, assumptions retired or reopened, contradictions, scope/API changes, resolved and remaining risks, asset/data changes, and whether the lifecycle stage still fits.
>
> Then give the next decision packet and the smallest set of actions that can change that decision. Keep missing or stale evidence as unknown. Do not promote interest to commitment, define a runbook as executed evidence, or call a formal review complete without attributable approval from its owner.

## Continue after implementation changes

> Review these implementation changes for [feature]: [CLs/issues/build/demo]. Connect each change to the developer job, explainer/spec expectation, tests, docs, samples, fallback, interoperability, and known friction IDs.
>
> Run or specify the smallest reproducible checks needed for setup, first success, visible controls, realistic framework/server integration, failure/recovery/cleanup, mobile/desktop, accessibility, console/network behavior, performance and resource cost. If tools and a runnable target are available, execute representative checks now and report the exact tested/pass/fail/blocked denominator; do not stop at a runbook.
>
> Update the packet with mismatches among explainer/spec, implementation, tests, docs, and demo. Propose the correct owner and regression/conformance work for each mismatch without rewriting the expected behavior to match the current implementation.

## Continue after developer or partner feedback

> Add this developer/partner evidence to [feature]'s packet: [notes, survey, issue, interview, trial report, public source].
>
> Classify the evidence source, segment, method, sample/denominator, independence, limitations, consent/attribution status, and evidence-ladder stage. Separate the job or outcome they want from support for this API shape. Compare it with existing evidence and counterevidence; do not sum repeated or syndicated claims as independent demand.
>
> Show which assumptions, design choices, trial tasks, integration priorities, or phase criteria should change. Draft follow-up questions that ask about past behavior, current workaround, cost, production constraints, rejection conditions, willingness to test, and what may be stated publicly.

## Review the API shape before wider investment

> Challenge the current API shape for [feature] using the packet and these materials: [explainer/spec/prototype].
>
> Test whether the primitive is at the right layer and abstraction level; whether a smaller intervention, existing API, library, framework, server feature, guidance, or no change is better; whether independent implementations and reliable tests are plausible; and whether permissions, lifecycle, errors, cancellation, cleanup, fallback, progressive enhancement, accessibility, privacy, security, internationalization, performance and hostile use are coherent.
>
> Return concrete design questions and experiments, not imagined consensus. Separate proposal-specific recorded positions from principle-grounded inference. State what result would retain, change, split, narrow, or abandon the current shape.

## Prepare a developer or origin trial

> Prepare [feature] for a [developer trial/origin trial]. Use the existing packet and diagnose whether a trial is the right next intervention.
>
> Define the uncertainties the trial must resolve; representative segments and recruitment gaps; realistic tasks and production-like integrations; required prototype, docs, demos, framework/server samples and support; consent/publication boundaries; telemetry and qualitative methods; leading, lagging, diagnostic and guardrail measures; exact denominators; success, failure, stop and redesign thresholds; incident/rollback handling; and the decisions that each possible result permits.
>
> Produce the trial brief, participant evidence ladder, task/instrument plan, support route, data/asset inventory, and transition criteria. Do not use enrollment, raw interest, or successful setup alone as proof the feature should ship.

## Check progression to the next phase

> Assess whether [feature] should move from [current phase] to [proposed phase]. Load the matching phase guidance and update the existing feature packet.
>
> For every relevant readiness dimension, report Supported, Partial, Unknown, Contradicted, or Not relevant with a reason and source. Distinguish advisory evidence from formal approvals. Check the developer/end-user problem, API and implementation learning, trials, interoperability, standards positions, framework/server/deployment experience, accessibility/privacy/security/user impact, docs/demos/support, partner evidence, launch resilience, measurements and unresolved contradictions.
>
> Return one of: progress as proposed; progress with explicit accepted risk and owners; remain in phase; narrow or redesign; park; stop. Explain what evidence supports the recommendation, what remains a human decision, and the smallest missing work that could change it. Produce the full transition packet rather than only an email or checklist.

## Audit all assets and data

Use this when the feature has accumulated files across systems or when preparing a handoff, trial, review, or launch.

> Build an authoritative asset and data inventory for [feature] from [repositories, folders, URLs, trackers, dashboards, documents]. Do not assume a named artifact exists or is current; verify it where access permits.
>
> Cover the relevant items:
>
> - problem/use-case brief and developer/end-user research;
> - explainer, specification, ChromeStatus entry, intent/review threads and standards positions;
> - implementation issues/CLs, tests/WPT/conformance, origin-trial or experiment configuration;
> - demos, samples, framework/library/build/server/deployment integrations and friction evidence;
> - accessibility, privacy, security, legal/regulatory, performance/resource and user-impact evidence;
> - trial/partner evidence, consent and public-attribution state;
> - docs plan, MDN/BCD state, developer.chrome.com/web.dev material, release notes and migration guidance;
> - FAQ, troubleshooting, support routing, monitoring, rollback/deprecation material;
> - presentations, workshops, GDE/partner enablement, video/social/launch materials when justified;
> - metrics definitions, instrumentation, raw evidence, denominators, baselines, targets, limitations and owners.
>
> Give every item a stable ID, purpose, audience, canonical location, owner, lifecycle stage, status, source/provenance, last verified date, dependencies, public/private boundary, review requirement and next action. Mark missing, duplicate, stale, contradictory, blocked and not-yet-justified items explicitly. End with exact totals and the smallest critical path for the current decision.

This inventory should prevent a launch deck or status page from becoming the accidental source of truth.

## Prepare to ship

> Manage prepare-to-ship execution for [feature] using the current packet and asset/data inventory. Do not equate implementation complete, intent approved, or Chrome shipment with broad readiness. Load `modules/launch-execution.md` and `modules/standards-and-incubation-analysis.md`; this is execution work, not planning only.
>
> Derive a coverage manifest from the spec/IDL and implementation. Create independently runnable feature-detection/fallback and minimal behavior samples, focused option/failure/integration samples, and at least one realistic use-case demo. Run them against the real implementation on desktop and mobile, exercise visible controls, inspect console/network/runtime state, and report exact pass/fail/blocked counts. Build friction only from observed or reproduced evidence; keep reported-unverified issues and hypotheses separate.
>
> Audit live MDN, `mdn/content`, BCD, Chrome-owned docs, release notes, compatibility/fallback, FAQ and support material. Where content is absent or stale, create and validate a patch-ready local addition or exact correction rather than stopping at a gap analysis. Do not publish or claim reviewer approval without authority.
>
> Fully analyze standards and incubation rather than copying status labels: `no signal`, open request, no response, and silence are not neutral. Read complete Mozilla/WebKit/TAG/intent threads, inventory design-significant issues/PRs, follow every substantive cross-link to an explicit disposition, reconstruct chronology, and map objections to responses, landed changes, reviewer confirmation, and current state. Also check claim-to-source traceability; framework/server/deployment evidence; accessibility; security/privacy/resource/user costs; trial and partner evidence stages; support ownership and known issues; launch-resilience, correction, hold and rollback plans; and outcome/guardrail measurement.
>
> Produce artifact paths, coverage and browser-execution matrices, observed friction evidence, docs/BCD patch inventory, launch decision brief, public-safe claims sheet, remaining-risk register, owner/on-call/support map, exact open/blocked denominator, and post-launch monitoring plan. Keep unsupported sections provisional or remove them. Never report a planned demo, recommended test, or identified docs gap as completed execution.

## Continue after release

> Continue [feature]'s packet after release. Gather current implementation, docs, support, interoperability, framework, partner, usage and user-impact evidence. Do not treat shipment, page-load share, positive anecdotes, or lack of criticism as success by themselves.
>
> Compare leading signals with lagging outcomes and guardrails. Keep no-counter, missing-support, blocked-research and no-response states as unknown. Cluster friction and criticism without erasing minority or severe issues. Identify recurring product, implementation, test, docs, sample, integration, messaging and support failures.
>
> Return the exact monitored denominator, evidence changes, regressions, unresolved risks, fixes and owners, support updates, documentation/demo corrections, measurement limits, and the next continue/change/narrow/rollback/deprecate decision.

## Ask for the next useful prompt

When the user does not know which prompt fits, this short prompt is enough:

> Here is the current state of [feature]: [links or rough notes]. Tell me which lifecycle decision is next, what evidence is missing for it, and which one prompt from the feature-development guide I should run now. Do not generate launch assets unless they are the current bottleneck.

## Expected progression

A healthy sequence is evidence-dependent rather than calendar-dependent:

1. establish a real developer/end-user job and viable layer;
2. retire the riskiest assumptions with research and the smallest useful prototype;
3. test API ergonomics, user impact, implementation feasibility, integration and interoperability;
4. run a trial only when it can answer named uncertainties;
5. progress with a transition packet that preserves unknowns and formal-review boundaries;
6. build public assets when claims, audience and support state justify them;
7. monitor outcomes, guardrails and support after release, then continue, change, narrow, rollback or deprecate.

The packet is the thread connecting those decisions. Each prompt should make the next decision easier to audit, not merely produce more material.
