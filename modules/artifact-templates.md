# Artifact templates and publishing targets

Each artifact template defines the required metadata, structure, and publishing
target. Templates are public-core — teams fill in the content.

## Universal artifact metadata

Every artifact must carry:

```yaml
artifactType: "_from list below_"
featureOrInitiative: "_ChromeStatus ID or initiative name_"
lifecycleStage: "_intake | incubation | prototype | ..._"
audience: "_internal | developers | partners | press | public_"
owner: "_role/name_"
status: "draft | review | published | stale"
created: "_ISO date_"
updated: "_ISO date_"
sources: ["_public source URLs_"]
unresolvedAssumptions: ["_explicitly listed_"]
reviewRequirements: ["_who must review before publication_"]
```

## Artifact types and templates

### Problem/use-case brief

```markdown
## Problem

_What developer pain does this address? Who experiences it? How often?_

## Use cases

_3-5 concrete, realistic scenarios. Not API descriptions._

## Alternatives considered

_What exists today? Why is it insufficient?_

## Non-goals

_What this does NOT attempt to solve._

## Evidence

_Links to research, issues, interviews. Label as
fact/signal/hypothesis/unknown._
```

**Publishing target:** Internal first; public explainer venue when ready.

### Developer research/survey plan

```markdown
## Research question

_What specific decision does this research support?_

## Population and sampling

_Who, how many, how recruited, selection bias risks._

## Questions

_Exact wording. Include falsification questions._

## Analysis method

_How will responses be interpreted? What would contradict the hypothesis?_

## Limitations

_What this research cannot answer._
```

**Publishing target:** Internal; methods summary public when evidence is cited.

### Ecosystem/framework compatibility matrix

```markdown
## Matrix

| Framework/library | Status | Evidence | Blockers |
| ----------------- | ------ | -------- | -------- |

## Integration notes

_Per-framework setup requirements, known issues, fallback paths._
```

**Publishing target:** Public docs / ChromeStatus.

### Partner trial brief

```markdown
## Partner

_Name (with consent) and evidence stage._

## What they will test

_Specific integration scenario._

## Success criteria

_What evidence would demonstrate production viability?_

## Timeline and support

_Duration, feedback cadence, support route._
```

**Publishing target:** Internal; public case study only with consent.

### Demo and sample plan

```markdown
## Demo

_What it shows, what audience, what platform._

## Samples

_Code repositories, documented setup, tested environments._

## Limitations

_What the demo does NOT prove._
```

**Publishing target:** Public (GitHub, web.dev, Chrome for Developers).

### Documentation gap analysis

```markdown
## Required docs

| Doc type | Status | Owner | Gap |
| -------- | ------ | ----- | --- |

## Known issues

_Docs that exist but are inaccurate, incomplete, or misleading._
```

**Publishing target:** Internal; public tracking issue.

### Launch brief

```markdown
## Feature summary

_One paragraph, public-safe._

## Key messages

_3-5 messages, each with evidence citation._

## Known limitations

_What to disclose publicly._

## Rollout plan

_Channels, timing, fallback/rollback._

## Measurement plan

_Link to measurement-framework entry._
```

**Publishing target:** Internal; public blog/docs when published.

### Speaker deck / presentation

```markdown
## Audience

_Developers, partners, internal, press?_

## Narrative arc

_Problem → solution → evidence → integration → adoption._

## Speaker notes

_Context, caveats, Q&A prep._

## Assets

_Demos, screenshots, code samples (all public-safe)._
```

**Publishing target:** Public (shared slides repo).

### Adoption and measurement plan

```markdown
## Adoption bottleneck

_What prevents adoption? (Not "lack of awareness" without evidence.)_

## Tactics

_Distribution mechanisms targeting the actual bottleneck._

## Metrics

_Link to measurement-framework entries._
```

**Publishing target:** Internal; public adoption guide when ready.

### Support/troubleshooting pack

```markdown
## Known issues

_Symptom, cause, workaround, fix status._

## FAQ

_Real questions from developers, not invented._

## Issue routing

_Where developers report problems. Who triages._
```

**Publishing target:** Public docs.
