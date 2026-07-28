# Developer-signal research

Use this module alongside implementation/issue-tracker research for feature, capability, initiative, readiness, trial, launch, adoption, and prioritization work. Implementation activity, formal standards positions, runtime support, usage telemetry, and developer need are separate evidence classes. Do not infer demand from code landing or infer implementation commitment from developer requests.

The goal is to find as much relevant public evidence as the bounded source frontier permits—including counterevidence—not to accumulate favorable mentions.

## Freeze the decision and frontier

Record:

- feature/capability/initiative, aliases, developer jobs, segments, and proposed outcomes;
- decision the signals can change: shape, scope, priority, trial, launch guidance, adoption work, redesign, park, or stop;
- public-only, approved-internal, or mixed evidence boundary;
- retrieval cutoff, languages/regions, time/tool budget, and saturation stopping rule;
- supportive and falsifying questions;
- canonical signal IDs, query IDs, source-family IDs, and independence groups.

Search problem/job/workaround language as well as the proposed API name. A developer can have a strong need without knowing the feature's name.

## Required public source families

Declare every family as applicable, not applicable with evidence, or blocked:

1. **Problem/workaround communities:** technical Q&A, public forums, support threads, public social/community discussions, conference Q&A, and issue reports describing the job or pain.
2. **Framework/library/tooling:** GitHub/GitLab issues and discussions, RFCs, roadmaps, maintainers, package ecosystems, polyfills, extensions, build/server/deployment tools, and workaround implementations.
3. **Surveys/research/usage:** WebDX/developer-needs research, State of CSS/JS or comparable surveys, HTTP Archive/Web Features/usage telemetry, published user research, and method/denominator documentation.
4. **Browser/standards/issues:** Chromium, WebKit, Mozilla, WICG/WHATWG/W3C/TAG issues and comments that contain attributable developer need, objections, integration experience, or requested use cases. Keep formal positions separate.
5. **Adjacent platforms/alternatives:** native OS APIs, mini-app/super-app platforms, server products, other browser capabilities, libraries, and non-browser approaches solving the same job.
6. **Public product/support evidence:** public engineering posts, migration reports, support portals, product feedback, case studies, bug reports, and documented production workarounds.
7. **Approved internal evidence, when supplied:** research, support tickets, partner feedback, trial notes, telemetry, or field reports under the explicit private/publicability boundary. Internal evidence never silently enters a public artifact.

At least four applicable public families must be completed for a successful broad launch assessment. Search all six unless a family is demonstrably irrelevant. A blocked applicable family remains visible and prevents a claim of exhaustive/reconciled research.

## Query systematically

Build queries across:

- capability aliases, IDL/primitive names, historical names, and spec terms;
- developer job, failure, complaint, workaround, manual process, missing capability, migration, cost, and rejection language;
- framework, library, server, enterprise, mobile, accessibility, privacy/security, performance, region, and non-English variants;
- supportive, skeptical, alternatives-sufficient, wrong-layer, and “why not” language;
- recent and historical windows, including pre-proposal evidence.

For every query record its literal terms, supportive/falsifying/neutral intent, URL/API request, source family, cutoff, pages/results retrieved, relevant, duplicate, screened-out, and blocked counts. Retain a parent-captured machine-readable result artifact listing every canonical result URL and disposition. `relevant` must equal the signal-ledger items linked to that query; six asserted zero-result searches without captured results are not complete. Use:

- `query_total = complete_queries + blocked_queries`;
- `retrieved = relevant + duplicate + screened_out + blocked`.

Follow newly discovered aliases, workarounds, repositories, products, communities, issues, and citations until the declared stopping rule or saturation. A zero-result query applies only to that exact source/vocabulary/cutoff.

## Signal ledger

For every included signal record, retain a source/evidence artifact and record:

- stable signal and query IDs;
- canonical URL, publication/update/retrieval dates, source family, and independence group;
- developer job, segment/context, stated need, last observed task when available, workaround, frequency/cost/urgency evidence, and desired outcome;
- direction: supporting, contradicting, or ambiguous;
- directness: direct observation, self-report, behavior/usage, workaround implementation, attributable commitment, or opinion;
- sample/denominator/method and representativeness where available;
- relevance to this exact intervention rather than the broad category;
- incentives/conflicts, selection bias, limitations, confidence, attribution permission, and publicability;
- implication for API shape, tests, docs/examples, trial, support, phase decision, or stop/redesign condition.

Canonicalize URLs and underlying claims. Syndicated articles, copied issues, multiple comments from one organization, and sources citing one original are one independence group, not independent demand. Do not convert stars, likes, issue counts, search volume, downloads, or Chrome usage into unique developer demand without a valid denominator and interpretation.

## Evidence ladder

Keep stages concrete and attributable:

1. observed public need;
2. candidate user/organization;
3. stated interest;
4. active evaluation;
5. trial commitment;
6. ship commitment;
7. verified production use and outcome.

Never promote a signal because its wording sounds enthusiastic. Public evidence of a workaround supports the job's existence, not necessarily the proposed API. An internal or public comment from an individual does not automatically represent their organization.

## Counterevidence and alternatives

Search explicitly for:

- rare/low-cost need;
- existing browser/library/server/native solution;
- framework maintainers who do not want the integration burden;
- other-engine implementation or architectural objections;
- privacy, security, accessibility, performance, low-end-device, enterprise, support, and user-control costs;
- proposal-specific rejection despite agreement on the broad job;
- failed trials, removals, low adoption, migration away, and better smaller interventions.

A successful research run includes a counterevidence statement even when none was found, naming the exact queries/source families searched and limitations. “No criticism found” without a reconciled search frontier is not evidence.

## Connect signals to implementation and enablement

Developer signals must change work:

- add contract/test IDs for reported tasks and failure modes;
- prioritize comprehensive copy-paste examples around common jobs and workarounds;
- add framework/server/deployment integrations actually requested;
- add troubleshooting for repeated support friction;
- challenge or narrow API shape when needs point elsewhere;
- define trial cohorts and learning thresholds;
- preserve unsupported segments and counterevidence in launch claims.

The required output is the machine-readable `developerSignals` section of the launch acceptance bundle plus a readable synthesis. Report exact source-family, query, signal-direction, independence-group, and blocked counts. Complete at least one explicit falsification query. If no contradictory signal is found, say so exactly and retain the falsification results and limitations; `counterevidence: none` is not a finding. Report saturation and what additional internal evidence could change the conclusion.
