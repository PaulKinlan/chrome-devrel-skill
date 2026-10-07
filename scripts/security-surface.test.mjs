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

// package.json: npm acts on this file by itself, so only the intended manifest passes.
const manifest = (overrides = {}) =>
  JSON.stringify({
    name: "chrome-devrel-skill",
    private: true,
    license: "Apache-2.0",
    engines: { node: ">=20" },
    scripts: { test: "node scripts/test-all.mjs" },
    ...overrides,
  });
const packageErrors = (text) => auditText("package.json", text, policy).errors;
assert.deepEqual(packageErrors(manifest()), []);
assert.ok(
  packageErrors(
    manifest({ scripts: { test: "node scripts/test-all.mjs", postinstall: "node payload.mjs" } }),
  ).some((error) => error.includes('script "postinstall" is not allowed')),
);
assert.ok(
  packageErrors(manifest({ scripts: { test: "node scripts/test-all.mjs && node payload.mjs" } }))
    .some((error) => error.includes("scripts.test must be exactly")),
);
assert.ok(
  packageErrors(manifest({ dependencies: { "left-pad": "1.3.0" } })).some((error) =>
    error.includes('"dependencies" is not an allowed field')
  ),
);
assert.ok(
  packageErrors(manifest({ private: false })).some((error) =>
    error.includes('"private" must be true')
  ),
);
assert.ok(packageErrors("{ not json").some((error) => error.includes("not valid JSON")));

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

  // The same split for package.json: a staged install hook must fail the index audit even
  // though the manifest in the worktree is the intended one.
  const packagePath = join(temporary, "package.json");
  writeFileSync(
    packagePath,
    manifest({ scripts: { test: "node scripts/test-all.mjs", postinstall: "node payload.mjs" } }),
  );
  execFileSync("git", ["add", "package.json"], { cwd: temporary });
  writeFileSync(packagePath, manifest());

  const indexResult = spawnSync(
    process.execPath,
    [auditScript, "--root", temporary, "--mode", "index"],
    { encoding: "utf8" },
  );
  assert.equal(indexResult.status, 1);
  assert.match(indexResult.stderr, /staged-evil\.example/);
  assert.match(indexResult.stderr, /package\.json: script "postinstall" is not allowed/);

  const worktreeResult = spawnSync(
    process.execPath,
    [auditScript, "--root", temporary, "--mode", "worktree"],
    { encoding: "utf8" },
  );
  assert.equal(worktreeResult.status, 0, worktreeResult.stderr);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

console.log("Security surface mutations: 14 passed, 0 failed");
