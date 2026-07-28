# Implementation and issue-tracker research

Use this module for feature development, readiness, launch, interoperability, debugging, and documentation work. Standards documents describe intended behavior; issue trackers, code reviews, source, and tests reveal implementation history, platform differences, known failures, and unfinished work.

A dashboard link or one umbrella bug is a seed, not a complete implementation analysis. Load `modules/developer-signals.md` in parallel: implementation evidence answers what engines built or are changing; developer signals answer who experiences the job, what they do today, what it costs, what they reject, and whether this intervention addresses the need. Never collapse those evidence classes.

## Required source families

Search every applicable source family, not only those linked from ChromeStatus:

### Chromium

- Chromium issues: https://issues.chromium.org/issues?q=
- Chromium Gerrit: https://chromium-review.googlesource.com/q/status:open+-is:wip
- Chromium source/Gitiles and code search
- Blink intent threads, owners/component records, feature flags, enterprise policies, DevTools support, WPT expectations/imports, and test directories

Search open, fixed/verified, duplicate, wont-fix, obsolete, and inaccessible issues. Search Gerrit changes across open, merged, abandoned, and reverted states; an open-only query cannot reconstruct implementation history. Follow `Bug:`, `Fixed:`, topic, hashtag, owner/reviewer, dependency, patchset, related-change, and commit-position links.

### WebKit

- WebKit Bugzilla: https://bugs.webkit.org/
- Quick search: https://bugs.webkit.org/buglist.cgi?quicksearch=
- WebKit standards positions, GitHub source/PRs/commits, WebKit tests, release notes, and feature-status records

Search aliases, API/interface/member names, specification URLs, standards issue IDs, and known Chromium/WPT terminology. Follow duplicate/dependency graphs, patches, commits, test changes, and linked standards discussions.

### Mozilla/Gecko

- Mozilla Bugzilla: https://bugzilla.mozilla.org/buglist.cgi?quicksearch=
- Mozilla standards positions, Searchfox/source, code-review/commit history, web-platform-tests, release notes, platform-status records, and linked standards issues

Search aliases, Web IDL names, preferences/flags, component names, test names, specification URLs, and related implementation terminology. Follow dependencies, duplicates, reviews, commits, test changes, and position links.

### Shared and adjacent sources

- web-platform-tests history, metadata, failures, expectations, and interop dashboards;
- MDN BCD/Web Features/Baseline mappings and issue history;
- specification and incubator issue/PR references;
- framework/library/polyfill issues when the feature's integration depends on them;
- platform/OS issue trackers when browser behavior delegates to the operating system.

Issue/change searches must also extract attributable developer-need signals, requested use cases, integration failures, workarounds, rejection reasons, and production constraints into a separate developer-signal ledger. Then broaden beyond implementation trackers across the six public source families in `modules/developer-signals.md`: problem/workaround communities, frameworks/libraries/tooling, surveys/research/usage, browser/standards discussions, adjacent alternatives, and public product/support evidence. Search job/workaround language and counterevidence, not only feature names. Internal feedback may supplement this only when supplied under an approved evidence boundary.

## Build a query manifest

Before searching, derive a stable query vocabulary from primary sources:

- feature name and historical names;
- ChromeStatus/feature ID;
- interface, dictionary, enum, attribute, method, event, CSS property/value, HTML element/attribute, header, manifest field, policy, preference, and flag names;
- Web IDL identifiers and implementation class/file names;
- spec title/URL/section anchors and issue numbers;
- intent subject, umbrella bug, component, owner, CL topic/hashtag, WPT directory/test names;
- common abbreviations, spelling/hyphenation variants, old proposal names, and vendor-specific names.

Freeze a retrieval cutoff and canonicalize result/change IDs before pagination. If a mutable live tracker changes totals during retrieval, restart against a stable snapshot/cutoff when supported or mark reconciliation blocked with the observed drift.

For every tracker/source query record:

- stable query ID;
- source family and exact URL/API request;
- literal terms/filters and why they are relevant;
- retrieval cutoff, pagination, reported total, pages/items retrieved, and failures;
- raw result artifact path or checksum;
- relevant, duplicate, screened-out, and blocked counts;
- follow-up queries generated from newly discovered aliases, bugs, CLs, files, or tests.

Use non-overlapping exact arithmetic:

- `query_total = complete_queries + blocked_queries`;
- `reported_result_total = retrieved_result_refs + unretrieved_result_refs` when the source reports a stable total;
- `retrieved_result_refs = relevant_analyzed + duplicate + screened_out + detail_blocked`;
- `result_ref_total = relevant_analyzed + duplicate + screened_out + detail_blocked + unretrieved_result_refs`;
- `change_total = open + merged_active + merged_reverted + abandoned + blocked_changes` after canonical-ID deduplication.

`merged_active` and `merged_reverted` are mutually exclusive classifications of each merged Gerrit change. An original change later reverted is `merged_reverted`; the separate revert CL is its own canonical change and is classified by its own current outcome. Never count one change in both merged buckets. Reconcile `result_ref_total`/`change_total` with source-reported totals or exact query unions; record drift, inaccessible pages, and unretrieved references instead of silently shrinking the denominator.

A zero-result query is evidence only for that exact vocabulary, source, and cutoff. It is not proof that an implementation, bug, or concern does not exist.

## Follow implementation lineage

For each relevant issue/change/source node, record:

- canonical ID/URL, title, project/component, state/resolution, priority/severity, owner/author/reviewers, creation/update/landing/revert dates;
- platform/configuration and affected versions;
- linked umbrella/dependency/duplicate issues;
- linked CLs, commits, patchsets, tests, expectations, specs, standards positions, and documentation;
- behavior before/after, implementation approach, flags/prefs/policies, rollout state, and known limitations;
- whether the node is current, superseded, duplicated, reverted, stale, or unresolved;
- exact feature-contract IDs and developer/user consequences.

Reconstruct the chronology from prototype through implementation, trial, fixes, shipment, regressions, and follow-up. A merged CL does not prove the feature works; a closed bug does not prove tests/docs landed; a source symbol does not prove runtime availability.

## Cross-browser implementation matrix

For Chromium, WebKit, and Gecko, report separately:

| Field | Required evidence |
| --- | --- |
| Public position | Formal recorded state and full analysis link |
| Implementation tracker | Canonical bugs/issues and exact query denominator |
| Code/change evidence | Open/merged/abandoned/reverted changes and source revision |
| Runtime exposure | Default/flag/pref/trial/platform state by version |
| Test evidence | WPT/vendor tests, expectations, failures, and gaps |
| Known issues | Open/reproduced/fixed/reverted with affected configurations |
| Docs/status | BCD/status/release-note state and contradictions |
| Confidence | Supported/partial/unknown/contradicted plus blocked evidence |

Do not infer a browser's position from implementation activity, or implementation commitment from a standards position. Report them as separate evidence classes.

## Connect research to execution

Every implementation claim used in docs, demos, friction, or launch material must link to runtime evidence or remain provisional. Tracker research should change the test manifest:

- add cases for reported bugs and fixed regressions;
- select required Chrome channel/flags/policies/platforms;
- expose browser-specific fallback and incompatibility paths;
- identify test expectations and untested branches;
- identify documentation caveats and support diagnostics;
- distinguish an implementation defect from a specification ambiguity or sample error.

Use `modules/launch-execution.md` to run the resulting cases in Chrome and `modules/standards-and-incubation-analysis.md` to connect implementation evidence to formal positions and review questions.

## Required outputs

1. query vocabulary and exact query manifest across Chromium issues/Gerrit/source, WebKit Bugzilla/source/tests, Mozilla Bugzilla/source/tests, and shared WPT/status systems;
2. paginated raw-result inventory with exact complete/blocked and relevant/duplicate/screened-out counts;
3. issue/change/source/test lineage graph and dated implementation chronology;
4. cross-browser implementation matrix;
5. known-issue and regression ledger mapped to feature-contract test IDs;
6. contradictions among tracker state, source, runtime, tests, standards positions, docs, and launch claims;
7. separate developer-signal query/source ledger with exact supporting/contradicting/ambiguous and independence counts, saturation/limitations, and changes it caused to feature scope/tests/docs/examples/trials;
8. additional browser tests/demos/docs/support changes generated from implementation and developer evidence;
9. blocked queries/sources and the conclusions each could change.

Do not report “no known issues,” “not implemented,” or “unsupported” until the declared query/source inventory is reconciled or the claim is explicitly narrowed to the searched evidence.
