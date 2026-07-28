#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeLaunchAttestation, validateLaunchAcceptance } from "./lib/launch-acceptance.mjs";
import { validateJsonSchema } from "./lib/json-schema-lite.mjs";
import { receiveLateKey } from "./lib/late-key-channel.mjs";
import { minimalReplayEnvironment, parseTrustedDocumentationCommand } from "./lib/trusted-receipt-command.mjs";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const manifestPath = resolve(value("--manifest", "launch-acceptance.json"));
const runRoot = resolve(value("--root", resolve(manifestPath, "..")));
const socketPath = resolve(value("--key-socket", resolve(runRoot, ".attestation-key.sock")));
const keyId = value("--key-id");
if (process.env.CHROME_DEVREL_ATTESTATION_KEY || !keyId || !args.includes("--online")) {
  console.error("Signer must start without CHROME_DEVREL_ATTESTATION_KEY; pass --key-socket, --key-id, and --online. Deliver the key only after REPLAY_COMPLETE_KEY_SOCKET appears.");
  process.exit(2);
}
const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const run = JSON.parse(await readFile(manifestPath, "utf8"));
const schema = JSON.parse(await readFile(resolve(repoRoot, "schemas/launch-acceptance.schema.json"), "utf8"));
const schemaErrors = validateJsonSchema(run, schema);
if (schemaErrors.length) throw new Error(`refusing receipt execution for schema-invalid manifest: ${JSON.stringify(schemaErrors)}`);
const trustedDocumentationValidatorPath = resolve(repoRoot, "scripts/validate-documentation-example.mjs");
const artifacts = new Map((run.artifacts || []).map((artifact) => [artifact.id, artifact]));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

// No key exists in this process or its environment while receipt commands run.
for (const receipt of run.receipts || []) {
  const trusted = await parseTrustedDocumentationCommand(receipt, { runRoot, trustedDocumentationValidatorPath });
  if (!trusted.ok) throw new Error(`receipt ${receipt.id}: untrusted command: ${trusted.reason}`);
  const frozenContractPath = artifacts.get(run.contract.frozenManifestArtifactId)?.path;
  const allowedExamplePaths = new Set((run.documentationExamples || []).map((example) => example.path));
  const guidePath = artifacts.get(run.documentationGuide?.artifactId)?.path;
  if (trusted.parsed.contract !== frozenContractPath || trusted.parsed.examples.some((path) => !allowedExamplePaths.has(path)) || (trusted.parsed.guide && trusted.parsed.guide !== guidePath)) throw new Error(`receipt ${receipt.id}: command arguments do not match manifest documentation artifacts`);
  for (const subject of receipt.subjects || []) {
    const artifact = artifacts.get(subject.id);
    if (!artifact || artifact.path !== subject.path) throw new Error(`receipt ${receipt.id}: subject ${subject.id} is not a matching artifact`);
    const current = digest(await readFile(resolve(runRoot, subject.path)));
    if (current !== subject.sha256Before || current !== subject.sha256After || current !== artifact.sha256) throw new Error(`receipt ${receipt.id}: subject ${subject.id} hash mismatch before replay`);
  }
  const replay = spawnSync(trusted.nodeReal, [trusted.scriptReal, ...receipt.argv.slice(2)], {
    cwd: trusted.cwdReal,
    encoding: null,
    shell: false,
    env: minimalReplayEnvironment(),
    maxBuffer: 64 * 1024 * 1024,
  });
  const exitCode = Number.isInteger(replay.status) ? replay.status : 1;
  if (exitCode !== receipt.exitCode) throw new Error(`receipt ${receipt.id}: replay exit ${exitCode} != recorded ${receipt.exitCode}`);
  for (const subject of receipt.subjects || []) {
    const current = digest(await readFile(resolve(runRoot, subject.path)));
    if (current !== subject.sha256After) throw new Error(`receipt ${receipt.id}: replay changed subject ${subject.id}`);
  }
}

// The socket is created only after every receipt child has exited. A separate
// parent-controlled sender process now provides the key; no worker command is
// spawned after this point.
const key = await receiveLateKey(socketPath);
run.attestation = { algorithm: "hmac-sha256", keyId, signedDigest: "0".repeat(64), signature: "0".repeat(64) };
Object.assign(run.attestation, computeLaunchAttestation(run, key));
const semanticSourcePolicy = JSON.parse(await readFile(resolve(repoRoot, "config/semantic-fact-sources.json"), "utf8"));
const result = await validateLaunchAcceptance(run, {
  root: runRoot,
  online: true,
  schema,
  semanticSourcePolicy,
  attestationKey: key,
  trustedDocumentationValidatorPath,
});
if (result.computedOutcome !== "succeeded") {
  console.error(JSON.stringify(result, null, 2));
  throw new Error("refusing to attest a run that does not pass independent online validation");
}
await writeFile(manifestPath, `${JSON.stringify(run, null, 2)}\n`, { mode: 0o600 });
console.log(`Replayed ${run.receipts.length} receipt(s) without a key, validated online, and attested ${manifestPath} as ${keyId}; key was not written.`);
