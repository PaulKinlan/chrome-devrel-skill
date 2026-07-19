# Phase 10 — Deprecation and removal

## Entry

A feature, behavior, API, trial, policy, or compatibility path may be restricted, replaced, or removed.

## Decisions

- Who is affected and how can they detect impact?
- Is removal necessary, proportionate, and timed realistically?
- What replacement/migration exists and works in production?
- Are reverse trials or phased enforcement needed?

## Work and evidence

- Inventory usage by segment/platform and identify invisible/long-tail dependencies; retain denominator and uncertainty.
- Run migration friction logs across realistic frameworks, servers, enterprises, accessibility, mobile/desktop, and other engines.
- Build detection/audit tooling, replacement samples, compatibility guidance, timelines, policy/admin notices, support and partner outreach.
- Rehearse user, competition, standards, privacy/security/accessibility, and ecosystem impacts.
- Define warnings, milestones, reverse-trial criteria, pause/extension/rollback triggers, and post-removal monitoring.

## Artifacts

- Impact and stakeholder analysis
- Migration/detection toolkit
- Deprecation/replacement docs and FAQ
- Outreach/support/enterprise plan
- Timeline, reverse-trial and rollback plan
- Removal outcome report

## Common failures

- UseCounter treated as complete affected-user inventory
- Replacement exists in theory but fails real integration
- Communication begins after warnings ship
- Small sites/framework plugins/assistive workflows excluded
- Deadline extended repeatedly without learning

## Transition packet: deprecation → removal/closure

Affected denominator and unknowns; migration completion/friction; outreach/support; current warnings/policies; unresolved users/risks; extension or removal rationale; rollback/emergency plan; post-removal monitoring and archival record.
