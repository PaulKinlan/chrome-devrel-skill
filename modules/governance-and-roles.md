# Governance and role routing

This module defines advisory role **archetypes** and routing responsibilities.
It does not define formal authority — actual sign-off authority must be sourced
from each team's canonical process documentation and configured in the team
owner map.

## Role archetypes

These archetypes describe responsibilities, not authority. A team maps them to
actual people and confirms authority from their governance process.

| Archetype                 | Responsibilities                                                                   | Routing verb                                       |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| DevRel practitioner       | Evidence quality, adoption strategy, developer research, artifacts, retrospectives | **coordinates** evidence and adoption work         |
| Product/engineering owner | Feature design, implementation, rollout decisions                                  | **contributes** design context                     |
| API Owner / Blink owner   | ChromeStatus entry management, API review process                                  | **consult** for API process questions              |
| Privacy reviewer          | Privacy analysis, data-flow review                                                 | **formal-review-if-required** by canonical process |
| Security reviewer         | Threat model, abuse analysis                                                       | **formal-review-if-required** by canonical process |
| Accessibility reviewer    | A11y testing, semantics                                                            | **formal-review-if-required** by canonical process |
| Standards/TAG liaison     | Standards venue engagement, cross-engine outreach                                  | **consult** for standards positioning              |
| Engineering lead/TL       | Implementation quality, testing, rollout mechanics                                 | **contributes** implementation context             |
| Communications/PR         | External messaging, press, social                                                  | **coordinates** external communication             |
| Legal counsel             | Legal, regulatory, liability                                                       | **formal-review-if-required** by canonical process |
| HR/people support         | Team safety and well-being                                                         | **consult** for safety/incident response           |
| Community/GDE manager     | Developer community engagement, GDE enablement                                     | **contributes** community strategy                 |

## Routing verbs

- **coordinates:** leads the work stream for this area
- **contributes:** provides input, evidence, or context
- **consult:** engaged for advice or specialized knowledge
- **formal-review-if-required:** formal sign-off may be needed per the team's
  canonical process; DevRel does not determine whether it is required

## Team-configurable owner map

Each team must fill in who holds each archetype and confirm authority from their
governance process. This is organization-local configuration — the public skill
provides the template, not the authority.

```markdown
## Team owner map (config-required)

| Archetype                 | Name/email | Backup    | Authority source       | Notes |
| ------------------------- | ---------- | --------- | ---------------------- | ----- |
| DevRel practitioner       | _fill in_  | _fill in_ | _team process_         |       |
| Product/engineering owner | _fill in_  | _fill in_ | _team process_         |       |
| API Owner                 | _fill in_  | _fill in_ | _Blink launch process_ |       |
| Privacy reviewer          | _fill in_  | _fill in_ | _team process_         |       |
| Security reviewer         | _fill in_  | _fill in_ | _team process_         |       |
| Accessibility reviewer    | _fill in_  | _fill in_ | _team process_         |       |
| Standards/TAG liaison     | _fill in_  | _fill in_ | _team process_         |       |
| Engineering lead/TL       | _fill in_  | _fill in_ | _team process_         |       |
| Communications/PR         | _fill in_  | _fill in_ | _team process_         |       |
| Legal counsel             | _fill in_  | _fill in_ | _team process_         |       |
| HR/people support         | _fill in_  | _fill in_ | _team process_         |       |
| Community/GDE manager     | _fill in_  | _fill in_ | _team process_         |       |
```

## DevRel boundary

DevRel **coordinates** evidence and adoption work. DevRel does not:

- Determine whether formal review is required or sufficient
- Block or approve shipment
- Replace formal privacy, security, accessibility, legal, or API Owner review
- Override engineering or product decisions
- Commit partners or other engines to positions they have not stated

Whether a formal review is required, and who conducts it, is determined by each
team's canonical governance process — not by this skill.

## Role routing by lifecycle phase

See `phases/README.md` for the integrated phase-role routing table.
