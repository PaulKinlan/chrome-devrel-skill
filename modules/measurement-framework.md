# Measurement framework

Defines how DevRel work is measured. Avoids a single universal score — different
objectives need different metrics. Every metric must state its denominator,
limitations, and privacy boundary.

## Metric definition schema

Every tracked metric must define:

```yaml
metricId: "_stable ID_"
name: "_human-readable name_"
objective: "_what DevRel outcome this measures_"
metric: "_what is counted/measured_"
denominator: "_what the count is divided by_"
baseline: "_pre-measurement or historical value_"
target: "_goal value or direction_"
window: "_measurement period_"
instrumentation: "_how data is collected (tool, API, survey)_"
privacyBoundary: "_what personal data is collected, retention, consent_"
scope: "_what this metric covers and does not_"
confidence: "_data quality: high/medium/low with rationale_"
owner: "_role responsible for this metric_"
cadence: "_how often measured: event-driven/weekly/monthly/milestone/quarterly_"
threshold: "_value that triggers action or alert_"
limitations: "_what this metric cannot tell you_"
```

## Candidate metrics by objective

### Product co-design quality

| Metric                                          | Denominator                | Instrumentation    | Limitations                          |
| ----------------------------------------------- | -------------------------- | ------------------ | ------------------------------------ |
| Design changes influenced by developer evidence | Total design decisions     | Issue tracker tags | Attribution is subjective            |
| Prevented friction items (found pre-ship)       | Total friction items found | Friction log count | Survivorship bias on prevented items |

### Developer adoption

| Metric                              | Denominator                           | Instrumentation                | Limitations                                                           |
| ----------------------------------- | ------------------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| ChromeStatus counter percentage     | Measured Chrome HTTP/HTTPS page loads | ChromeStatus timeline API      | Family counters don't isolate feature; no-counter = unknown, not zero |
| Framework/library integration count | Target frameworks                     | GitHub/repos                   | Integration ≠ production use                                          |
| Production deployment evidence      | Target partner segment                | Case studies, partner feedback | Self-selection bias                                                   |

### Interoperability

| Metric                             | Denominator                    | Instrumentation                | Limitations                                     |
| ---------------------------------- | ------------------------------ | ------------------------------ | ----------------------------------------------- |
| Other-engine implementation status | Target engines (WebKit, Gecko) | Public positions, bug trackers | Position ≠ implementation; silence ≠ opposition |
| Baseline availability              | Web Platform Baseline          | web-platform-dx/web-features   | Baseline lag varies by feature                  |

### Documentation quality

| Metric               | Denominator                    | Instrumentation               | Limitations                                 |
| -------------------- | ------------------------------ | ----------------------------- | ------------------------------------------- |
| Task completion rate | Representative developer tasks | Usability testing             | Small samples; lab vs field                 |
| Support issue volume | Time period                    | Issue tracker, support portal | Volume reflects awareness, not just quality |

### Developer sentiment

| Metric           | Denominator              | Instrumentation                | Limitations                                |
| ---------------- | ------------------------ | ------------------------------ | ------------------------------------------ |
| Sentiment trend  | Survey sample            | Developer survey               | Selection bias; self-report; small samples |
| Criticism themes | Public discussion volume | Issue trackers, forums, social | Coverage bias; volume ≠ prevalence         |

### Team safety

| Metric                    | Denominator      | Instrumentation    | Limitations                        |
| ------------------------- | ---------------- | ------------------ | ---------------------------------- |
| Incident response time    | Safety incidents | Incident log       | Privacy-preserving aggregates only |
| Team well-being check-ins | Team members     | Private HR process | Never public; aggregate only       |

## Privacy rules

- Never collect personal data without an approved purpose and handling plan
- Use aggregate, privacy-preserving measures for team safety
- Separate correlation from attribution in all reporting
- Record denominator, sample, missing data, selection bias, and confidence

## Stopping and escalation

Escalate to human decision when:

- A product concern requires redesign, delay, or rollback
- Evidence conflicts materially across sources
- Monitoring would cross a privacy boundary
- The denominator is too unstable to support the claim
- A safety incident occurs
