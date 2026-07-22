# Chrome feature launch retrospectives

This directory contains inventory-driven, evidence-backed retrospective runs. Reports remain public so skill changes can be traced to feature-level evidence rather than hidden summaries.

## Current run

`runs/2026-07-19-v140-v150/` covers Chrome milestones 140 through 150 inclusive.

The authoritative target set comes from:

- `https://chromestatus.com/api/v0/features?milestone=N`
- `https://chromestatus.com/api/v0/features/:id`

A **launch event** is one `(milestone, category, featureId)` record. A **feature report** groups all launch events for one ChromeStatus feature ID. This preserves Origin Trial, shipping, deprecation, removal, and other category events without duplicating the full retrospective.

## Build or resume inventory

```sh
node scripts/build-retrospective-inventory.mjs \
  --milestones 140-150 \
  --run 2026-07-19-v140-v150
```

The collector caches every response, retries with backoff, writes atomically, uses bounded concurrency, and resumes from cached evidence. `--refresh` deliberately refetches source records.

Before feature research, collect first-party Chrome usage telemetry:

```sh
node scripts/collect-retrospective-metrics.mjs
node scripts/validate-retrospective-metrics.mjs
```

The collector snapshots ChromeStatus's legacy HTML/JS, WebDX/WebFeature, CSS, and origin-trial counter mappings and full public timelines. It also pins the current `web-platform-dx/web-features-mappings` commit, stores content hashes, and writes one evidence record per feature—even when no public counter can be mapped. Mapping states distinguish exact counters, broader WebDX/property families, origin-trial counters, multiple counters, and unmapped features. The values are the share of measured Chrome HTTP/HTTPS page loads on which a counter fired, not unique developers, sites, users, successful tasks, satisfaction, or end-user benefit.

Feature research runs on GLM 5.2 with Z.AI's Coding Plan **Web Search Prime** and **Web Reader** MCP servers—the search/retrieval tools attached to the GLM plan. It does not use pi-web-access `web_search`. The worker reads both cached ChromeStatus and metrics evidence first. It prefers an explicit `ZAI_API_KEY`, then falls back to the current user's Pi agent directory (`$PI_CODING_AGENT_DIR` or `$HOME/.pi/agent`). It generates an endpoint-only MCP config inside the ignored run workspace. Teams can override discovery with `PI_AGENT_DIR`, `MCP_ADAPTER`, or `MCP_CONFIG`; no developer-specific absolute path is encoded. Keys never enter prompts, arguments, logs, reports, or the repository. Each feature remains an isolated resumable job, so MCP/provider failure produces a retryable or blocked feature rather than halting the run.

## Required outputs

- `run.json` — fixed denominator, counts and manifest checksums
- `manifest.events.jsonl` — every launch event
- `manifest.features.jsonl` — every unique feature/report target
- `evidence/chromestatus/` — cached authoritative launch records
- `evidence/metrics/source/` — checksummed first-party metric snapshots and pinned mapping source
- `evidence/metrics/timelines/` — cached public counter histories
- `evidence/metrics/features/<featureId>.json` — mapping scope, limitations and launch-relative usage evidence for every feature
- `evidence/metrics/manifest.json` — exact mapped/unmapped denominator and content hashes
- `reports/<featureId>.json` — one schema-valid report per feature
- later evidence/search logs under each feature's evidence directory

A run is not complete until every feature report is `complete`, `partial`, or `blocked`; `pending`/missing reports prevent completion. Partial/blocked features remain in the denominator and prevent unsupported aggregate conclusions.

## Outcome policy

Success is multidimensional. Usage alone does not prove user value; positive press does not prove adoption; negative press does not prove product failure; Chrome shipment does not prove interoperability; missing evidence is not success.

See [`report.schema.json`](report.schema.json) and [`../modules/launch-retrospective.md`](../modules/launch-retrospective.md).
