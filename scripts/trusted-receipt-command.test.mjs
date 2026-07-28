#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { minimalReplayEnvironment, parseTrustedDocumentationCommand } from "./lib/trusted-receipt-command.mjs";

const repo = resolve(fileURLToPath(new URL("..", import.meta.url)));
const trustedScript = join(repo, "scripts/validate-documentation-example.mjs");
const root = mkdtempSync(join(tmpdir(), "trusted-receipt-"));
try {
  mkdirSync(join(root, "evidence"), { recursive: true });
  mkdirSync(join(root, "examples"), { recursive: true });
  writeFileSync(join(root, "evidence/contract.json"), "{}\n");
  writeFileSync(join(root, "examples/demo.html"), "demo\n");
  const base = { cwd: root, argv: [process.execPath, trustedScript, "--root", root, "--contract", "evidence/contract.json", "--example", "examples/demo.html"] };
  assert.equal((await parseTrustedDocumentationCommand(base, { runRoot: root, trustedDocumentationValidatorPath: trustedScript })).ok, true);

  const evalProbe = { ...base, argv: [process.execPath, "-e", "console.log('fake')", trustedScript, "--root", root] };
  assert.equal((await parseTrustedDocumentationCommand(evalProbe, { runRoot: root, trustedDocumentationValidatorPath: trustedScript })).ok, false);

  const duplicate = { ...base, argv: [...base.argv, "--root", root] };
  assert.equal((await parseTrustedDocumentationCommand(duplicate, { runRoot: root, trustedDocumentationValidatorPath: trustedScript })).ok, false);

  const fakeDir = join(root, "fake"); mkdirSync(fakeDir);
  const fakeScript = join(fakeDir, "validate-documentation-example.mjs"); writeFileSync(fakeScript, "console.log('fake')\n");
  const fake = { ...base, argv: [process.execPath, fakeScript, ...base.argv.slice(2)] };
  assert.equal((await parseTrustedDocumentationCommand(fake, { runRoot: root, trustedDocumentationValidatorPath: trustedScript })).ok, false);

  process.env.PARENT_ONLY_CANARY = "must-not-leak";
  const replayEnv = minimalReplayEnvironment();
  assert.equal(replayEnv.PARENT_ONLY_CANARY, undefined);
  assert.deepEqual(Object.keys(replayEnv).sort(), ["LANG", "LC_ALL", "PATH"]);
  console.log("Trusted receipt commands: exact validator accepted; eval, duplicate, fake path, and environment leakage rejected");
} finally {
  delete process.env.PARENT_ONLY_CANARY;
  rmSync(root, { recursive: true, force: true });
}
