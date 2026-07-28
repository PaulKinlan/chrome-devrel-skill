# Executable launch acceptance and correctness hill-climb

Use this module for every concrete launch/readiness run. Policy prose, a model-written report, a command transcript, or a judge score is not execution evidence. Completion is determined by the committed validator over a machine-readable run bundle.

## Required bundle

Create one run directory containing:

- `launch-acceptance.json`, based on `templates/launch-acceptance.template.json` and `schemas/launch-acceptance.schema.json`;
- every cited screenshot, console/network capture, assertion result, source snapshot, patch, example, diff, command stdout/stderr, and MCP event log;
- a parent HMAC attestation over the complete manifest. Generate an ephemeral key outside the worker context, expose it only to the parent signer/validator as `CHROME_DEVREL_ATTESTATION_KEY`, and never write or log the key;
- `acceptance-run.json`, generated—not authored—after parent attestation by:

```sh
# Start the signer with NO key. It replays receipts, then creates the socket:
env -u CHROME_DEVREL_ATTESTATION_KEY \
  node scripts/sign-launch-acceptance.mjs \
  --manifest <run>/launch-acceptance.json \
  --root <run> \
  --key-socket <run>/.attestation-key.sock \
  --key-id <non-secret-parent-key-id> \
  --online
# Only after it prints REPLAY_COMPLETE_KEY_SOCKET, use a separate parent process:
node scripts/send-launch-attestation-key.mjs \
  --socket <run>/.attestation-key.sock
node scripts/validate-launch-acceptance.mjs \
  --manifest <run>/launch-acceptance.json \
  --root <run> \
  --online \
  --output <run>/acceptance-run.json
```

Generate command receipts with `node scripts/run-with-receipt.mjs --root <run> --id <id> --subject <validated-artifact-id>=<path-relative-to-run> -- <command> [args...]`; repeat `--subject` for a suite. The wrapper binds before/after subject hashes. The parent signer replays every exact argv/cwd before issuing the HMAC; do not type successful command results into the manifest by hand.

The writer/leaf and receipt commands must not receive the attestation key or any parent secret. Before replay, the signer validates the complete JSON Schema and rejects every receipt command except the exact trusted validator realpath/argument grammar; replay receives a minimal `PATH`/locale-only environment. The signer refuses to start if the key exists, creates a mode-0600 Unix socket only after every trusted validator child exits, then receives the key from a separate parent sender and spawns no further command. Do not start the sender before the signer reports `REPLAY_COMPLETE_KEY_SOCKET`. A changed manifest, forged producer label, or key mismatch fails validation. `--online` is mandatory for a successful current-launch result. The online launch-acceptance validator is the completion boundary. A network, source, Chrome, MCP, platform, or account failure is blocked evidence, never a pass. The worker's `declaredOutcome` is not trusted; the validator computes the result and exits nonzero on any failed gate.

## Freeze before changing assets

Freeze these stable inventories before the first correction:

1. feature-contract IDs and blocked IDs in a parent-generated contract-manifest artifact, bound to retained spec/IDL/explainer snapshots;
2. documentation/example layers and the contract IDs each must cover;
3. browser tests, routes, environments, controls, expected assertions, and adjacent regressions;
4. typed semantic claims and primary-source selectors;
5. developer-signal source families/query frontier and stopping rule;
6. current friction frontier and goals.

New evidence may add IDs but cannot silently delete, merge, rename, or remove failed IDs. Record an explicit supersession edge when the underlying contract genuinely changes.

## Typed facts, not plausible values

Do not infer one version/date field from another. Keep these meanings distinct:

- target launch milestone;
- actual Chrome build/browser major tested;
- current stable milestone at the retrieval cutoff;
- BCD's recorded `version_added` value;
- first implementation/flag/trial version;
- scheduled stable date;
- actual stable release date.

For every BCD version and release/milestone date in a generated JSON asset, register:

- claim ID and typed meaning;
- asset path plus exact JSON Pointer;
- claimed value;
- fresh primary-source snapshot artifact and exact JSON Pointer;
- live HTTPS source URL, retrieval timestamp, and a `git:<40-hex>` revision or `sha256:<64-hex>` source-snapshot revision.

The validator accepts only the authoritative claim-type/hostname/path adapters in `config/semantic-fact-sources.json`; arbitrary HTTPS/data URLs cannot attest facts. It compares the asset, retained snapshot, and freshly fetched primary source. A valid BCD schema or `npm test` does not prove factual correctness. A retrieval date is not a release date. A browser used for validation is not automatically the first supporting browser. Contradictory sources prevent success until explicitly reconciled.

## Saved browser evidence, not screenshot claims

A passed browser test requires a parent-controlled Chrome session using `chrome-devtools-mcp`, exact `Browser.getVersion` evidence, a fresh profile ID, flags/policies/channel/OS, visible interactions, typed assertion receipts, and before/after console and network captures. The MCP event log must bind the session/browser version and record navigation, interaction, console, network, and screenshot calls for each test. Every test must retain at least one screenshot.

Each screenshot must:

- exist under the run root with no traversal or symlink;
- be a decodable PNG of at least 320×200 and 1,024 bytes;
- match its recorded byte length and SHA-256;
- have a capture timestamp inside the run interval;
- bind to the same run, browser session, route/test ID, and MCP-controlled capture.

A path in Markdown, an attachment not saved to disk, a static page screenshot, a renamed text file, stale bytes, or an image from another run/session is not evidence. Screenshots supplement DOM/runtime assertions; they do not replace them.

## Comprehensive, copy-paste-ready documentation examples

“Comprehensive examples” means exact coverage of the declared developer-facing contract, not a single happy-path snippet. Preserve all four independently runnable layers:

1. feature detection, setup requirements, unsupported state, and fallback;
2. minimal copy-paste examples for every important primitive/normative behavior;
3. options, errors, denial, malformed input, policy/permission, lifecycle/cleanup, server/build/framework integration, and fallback branches;
4. at least one realistic product flow with state, controls, recovery, and adjacent APIs.

Every unblocked contract ID in the parent-frozen manifest must map to at least one documentation example and one trusted browser test; silently shrinking or relabeling the worker manifest cannot reduce the denominator. Removed/split/merged IDs need explicit supersession evidence. Each guide must register all required sections in the acceptance bundle. Each example must be standalone, contain complete source rather than ellipses or hidden harness dependencies, declare all server/header/flag/policy/token/dependency requirements, show expected visible output and errors, and include an exact successful execution receipt. Placeholders such as `TODO`, `FIXME`, `REPLACE_ME`, or `<your-…>` prevent acceptance.

The guide must also include an API/behavior inventory, options and exceptions, compatibility and progressive enhancement, deployment/server configuration, accessibility, privacy/security, performance/resource considerations, troubleshooting/diagnostics, and links to the separately runnable examples. “Copy this fragment out of the showcase and fill in the rest” is not copy-paste-ready.

## Friction must drive corrections

Every failed browser test enters the friction frontier. A friction item is `verified` only when all of these exist:

1. original failed test and before evidence;
2. a real code/docs/sample/configuration change with a different content hash;
3. a later parent-verified re-run of the exact reproduction that passes;
4. every declared adjacent regression test passing;
5. after evidence, including before/after screenshots for visual findings;
6. updated denominator counts including any new friction discovered during the re-run.

`open`, `fixed-unverified`, `disputed`, `blocked`, `decision-required`, and `accepted-risk` do not count as resolved and prevent a successful run. Human risk acceptance requires attributable authority evidence and yields an accepted-risk outcome, not technical success. Never change the expectation to match the implementation merely to clear the item.

## Bounded hill-climb

Repeat:

1. parent/integrator freezes the bundle and runs the validator;
2. validator emits exact structured failures;
3. worker applies one materially distinct correction to the responsible layer;
4. parent runs the failed case, adjacent regressions, full semantic/artifact integrity checks, and the complete current friction frontier;
5. newly discovered failures are added rather than hidden;
6. validator recomputes acceptance.

Keep one correction ledger with hypotheses, changes, before/after hashes, expected discriminating result, and outcome. At most three materially distinct corrections per goal/environment are allowed; identical retries are forbidden. Exhaustion becomes `decision_required`, never an invented pass or generic blocker.

Attributable external reports remain a separate exact inventory: reproduced, not reproduced, blocked, and not attempted. Reproduced reports link to a failed reproduction and friction item; not-reproduced reports link to a completed passing attempt. Blocked/not-attempted reports keep the frontier open.

A run succeeds only when:

```text
schema/inventory valid
+ all current semantic claims match fresh primary sources
+ all cited artifacts exist and pass integrity checks
+ all unblocked contract IDs have comprehensive example and runtime coverage
+ parent-controlled Chrome/MCP tests pass
+ friction frontier is closed with verified fixes
+ developer-signal frontier is reconciled
+ no blocked or decision-required goal remains
```

Structural repository tests and model/judge scores remain useful policy regressions, but they are explicitly not launch-run acceptance.
