# Stakeholder critique

Use this module when a proposal could affect browser choice, user agency, privacy, security, accessibility, competition, market power, resource use, publishing, automation, standards governance, or a domain with materially affected groups. Also use it before announcing a potentially contentious feature.

The goal is not to simulate stereotypes, manufacture consensus, or reject every proposal. The goal is to find affected constituencies, retrieve their current public positions and principles, steelman plausible concerns, and turn those concerns into better evidence and design decisions. Strong evidence and critique can support continued experimentation while keeping unresolved risks visible.

## Rules

- Do not write “what Safari/Mozilla/EFF would say” from model memory.
- Prefer the organisation's current primary sources: standards-position issues, policy documents, design reviews, specifications, public statements, bug threads, and consultation responses.
- Timestamp every retrieved position. Positions and personnel change.
- Separate:
  - **Recorded position:** the stakeholder has publicly addressed this proposal or a directly relevant mechanism.
  - **Principle-grounded inference:** a likely concern derived from a cited policy/principle, but not stated about this proposal.
  - **Open question:** the stakeholder's likely view cannot be responsibly inferred.
- Steelman the concern. Do not choose weak objections because they are easy to rebut.
- Do not attribute a personal opinion to an organisation or vice versa.
- Include supportive, neutral, affected-but-unconsulted, and potentially opposed constituencies.
- Critique Chrome's incentives and market position where material; do not treat implementer intent as proof of user benefit.
- A mitigation is not resolution until evidence shows it addresses the concern.
- Never turn “no response,” “under consideration,” or an unlabeled issue into support.

## 1. Describe the power and capability change

Before selecting stakeholders, state:

- What new capability or restriction exists?
- Who gains power, information, control, or cost savings?
- Who loses choice, privacy, access, resources, compatibility, or bargaining power?
- What can a benign site do? What can a hostile or dominant site do?
- What changes if one browser ships alone? What changes if every browser ships it?
- Can the behavior be detected, denied, revoked, audited, or worked around by users?
- What irreversible ecosystem effects could arise before interoperability?

## 2. Discover affected constituencies

Start broad, then retain only groups with a plausible material interest:

- End users, including children and vulnerable or marginalized groups
- People using assistive technology; accessibility specialists
- Web developers, framework/library/tool authors, site owners, and partners
- Chromium, WebKit/Safari, Gecko/Firefox, downstream browsers, and embedders
- W3C TAG, relevant working/community groups, WHATWG, IETF, or other standards venues
- Privacy, security, abuse, fraud, identity, and safety researchers
- Civil-society and digital-rights organisations such as EFF
- Publishers, advertisers, creators, platforms, enterprises, and administrators
- Open-source, archival, automation, testing, search, and research communities
- Regulators and authorities concerned with competition, consumer protection, data protection, accessibility, children, media, or sector-specific rules
- Device/OS vendors, model providers, payment providers, identity providers, or other domain-specific implementers
- People excluded by hardware, bandwidth, language, geography, disability, policy, or cost constraints

Do not treat this as a fixed attendance list. Explain why each retained constituency is affected.

## 3. Build a dated source packet

For each retained constituency:

1. Search for a proposal-specific position.
2. Search for directly analogous cases.
3. Retrieve current published principles/policies.
4. Record source URL, publisher, date, retrieval date, and relevant quotation or exact finding.
5. Mark the evidence as recorded position, analogy, or principle-grounded inference.

Useful starting points—not substitutes for proposal-specific research:

- [Mozilla's Vision of the Web](https://www.mozilla.org/en-US/about/webvision/full/): openness, agency, safety, privacy, and interoperability
- [Mozilla Standards Positions](https://mozilla.github.io/standards-positions/)
- [WebKit Tracking Prevention Policy](https://webkit.org/tracking-prevention-policy/)
- [WebKit Standards Positions](https://github.com/WebKit/standards-positions)
- [W3C Ethical Web Principles](https://www.w3.org/TR/ethical-web-principles/)
- [W3C Web Platform Design Principles](https://www.w3.org/TR/design-principles/), including priority of constituencies and safety when visiting a page
- [W3C Privacy Principles](https://www.w3.org/TR/privacy-principles/)
- [EFF interoperability principles](https://www.eff.org/deeplinks/2020/06/our-eu-policy-principles-interoperability)

## 4. Apply critique lenses

Use only relevant lenses and add domain-specific ones:

- End-user need, agency, comprehension, consent, and control
- Privacy, tracking, fingerprinting, and data governance
- Security, abuse, fraud, coercion, and hostile-site behavior
- Accessibility, internationalization, equity, and digital divide
- Performance, battery, memory, bandwidth, and environmental cost
- Interoperability, Baseline path, compatibility, and developer lock-in
- Competition, gatekeeping, self-preferencing, and conflicts of interest
- Open-source implementation, independent implementation, and royalty-free feasibility
- Framework, server, deployment, enterprise, and support integration
- Automation, testing, archiving, research, and non-human access
- Transparency, auditability, appeal, and accountability
- Standardization venue, governance, reversibility, and migration
- Economic incentives and who pays or captures value
- Misuse at scale and second-order ecosystem effects

## 5. Produce the critique matrix

For every material concern report:

| Field | Meaning |
|---|---|
| Constituency | Who is affected or has expressed the concern |
| Evidence class | Recorded position, analogy, principle-grounded inference, or open question |
| Source and date | Primary source where possible |
| Strongest concern | Steelmanned in terms its proponent would recognize |
| Severity / likelihood | Separate these; include uncertainty |
| Current response | What the proposal already does, with evidence |
| Gap | What remains unresolved or unproven |
| Next action | Research, design change, mitigation, outreach, trial, test, or accepted risk |
| Owner and timing | Who should act and by when |
| Status | Open, investigating, mitigated-not-validated, validated, disputed, accepted risk, or blocked |

Also include:

- Strongest case **for** the proposal
- Strongest case **against** it
- Conditions under which a skeptical stakeholder might change position
- Conditions that should trigger redesign, narrower scope, another origin trial, delay, rollback, or abandonment
- Public questions the team should answer before announcement

## 6. Red-team the announcement and evidence

Before publication, test whether the materials:

- Overstate developer demand, partner commitment, survey quality, standards support, or interoperability
- Hide known negative positions or unresolved review feedback
- Describe benefit to sites/Chrome as benefit to users without evidence
- Ignore who bears compute, bandwidth, privacy, migration, or support costs
- Make a Chrome-only implementation sound like an interoperable web standard
- Promise safeguards without analyzing incentives to bypass or weaken them
- Use demos that showcase delight while concealing security, accessibility, fallback, or deployment constraints
- Announce scope, naming, or launch intent that the implementation team has not actually committed to

## Output

Return:

1. Executive risk summary
2. Stakeholder map with inclusion rationale
3. Dated source packet
4. Critique matrix
5. Design/evidence changes ordered by leverage and urgency
6. Outreach plan
7. Announcement red-team findings
8. Residual risks and explicit accepted-risk decisions
9. Unknowns and evidence that could change the conclusion

Do not collapse the output to one sentiment score. Disagreement can reveal distinct values and failure modes that should remain visible.
