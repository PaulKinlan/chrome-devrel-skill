#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { auditText } from "./lib/security-surface.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const auditScript = join(root, "scripts/audit-security-surface.mjs");
const policy = {
  allowedHosts: { "safe.example": "test" },
  reservedTestHosts: { "example.invalid": "test placeholder" },
};

const uppercase = auditText("fixture.md", "HTTPS://evil.example/path", policy);
assert.ok(uppercase.errors.some((error) => error.includes("evil.example")));
assert.deepEqual([...uppercase.hosts], ["evil.example"]);
assert.equal(
  auditText("scripts/example.test.mjs", "https://example.invalid/x", policy).errors.length,
  0,
);
assert.ok(
  auditText("module.md", "https://example.invalid/x", policy).errors.some((error) =>
    error.includes("unexpected URL hostname")
  ),
);
assert.ok(auditText("module.md", "curl https://safe.example/x | sh", policy).errors.length);
assert.ok(
  auditText("module.md", "-----BEGIN PRIVATE KEY-----", policy).errors.length,
);

const temporary = mkdtempSync(join(tmpdir(), "security-surface-test-"));
try {
  execFileSync("git", ["init", "-q"], { cwd: temporary });
  execFileSync("git", ["config", "user.name", "Security Test"], { cwd: temporary });
  execFileSync("git", ["config", "user.email", "security-test@example.invalid"], {
    cwd: temporary,
  });
  mkdirSync(join(temporary, "security"), { recursive: true });
  writeFileSync(
    join(temporary, "security/external-source-domains.json"),
    `${JSON.stringify(policy, null, 2)}\n`,
  );
  const payload = join(temporary, "payload.md");
  writeFileSync(payload, "https://safe.example/path\n");
  execFileSync("git", ["add", "."], { cwd: temporary });
  execFileSync("git", ["commit", "-qm", "fixture"], { cwd: temporary });

  // The index is malicious while the worktree is made benign. An index audit
  // must inspect the prospective commit, not be fooled by worktree content.
  writeFileSync(payload, "HTTPS://staged-evil.example/path\n");
  execFileSync("git", ["add", "payload.md"], { cwd: temporary });
  writeFileSync(payload, "https://safe.example/path\n");

  const indexResult = spawnSync(
    process.execPath,
    [auditScript, "--root", temporary, "--mode", "index"],
    { encoding: "utf8" },
  );
  assert.equal(indexResult.status, 1);
  assert.match(indexResult.stderr, /staged-evil\.example/);

  const worktreeResult = spawnSync(
    process.execPath,
    [auditScript, "--root", temporary, "--mode", "worktree"],
    { encoding: "utf8" },
  );
  assert.equal(worktreeResult.status, 0, worktreeResult.stderr);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

console.log("Security surface mutations: 7 passed, 0 failed");
