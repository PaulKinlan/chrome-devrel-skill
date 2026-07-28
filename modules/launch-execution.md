# Launch execution: demos, samples, docs, and observed friction

Use this module when the user says they need to **manage**, **prepare**, **validate**, or **enable** a feature launch. A launch plan is not the default final deliverable. Load `modules/completion-loop.md` and execute the public, reversible work until it succeeds or reaches a confirmed terminal blocker.

This module does not grant release, API Owner, engineering, standards, privacy, security, accessibility, legal, MDN, or editorial approval. A generic request to manage a launch authorizes public research and reversible local drafts/tests only. Opening an external issue or PR, publishing, changing production systems, or representing another team requires a separate explicit instruction for that action plus confirmed target, scope, account, and authority. User approval without verified scope/authority is sufficient only for local drafts, never external representation.

## Default execution contract

Unless the user explicitly asks for planning only:

1. Recover or create the durable feature packet and canonical asset inventory.
2. Retrieve the current specification, explainer, IDL, implementation status, tests, ChromeStatus/intent records, standards positions, and existing documentation/demos. Load `modules/standards-and-incubation-analysis.md` and `modules/implementation-and-issue-tracker-research.md`; read full Mozilla/WebKit/TAG/incubation threads, disposition every substantive cross-link, and search/reconcile Chromium Issues/Gerrit/source, WebKit Bugzilla/source/tests, Mozilla Bugzilla/source/tests, and WPT/status history.
3. Build a coverage manifest from the actual API surface, normative behavior, important options, policies/permissions, failure modes, fallback, and realistic developer jobs.
4. Create the missing standalone samples and integrated demos in a reviewable workspace.
5. Launch the intended Chrome build and run every applicable sample/demo against the real implementation. If the required build/platform cannot run, mark those runtime goals blocked; never substitute prose, mocks, or source inspection.
6. Exercise visible behavior and inspect console/network/runtime state before and after interactions.
7. Create the friction log from observed or externally reproduced evidence, not from speculation.
8. Audit MDN content and BCD plus Chrome-owned developer documentation; create patch-ready additions or corrections when missing or stale.
9. Re-run after fixes and report exact built/tested/pass/fail/blocked denominators.
10. Return the launch/readiness decision packet and concrete artifact paths, not merely a future worklist.

Do not stop after identifying that demos, tests, or docs are missing. Missing public information should trigger research; missing reversible local assets should trigger creation. Ask only for access, authority, private evidence, product decisions, or environment capabilities that cannot be obtained responsibly.

## Build a coverage manifest before demos

Inventory the feature contract with stable IDs:

- exposed interfaces, properties, methods, events, dictionaries, enums, attributes, headers, manifest fields, CSS/HTML syntax, or policy controls;
- required contexts, origin/security requirements, permissions, policies, flags, tokens, platform/channel constraints, and server configuration;
- normative success behavior and meaningful option branches;
- errors, denial, malformed/empty inputs, unsupported states, cancellation, cleanup, navigation/reload, concurrent use, and recovery;
- feature detection, progressive enhancement, other-engine behavior, and fallback;
- accessibility, mobile/desktop, keyboard/touch, responsive layout, privacy/security, performance/resource, framework/build/server/deployment, and enterprise implications;
- the developer jobs and user outcomes the feature is supposed to improve.

Map every sample/test to one or more contract IDs. Report exact covered/total/blocked counts. “Comprehensive” means the declared manifest is covered or explicitly blocked; it does not mean an arbitrary number of demos.

## Create four layers of runnable material

### Layer 0 — feature detection and fallback

Create the smallest standalone page or program that:

- detects support without UA sniffing;
- explains required context/configuration;
- exposes unsupported/denied/error state visibly;
- preserves a useful fallback or progressive-enhancement path.

### Layer 1 — minimal standalone samples

Create one copyable, independently runnable sample for each important primitive or normative behavior. Each sample must include:

- the smallest necessary HTML/CSS/JS or equivalent source;
- explicit server/header/manifest/flag/token requirements;
- visible input, result, status, and error/recovery state;
- no hidden dependency on the launch workspace or private harness;
- a short README or inline instructions stating expected behavior and support boundary.

These are documentation candidates. A developer should be able to copy one without extracting it from a large showcase application.

### Layer 2 — branches, failures, and integration

Add focused samples for meaningful options, permissions/policies, cross-origin behavior, lifecycle/cleanup, malformed or denied inputs, unsupported browsers, framework/build/server integration, and fallback. Do not manufacture a branch the implementation cannot expose; mark it blocked with the exact reason.

### Layer 3 — realistic user experience

Build at least one cohesive use case that demonstrates why the primitive matters in a product-like flow. It must compose the feature with realistic application state, user control, recovery, and adjacent APIs without hiding the underlying behavior. Keep the Layer 1 samples even when this richer demo exists.

## Run the implementation, not just the source

Before frontend authoring, consult current web-platform guidance available in the environment rather than relying only on model memory.

For Chrome launch/readiness work, browser execution is a hard evidence gate. Launch Chrome and use `chrome-devtools-mcp`; if it cannot be connected, the runtime/demo/docs-example/friction goals are blocked and launch enablement cannot be called successful. Static content creation, screenshots of unexecuted markup, lint, unit tests, or source review do not satisfy this gate.

For browser-facing work:

- use the intended Chrome channel/build and record its exact version, OS, flags, policies, tokens, profile state, server headers, viewport, and hardware constraints;
- use a local secure server or the required deployable environment rather than weakening security requirements;
- use `chrome-devtools-mcp` for Chrome browser validation and retain the page/session evidence;
- exercise every visible control with realistic input on desktop and mobile configurations;
- label mobile evidence as physical device, remotely controlled device, emulator, or desktop viewport emulation; viewport emulation proves responsive layout only and must not be reported as Android/mobile-platform API validation;
- inspect console and network before interaction and after each important state transition;
- retain screenshots, DOM/state evidence, request details, errors, and performance traces where relevant;
- validate feature-detection and fallback in an unsupported configuration or engine when feasible;
- run static/unit/WPT/conformance checks too, but never substitute them for visible browser behavior.

If the implementation is unavailable, first try the documented channel, flag, origin-trial, policy, or build path when safe and permitted. Otherwise mark the route `blocked`, preserve partial evidence, and do not convert a simulation or mocked output into a runtime pass.

## Build friction only from evidence

Keep source class and execution outcome separate:

- **Source class:** discovered during this run, attributable external report, or hypothesis/question.
- **Execution result for inventory tests:** pass, fail, or blocked.
- **Reproduction outcome for external reports:** reproduced, not reproduced, blocked, or not attempted.

Use these exact invariants:

- `inventory_total = pass + fail + blocked`;
- `inventory_tested = pass + fail`;
- `report_attempted = reproduced + not_reproduced`;
- `report_total = reproduced + not_reproduced + blocked + not_attempted`.

Observed friction is a failure encountered during this run. An external report becomes reproduced friction only when its reproduction outcome is `reproduced`; a completed attempt with `not_reproduced` remains an external report and does not become a pass claim about every environment. Hypotheses stay outside all execution denominators until converted into explicit test IDs.

Link every observed/reproduced item to the sample/task, expected source, environment, evidence, reproduction rate, severity, workaround, likely owner, and regression check. Re-run after correction. A planned test is not an executed test; a working happy path does not clear untested branches.

Use `modules/friction-log.md` for the complete record.

## Audit and prepare documentation

### MDN and browser compatibility data

1. Search the live MDN site, `mdn/content`, and `mdn/browser-compat-data`; record exact URLs, source paths, revisions, and retrieval date.
2. Derive the required page/BCD inventory from the current spec and IDL. Do not assume one overview page is sufficient.
3. If pages exist, compare names, syntax, values, exceptions, context/security requirements, examples, specification links, and browser support against current evidence.
4. If pages or BCD are absent, create a patch-ready local page set and BCD change using `modules/mdn-reference-authoring.md` and its templates.
5. If content is stale, create an exact patch rather than only a gap-analysis paragraph.
6. Run MDN formatting/build/preview and BCD schema/tests when the repositories and tooling are available. Run the examples against the actual browser implementation separately.
7. Preserve upstream issue/PR requirements and review boundaries. A local patch is `draft` or `review-ready`, never “published” or “approved.” Do not open a PR without authority.

### Chrome-owned enablement

Audit and, when missing, create patch-ready material for the relevant Chrome release notes, developer.chrome.com/web.dev reference or guide, compatibility/fallback guidance, enterprise notice, FAQ/troubleshooting, and demo index. Before calling a change patch-ready:

1. identify the canonical source repository and exact target path;
2. pin the base revision and record the retrieval date;
3. follow that repository's contribution, frontmatter, style, code-sample, and asset rules;
4. place files in the repository-native structure and produce an exact diff;
5. run its available formatter, build, link checker, and local preview;
6. test embedded examples separately against the actual browser implementation.

If the canonical source or build path cannot be established, label the output a provisional content draft rather than a patch. All public claims must trace back to the same feature packet.

### Sample reuse

Where MDN or Chrome docs need examples, use the tested Layer 1 samples as the source. Keep documentation snippets and standalone runnable files synchronized with stable sample IDs and regression checks.

## Required final report

Return:

1. feature stage, decision, evidence boundary, and exact runtime environment;
2. coverage manifest with exact covered/total/blocked counts;
3. created/updated standalone samples and integrated demos with paths;
4. browser execution matrix with `inventory_total`, `inventory_tested`, pass/fail/blocked counts, evidence paths, and physical/remote/emulated/viewport-only mobile labels;
5. observed/reproduced friction, external-report reproduction outcomes with `report_total`/`report_attempted`, and hypotheses in separate sections;
6. standards/incubation source graph, chronology, engine-position matrix, TAG and objection-resolution ledgers, exact cross-link denominator, and contradictions against launch claims;
7. implementation query manifest and lineage across Chromium Issues/Gerrit/source, WebKit Bugzilla/source/tests, Mozilla Bugzilla/source/tests, and WPT/status records;
8. MDN/BCD and Chrome-doc inventories with absent/current/stale status and patch paths;
9. completion-goal ledger, code/docs changes made, validations run, failures corrected, and re-run results;
10. residual product/review/support risks with owners or `owner required`;
11. the smallest remaining actions that require private evidence, formal decisions, publication authority, or unavailable environments.

Never report “demo planned,” “docs needed,” or “test recommended” as completion when the files could have been built and executed in the current environment.
