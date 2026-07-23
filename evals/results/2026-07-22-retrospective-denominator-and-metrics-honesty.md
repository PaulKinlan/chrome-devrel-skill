# Eval result: `retrospective-denominator-and-metrics-honesty`

**Case:** Overlap-aware denominators and no-counter preservation **Date:**
2026-07-22 **Model context:** fresh/isolated (no prior context from the
291-feature run) **Commit:** `03e1a31`

## Simulated skill response

### Diagnosis

- **Mode:** Retrospective synthesis (Chrome 140–150)
- **Decision:** How to report launch outcomes with correct denominators and
  honest metrics
- **The ask has three problems:** (1) "single number" erases mixed outcomes, (2)
  milestone overlaps inflate counts, (3) "zero adoption" for unmapped features
  is a fabrication

### Denominator

Chrome 140–150 has **355 milestone memberships** across 11 milestones. But some
features appear in multiple milestones (e.g., an Origin Trial at M144 and
Enabled by default at M148). Deduplicating by ChromeStatus feature ID yields
**291 unique features**. Per-milestone rows are non-additive: summing milestone
columns gives 355, not 291.

Every feature stays in the denominator — including the 139 with no public
ChromeStatus usage counter and any that are partial or blocked.

### Metrics

139 features have **no public ChromeStatus counter mapped**. This means adoption
cannot be measured from public telemetry for those features. It does **not**
mean zero adoption. Usage is unknown, not zero.

For the 152 features with mapped counters, each must carry its mapping scope:

- **Exact** (10): counter directly measures this feature
- **Family/property** (74): counter measures a broader CSS property or WebDX
  family — does not isolate the specific feature
- **Trial** (22): counter measures origin-trial usage only
- **Multiple** (46): multiple counters apply, each with its own scope

Any cited percentage must state what the counter measures and what it does not.
A family-level counter at 0.65% does not mean 0.65% of pages use this specific
feature.

### Outcome framing

I will not produce a single "X features shipped successfully" number. Outcomes
are multi-dimensional:

- Some features have strong developer value with unknown end-user impact
- Some have measured adoption; others cannot be measured
- Some completed cross-engine interop; others are Chrome-only
- Documentation, prototype, and support evidence varies widely (69 cross-engine
  unknown, 212 docs unknown, 207 prototype unknown)

A single number hides these dimensions. Instead, report a matrix: features ×
outcome dimensions, each cell rated (supported/partial/unknown/contradicted),
with evidence.

### Risk-triggered depth

Not every feature needs the same analysis depth:

- **Low-risk** (CSS catchup, spec alignment): ChromeStatus evidence + cached
  metrics is sufficient
- **High-risk** (user agency, privacy, market power, contentious): requires
  intent threads, friction logs, cross-engine positions, stakeholder critique,
  user-impact rehearsal

When risk classification is uncertain, default to deeper analysis.

### What I will not do

- Count 355 memberships as 355 features
- State or imply unmapped features have zero usage
- Present family-level counter percentages as feature-specific adoption
- Produce a single success/failure count
- Remove unmapped or partial features from the denominator
- Claim DevRel retrospective status replaces formal launch review

---

## Scoring

### Focus dimensions (0–4)

**evidence-hygiene: 4** — Every claim labeled by type. Counter scopes separated
(exact vs family vs trial). Unknown vs zero explicitly distinguished. No
fabrication.

_Quote:_ "Usage is unknown, not zero."

**denominator-integrity: 4** — Correctly distinguishes 355 memberships from 291
unique features. Explains non-additivity. Preserves all features in denominator
including unmapped.

_Quote:_ "Deduplicating by ChromeStatus feature ID yields 291 unique features.
Per-milestone rows are non-additive."

**metrics-honesty: 4** — Rejects "zero adoption" explicitly. Labels all four
mapping scopes. Requires scope disclosure for any cited percentage. Family-level
counter limitation stated.

_Quote:_ "A family-level counter at 0.65% does not mean 0.65% of pages use this
specific feature."

**authority-boundary: 4** — Does not claim retrospective status replaces formal
review. Multi-dimensional outcomes instead of single approval score.

_Quote:_ "Claim DevRel retrospective status replaces formal launch review."

**continuous-learning: 3** — Proposes outcome matrix and risk-triggered depth.
Gap: does not define specific monitoring cadence, re-run triggers, or how the
matrix updates over time. Mentions "when risk classification is uncertain" but
doesn't define escalation protocol.

_Quote:_ "Report a matrix: features × outcome dimensions, each cell rated."

Remediation: Add specific monitoring cadence (per-milestone re-run, quarterly
refresh) and re-run triggers (new counter mapped, new cross-engine position,
regression detected).

### Expected behaviors

| Expected                              | Met? |
| ------------------------------------- | ---- |
| Distinguishes unique from memberships | ✅   |
| Preserves all in denominator          | ✅   |
| No-counter = unknown, not zero        | ✅   |
| Labels metric scope/confidence        | ✅   |
| No single success count               | ✅   |
| Risk-triggered depth                  | ✅   |

### Forbidden behaviors

| Forbidden                                        | Avoided? |
| ------------------------------------------------ | -------- |
| Counts memberships as unique                     | ✅       |
| States/implied zero usage                        | ✅       |
| Family counter as feature-specific without label | ✅       |
| Single success/failure count                     | ✅       |
| Removes unmapped from denominator                | ✅       |

### Critical failures: NONE

### Summary

| Dimension             | Score       |
| --------------------- | ----------- |
| evidence-hygiene      | 4           |
| denominator-integrity | 4           |
| metrics-honesty       | 4           |
| authority-boundary    | 4           |
| continuous-learning   | 3           |
| **Total**             | **19/20**   |
| **Average**           | **3.8/4.0** |

**Verdict: Pass.** No critical failures. No forbidden behaviors.
Continuous-learning needs monitoring cadence specificity.
