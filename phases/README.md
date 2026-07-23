# Lifecycle phase modules

The lifecycle is not strictly linear. A feature may return to incubation, repeat
trials, narrow scope, park, or stop. Use the module matching the current
decision—not the desired status.

Each phase module defines:

- Entry diagnosis
- Decisions the phase exists to make
- Work and evidence
- Artifacts
- Common failure modes
- Transition packet

A transition packet is a decision-quality handoff, not proof of approval. Rate
each material dimension as supported, partial, unknown, contradicted, or not
relevant with rationale. Formal Chrome/Blink requirements remain defined by
current canonical process documentation.

## Role routing by phase

Advisory — teams configure their own owner map and authority (see
`modules/governance-and-roles.md`). Roles marked **coordinate** lead the work
stream; **contribute** provide input; **consult** are engaged for advice;
**formal-review-if-required** may need formal sign-off per the team's canonical
process (DevRel does not determine whether it is required).

| Phase              | DevRel         | Product/Eng    | API Owner      | Privacy                   | Security                  | A11y                      | Standards      | Comms          |
| ------------------ | -------------- | -------------- | -------------- | ------------------------- | ------------------------- | ------------------------- | -------------- | -------------- |
| 0 Intake           | **coordinate** | contribute     | consult        | —                         | —                         | —                         | —              | —              |
| 1 Incubation       | **coordinate** | contribute     | consult        | formal-review-if-required | formal-review-if-required | consult                   | consult        | —              |
| 2 Prototype        | contribute     | **coordinate** | consult        | formal-review-if-required | formal-review-if-required | consult                   | consult        | —              |
| 3 Developer trials | **coordinate** | contribute     | consult        | —                         | —                         | consult                   | —              | —              |
| 4 Wide review      | contribute     | contribute     | **coordinate** | formal-review-if-required | formal-review-if-required | formal-review-if-required | **coordinate** | —              |
| 5 Experiment       | contribute     | **coordinate** | consult        | formal-review-if-required | formal-review-if-required | —                         | consult        | —              |
| 6 Prepare to ship  | contribute     | contribute     | consult        | formal-review-if-required | formal-review-if-required | formal-review-if-required | consult        | contribute     |
| 7 Release          | contribute     | contribute     | —              | —                         | —                         | —                         | —              | **coordinate** |
| 8 Adoption         | **coordinate** | contribute     | —              | —                         | —                         | —                         | consult        | contribute     |
| 9 Support          | **coordinate** | contribute     | —              | —                         | —                         | —                         | —              | —              |
| 10 Deprecation     | **coordinate** | contribute     | consult        | formal-review-if-required | —                         | consult                   | consult        | contribute     |

DevRel coordinates phases where evidence quality, developer feedback, and
adoption mechanics are the primary work. Product/engineering coordinate where
design and implementation are primary. Whether formal review is required at any
phase is determined by the team's canonical process, not by this table.

This routing is advisory. Teams must calibrate to their governance model.

## Router

- [00 — Intake and classification](00-intake.md)
- [01 — Incubation](01-incubation.md)
- [02 — Prototype](02-prototype.md)
- [03 — Developer trials](03-developer-trials.md)
- [04 — Wide review and readiness](04-wide-review.md)
- [05 — Experiment / Origin Trial](05-experiment.md)
- [06 — Prepare to ship](06-prepare-to-ship.md)
- [07 — Release communication](07-release.md)
- [08 — Adoption and scale](08-adoption.md)
- [09 — Support and iteration](09-support.md)
- [10 — Deprecation and removal](10-deprecation.md)

Use `modules/ecosystem-and-customer-research.md` whenever demand, alternatives,
communities, customers, partners, or adjacent-platform behavior is unknown.
