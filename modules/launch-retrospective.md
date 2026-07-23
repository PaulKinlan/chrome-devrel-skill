# Evidence-based launch retrospective

Use this module to review historical or recent Chrome feature launches,
deprecations, removals, trials, and interventions—and to improve the skill from
the complete evidence set.

## Non-negotiable structure

- Establish an authoritative fixed inventory before analysis.
- Keep every target in the denominator. Failed/blocked research is not removed.
- Store one versioned report per unique ChromeStatus feature and retain all
  launch events/categories/milestones for that feature.
- Preserve raw/source evidence or a durable source record with URL, dates,
  provenance, limitations, and content hash where allowed.
- Never overwrite historical results; append new evidence and revisions.
- Do not call a launch successful or failed from press sentiment alone.
- Missing usage, adoption, partner, interoperability, or user-impact evidence
  remains unknown.

## Evidence families

For each feature collect, where relevant:

1. ChromeStatus full record and launch events
2. Explainer/spec/design documents and revision history
3. Intent, TAG, Mozilla/WebKit and other standards/review threads
4. Implementation, tests, bugs, regressions and platform support
5. Chrome usage telemetry: legacy HTML/JS UseCounters, WebDX/WebFeature
   counters, CSS counters, origin-trial counters, and feature-specific UMA/UKM
   plans. Cache the public ChromeStatus timelines and counter mapping rather
   than relying only on links found by search.
6. Docs, samples, demos, release communications and claims
7. Other usage data: Web Platform Dashboard/web-features/HTTP Archive/BigQuery
   or other defensible sources
8. Framework/library/tool integration and package/code evidence
9. Developer/customer/partner trials, production use and case studies
10. Support issues, migration/friction and known failures
11. Critical and positive ecosystem/press/community coverage with
    source-selection limits
12. User impact, accessibility, privacy, security, resource and competition
    evidence

ChromeStatus metrics report the share of measured Chrome HTTP/HTTPS page loads
on which a counter fired. Record whether the mapping is exact, a broader WebDX
family/property, origin-trial-only, ambiguous, custom/internal-only, or absent.
Do not translate that percentage into unique developers, sites, users,
successful tasks, satisfaction, or end-user benefit. A missing mapping means “no
mapped public counter found,” not “no adoption data exists.”

Distinguish independent evidence from sources that repeat one underlying
announcement.

## Review

Replay each lifecycle phase using the detailed phase modules. Ask what was
knowable by the relevant date, what evidence/artifacts existed, what remained
unknown, and whether the next transition packet would have been supported.

Assess outcomes separately:

- Developer problem/value
- End-user impact and control
- Adoption and durable production use
- Interoperability/other-engine/Baseline progress
- Implementation quality and compatibility
- Evidence quality and communication accuracy
- Documentation/demo/integration quality
- Support burden and issue resolution
- Team/launch resilience where public evidence exists

Use `success`, `mixed`, `failure`, or `unscored` with cited evidence and
limitations per dimension. Overall status must not hide mixed dimensions.

## Counterfactual and learning

For each feature record:

- What went well and should become reusable practice?
- What failed or surprised the team?
- Which phase question, evidence, artifact, review rehearsal, friction test,
  stakeholder critique, or monitoring alert could have helped?
- Was the issue product design, implementation, process, evidence,
  communication, adoption, support, or unavoidable disagreement?
- What concrete skill rule, phase packet, prompt, artifact, or eval should
  change?

Do not claim a communications fix would have repaired a product/design failure.
Do not use hindsight-only information as if it was available at launch.

## Robust execution

- Use resumable manifests, atomic writes, bounded concurrency, retries/backoff,
  and cached source evidence.
- Split research into deterministic per-feature jobs with explicit status:
  pending, active, complete, partial, blocked, failed-retryable.
- Keep search queries and attempted sources so a failed provider can resume or
  be replaced.
- Prefer direct primary URLs from ChromeStatus and known source APIs before
  general web search. Use the browser for `chromestatus.com`, or the
  server-rendered `https://chromestatuslite.com/feature/{featureId}` route when
  automated readers need stable HTML.
- Prefer the search/reader tools attached to the active research model/plan when
  available. The current GLM worker uses Z.AI Web Search Prime + Web Reader MCP
  directly rather than pi-web-access; provider failure must affect only one
  feature job, not the run.
- Validate every report against the schema before counting it complete.
- Publish exact feature/report/event totals and completion states.

## Recurrence

Run incrementally per new milestone and periodically refresh post-launch outcome
evidence. New evidence creates a dated revision rather than erasing the original
conclusion. Feed recurring lessons into phase modules and add regression evals
that include both strong and weak cases.

## Retrospective evidence rules (derived from 291-feature validation run)

The following rules are derived from validated patterns in the Chrome 140–150
retrospective run (291 unique features, 355 milestone memberships, 152
counter-mapped, 139 unmapped). Each rule cites the evidence that supports it.

### R1: Overlap-aware denominators

When reporting retrospective counts, distinguish unique features from milestone
memberships. A feature shipping in Chrome 144 (Origin Trial) and Chrome 148
(Enabled by default) is one feature with two memberships, not two features.

**Evidence:** 355 milestone memberships collapsed to 291 unique features (41
features in 2+ milestones). Per-milestone rows are non-additive.

**Counterevidence/limit:** This rule does not apply when a feature's behavior
changed materially between milestones (e.g., API redesign). In that case, note
both milestones but still count as one feature unless the ChromeStatus ID
changed.

### R2: No-counter ≠ zero usage

When no public ChromeStatus counter is mapped for a feature, state "no public
counter is mapped" or "adoption cannot be measured from public telemetry." Never
state, imply, or allow readers to infer zero usage.

**Evidence:** 139/139 unmapped features verified — zero reports claim zero
usage. 27 use variant wording ("too early", "no usage evidence") all verified to
NOT claim zero.

**Counterevidence/limit:** 27 reports use non-standard phrasing that requires
manual verification. The rule should specify the canonical phrasing for
generated reports.

### R3: Metric scope/confidence labels are mandatory

Every report citing cached ChromeStatus metrics must label: mapping status
(exact, family/property, trial, multiple), what the counter measures, what it
does not measure, and whether the counter isolates the feature or measures a
broader family.

**Evidence:** 152/152 mapped reports have scope/limitation documentation after
quality fixes. The quality audit found 0 scope-missing reports after the fix.

**Counterevidence/limit:** Family-level counters (74 of 152) inherently cannot
isolate the specific feature. The label must state this explicitly rather than
presenting family usage as feature-specific adoption.

### R4: Risk-triggered report depth

Reports generated from ChromeStatus evidence alone are acceptable for low-risk
features (CSS catchup, spec alignment, behavior fixes with no user-facing power
change). Deeper analysis (intent threads, friction logs, cross-engine positions,
stakeholder critique, user-impact rehearsal) is required for:

- Features that change user agency, privacy, security, or market power
- Features with known external criticism or contentious positions
- Features that create new platform capabilities (not catchup)
- Features with origin trials (require trial design evidence)

**Evidence:** 204 reports generated from ChromeStatus only; 87 with deeper
analysis. Evidence gaps concentrated in generated reports: 69 cross-engine
unknown, 212 docs unknown, 207 prototype unknown. These unknowns are acceptable
for low-risk features but unacceptable for high-risk ones.

**Counterevidence/limit:** Risk classification itself requires judgment. A
"simple CSS fix" could have accessibility or performance implications. When
uncertain, default to deeper analysis.

**Risk-trigger checklist (advisory — classification needs stakeholder
calibration):**

| Trigger                                              | Example                                               | Minimum depth                                   |
| ---------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| Changes user agency, consent, or control             | Attestation, permission changes, background execution | Stakeholder critique + user-impact rehearsal    |
| Changes privacy, tracking, or fingerprinting surface | New signals, data collection, cross-origin access     | Privacy analysis + stakeholder critique         |
| Changes market power or competition                  | Gatekeeping API, bundling, self-preferencing          | Competition analysis + stakeholder critique     |
| Known external criticism or contentious position     | Public objections from other engines, civil society   | Source-grounded steelman + response plan        |
| New platform capability (not catchup)                | New API primitive, new execution model                | Ecosystem research + interop analysis           |
| Origin trial                                         | Any OT feature                                        | Trial design + learning goals + feedback plan   |
| Accessibility, security, or abuse implications       | New input modality, resource exposure, attack surface | A11y/security review rehearsal + abuse analysis |
| Default to deeper when uncertain                     | Risk unclear                                          | Deeper analysis is the safe default             |

### R5: Explicit unknown status required

Every lifecycle phase in a report must have an explicit status (supported,
partial, unknown, contradicted, not relevant). Blank or missing statuses are not
acceptable — they hide evidence gaps.

**Evidence:** 291/291 reports have status labels for all 11 phases after
normalization. "Not relevant" is used legitimately for phases that don't apply
(e.g., deprecation for a new feature, experiment for a direct-ship CSS catchup).

**Counterevidence/limit:** "Not relevant" must be justified with a finding
explaining why. "Unknown" means evidence was not found, not that the phase is
unimportant.
