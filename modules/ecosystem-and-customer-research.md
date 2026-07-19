# Ecosystem and customer research

Use this module when the developer problem, demand, customer/partner set, alternatives, adjacent-platform behavior, adoption path, or “why not?” case is incomplete.

The goal is not to collect a large pile of favorable links. The goal is a reproducible, deduplicated evidence base that improves product and launch decisions.

## 1. Frame the decision

Record:

- Lifecycle phase and decision this research must support
- Proposed developer/end-user jobs, segments, and outcomes
- Claims being tested
- Known alternatives and constraints
- Evidence cutoff date, public/private boundary, time/tool budget, languages/regions, and stopping rule

Write both support and falsification questions:

- What evidence would support a real unmet need?
- What evidence would show the problem is rare, already solved, at the wrong layer, or too costly/risky?
- What would change the API shape, scope, priority, phase transition, or stop decision?

## 2. Build a source and community map

Search multiple independent source families. Adapt the list to the domain:

### Web developers and ecosystem

- GitHub/GitLab issues, discussions, repositories, code search, stars/forks only as weak context
- Stack Overflow and other technical Q&A
- Framework/library/tool issue trackers, RFCs, roadmaps, support forums, package registries and download/usage data
- WICG, WHATWG, W3C groups, WebDX/developer-signals, TC39/IETF where relevant
- Chromium, WebKit and Mozilla bugs/standards positions; downstream browser forums
- Public blogs, newsletters, conference talks, podcasts, community forums, Hacker News/Reddit and public social posts
- Public support portals, product feedback, app/plugin reviews and migration discussions
- Existing polyfills, JavaScript libraries, browser extensions, server products and workarounds—implementation effort is evidence of a job, not automatically demand for a native API

### Adjacent platforms and regions

- iOS/iPadOS/macOS, Android, Windows, Linux/desktop APIs and developer docs
- Native frameworks and cross-platform stacks
- WeChat Mini Programs, Alipay Mini Programs, Douyin/ByteDance and other mini-app/super-app ecosystems using accessible public sources and appropriate languages
- Messaging/chat app platforms, bots, embedded apps and distribution models
- LLM/model platforms, AI SDKs, agent protocols/tools, extension/plugin ecosystems and on-device/cloud approaches
- Games, XR, media, payments, identity, enterprise, automotive or other domain platforms where relevant

Do not assume a native or mini-app pattern belongs on the web. Extract the job, permission/control model, lifecycle, distribution, business incentives, user cost, failure modes, abuse, and interoperability consequences; then assess what must change to fit web principles.

### Customers and partners

Map segments before organizations:

- Who experiences the job/pain, how often, and with what cost/urgency?
- Who chooses, integrates, approves, pays, operates, supports, and receives value?
- What technical stack, scale, geography, regulation, accessibility, and deployment constraints matter?
- Which public organizations/products demonstrate the need or workaround?
- Which communities, trade groups, maintainers, GDEs, vendors or researchers can provide representative access?

A public fit hypothesis is not permission to contact, name, or claim support. Use the evidence ladder: observed public need → candidate → contacted with permission → interest → active evaluation → trial commitment → ship commitment → verified production.

## 3. Search systematically

Create a query matrix across:

- Problem/job language, not only proposed API names
- Workaround/complaint/failure/migration terms
- Framework, server, mobile, enterprise, accessibility and region variants
- Native/mini-app/chat/agent equivalents
- Supportive, skeptical and failure language
- Time windows and non-English terms where capability exists

Use varied queries and follow citation/issue/link graphs. Record query, engine/source, date, result count inspected, inclusion/exclusion reason, and newly discovered vocabulary. Deduplicate syndicated content and claims that trace to one source.

Continue until the predefined budget/stopping rule or evidence saturation: successive query batches produce no material new segment, job, workaround, objection, source family, or candidate. “Hundreds of searches” can be appropriate, but volume is not the outcome.

Respect terms, robots/access controls, rate limits, community norms, personal data, and research ethics. Do not enter private communities, scrape profiles, or build contact lists without an approved purpose and handling plan.

## 4. Assess evidence quality

For each item record:

- Stable evidence ID
- Claim/job/objection supported or contradicted
- Source URL/publisher/author where appropriate, publication and retrieval date
- Source family and independence from other items
- Segment/geography/stack/context
- Direct observation, self-report, behavior/usage, implementation/workaround, experiment, commitment, or opinion
- Sample/denominator/methodology where available
- Relevance to this API shape versus the broad category
- Limitations, conflicts/incentives, selection bias, and confidence
- Permission/attribution status

Do not sum weak mentions into strong evidence without a valid method.

## 5. Distill platform patterns for the web

For each adjacent-platform capability:

1. Describe the user/developer job and current experience.
2. Identify the primitive(s), lifecycle, permissions, distribution and business model.
3. Identify what the platform owner controls and what users/developers can choose.
4. Record adoption and known friction with evidence.
5. Compare existing web capabilities/workarounds.
6. Decide whether the web needs:
   - no change,
   - guidance/tooling/library work,
   - extension of an existing capability,
   - a new low-level primitive,
   - a higher-level API,
   - server/standards/ecosystem work outside the browser.
7. Apply user impact, interoperability, security/privacy/accessibility, competition and abuse critique, including low-end devices, metered networks, storage/compute constraints, and the exact consent/refusal/revocation model.

## 6. Find and engage candidates responsibly

Produce segment-balanced **candidate hypotheses**, not endorsements. Prioritize candidates whose public work suggests a relevant job and whose stack/constraints test meaningful assumptions.

For outreach, prepare:

- Why this person/community may be relevant, with public source
- What the team wants to learn—not a request to validate the solution
- Time/scope, confidentiality/public attribution choices, and follow-up
- Interview/task guide focused on current behavior, past examples, constraints, alternatives, and willingness to test. Include concrete prompts such as: “Tell me about the last time this occurred”; “What did you do instead?”; “What did that cost?”; “Who approved, operated, and supported it?”; “What would prevent production use?”; and “What would make you reject this API?”
- Consent for quotes, organization naming, contact retention, and future outreach

Ask for evidence of behavior: last time the problem occurred, current workaround, cost, failed alternatives, production constraints, and what would make them reject the proposal.

## 7. Run the adversarial “why not?”

Test at least:

- The need is rare, low-cost, or already solved
- The proposed user is not the person bearing cost
- A library/framework/server/native pattern is sufficient
- The browser is the wrong layer or creates ossification
- The API is too high-level/low-level, not independently implementable, or cannot be tested
- Other engines have good reasons not to implement
- Privacy/security/accessibility/competition/user-agency cost exceeds value
- It works only on flagship devices or one region/business model
- Partners want an outcome but not this API
- Demand is produced by promotion, selection bias, or one vendor ecosystem
- A smaller intervention or no intervention is better

Report the strongest case against, what evidence could rebut it, and whether the proposal should continue, change, narrow, park, or stop.

## Outputs

- Decision/research brief and cutoff
- Query/source/community map and search log
- Deduplicated evidence ledger with quality/limitations
- Developer jobs, segments, workarounds and unmet needs
- Adjacent-platform pattern matrix (native, mini-app, chat, LLM/agent as relevant)
- Existing-web alternative analysis
- Candidate customer/partner/community map with permission/evidence stages
- Contradictory evidence and “why not?” brief
- Research saturation/gaps statement
- Implications for API/design, phase transition, trials, artifacts and adoption, including prototype learning goals, evidence thresholds, stop/redesign conditions, and what result triggers each next-phase recommendation
- Interview/outreach plan

Never claim representative demand, customer support, or research completion without a defensible denominator and method.
