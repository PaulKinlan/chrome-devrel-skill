#!/usr/bin/env node
// Regression: every CLI must actually run — not silently exit 0 with no output —
// when reached the way agents reach it after installation:
//   - through a symlinked skill mount (`install-skill --symlink`, the Skills CLI default)
//   - from a checkout whose directory name contains a space / non-ASCII character
//     (import.meta.url percent-encodes those, so a string comparison with argv[1] fails)
// The maintainer validators and the eval runner are run from such a checkout too: they
// derive the repository root from import.meta.url and used to crash on it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isMainModule } from "./lib/is-main.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const tmp = realpathSync(mkdtempSync(join(tmpdir(), "chrome-devrel-entrypoint-")));
const mount = join(tmp, "mounted-skill");

// Run from a neutral directory, like an agent working inside someone else's project.
const run = (scriptPath, args) =>
  spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: tmp,
    encoding: "utf8",
    timeout: 60_000,
  });

try {
  // --- isMainModule unit semantics -----------------------------------------------------
  assert.equal(isMainModule(import.meta.url), true, "this test is the entry script");
  assert.equal(
    isMainModule(new URL("./route-request.mjs", import.meta.url).href),
    false,
    "a different module is not the entry script",
  );
  assert.equal(isMainModule(import.meta.url, ""), false, "no entry script");
  assert.equal(isMainModule("file:///does/not/exist.mjs"), false, "unresolvable path");

  // --- every CLI, in every way an agent may reach it -----------------------------------
  symlinkSync(repoRoot, mount, "dir");

  // A real directory (not a symlink) with characters import.meta.url percent-encodes.
  const spaced = join(tmp, "skill copy ü");
  mkdirSync(spaced);
  for (const dir of ["scripts", "config", "schemas", "templates"]) {
    cpSync(join(repoRoot, dir), join(spaced, dir), { recursive: true });
  }

  const clis = [
    {
      script: "scripts/route-request.mjs",
      args: ["--merge", "manage the launch of Example API"],
      exitCode: 0,
      check(result) {
        const routed = JSON.parse(result.stdout);
        assert.equal(typeof routed.mode, "string");
        assert.ok(Array.isArray(routed.modules) && routed.modules.length > 0);
      },
    },
    { script: "scripts/packet.mjs", args: [], exitCode: 2, stdout: /Usage:/ },
    { script: "scripts/prepare-launch-bundle.mjs", args: [], exitCode: 2, stdout: /Usage:/ },
    { script: "scripts/install-skill.mjs", args: ["--help"], exitCode: 0, stdout: /Usage:/ },
  ];
  const ways = [
    ["direct path", repoRoot],
    ["symlinked mount", mount],
    ["path with space and non-ASCII", spaced],
  ];

  for (const cli of clis) {
    for (const [way, base] of ways) {
      const label = `${cli.script} via ${way}`;
      const result = run(join(base, cli.script), cli.args);
      assert.ok(
        `${result.stdout}${result.stderr}`.length > 0,
        `${label}: no output at all — the entry-point guard did not fire`,
      );
      assert.equal(result.status, cli.exitCode, `${label}: exit code\n${result.stderr}`);
      if (cli.stdout) assert.match(result.stdout, cli.stdout, label);
      cli.check?.(result);
    }
  }

  // --- maintainer scripts from a spaced checkout -----------------------------------------
  // They derive the repository root from import.meta.url as well; a percent-encoded
  // pathname (".../my%20checkout...") made them crash for a contributor whose clone path
  // contains a space. Run from a neutral cwd so nothing can lean on process.cwd() either.
  const checkout = join(tmp, "my checkout ü");
  cpSync(repoRoot, checkout, { recursive: true, filter: (source) => basename(source) !== ".git" });
  const maintainerScripts = [
    { script: "scripts/validate-public-core.mjs", args: [] },
    { script: "scripts/mdn-mutation-tests.mjs", args: [] },
    { script: "evals/validate.mjs", args: [] },
    // The eval runner reads cases.json and rubric.json from the root it derives. --list
    // calls no model and writes nothing, so it fails exactly when that root is wrong.
    { script: "evals/run.mjs", args: ["--list"], stdout: /^cases \(\d+\):$/m },
  ];
  for (const { script, args, stdout } of maintainerScripts) {
    const result = run(join(checkout, script), args);
    assert.equal(
      result.status,
      0,
      `${script} from a spaced checkout: exit ${result.status}\n${result.stderr}${result.stdout}`,
    );
    if (stdout) assert.match(result.stdout, stdout, `${script} from a spaced checkout`);
  }

  // --- a real offline workflow through the symlinked mount -----------------------------
  // Exercises the deeper code that only runs once the entry guard fires: packet state,
  // bundle scaffolding, and the trusted documentation-validator receipt.
  const viaMount = (name, args) => run(join(mount, "scripts", name), args);
  const parse = (result, label) => {
    assert.equal(result.status, 0, `${label}: exit ${result.status}\n${result.stderr}${result.stdout}`);
    return JSON.parse(result.stdout);
  };
  const packetDir = join(tmp, "packet");
  const runDir = join(tmp, "run");

  const initialized = parse(
    viaMount("packet.mjs", ["init", "--dir", packetDir, "--id", "5175745573945344", "--stage", "01-incubation"]),
    "packet init",
  );
  assert.equal(initialized.status, "initialized");

  const scaffolded = parse(
    viaMount("prepare-launch-bundle.mjs", [
      "init", "--root", runDir, "--packet", join(packetDir, "packet.json"),
      "--contracts", "C1,C2,C3", "--surface-token", "ExampleAPI",
    ]),
    "bundle init",
  );
  assert.equal(scaffolded.status, "initialized");

  const refreshed = parse(viaMount("prepare-launch-bundle.mjs", ["refresh", "--root", runDir]), "bundle refresh");
  assert.equal(refreshed.status, "refreshed");

  console.log(
    `CLI entry points: ${clis.length} CLIs x ${ways.length} access paths, ${maintainerScripts.length} maintainer scripts from a spaced checkout, plus an offline packet+bundle workflow through a symlinked mount, passed`,
  );
} finally {
  // `mount` points at the real repository: remove the link itself first so the recursive
  // delete below can never traverse into the checkout, even if an assertion failed midway.
  try {
    unlinkSync(mount);
  } catch {
    // never created, or already removed
  }
  rmSync(tmp, { recursive: true, force: true });
}
