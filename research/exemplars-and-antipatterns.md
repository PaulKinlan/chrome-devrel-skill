# Method and process patterns from public cases

Source-cited method/process patterns from the Chrome 140–150 retrospective run
(291 features) and validated eval cases. These are **process patterns about how
the skill handles evidence**, not launch outcome conclusions or judgments about
whether features succeeded.

## Process patterns that produced honest evidence

### E1: CSS catchup features with clean ChromeStatus records

**Pattern:** Features like "Support rect() and xywh() in shape-outside"
(6323071520735232) and "flex-wrap: balance" (4547107962486784) shipped with
clear problem statements, cross-engine parity, and honest metric scope labels.
ChromeStatus-evidence-only reports are sufficient for these low-risk features.

**Evidence:** Report `reports/6323071520735232.json` — CSS family counter
`shape-outside` (bucket_id 347) measured **0.00642198%** of Chrome page loads on
2026-07-20 (source: `evidence/metrics/features/6323071520735232.json`, field
`latestSnapshot.day_percentage`). The report states this is a family-level
measurement, not feature-specific adoption. Report
`reports/4547107962486784.json` has an exact counter mapped, allowing direct
adoption measurement.

**Limit:** Not all CSS features are low-risk. Layout-breaking changes need
deeper analysis.

### E2: Features with exact counter mappings

**Pattern:** 10 features have exact-counter mappings (counter directly measures
the feature). These allow precise adoption measurement without family-level
ambiguity.

**Evidence:** Exact counters in manifest (10 features). Reports cite the counter
percentage with scope label "exact."

**Limit:** Exact counters are rare (10/291). Most features have family-level or
no counters.

### E3: Retrospective reports that honestly mark unknowns

**Pattern:** 291/291 reports have explicit "unknown" status for phases where
evidence was not found. This preserves evidence gaps rather than hiding them.

**Evidence:** Full-denominator audit — 69 cross-engine unknown, 212 docs
unknown, 207 prototype unknown, all explicitly labeled.

**Limit:** Unknowns are concentrated in ChromeStatus-evidence-only generated
reports. Deeper analysis would resolve many.

## Process anti-patterns (evidence-handling failures to avoid)

### A1: Treating "no counter" as "zero usage"

**Pattern:** The team initially suggested marking 139 unmapped features as "zero
adoption." This would fabricate evidence — absence of a public counter means
usage is unknown, not zero.

**Evidence:** Eval case `retrospective-denominator-and-metrics-honesty` —
forbidden behavior "States or implies unmapped features have zero usage."
139/139 reports verified to NOT claim zero.

**Limit:** 27 reports use variant wording that requires manual verification.

### A2: Counting milestone memberships as unique features

**Pattern:** Summing per-milestone counts (355) instead of deduplicating by
ChromeStatus ID (291) inflates the denominator by 22%.

**Evidence:** 41 features appear in 2+ milestones. Eval case tests
non-additivity.

**Limit:** When a feature's behavior changes materially between milestones, both
milestones may need separate analysis.

### A3: Presenting family-level counter usage as feature-specific

**Pattern:** 74 features are mapped to web-feature-family counters that measure
a broader property (e.g., "shape-outside" family for a rect()/xywh() addition).
Presenting family usage as feature-specific adoption overclaims.

**Evidence:** R3 in launch-retrospective.md — 74/152 mapped reports use
family-level counters. All carry scope limitations after quality fixes.

**Limit:** Family counters are the best available signal for many features. The
limitation must be stated, not used to dismiss the data.

### A4: Using survey category interest as API demand

**Pattern:** A general "developers are interested in AI" survey was cited as
evidence for a specific API. Category interest cannot be extrapolated to
specific implementation demand.

**Evidence:** Eval case `survey-selection-and-pushback` — 17/20, no critical
failures. Skill correctly rejected the survey as insufficient.

**Limit:** Category interest is weak signal, not zero signal. It may justify
further research but not design decisions.

### A5: Inventing browser positions from silence

**Pattern:** Assuming Mozilla or WebKit supports a feature because they haven't
objected. Silence is unknown, not support.

**Evidence:** Eval case `stakeholder-critique-attestation` — 19/20. Skill
explicitly states "I will not infer support from silence." Eval case
`strong-capability-retains-risk` rates interop as Unknown.

**Limit:** Other engines may have implicit positions inferable from principles,
but these must be labeled as principle-grounded inference, not recorded
positions.

### A6: Turning shipment into success

**Pattern:** A feature that shipped is not automatically "successful." Shipment
is a process event, not an outcome measure.

**Evidence:** SKILL.md operating rule: "never infer success from shipment, usage
alone, press sentiment, or missing criticism." R1-R5 in launch-retrospective.md
enforce multi-dimensional outcome assessment.

**Limit:** Shipment is necessary context but not sufficient evidence. Mixed
outcomes must remain visible.

## Pattern-to-rule mapping

| Pattern                       | Rule                          | Evidence count            |
| ----------------------------- | ----------------------------- | ------------------------- |
| E1: Clean catchup records     | R4 (risk-triggered depth)     | 204 generated reports     |
| E2: Exact counters            | R3 (scope/confidence labels)  | 10 exact-counter features |
| E3: Honest unknowns           | R5 (explicit unknown status)  | 291/291 reports           |
| A1: No-counter ≠ zero         | R2                            | 139/139 verified          |
| A2: Non-additive denominators | R1                            | 355→291                   |
| A3: Family ≠ feature          | R3                            | 74 family-counter reports |
| A4: Survey ≠ demand           | Survey audit rule in SKILL.md | Eval case 17/20           |
| A5: Silence ≠ support         | SKILL.md operating rule       | Eval cases 19/20, 22/24   |
| A6: Shipment ≠ success        | SKILL.md + R1-R5              | 291 reports               |
