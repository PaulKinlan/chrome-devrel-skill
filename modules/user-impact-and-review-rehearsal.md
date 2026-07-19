# User impact and review-perspective rehearsal

This module helps a team discover issues that formal reviewers, affected users, and public critics may raise. It does **not** perform or replace accessibility, privacy, security, legal, standards, API Owner, engineering, enterprise, or other required review.

Use it during incubation, before trials, before shipment, and whenever the capability, implementation, rollout, or data model changes.

## 1. Start from the end user, not the API consumer

Distinguish at least three groups:

- **End users:** people whose device, data, attention, access, money, safety, or choices are affected.
- **Developers/site operators:** people deciding whether and how to integrate the feature.
- **Implementers/intermediaries:** browsers, operating systems, model providers, servers, frameworks, vendors, and other infrastructure.

A developer benefit is not automatically an end-user benefit. State who receives each claimed benefit and who bears each cost.

## 2. Build a user-cost and control ledger

For each supported device/platform/configuration, investigate:

- Download size, timing, frequency, and whether it is automatic, user-initiated, or administrator-controlled
- Disk, memory, CPU/GPU/NPU, battery, thermal, bandwidth, and environmental costs
- Low-end hardware, metered networks, data caps, shared devices, enterprise policy, and limited storage
- Permissions, disclosure, meaningful choice, consent, refusal, revocation, deletion, and re-download behavior
- Whether merely visiting a page can trigger work, download, data access, or resource consumption
- Data sources, destinations, retention, model/provider changes, local/remote/hybrid execution, and user visibility
- Accessibility-tree behavior, assistive-technology compatibility, cognitive load, motion, input methods, localization, and language/model quality
- Failure, partial support, offline behavior, fallback, recovery, updates, version skew, and graceful degradation
- Abuse and resource-exhaustion controls, quotas, rate limits, background use, and cross-origin delegation
- User-visible settings, diagnostics, explanations, appeal, and support routes
- Whether behavior is reversible without breaking sites or stranding users

For every material cost, retain measurement method, device/configuration, denominator, and uncertainty. Do not use a flagship desktop as evidence for all users.

## 3. Rehearse formal review perspectives

For each relevant discipline, answer the questions below and link current canonical guidance. Mark the result as `pre-review hypothesis`, never `approved`.

### Accessibility

- Which disabled users and assistive technologies could be affected?
- Is equivalent semantics, navigation, focus, input, output, status, error, and recovery available?
- Has testing included screen readers, keyboard/switch input, zoom/reflow, contrast/forced colors, reduced motion, captions/transcripts, and cognitive clarity where relevant?
- Does fallback preserve the task, not merely avoid a crash?

### Privacy and data protection

- What new information, inference, linkage, tracking, fingerprinting, or cross-context collaboration becomes possible?
- Is data minimized, purpose-limited, understandable, controllable, and deletable?
- What happens under hostile use and at scale?
- Are “local,” “anonymous,” “aggregated,” or “privacy-preserving” claims technically demonstrated and bounded?

### Security and abuse

- What can a hostile site, compromised dependency, malicious partner, or dominant service do?
- Can the feature exfiltrate data, consume resources, escalate privilege, spoof UI, bypass user intent, or create irreversible state?
- Are permission, origin, isolation, quota, revocation, audit, and incident mechanisms proportionate?

### Standards and interoperability

- Is the problem and API shape independently implementable?
- What are current positions and unresolved objections from other engines and standards reviewers?
- Is behavior testable across implementations? What is the Baseline path?
- Does a Chrome-only period create lock-in or compatibility pressure?

### Legal, regulatory, and competition

- Which jurisdictions, sectors, protected groups, consumer rights, accessibility duties, data rules, child-safety rules, or competition concerns may apply?
- Does Chrome's market position, bundling, defaults, or control of adjacent infrastructure create self-preferencing or gatekeeping concerns?
- If the browser supplies a model, service, identity, attester, or policy, does it control which capabilities, quality levels, terms, or updates web developers can access—and can independent browsers/providers implement a genuinely substitutable path?
- Record these as questions for qualified reviewers; do not provide legal conclusions.

### Engineering, performance, and operations

- Can it be implemented, tested, debugged, rolled out, monitored, updated, rolled back, and supported safely?
- What are worst-case device and server costs?
- What happens during partial rollout, version mismatch, provider outage, corrupted state, or abandoned implementation?

### Enterprise and administrators

- Can organizations understand, configure, audit, disable, and migrate the feature?
- Is notice early enough for policy and application changes?

## 4. Anticipate public questions

Search prior coverage and public discussion of analogous browser launches. Include critical sources such as technical press, mainstream technology press, civil society, standards discussions, issue trackers, and affected communities—not only favorable launch coverage.

For each recurring critique:

- What fact, design choice, incentive, or prior experience drives it?
- Could the team have known this before launch?
- Is the right response evidence, design change, narrower claims, rollout change, preparation, or acceptance of disagreement?
- What answer can be published with sources?
- What remains unresolved and should be said plainly?

Do not optimize to prevent negative press. Optimize to avoid preventable surprise, unsupported claims, user harm, and unprepared teams.

## Output

1. End-user/developer/implementer benefit-cost table
2. Device and configuration matrix
3. Pre-review perspective matrix with sources and unknowns
4. Public-question and analogous-coverage brief
5. Required research/tests/reviews and owners
6. Claims that are safe, provisional, unsupported, or contradicted
7. Rollout/communication changes
8. Residual user risks and explicit decisions
