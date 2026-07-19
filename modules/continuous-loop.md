# Continuous DevRel loop

Use this module when DevRel work should continue across feature versions, lifecycle stages, or a portfolio. It turns research, friction, critique, assets, support, and outcomes into a repeatable improvement system.

## Loop

1. **Inventory**
   - Features/initiatives, stable IDs, owners, lifecycle stages, artifacts, audiences, environments, open concerns, and support state
   - Explicit denominator; blocked and unsupported items remain visible
2. **Gather evidence**
   - Current specs/explainers, ChromeStatus/intents, implementation, standards positions, developer/partner research, adoption, support, press/public critique, docs, demos, and telemetry
3. **Exercise**
   - Run friction logs and conformance across representative mobile/desktop, browser, framework, server, permission, network, and user configurations
4. **Critique**
   - Product/API fit, user impact, review perspectives, stakeholder externalities, narrative, artifacts, adoption, and launch resilience
5. **Ask questions**
   - Convert unknowns, contradictions, and failures into answerable questions with evidence plans
6. **Set goals**
   - Choose measurable product, evidence, integration, documentation, adoption, interoperability, sentiment, support, and team-safety goals
7. **Improve**
   - Product/design, implementation, tests, spec/explainer, docs, demos, tooling, partners, narrative, presentations, promotion, support, or rollout
8. **Validate**
   - Re-run exact failures and adjacent paths; add immutable regression/conformance checks; preserve before/after evidence
9. **Publish/update**
   - Update the public source of truth and artifact pack with versions, evidence, limitations, and owners
10. **Monitor and repeat**
   - Watch standards positions, releases, framework integrations, support issues, adoption, press/public discussion, incident signals, and stale artifacts

## Monitoring design

Define cadence and triggers rather than “monitor continuously” as an unbounded instruction.

- **Event-driven:** new Intent, position, spec change, milestone, trial change, partner commitment, regression, incident, or major coverage
- **Frequent during launches/trials:** support, issues, press, moderation, runtime failures
- **Weekly:** evidence/asset freshness, open risks, partner and framework progress
- **Per milestone:** compatibility, friction/conformance, docs/demo accuracy, release readiness
- **Quarterly/post-launch:** adoption, interoperability, sentiment, support burden, strategy and narrative

Every monitor needs source, query/filter, owner, cadence, retention, privacy boundary, alert threshold, and action. Do not collect private community data or personal information without an approved purpose and handling plan.

## State and provenance

Keep append-only history for:

- Source URL or evidence path, publisher, publication/retrieval date, and checksum/version where useful
- What changed and why
- Previous/current readiness state
- Open/resolved/reopened concerns
- Artifact and test versions
- Decisions, owner, date, evidence, and reversal conditions
- Exact tested/total/pass/fail/blocked denominators

Never overwrite a negative historical result merely because the current state improved.

## Outcome monitoring

Choose measures by objective:

- Product co-design and prevented/reduced friction
- Developer/partner trial and production adoption
- Framework/library/tool integration
- Other-engine position and implementation movement
- Baseline/interoperability progress
- Documentation/sample success and task completion
- Support volume, recurrence, severity, and resolution time
- Sentiment and criticism themes with source/selection limitations
- Asset reuse by staff, GDEs, partners, events, and external educators
- Incident/team-safety indicators using privacy-preserving aggregates

Separate correlation from attribution. Record denominator, sample, missing data, selection bias, and confidence.

## Stopping and escalation

The loop should recommend human decisions when:

- A product concern requires redesign, narrowing, delay, rollback, or abandonment
- Formal review or qualified advice is required
- Evidence conflicts materially
- A harassment, privacy, security, or safety incident occurs
- Monitoring would cross a privacy or organizational boundary
- The denominator or source is too unstable to support the claim

## Output

- Portfolio manifest and denominator
- Current state dashboard by dimension
- New evidence/change log
- Friction, critique, and conformance results
- Questions and goals
- Work queue by owner/impact/urgency
- Artifact freshness report
- Monitoring alerts and actions
- Outcome trend with limitations
- Residual risks and required human decisions
