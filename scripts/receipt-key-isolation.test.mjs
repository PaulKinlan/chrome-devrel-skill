#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const repo = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sender = join(repo, "scripts/send-launch-attestation-key.mjs");
const signer = join(repo, "scripts/sign-launch-acceptance.mjs");
const channel = join(repo, "scripts/lib/late-key-channel.mjs");
const root = mkdtempSync(join(tmpdir(), "late-key-isolation-"));
const socketPath = join(root, "key.sock");
const key = "sender-only-test-key-that-is-longer-than-thirty-two-bytes";
try {
  const cleanEnv = { ...process.env }; delete cleanEnv.CHROME_DEVREL_ATTESTATION_KEY;
  const receiverCode = `import { receiveLateKey } from ${JSON.stringify(channel)}; if(process.env.CHROME_DEVREL_ATTESTATION_KEY) process.exit(9); console.log('pre-key=absent'); const key=await receiveLateKey(${JSON.stringify(socketPath)}); console.log('received-length='+key.length);`;
  const receiver = spawn(process.execPath, ["--input-type=module", "-e", receiverCode], { env: cleanEnv, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "", stderr = "";
  receiver.stdout.setEncoding("utf8"); receiver.stderr.setEncoding("utf8");
  receiver.stdout.on("data", (chunk) => { stdout += chunk; });
  const ready = new Promise((resolveReady, reject) => {
    receiver.stderr.on("data", (chunk) => { stderr += chunk; if (stderr.includes("REPLAY_COMPLETE_KEY_SOCKET=")) resolveReady(); });
    receiver.on("error", reject);
  });
  await ready;
  const sent = spawnSync(process.execPath, [sender, "--socket", socketPath], { env: { ...process.env, CHROME_DEVREL_ATTESTATION_KEY: key }, encoding: "utf8" });
  assert.equal(sent.status, 0, sent.stderr);
  const exitCode = await new Promise((resolveExit) => receiver.on("close", resolveExit));
  assert.equal(exitCode, 0, stderr);
  assert.match(stdout, /pre-key=absent/);
  assert.match(stdout, new RegExp(`received-length=${key.length}`));

  const refused = spawnSync(process.execPath, [signer, "--manifest", "missing.json", "--key-id", "test", "--online"], { env: { ...process.env, CHROME_DEVREL_ATTESTATION_KEY: key }, encoding: "utf8" });
  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /Signer must start without/);
  console.log("Late key isolation: receiver started keyless; sender delivered only after socket readiness; keyed signer start refused");
} finally {
  rmSync(root, { recursive: true, force: true });
}
