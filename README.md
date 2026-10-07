# Chrome DevRel Skill

A public-alpha agent skill for working on Chrome features from early problem discovery through release, adoption, support, and removal.

This is not a canonical Chrome process document. It cannot grant approval from DevRel, API Owners, standards groups, privacy, security, accessibility, legal, or engineering reviewers.

## Quickstart

1. **Install.**

   ```bash
   npx skills add PaulKinlan/chrome-devrel-skill --skill chrome-devrel
   ```

   Working from a clone instead? One command mounts the live checkout into every local agent:

   ```bash
   node scripts/install-skill.mjs
   ```

2. **Check it** (clone installs): `node scripts/install-skill.mjs --doctor` confirms each mount's `SKILL.md` parses and its helper scripts really run from there.
3. **Ask.** Start a new agent session, because agents read skills at startup, and paste the sentence under [Start with one sentence](#start-with-one-sentence).

Node.js 20 or newer is needed only for the bundled helper scripts, the installer, and validation. Reading the skill needs nothing.

## Install

The repository exposes one agent skill, `chrome-devrel`.

### With the Skills CLI

```bash
npx skills add PaulKinlan/chrome-devrel-skill --skill chrome-devrel
```

Add `--global` to make it available outside the current project. The command has been checked against this repository with `--list`; client-specific activation still depends on the agent you choose during installation.

### From a local checkout

```bash
node scripts/install-skill.mjs            # symlink this checkout into every agent below
node scripts/install-skill.mjs --doctor   # verify each mount
```

The default targets are Antigravity / Jetski (`~/.gemini/config/skills/chrome-devrel`), the universal `~/.agents/skills/chrome-devrel`, Claude Code (`~/.claude/skills/chrome-devrel`), and Pi (`~/.pi/agent/skills/chrome-devrel`). Because the mounts are symlinks, edits to the checkout reach your agents in their next session.

| Option | Effect |
| --- | --- |
| `--target claude,pi` | Install into a subset of `antigravity`, `agents`, `claude`, `pi` |
| `--copy` | Copy the distributable files for an isolated snapshot instead of symlinking |
| `--status` | Show what is installed where |
| `--doctor` | `--status` plus a smoke test through each mount: `SKILL.md` must parse and the helpers must run. Exits 1 if anything is broken |
| `--uninstall` | Remove the mounts |
| `--force` | Replace a target even when it is not a `chrome-devrel` install |
| `--json` | Machine-readable output |

The installer checks every target before it changes any of them. An existing symlink is always safe to replace. A real directory is replaced only when its `SKILL.md` is named `chrome-devrel`; otherwise the whole run stops and leaves everything untouched.

### If something is off

- **The agent does not seem to know the skill.** Start a new session, then run `--doctor`. A `✗` names the mount and the reason.
- **"Refusing to replace paths that are not a chrome-devrel install".** Something else already lives at that path. Look at it, then either re-run with `--force` or choose other agents with `--target`.

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

## CLI Workflow Tools

In addition to conversational prompts, the repository includes zero-dependency CLI helpers for managing persistent feature state across Phases 0–10 and scaffolding/attesting Phase 6 launch bundles:

### 1. Day-to-day feature packets (`scripts/packet.mjs`)

Maintain a persistent `packet.json` and rendered `PACKET.md` for a feature across sessions, enforcing append-only ID continuity (`E*`, `R*`, `F*`, `Q*`, `A*`) and checking phase-gate readiness against [`schemas/feature-packet.schema.json`](schemas/feature-packet.schema.json):

```bash
# Initialize a packet (pass --online to seed from ChromeStatus API)
node scripts/packet.mjs init --dir ./packets/my-feature --id 5175745573945344 --stage 01-incubation --online

# Update readiness, risks, evidence, or friction (rejects dropped IDs)
node scripts/packet.mjs update --dir ./packets/my-feature --patch ./update.json --summary "Added trial results"

# Check phase-gate readiness before advancing (exits 1 when it recommends remain-in-phase)
node scripts/packet.mjs check --dir ./packets/my-feature --to-phase 06-prepare-to-ship
```

A patch is a JSON object using any of these top-level keys. Any other key is rejected with `PATCH_UNKNOWN_KEY`, so a typo such as `"risk"` cannot report success while recording nothing.

| Key | How it is applied |
| --- | --- |
| `feature`, `jobs` | Fields are merged over the existing ones. An array field is replaced, not appended. |
| `readiness` | Per dimension; the fields you give are merged into that dimension. |
| `evidence`, `risks`, `friction`, `questions`, `assets` | Items are matched by `id`. A new `id` is appended and an existing `id` is merged. An ID can never be deleted (`ID_CONTINUITY_VIOLATION`); change its `status` instead. `--strict` additionally requires every existing ID in a collection you touch to be present. |

```json
{
  "risks": [
    { "id": "R1", "summary": "No response yet from other engines", "severity": "medium", "status": "open", "owner": "feature-owner" }
  ],
  "questions": [
    { "id": "Q1", "question": "Does the trial need an enterprise policy?", "status": "open", "owner": "feature-owner" }
  ]
}
```

Field names and allowed values are defined in [`schemas/feature-packet.schema.json`](schemas/feature-packet.schema.json). A patch the schema rejects leaves `packet.json` unchanged. Expected failures print a single `packet: ...` line with no stack trace and exit 1; usage mistakes such as a missing `--dir` exit 2.

### 2. Phase 6 launch bundle scaffolder (`scripts/prepare-launch-bundle.mjs`)

Scaffold a Phase 6 launch-acceptance run directory (importing metadata from a `packet.json` if present), execute [`scripts/validate-documentation-example.mjs`](scripts/validate-documentation-example.mjs) under [`scripts/run-with-receipt.mjs`](scripts/run-with-receipt.mjs), refresh artifact SHA-256 hashes after edits, and run parent-verifier attestation:

```bash
# Scaffold run directory, 4-layer examples, 11-section guide, and command receipts
node scripts/prepare-launch-bundle.mjs init --root ./runs/my-feature --packet ./packets/my-feature/packet.json --contracts C1,C2,C3 --surface-token MyFeatureAPI

# Re-run documentation receipt and refresh artifact hashes after editing samples/docs
node scripts/prepare-launch-bundle.mjs refresh --root ./runs/my-feature

# Attest and validate the bundle (writes acceptance-run.json; on failure it exits 1 and prints the first errors)
node scripts/prepare-launch-bundle.mjs attest --root ./runs/my-feature --late-key
```

### 3. Request router (`scripts/route-request.mjs`)

Inspect which execution mode (`execute`, `plan`, `analyze`, `research`, `diagnose`) and modules a prompt routes to (pass `--merge` to combine modules across multi-intent prompts):

```bash
node scripts/route-request.mjs --merge "Prepare Feature X to ship and draft MDN reference pages"
```

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
| [`templates/`](templates/) | Feature packet, owner maps, evidence records, measurements, launch acceptance, and publishing targets |
| [`schemas/`](schemas/) | Machine-readable contracts for feature packets, launch acceptance, and private-overlay artifacts |
| [`config/`](config/) | Request routing and authoritative semantic-fact source policy |
| [`evals/`](evals/) | Public evaluation cases, rubric, and recorded results |
| [`scripts/`](scripts/) | Skill installer, feature packet CLI, launch bundle scaffolder, validators, security checks, and mutation tests |
| [`research/`](research/) | Public lifecycle research, exemplars, case notes, and discovery questions |
| [`retrospectives/`](retrospectives/) | Reproducible retrospective method and pinned archive records |

## Public core and private overlays

The repository ships public process sources, templates, validators, and evals. Teams record local owners and authority sources in [`templates/owner-map.template.json`](templates/owner-map.template.json), baselines and targets in [`templates/metric-definition.template.json`](templates/metric-definition.template.json), and approved private inputs through the [private-overlay contract](modules/private-overlay-contract.md).

Private overlays are inputs, not a second public record. The output boundary must be explicit, and ambiguous material stops the run until a human decides whether it can be used.

## Validation

```bash
node scripts/test-all.mjs
```

runs every validation gate in the order CI does: the security-surface audit first (if it fails, nothing else runs), then retrospective checks, launch-acceptance mutations, trusted-command and key-isolation tests, request routing, behavior contracts, public-core validation (including the `SKILL.md` frontmatter), eval structure, MDN mutation guards, and the installer, entry-point, feature-packet, and launch-bundle tests. It prints one line per gate and exits non-zero if any gate fails.

| Flag | Effect |
| --- | --- |
| `--bail` | Stop at the first failing gate |
| `--only <text>` | Run only gates whose name or script contains `<text>`, for example `--only packet` |
| `--verbose` | Show the output of passing gates too |
| `--list` | Print the gates and exit |

CI runs this same command ([`.github/workflows/security-and-core.yml`](.github/workflows/security-and-core.yml)), so [`scripts/test-all.mjs`](scripts/test-all.mjs) is the single list of gates; a `scripts/*.test.mjs` file that is not registered there fails the run. CI uses the Node version in [`.nvmrc`](.nvmrc). Locally the security audit reads your working tree, untracked files included; in CI it reads the Git index, which is what would be committed.

## Authority and publication

The skill may research public sources and create reversible local drafts, tests, demos, documentation, and evidence bundles. External pull requests, issues, publication, production changes, formal approval, and speaking on behalf of a team require separate authority.

Substantive criticism is welcome. The [community conduct policy](CODE_OF_CONDUCT.md) protects disagreement while prohibiting harassment, threats, and doxxing.

