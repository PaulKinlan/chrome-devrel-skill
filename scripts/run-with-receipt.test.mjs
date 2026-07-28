#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = resolve(fileURLToPath(new URL("..", import.meta.url)));
const script = join(repo, "scripts/run-with-receipt.mjs");
const root = mkdtempSync(join(tmpdir(), "receipt-test-"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
try {
  writeFileSync(join(root, "example.txt"), "subject bytes\n");
  const result = spawnSync(process.execPath, [script, "--root", root, "--id", "ok", "--subject", "example-artifact=example.txt", "--", process.execPath, "-e", "process.stdout.write('real output')"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const fragment = JSON.parse(readFileSync(join(root, "receipts/ok.receipt.json"), "utf8"));
  assert.deepEqual(fragment.receipt.argv.slice(0, 2), [process.execPath, "-e"]);
  assert.equal(fragment.receipt.exitCode, 0);
  assert.deepEqual(fragment.receipt.subjectArtifactIds, ["example-artifact"]);
  assert.equal(fragment.receipt.subjects[0].path, "example.txt");
  assert.equal(fragment.receipt.subjects[0].sha256Before, fragment.receipt.subjects[0].sha256After);
  const stdout = readFileSync(join(root, fragment.artifacts[0].path));
  assert.equal(stdout.toString(), "real output");
  assert.equal(fragment.artifacts[0].sha256, hash(stdout));

  const failed = spawnSync(process.execPath, [script, "--root", root, "--id", "failed", "--subject", "example-artifact=example.txt", "--", process.execPath, "-e", "process.stderr.write('real error'); process.exit(7)"], { encoding: "utf8" });
  assert.equal(failed.status, 7);
  const failedFragment = JSON.parse(readFileSync(join(root, "receipts/failed.receipt.json"), "utf8"));
  assert.equal(failedFragment.receipt.exitCode, 7);
  assert.equal(readFileSync(join(root, failedFragment.artifacts[1].path), "utf8"), "real error");
  console.log("Command receipts: success and failure provenance passed");
} finally {
  rmSync(root, { recursive: true, force: true });
}
