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
- Status: open, reproduced, disputed, fixed-unverified, verified, blocked, or accepted

A mismatch between docs/explainer/spec/implementation is a finding even if one path “works.” Do not silently rewrite the expectation to match implementation.

## Iterate

1. Turn high-value findings into questions and measurable goals.
2. Improve the appropriate layer: product, implementation, spec/explainer, docs, sample, tooling, demo, fallback, or support.
3. Add immutable regression/conformance assertions where behavior can be tested.
4. Re-run the exact reproduction plus adjacent paths.
5. Preserve before/after evidence and denominator counts.
6. Monitor for recurrence across versions and environments. Define each monitor's source/query, cadence (for example every milestone or after relevant implementation/docs changes), owner, alert threshold (such as a reappearing console signature or failed conformance assertion), action, and stop condition.

Report exact tested/total/fixed/remaining/blocked counts. Do not claim complete coverage without an inventory.

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
