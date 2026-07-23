# Advisory readiness expectations

This module provides advisory evidence expectations for each readiness
dimension. These are **not mandatory gates** — they describe what credible
evidence looks like for each dimension, so teams and reviewers can assess gaps
honestly. There is no universal DevRel veto.

## How to use

For each dimension, rate the feature as:

- **Supported:** credible evidence is present and linked
- **Partial:** some evidence exists but material gaps remain
- **Unknown:** evidence has not been found or supplied
- **Contradicted:** available evidence challenges the current claim
- **Not relevant:** explain why; never use this to mean untested

## Dimension expectations

### Problem validity

- **Supported:** Concrete, recurring developer pain documented via research,
  interviews, or public issue trackers. The problem is distinguishable from
  "this API would be nice to have."
- **Partial:** Plausible problem with anecdotal evidence but no systematic
  research.
- **Unknown:** No developer research conducted.

### Developer demand

- **Supported:** Attributable evidence from representative developers that they
  need this specific capability (not a broad category survey). Distinguish:
  observed need → contacted → interest → trial → ship → production.
- **Partial:** General category interest exists but does not measure demand for
  this API shape.
- **Unknown:** No demand evidence collected.

### Partner commitment

- **Supported:** Named partners with consented, attributable statements about
  willingness to trial or ship. Evidence stage explicitly classified.
- **Partial:** Partners expressed interest but no commitment to trial or ship.
- **Unknown:** No partner engagement.

### API ergonomics

- **Supported:** Friction logs from clean setup through realistic integration.
  Framework compatibility tested. API is usable without hidden knowledge.
- **Partial:** Demos work but integration testing is incomplete or desktop-only.
- **Unknown:** No ergonomics testing.

### Interoperability

- **Supported:** Public positions from other engines cited with dates. Baseline
  path defined. Independent implementability confirmed.
- **Partial:** Some cross-engine signals but no formal positions.
- **Unknown:** No cross-engine engagement. Silence is not support.

### Framework/library fit

- **Supported:** Integration tested with major frameworks (React, Vue, Angular).
  Build tools and server requirements documented.
- **Partial:** Vanilla JS works; framework integration assumed but untested.
- **Unknown:** No framework testing.

### Documentation

- **Supported:** Reference docs, quickstart, samples, FAQ, and known-limitations
  guide exist and are tested against real workflows.
- **Partial:** Minimal reference exists but quickstart has gaps or samples are
  toy-only.
- **Unknown:** No documentation prepared.

### Adoption mechanics

- **Supported:** Specific distribution plan targeting the actual adoption
  bottleneck (not just "write an article"). Multipliers identified: frameworks,
  tools, GDEs, partners, events.
- **Partial:** Content plan exists but lacks distribution/adoption mechanism.
- **Unknown:** No adoption plan.

### Measurement

- **Supported:** Relevant metrics defined with denominators, baselines,
  instrumentation, and privacy boundaries. See
  `modules/measurement-framework.md`.
- **Partial:** Some metrics defined but denominators or instrumentation missing.
- **Unknown:** No measurement plan.

### User impact

- **Supported:** End-user benefit/cost analysis completed. Device matrix
  measured. Privacy, accessibility, and abuse implications assessed.
- **Partial:** Developer benefit documented but end-user impact not analyzed.
- **Unknown:** No user impact analysis.

### Team safety

- **Supported:** Launch resilience plan in place. Roles assigned. Moderation,
  escalation, and aftercare prepared.
- **Partial:** Some preparation but incomplete coverage.
- **Unknown:** No launch resilience preparation.

### Accessibility

- **Supported:** AT compatibility tested (screen readers, keyboard/switch,
  zoom/reflow, contrast/forced colors, reduced motion). Equivalent semantics,
  navigation, and error recovery available.
- **Partial:** Some a11y testing but gaps in AT coverage or semantic
  equivalence.
- **Unknown:** No accessibility testing conducted.

### Privacy and data protection

- **Supported:** Data-flow analysis complete. What data is collected, where it
  goes, retention, and user control documented. "Local"/"private" claims
  technically demonstrated.
- **Partial:** Some privacy analysis but data flow or user-control gaps remain.
- **Unknown:** No privacy analysis. "Local" or "private" claims unverified.

### Security and abuse

- **Supported:** Threat model complete. Hostile-site behavior, resource
  exhaustion, privilege escalation, and data exfiltration analyzed. Abuse
  controls proportionate.
- **Partial:** Some security analysis but threat model or abuse controls
  incomplete.
- **Unknown:** No security/abuse analysis.

### Legal, regulatory, and competition

- **Supported:** Legal review routed. Jurisdictional, consumer-protection,
  data-protection, accessibility-duty, and competition questions identified as
  routing questions for qualified counsel.
- **Partial:** Some legal questions identified but review not routed.
- **Unknown:** No legal/regulatory analysis. (Note: DevRel identifies questions
  and routes to counsel; it never provides legal conclusions.)

### Server and deployment integration

- **Supported:** Server requirements, headers, secure-context constraints,
  enterprise policy, and deployment paths tested and documented.
- **Partial:** Some integration testing but enterprise or deployment gaps.
- **Unknown:** No server/deployment testing.

### Performance and resource cost

- **Supported:** Performance measured across device tiers (flagship, mid-range,
  low-end). Memory, CPU/GPU, battery, thermal, and bandwidth costs quantified
  with methodology.
- **Partial:** Flagship-only measurements; low-end device behavior unknown.
- **Unknown:** No performance measurement.

### Supportability

- **Supported:** Support route defined. Known issues documented. FAQ from real
  developer questions. Issue triage owner assigned.
- **Partial:** Some support preparation but FAQ or triage gaps.
- **Unknown:** No support plan.

### Narrative and claim accuracy

- **Supported:** All public claims traceable to cited evidence. Terminology
  consistent across artifacts. Known limitations disclosed.
- **Partial:** Some claims lack evidence citation or terminology is
  inconsistent.
- **Unknown:** Claims not verified against evidence.
