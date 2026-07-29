# Chrome DevRel Skill

A public-alpha agent skill for working on Chrome features from early problem discovery through release, adoption, support, and removal.

This is not a canonical Chrome process document. It cannot grant approval from DevRel, API Owners, standards groups, privacy, security, accessibility, legal, or engineering reviewers.

## Install

The repository exposes one agent skill, `chrome-devrel`. Install it with the Skills CLI:

```bash
npx skills add PaulKinlan/chrome-devrel-skill --skill chrome-devrel
```

Add `--global` to make it available outside the current project. The command has been checked against this repository with `--list`; client-specific activation still depends on the agent you choose during installation.

## What it does

Give the skill a feature, a link, and the decision you need to make. It will:

- identify the feature's lifecycle stage;
- separate sourced facts from hypotheses, recommendations, unknowns, and blockers;
- research developer need, alternatives, implementation status, interoperability, and user cost;
- find gaps in tests, documentation, demos, ownership, and launch materials;
- build and test public, reversible artifacts when the request calls for execution;
- preserve unresolved failures instead of replacing them with a cleaner plan;
- for launch execution, report exact contract coverage plus runtime total, tested, pass, fail, and blocked counts.

It can begin with evidence or with an artifact request. If you ask for a launch deck, for example, it checks the claims and missing evidence before drafting the deck.

## Start with one sentence

> Help me progress [feature or link]. I’m the [PM / engineer / DevRel / stakeholder]. The decision is [decision, or “work out the next decision”]. Start from [links, or “public evidence only”].

A few shorter versions:

- **PM:** `Assess [feature] for [next phase or release]. What decision comes next, and what evidence is missing?`
- **Engineer:** `Review [feature or API change]. What can break, what must be tested, and what should I change next?`
- **DevRel:** `Assess [feature] for developer enablement. Find the missing evidence, integration work, docs, demos, and support paths.`
- **Stakeholder:** `Challenge [feature] from a [user / privacy / security / standards / partner / enterprise] perspective.`
- **Continue existing work:** `Continue [feature] from [packet or link]. Show what changed, what remains unresolved, and the next three actions.`

The skill asks only for information it cannot responsibly find. Public research and reversible local work continue without waiting for permission at every step.

## What “manage the launch” means

Requests such as **manage the launch**, **build the launch assets**, **prepare to ship**, **validate this feature for release**, or **deliver developer enablement for a named launch** trigger execution unless you explicitly ask for a plan only.

The skill freezes a feature contract, then works through it:

1. Check current ChromeStatus, BCD, release, specification, implementation, standards, and documentation facts against their primary sources.
2. Search a bounded set of public source families for developer problems, workarounds, integration reports, alternatives, supportive evidence, and counterevidence.
3. Build missing feature detection, primitive, failure, integration, and realistic examples as independently runnable files.
4. Launch the intended Chrome build and exercise each unblocked contract with `chrome-devtools-mcp`.
5. Save screenshots, console output, network records, interactions, assertions, browser version, launch arguments, and artifact hashes.
6. Put every observed failure into the friction log. A failure closes only after the subject changes, the exact test passes on rerun, and adjacent regressions pass.
7. Run the online launch-acceptance validator. The validator, rather than the report's prose, computes whether the run succeeded.

If Chrome, MCP, a required flag, policy, platform, device, account, or network is unavailable, the affected runtime work is blocked. Source inspection, lint, mocks, authored JSON, or a screenshot claim cannot replace it.

See:

- [Launch execution](modules/launch-execution.md)
- [Executable launch acceptance](modules/launch-acceptance.md)
- [Completion loop](modules/completion-loop.md)
- [Developer-signal research](modules/developer-signals.md)
- [Standards and incubation analysis](modules/standards-and-incubation-analysis.md)
- [Implementation and issue research](modules/implementation-and-issue-tracker-research.md)

## Evidence rules

The skill follows a few strict rules because launch work becomes misleading when evidence types blur together.

- Missing evidence is **unknown**, not support or approval.
- `No signal`, an unanswered position request, and silence do not mean neutral.
- Code activity, issue counts, usage, stars, and downloads do not automatically prove developer demand.
- Partner interest is not a trial commitment; a trial commitment is not a ship commitment; shipment is not verified production use.
- Chrome adoption alone does not establish interoperability or a healthy web-platform outcome.
- Formal approval must be attributable to the person or group with that authority.
- Private evidence stays outside public artifacts unless its use has been explicitly approved.

The same distinctions apply across later updates. Feature packets retain stable evidence, risk, question, and asset IDs so that a new summary cannot silently drop old failures.

## Modes and lifecycle stages

The skill handles individual features, multi-feature initiatives, deprecations, adoption work, recurring support problems, events, and continuous portfolio work.

It maps each request to the relevant lifecycle stage:

`intake → incubation → prototype → developer trial → wide review → experiment → prepare to ship → release → adoption → support → removal`

Detailed phase guidance and transition packets live in [`phases/README.md`](phases/README.md). Ongoing feature work uses the [feature-development prompt guide](modules/feature-development-prompts.md).

## Example requests

### Test a feature before release

> Assess [feature] for release. Check current implementation, other-engine positions, developer need, docs and BCD, then build and run the missing samples. Return contract covered/total/blocked counts and runtime total/tested/pass/fail/blocked counts.

### Continue an existing feature packet

> Continue [feature] from [packet]. New evidence: [links or changes]. Preserve previous IDs and failures, show the delta first, then give the next decision and the smallest actions that could change it.

### Start from an artifact

> I need a launch presentation for [feature]. Verify its claims, identify missing evidence, and create the outline, slide content, speaker notes, demo plan, sources, and review checklist.

### Run a friction log

> Test [API, demo, or documentation URL] while completing [developer task]. Cover discovery, setup, first success, integration, mobile and desktop, failure and recovery, accessibility, performance, console, network, and cleanup. Fix what can be fixed and report exact remaining and blocked counts.

### Rehearse stakeholder reviews

> Challenge [feature] from accessibility, privacy, security, standards, engineering, enterprise, competition, and end-user perspectives. Source recorded positions, label inference, and map each concern to evidence, a design change, narrower scope, outreach, rollback, accepted risk, or a stop decision.

### Run a retrospective

> Build a fixed inventory for Chrome milestones [range]. Produce one sourced report per feature, retain partial and blocked cases, reconcile the denominator, and turn repeated failures into skill changes and regression tests.

More task-specific prompts are in [the feature-development guide](modules/feature-development-prompts.md) and the modules linked below.

## Repository map

| Path | Contents |
| --- | --- |
| [`SKILL.md`](SKILL.md) | Agent operating contract and routing rules |
| [`phases/`](phases/) | Lifecycle-specific questions and transition packets |
| [`modules/`](modules/) | Research, launch, friction, measurement, review, support, and retrospective methods |
| [`templates/`](templates/) | Owner maps, evidence records, measurements, launch acceptance, and publishing targets |
| [`schemas/`](schemas/) | Machine-readable contracts for launch and private-overlay artifacts |
| [`config/`](config/) | Request routing and authoritative semantic-fact source policy |
| [`evals/`](evals/) | Public evaluation cases, rubric, and recorded results |
| [`scripts/`](scripts/) | Validators, security checks, mutation tests, routing tests, and retrospective tools |
| [`research/`](research/) | Public lifecycle research, exemplars, case notes, and discovery questions |
| [`retrospectives/`](retrospectives/) | Reproducible retrospective method and pinned archive records |

## Public core and private overlays

The repository ships public process sources, templates, validators, and evals. Teams record local owners and authority sources in [`templates/owner-map.template.json`](templates/owner-map.template.json), baselines and targets in [`templates/metric-definition.template.json`](templates/metric-definition.template.json), and approved private inputs through the [private-overlay contract](modules/private-overlay-contract.md).

Private overlays are inputs, not a second public record. The output boundary must be explicit, and ambiguous material stops the run until a human decides whether it can be used.

## Validation

The main workflow runs the prospective-commit security audit before the other gates, followed by retrospective checks, launch-acceptance mutations, trusted-command and key-isolation tests, request routing, behavior contracts, public-core validation, eval structure, and MDN mutation guards.

Run individual checks with Node 22, for example:

```bash
node scripts/audit-security-surface.mjs --mode worktree
node scripts/launch-acceptance.test.mjs
node scripts/request-routing.test.mjs
node scripts/behavior-contracts.test.mjs
node scripts/validate-public-core.mjs
node evals/validate.mjs
```

The complete sequence is recorded in [`.github/workflows/security-and-core.yml`](.github/workflows/security-and-core.yml).

## Authority and publication

The skill may research public sources and create reversible local drafts, tests, demos, documentation, and evidence bundles. External pull requests, issues, publication, production changes, formal approval, and speaking on behalf of a team require separate authority.

Substantive criticism is welcome. The [community conduct policy](CODE_OF_CONDUCT.md) protects disagreement while prohibiting harassment, threats, and doxxing.
