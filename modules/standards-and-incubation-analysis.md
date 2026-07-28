# Standards positions and incubation evidence graph

Use this module for any feature readiness, launch, interoperability, standards-position, or incubation assessment. A status field or issue label is an index, not the analysis. Read the full primary-source record and the substantive evidence it links.

This is evidence reconstruction, not standards authority. Only the relevant standards body, browser project, reviewer, or issue owner can state or change its formal position.

## Non-negotiable status semantics

- **No signal**, **no position**, **position requested**, **open request**, **no response**, and silence mean that no attributable final position has been recorded in the source examined. They do **not** mean neutral, supportive, opposed, low risk, or “no concerns.”
- A comment by an employee or contributor is not automatically the browser project's formal position.
- A positive or negative issue comment is not a final position unless the repository's documented process, label, resolution, or authorized maintainer identifies it as one.
- An open TAG review is not “passed,” and a closed review must be read for its actual resolution; closed does not automatically mean satisfied.
- ChromeStatus summaries and copied dashboard fields may be stale. Reconcile them against current primary sources and retain contradictions.
- Lack of a competing implementation is not evidence that independent implementation is easy or planned.

For every engine/reviewer, keep these fields separate:

1. request state;
2. current formal recorded position;
3. attributable individual comments;
4. unresolved questions/objections;
5. changes requested or suggested;
6. implementer activity or commitment;
7. last verified source, revision, and date;
8. uncertainty and contradictions.

## Build the source graph

Start from the feature's ChromeStatus/ChromestatusLite record and discover the canonical graph. Include every applicable family:

- initial proposal and incubation home;
- current explainer, specification, Web IDL, privacy/security questionnaire, use cases, examples, changelog, and reference implementation;
- repository issues, pull requests, discussions, releases, and design-significant commits;
- WICG or other community-group proposal and migration history;
- W3C TAG design review, all comments, linked follow-ups, review outcome, and review changes;
- Mozilla standards-position request, full thread, labels/state, linked standards issues, Bugzilla/Gecko work, prototypes, tests, and follow-ups;
- WebKit standards-position request, full thread, labels/state, linked WebKit bugs, standards discussions, prototypes, tests, and follow-ups;
- other implementer positions or implementation records when relevant;
- Blink intent threads, every substantive reply, linked evidence, API-owner questions, trial results, and later corrections;
- standards-body issues, pull requests, minutes, resolutions, and registry entries;
- WPT, implementation tests, BCD/Web Features/Baseline mappings, and interoperability dashboards;
- developer/partner evidence linked from any of the above.

Pin source revisions or retrieval timestamps. Prefer repository APIs/raw files over snippets or search-result summaries. Preserve issue/PR state, labels, authorship, comment chronology, edited/removed state when visible, and exact quoted passages needed for the conclusion.

## Freeze and reconcile the research universe

Before traversal, record a retrieval cutoff timestamp and a seed-universe manifest: feature records, canonical incubation repositories (including prior/migrated repositories), review/position requests, intent threads, standards repositories, implementation trackers, and test/documentation repositories. New material after the cutoff is a later delta, not silently mixed into this run.

For every repository or tracker that exposes listing APIs:

1. retrieve all pages, recording page size, page count, API-reported total when available, and request failures;
2. reconcile open and closed item counts against the frozen snapshot;
3. screen every closed item before deciding it is design-significant or unrelated—do not search only for familiar keywords;
4. preserve deleted, transferred, converted, locked, inaccessible, and migrated items as explicit states;
5. record any source family that cannot provide an enumerable denominator.

Use exact item arithmetic:

- `repo_item_total = analyzed_open + design_significant_closed + screened_out_closed + blocked_items`;
- `repo_item_reconciled = analyzed_open + design_significant_closed + screened_out_closed`.

A complete repository inventory requires `blocked_items = 0` and reconciliation with the API/listing total. Otherwise report the inventory as partial and state what the blocked items could change.

## Follow substantive cross-links to closure

Extract links deterministically from authored issue/PR bodies, comments, review text, repository documents, and cited evidence fields—not page navigation, account chrome, suggested content, or social controls. Record the source node/comment and anchor text for each discovered edge.

Canonicalize each node identity using the final repository/issue/PR/document identity: remove tracking parameters and fragments used only for navigation, preserve claim-relevant version/revision parameters, resolve known repository transfers, and keep comment anchors as edge provenance rather than duplicate document nodes. Maintain a visited-node set and edge set so cycles terminate and repeated links receive a `duplicate` edge disposition pointing to the canonical analyzed node.

For every source node, inventory outbound links. Follow a link when it supplies or challenges any of these:

- the problem/use case or developer evidence;
- API shape, algorithm, normative behavior, terminology, or scope;
- privacy, security, accessibility, performance, user control, enterprise, or abuse analysis;
- implementability, interoperability, compatibility, fallback, or testing;
- a reviewer question, objection, response, claimed resolution, or formal position;
- implementation, trial, telemetry, partner use, or production evidence;
- documentation, sample, demo, or support behavior used in a launch claim.

Process a recorded frontier queue until it is empty. If access, robots/authentication, deletion, tool limits, or an explicit run resource limit prevents retrieval, mark every remaining relevant frontier edge `blocked` with its source, attempted method, reason, and possible impact. Never stop silently or claim closure while a relevant frontier remains.

Continue through substantive cross-links until each edge reaches one of these explicit dispositions:

- `analyzed`: content retrieved and incorporated;
- `duplicate`: same evidence already represented by another canonical node;
- `out-of-scope`: irrelevant to the feature decision, with a reason;
- `blocked`: relevant but inaccessible/unavailable, with attempted method and impact.

Do not follow generic navigation, account pages, unrelated issue references, social share links, or broad background pages unless a claim depends on them. Do not silently omit a relevant link because it is inconvenient or disagrees with the launch narrative.

Use separate edge and unique-node arithmetic:

- `link_total = analyzed + duplicate + out_of_scope + blocked`;
- `relevant_link_total = analyzed + duplicate + blocked`;
- `relevant_link_complete = analyzed + duplicate`;
- `unique_relevant_node_total = analyzed_unique + blocked_unique`;
- `unique_relevant_node_complete = analyzed_unique`;
- `question_total = resolved + open + disputed + superseded`.

`duplicate` counts a successfully dispositioned relevant edge but not a new evidence node. A graph with relevant blocked edges/nodes or a non-empty frontier is not fully evidenced. Report every frontier and what conclusion each blocked edge/node could change.

## Reconstruct chronology and current state

Build a dated chronology rather than flattening years of discussion into one label:

1. proposal/request opened;
2. initial questions and positions;
3. author responses;
4. spec/explainer/implementation changes;
5. follow-up review and counterarguments;
6. current issue/PR state;
7. formal resolution, if any;
8. later regressions, reopened questions, or contradictory launch claims.

For every material question or objection, create a stable ledger row:

- ID and theme;
- who raised it, role/source, and date;
- exact concern and linked evidence;
- proposal-owner response;
- claimed resolution;
- landed spec/implementation/test/docs change and revision;
- reviewer confirmation, disagreement, or silence;
- current state: resolved, open, disputed, or superseded;
- launch/user/developer consequence;
- owner or `owner required`.

An author's answer is not proof that a reviewer accepted the answer. A merged change is not closure unless it addresses the recorded question and current evidence supports that disposition.

## Analyze the entire incubation surface

Using the frozen, paginated, reconciled repository inventory, analyze all open issues and pull requests plus every closed item classified as design-significant; retain the denominator and IDs of closed items screened out. For each analyzed item:

- classify it as normative design, editorial, implementation, testing, documentation, process, or unrelated;
- identify the current draft behavior and any proposed-but-unmerged behavior;
- record dependencies and competing proposals;
- compare explainer, spec, IDL, implementation, WPT, docs, and demos;
- mark mismatches, unresolved choices, and stale claims;
- distinguish shipped/implemented behavior from an open proposal or reference sketch.

Do not say “no anticipated spec changes” while material design PRs/issues remain open without explaining the contradiction. Do not infer that issue closure means implementation/tests/docs were updated; verify each layer.

## Engine-position analysis

For Mozilla, WebKit, and every other relevant engine, report:

| Field | Required evidence |
| --- | --- |
| Request | Canonical request URL, opener, date, state |
| Formal position | Exact documented label/resolution and its process meaning |
| Individual commentary | Attributable comments, separated from formal position |
| Principal reasons | Directly sourced themes, not remembered vendor stereotypes |
| Requested changes/questions | Exact asks and current disposition |
| Implementation evidence | Bugs, prototypes, code, tests, or explicit absence |
| Cross-links | Exact `link_total`/`relevant_link_total`/`relevant_link_complete` edge counts, unique relevant-node totals, duplicate/out-of-scope/blocked counts, and remaining frontier state |
| Current wording | Public-safe sentence that preserves uncertainty |

Safe examples:

- “Mozilla's position request remains open with no final recorded position; commenters raised X and Y.”
- “WebKit records an opposed position for reasons A and B; issue C remains open.”
- “No formal signal was found as of DATE.”

Unsafe examples:

- “Mozilla is neutral” when the request says no signal or remains open.
- “Safari support is likely” based on one favorable comment.
- “TAG approved” because the review closed without reading the resolution.
- “No interoperability risk” because no second implementation exists.

## Required outputs

1. frozen seed-universe/source-graph manifest with cutoff time, repository pagination/item reconciliation, stable canonical node/link IDs, revisions/dates, visited/frontier state, provenance, and exact edge/node dispositions;
2. dated incubation and review chronology;
3. engine-position matrix separating request, formal position, individual comments, objections, and implementation evidence;
4. TAG question/response/resolution ledger;
5. complete open/design-significant issue and PR inventory;
6. explainer/spec/IDL/implementation/test/docs/demo mismatch table;
7. objection-resolution ledger with exact `question_total` arithmetic;
8. contradictions against ChromeStatus, intent, release-note, docs, and launch claims;
9. safe, provisional, contradicted, and unsupported standards/interoperability claims;
10. blocked evidence and the decisions it could change.

A one-line standards-status table is navigation metadata only. It is never a substitute for this analysis when readiness or launch decisions depend on standards and interoperability.
