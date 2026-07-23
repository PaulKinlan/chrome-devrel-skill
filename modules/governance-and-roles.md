# Governance and role routing

This module defines advisory roles and routing for Chrome DevRel work. It does
not invent approval authority — formal API Owner, standards, engineering,
privacy, security, accessibility, legal, and release approvals remain defined by
Chromium's canonical process.

## Public-core roles

These roles exist in any team doing platform DevRel. A team may combine roles,
but the responsibilities must be owned.

| Role                      | Responsibilities                                            | Decision authority                          |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| DevRel lead               | Owns the retrospective, evidence quality, and adoption plan | Advises; does not block or approve shipment |
| Product/engineering owner | Owns the feature design, implementation, and ship decision  | Formal ship/hold/delay decision             |
| API Owner / Blink owner   | Owns the ChromeStatus entry, intent threads, and API review | Formal API review approval                  |
| Privacy reviewer          | Owns privacy analysis and data-flow review                  | Formal privacy sign-off                     |
| Security reviewer         | Owns threat model and abuse analysis                        | Formal security sign-off                    |
| Accessibility reviewer    | Owns a11y testing and semantics review                      | Formal a11y sign-off                        |
| Standards/TAG liaison     | Owns standards venue engagement and cross-engine positions  | Formal standards position                   |
| Engineering lead/TL       | Owns implementation quality, testing, and rollout           | Formal implementation sign-off              |
| Communications/PR         | Owns external messaging, press, and social                  | Formal comms approval                       |
| Legal counsel             | Owns legal, regulatory, and liability review                | Formal legal sign-off                       |
| HR/people support         | Owns team safety and well-being during contentious launches | Formal HR authority                         |
| Community/GDE manager     | Owns developer community engagement and GDE enablement      | Advises on community strategy               |

## Team-configurable owner map

Each team must fill in who holds each role. This is organization-local
configuration — the public skill provides the template, not the names.

```markdown
## Team owner map (config-required)

| Role                      | Name/email | Backup    | Notes |
| ------------------------- | ---------- | --------- | ----- |
| DevRel lead               | _fill in_  | _fill in_ |       |
| Product/engineering owner | _fill in_  | _fill in_ |       |
| API Owner                 | _fill in_  | _fill in_ |       |
| Privacy reviewer          | _fill in_  | _fill in_ |       |
| Security reviewer         | _fill in_  | _fill in_ |       |
| Accessibility reviewer    | _fill in_  | _fill in_ |       |
| Standards/TAG liaison     | _fill in_  | _fill in_ |       |
| Engineering lead/TL       | _fill in_  | _fill in_ |       |
| Communications/PR         | _fill in_  | _fill in_ |       |
| Legal counsel             | _fill in_  | _fill in_ |       |
| HR/people support         | _fill in_  | _fill in_ |       |
| Community/GDE manager     | _fill in_  | _fill in_ |       |
```

## DevRel authority boundary

DevRel can:

- Advise on evidence quality, adoption strategy, and readiness gaps
- Recommend delays, narrower scope, or additional evidence collection
- Produce artifacts, research, and retrospective analysis
- Escalate concerns to formal reviewers

DevRel cannot:

- Block or approve shipment
- Replace formal privacy, security, accessibility, legal, or API Owner review
- Override engineering or product decisions
- Commit partners or other engines to positions they have not stated

## Role routing by lifecycle phase

See `phases/README.md` for the integrated phase-role routing table.
