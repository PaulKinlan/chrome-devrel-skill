# Evidence-based launch retrospective

Use this module to review historical or recent Chrome feature launches, deprecations, removals, trials, and interventions—and to improve the skill from the complete evidence set.

## Non-negotiable structure

- Establish an authoritative fixed inventory before analysis.
- Keep every target in the denominator. Failed/blocked research is not removed.
- Store one versioned report per unique ChromeStatus feature and retain all launch events/categories/milestones for that feature.
- Preserve raw/source evidence or a durable source record with URL, dates, provenance, limitations, and content hash where allowed.
- Never overwrite historical results; append new evidence and revisions.
- Do not call a launch successful or failed from press sentiment alone.
- Missing usage, adoption, partner, interoperability, or user-impact evidence remains unknown.

## Evidence families

For each feature collect, where relevant:

1. ChromeStatus full record and launch events
2. Explainer/spec/design documents and revision history
3. Intent, TAG, Mozilla/WebKit and other standards/review threads
4. Implementation, tests, bugs, regressions and platform support
5. Docs, samples, demos, release communications and claims
6. Usage data (for example Chrome use counters where linked), Web Platform Dashboard/web-features/HTTP Archive/BigQuery or other defensible sources
7. Framework/library/tool integration and package/code evidence
8. Developer/customer/partner trials, production use and case studies
9. Support issues, migration/friction and known failures
10. Critical and positive ecosystem/press/community coverage with source-selection limits
11. User impact, accessibility, privacy, security, resource and competition evidence

Distinguish independent evidence from sources that repeat one underlying announcement.

## Review

Replay each lifecycle phase using the detailed phase modules. Ask what was knowable by the relevant date, what evidence/artifacts existed, what remained unknown, and whether the next transition packet would have been supported.

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

Use `success`, `mixed`, `failure`, or `unscored` with cited evidence and limitations per dimension. Overall status must not hide mixed dimensions.

## Counterfactual and learning

For each feature record:

- What went well and should become reusable practice?
- What failed or surprised the team?
- Which phase question, evidence, artifact, review rehearsal, friction test, stakeholder critique, or monitoring alert could have helped?
- Was the issue product design, implementation, process, evidence, communication, adoption, support, or unavoidable disagreement?
- What concrete skill rule, phase packet, prompt, artifact, or eval should change?

Do not claim a communications fix would have repaired a product/design failure. Do not use hindsight-only information as if it was available at launch.

## Robust execution

- Use resumable manifests, atomic writes, bounded concurrency, retries/backoff, and cached source evidence.
- Split research into deterministic per-feature jobs with explicit status: pending, active, complete, partial, blocked, failed-retryable.
- Keep search queries and attempted sources so a failed provider can resume or be replaced.
- Prefer direct primary URLs from ChromeStatus and known source APIs before general web search. Use the browser for `chromestatus.com`, or the server-rendered `https://chromestatuslite.com/feature/{featureId}` route when automated readers need stable HTML.
- Prefer the search/reader tools attached to the active research model/plan when available. The current GLM worker uses Z.AI Web Search Prime + Web Reader MCP directly rather than pi-web-access; provider failure must affect only one feature job, not the run.
- Validate every report against the schema before counting it complete.
- Publish exact feature/report/event totals and completion states.

## Recurrence

Run incrementally per new milestone and periodically refresh post-launch outcome evidence. New evidence creates a dated revision rather than erasing the original conclusion. Feed recurring lessons into phase modules and add regression evals that include both strong and weak cases.
