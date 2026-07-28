# Friction log

A friction log is a reproducible evidence record of what prevents a developer or user from understanding, trying, integrating, deploying, operating, or supporting a capability. It is not a list of impressions and not a one-time happy-path demo.

## Define the run

Record before testing:

- Feature and version/milestone
- User/job and realistic task
- Lifecycle stage and expected support
- OS, browser/channel/build, flags/tokens/policies, hardware, viewport, input methods, network, locale, assistive technology, framework, server, and toolchain
- Source docs, explainer/spec revision, samples, and expected behavior
- Fresh profile/cache/storage state and any preconditions
- Mobile and desktop unless direct evidence excludes a class

## Exercise the complete path

1. **Discovery:** Can the intended user find and understand the capability and support state?
2. **Setup:** Flags, origin-trial tokens, permissions, downloads, dependencies, headers, server configuration, policies, and secure contexts.
3. **First success:** Follow the canonical quickstart exactly without hidden knowledge.
4. **Core controls:** Exercise every visible control and documented option; use pointer, touch, and keyboard where applicable.
5. **Realistic integration:** Framework/library, server, build, deployment, lifecycle, cleanup, and state-management paths.
6. **Edges:** Empty, malformed, large, slow, denied, unsupported, offline, interrupted, stale, concurrent, cancelled, backgrounded, and resource-constrained cases.
7. **Compatibility:** Mobile/desktop, other engines, fallbacks, progressive enhancement, and feature detection.
8. **Quality:** Visual artifacts, overflow, responsiveness, focus, semantics, announcements, motion, performance, memory, battery, console, network, errors, and recovery.
9. **Operations:** Logging, diagnostics, issue reporting, version updates, rollback, support, and deletion/cleanup.

Use real browser/runtime evidence. Inspect console and network before and after state changes. Capture screenshots/video/traces where they reveal behavior. Never convert “no visible error” into a pass without exercising the expected behavior.

A proposed concern is not observed friction. Keep source and outcome separate:

- **Source class:** discovered during this run, attributable external report, or hypothesis/question.
- **Inventory-test result:** pass, fail, or blocked.
- **External-report reproduction outcome:** reproduced, not reproduced, blocked, or not attempted.

Use exact arithmetic:

- `inventory_total = pass + fail + blocked`;
- `inventory_tested = pass + fail`;
- `report_attempted = reproduced + not_reproduced`;
- `report_total = reproduced + not_reproduced + blocked + not_attempted`.

A failure discovered in the run is observed friction. An external report is reproduced friction only when the reproduction outcome is `reproduced`. `not_reproduced` records a completed attempt but is not evidence that the issue is impossible in other environments. Hypotheses remain outside all execution denominators until converted into stable test IDs.

## Record each friction item

- Stable ID
- Step and user intent
- Expected behavior and source
- Actual behavior
- Evidence paths/URLs and timestamps
- Reproduction steps and rate
- Environment(s) tested
- Affected users and severity
- Category: explainer/spec, docs, sample, implementation, framework/library, server/deployment, browser compatibility, UX, accessibility, performance, privacy/security, tooling, support, or unknown
- Workaround and its cost
- Likely owner (not blame)
- Question or hypothesis
- Proposed fix/test
- Source class: discovered-during-run, external-report, or hypothesis/question
- Inventory-test result: pass, fail, or blocked, when this item has a test ID
- Reproduction outcome: reproduced, not-reproduced, blocked, or not-attempted, for an external report
- Resolution status: open, disputed, fixed-unverified, verified, blocked, decision-required, or accepted-risk
- Original failed test ID, before-artifact IDs, fix-artifact IDs, verification test ID, adjacent regression test IDs, and after-artifact IDs

A mismatch between docs/explainer/spec/implementation is a finding even if one path “works.” Do not silently rewrite the expectation to match implementation.

## Iterate and close the frontier

Every failed browser test enters the friction frontier; a report cannot omit a failed test merely because it was later corrected.

1. Turn each finding into a measurable goal owned by the appropriate layer: product, implementation, spec/explainer, docs, sample, tooling, demo, fallback, or support.
2. Make a real content/code/configuration change and retain its path plus before/after content hashes.
3. Add immutable regression/conformance assertions where behavior can be tested.
4. Parent-verify the exact original reproduction after the change.
5. Re-run every declared adjacent regression, full semantic-fact and artifact-integrity gates, and the complete friction frontier.
6. Save before/after screenshots for visual findings and retain all console/network/assertion evidence.
7. Add newly discovered failures to the denominator rather than hiding them.
8. Monitor for recurrence across versions and environments. Define each monitor's source/query, cadence (for example every milestone or after relevant implementation/docs changes), owner, alert threshold (such as a reappearing console signature or failed conformance assertion), action, and stop condition.

`verified` is computed only when the original failure, changed artifact, later exact-reproduction pass, adjacent-regression passes, and after evidence all exist. `fixed-unverified`, `open`, `disputed`, `blocked`, `decision-required`, and `accepted-risk` are not resolved and prevent technical success. Accepted risk requires attributable human authority evidence; it never becomes a verifier-generated technical pass.

Report `inventory_total`, `inventory_tested`, pass/fail/blocked, verified/open/fixed-unverified/disputed/blocked/decision-required/accepted-risk, `report_total`, `report_attempted`, and reproduced/not-reproduced/report-blocked/not-attempted counts against explicit ID inventories. `resolved = verified`; no other status may enter that numerator. Report hypotheses separately and outside all execution totals. Do not claim complete coverage without an inventory or machine-valid closure bundle.

## Output

- Run manifest
- Step-by-step journey
- Friction table
- Evidence index
- Console/network/performance/accessibility/visual summary
- Cross-device/browser matrix
- Questions and goals
- Fix/owner plan
- Regression/conformance additions
- Re-run results, monitoring cadence/triggers/outcomes, and residual risks
