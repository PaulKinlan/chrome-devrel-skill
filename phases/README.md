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

Advisory — teams configure their own owner map (see
`modules/governance-and-roles.md`). Roles marked **lead** own the phase
decision; **contrib** contribute evidence/artifacts; **review** must sign off
formally.

| Phase              | DevRel   | Product/Eng | API Owner | Privacy | Security | A11y    | Standards | Comms    |
| ------------------ | -------- | ----------- | --------- | ------- | -------- | ------- | --------- | -------- |
| 0 Intake           | **lead** | contrib     | contrib   | —       | —        | —       | —         | —        |
| 1 Incubation       | **lead** | contrib     | review    | review  | review   | contrib | contrib   | —        |
| 2 Prototype        | contrib  | **lead**    | review    | review  | review   | contrib | contrib   | —        |
| 3 Developer trials | **lead** | contrib     | contrib   | —       | —        | contrib | —         | —        |
| 4 Wide review      | contrib  | contrib     | **lead**  | review  | review   | review  | **lead**  | —        |
| 5 Experiment       | contrib  | **lead**    | contrib   | review  | review   | —       | contrib   | —        |
| 6 Prepare to ship  | contrib  | contrib     | review    | review  | review   | review  | contrib   | contrib  |
| 7 Release          | contrib  | contrib     | —         | —       | —        | —       | —         | **lead** |
| 8 Adoption         | **lead** | contrib     | —         | —       | —        | —       | contrib   | contrib  |
| 9 Support          | **lead** | contrib     | —         | —       | —        | —       | —         | —        |
| 10 Deprecation     | **lead** | contrib     | review    | review  | —        | contrib | contrib   | contrib  |

DevRel leads phases where evidence quality, developer feedback, and adoption
mechanics are the primary decisions (intake, trials, adoption, support,
deprecation). Product/engineering and formal reviewers lead where design,
implementation, or formal sign-off is the primary decision.

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

Use `../modules/ecosystem-and-customer-research.md` whenever demand,
alternatives, communities, customers, partners, or adjacent-platform behavior is
unknown.
