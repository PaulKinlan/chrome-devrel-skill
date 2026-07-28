# Phase 06 — Prepare to ship

## Entry

Implementation and specification are intended to stabilize for default availability; formal reviews, Intent to Ship, docs, rollout, support, and launch preparation converge.

## Decisions

- Is the evidence credible enough to explain the decision publicly?
- Are spec, implementation, tests, docs, samples, fallback, support, and rollout aligned?
- What unresolved risks are accepted, mitigated, or launch-changing?
- Is the team prepared for likely questions, regressions, and controversy?

## Work and evidence

Load `modules/launch-execution.md`, `modules/standards-and-incubation-analysis.md`, `modules/implementation-and-issue-tracker-research.md`, and `modules/completion-loop.md`. “Manage the launch” means execute the public, reversible readiness and enablement work until success or a confirmed terminal blocker unless the user explicitly asks for planning only.

- Reconcile every ChromeStatus/intent claim with linked evidence, methods, dates, denominators, and contradictory findings.
- Fully analyze Mozilla, WebKit, TAG, intent, and incubation records: read complete threads; follow every substantive cross-link to analyzed/duplicate/out-of-scope/blocked; inventory design-significant issues/PRs; reconstruct chronology; and map each question/objection to responses, landed changes, reviewer confirmation, and current state. `No signal`, an open request, no response, and silence are not neutral or support.
- Search and reconcile Chromium Issues, Gerrit open/merged/abandoned/reverted changes and source; WebKit Bugzilla/source/tests; Mozilla Bugzilla/source/tests; and shared WPT/status history using feature names, aliases, IDL members, flags, spec URLs, bug IDs, components, and test names. Preserve exact query/result/change denominators and zero-result limits.
- Confirm current formal review/gate states without having DevRel claim approval.
- Derive an explicit feature-contract coverage manifest from the spec/IDL, implementation, policies/permissions, failure/fallback behavior, and developer jobs.
- Build independently runnable minimal samples for the important primitives and branches, plus at least one realistic integrated use case. A demo plan is not a demo.
- Launch the intended Chrome build and run the samples/demos against the real implementation using `chrome-devtools-mcp`. Exercise visible controls on desktop and mobile; inspect console/network/runtime state; preserve evidence; report `inventory_total = pass + fail + blocked` and `inventory_tested = pass + fail`. Label mobile evidence as physical, remote-device, emulator, or viewport-only; viewport emulation is not mobile-platform/API validation. If Chrome/MCP/platform access is unavailable, the runtime goal is blocked—content or source checks cannot replace it.
- Build friction/conformance from executed journeys across setup, first success, framework/server integration, permissions/policies, failure/recovery/cleanup, compatibility, accessibility, and resource cost. Keep hypotheses and externally reported-but-unreproduced issues outside the tested denominator.
- Audit live MDN, `mdn/content`, BCD, Chrome-owned docs, release notes, samples, FAQ/troubleshooting, compatibility/fallback, enterprise/admin notice, and migration material against the current spec and implementation.
- Where documentation or BCD is absent or stale, create a patch-ready local addition/correction and test its examples; do not stop at a gap analysis or claim upstream approval.
- Build narrative and launch assets from the same tested source of truth.
- Complete rollout/telemetry/rollback, support ownership, monitoring, and launch-resilience/team-safety plans.
- Continue building, testing, correcting, and re-running every reversible local goal. Ask the user only for a genuine product/authority/private-access/unavailable-environment decision; do not return “write or test next?” choices for implied goals.

## Artifacts

- Evidence-backed ship/launch brief
- Formal-review state matrix plus standards/incubation source graph, chronology, cross-link manifest, engine-position matrix, TAG ledger, and objection-resolution ledger
- Coverage manifest, runnable standalone sample suite, integrated demo, and exact browser execution matrix
- Final observed-friction/conformance/user-impact report with reported issues and hypotheses separated
- MDN/BCD and Chrome-doc inventory plus tested patch-ready additions or corrections
- Coherent artifact inventory and source-of-truth
- Rollout/rollback/support/monitoring plan
- Press/public question and launch-resilience pack

## Common failures

- “Three LGTMs” treated as proof of developer/user value
- Unsupported sentiment or partner claims
- Docs/demo preparation after branch/feature freeze
- Known negative positions or costs omitted from messaging
- Individual engineers left as default public responders

## Transition packet: prepare-to-ship → release

Approved/current launch state; exact milestone/platform rollout; evidence and claim ledger; current review/position links; known limitations/costs/fallbacks; docs/demo/FAQ/assets; partner permissions; support/escalation/incident roles; monitoring and rollback triggers; open risks and public wording.
