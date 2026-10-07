#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getDefaultTargets,
  inspectTarget,
  installSkill,
  parseArgs,
} from "./install-skill.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const homes = [];
const freshHome = () => {
  const home = mkdtempSync(join(tmpdir(), "chrome-devrel-install-test-"));
  homes.push(home);
  return home;
};
const pathOf = (home, id) => getDefaultTargets(home).find((t) => t.id === id).path;
const seedDir = (path, skillMd, extra = {}) => {
  mkdirSync(path, { recursive: true });
  writeFileSync(join(path, "SKILL.md"), skillMd);
  for (const [name, text] of Object.entries(extra)) writeFileSync(join(path, name), text);
};
const skillMd = (name) => `---\nname: ${name}\ndescription: test fixture\n---\n# ${name}\n`;

try {
  // --- argument parsing ------------------------------------------------------------------
  assert.deepEqual(
    (({ mode, targets, force }) => ({ mode, targets, force }))(
      parseArgs(["--copy", "--target", "claude, pi", "--force"]),
    ),
    { mode: "copy", targets: ["claude", "pi"], force: true },
  );
  assert.equal(parseArgs(["--doctor"]).mode, "doctor");
  assert.equal(parseArgs(["--status"]).mode, "status");
  assert.throws(() => parseArgs(["--home"]), /--home requires a value/);
  assert.throws(() => parseArgs(["--target"]), /--target requires a value/);
  assert.throws(() => parseArgs(["--target", "--copy"]), /--target requires a value/);
  assert.throws(() => parseArgs(["--bogus"]), /Unknown option: --bogus/);

  // --- mount, copy, repo guard, uninstall ---------------------------------------------------
  {
    const home = freshHome();
    // A stale earlier install of this skill (a real directory) must be replaced cleanly.
    const staleAgentsDir = pathOf(home, "agents");
    seedDir(staleAgentsDir, skillMd("chrome-devrel"), { "old-file.md": "stale\n" });

    const initialStatus = await installSkill({ mode: "status", home, repoRoot });
    assert.equal(initialStatus.length, 4);
    assert.equal(initialStatus.find((r) => r.id === "agents").kind, "directory");
    assert.equal(initialStatus.find((r) => r.id === "agents").skillName, "chrome-devrel");
    assert.equal(initialStatus.find((r) => r.id === "antigravity").kind, "missing");

    // 1. Mount via symlink across all 4 targets
    const mounted = await installSkill({ mode: "symlink", home, repoRoot });
    for (const item of mounted) {
      assert.equal(item.kind, "symlink", `${item.id} should be a symlink`);
      assert.equal(item.pointsToRepo, true, `${item.id} should resolve to repoRoot`);
      assert.equal(item.hasSkillMd, true, `${item.id} should expose SKILL.md`);
    }
    assert.equal(mounted.find((r) => r.id === "agents").previousKind, "directory");

    // 2. Copy mode on a specific target
    const copied = await installSkill({ mode: "copy", home, targets: ["antigravity"], repoRoot });
    assert.equal(copied.length, 1);
    assert.equal(copied[0].kind, "directory");
    assert.equal(copied[0].pointsToRepo, false);
    assert.equal(copied[0].hasSkillMd, true);
    assert.equal(copied[0].skillName, "chrome-devrel");

    // 3. Refuse installing inside repoRoot
    await assert.rejects(
      () =>
        installSkill({
          mode: "symlink",
          home: join(repoRoot, "scratch-forbidden-home"),
          repoRoot,
        }),
      /Refusing to install inside the repository tree/,
    );
    assert.equal(existsSync(join(repoRoot, "scratch-forbidden-home")), false);

    // 4. Uninstall all targets — and never touch the checkout the symlinks point at
    const removed = await installSkill({ mode: "uninstall", home, repoRoot });
    for (const item of removed) {
      assert.equal(item.exists, false, `${item.id} should be removed`);
      const postCheck = await inspectTarget(item.path, repoRoot);
      assert.equal(postCheck.exists, false);
    }
    assert.ok(existsSync(join(repoRoot, "SKILL.md")), "uninstall must not delete the repository");
    assert.ok(existsSync(join(repoRoot, "scripts", "install-skill.mjs")));
  }

  // --- a directory that is not ours is refused, atomically, unless --force ------------------
  {
    const home = freshHome();
    const foreign = pathOf(home, "claude");
    seedDir(foreign, skillMd("someone-elses-skill"), { "keep.txt": "precious\n" });

    await assert.rejects(
      () => installSkill({ mode: "symlink", home, repoRoot }),
      (error) =>
        /Refusing to replace paths that are not a chrome-devrel install/.test(error.message) &&
        error.message.includes(foreign) &&
        /someone-elses-skill/.test(error.message) &&
        /--force/.test(error.message),
    );
    assert.equal(existsSync(join(foreign, "keep.txt")), true, "foreign directory must be untouched");
    assert.equal(
      (await inspectTarget(pathOf(home, "antigravity"), repoRoot)).exists,
      false,
      "a refusal must not leave other targets half-installed",
    );
    await assert.rejects(
      () => installSkill({ mode: "uninstall", home, repoRoot }),
      /Refusing to remove paths that are not a chrome-devrel install/,
    );
    assert.equal(existsSync(join(foreign, "keep.txt")), true);

    const forced = await installSkill({ mode: "symlink", home, repoRoot, force: true });
    assert.ok(forced.every((r) => r.kind === "symlink" && r.pointsToRepo));
    assert.equal(existsSync(join(foreign, "keep.txt")), false, "--force replaces the foreign directory");
  }

  // --- a directory with no readable SKILL.md, a plain file, and a dangling link ---------------
  {
    const home = freshHome();
    const noSkillMd = pathOf(home, "pi");
    mkdirSync(noSkillMd, { recursive: true });
    writeFileSync(join(noSkillMd, "notes.txt"), "not a skill\n");
    await assert.rejects(
      () => installSkill({ mode: "copy", home, targets: ["pi"], repoRoot }),
      /no readable SKILL\.md/,
    );
    assert.equal(existsSync(join(noSkillMd, "notes.txt")), true);

    const plainFile = pathOf(home, "agents");
    mkdirSync(join(plainFile, ".."), { recursive: true });
    writeFileSync(plainFile, "just a file\n");
    await assert.rejects(
      () => installSkill({ mode: "symlink", home, targets: ["agents"], repoRoot }),
      /neither a directory nor a symlink/,
    );

    // A dangling symlink holds nothing worth protecting: replace it without --force.
    const dangling = pathOf(home, "claude");
    mkdirSync(join(dangling, ".."), { recursive: true });
    symlinkSync(join(home, "does-not-exist"), dangling, "dir");
    const replaced = await installSkill({ mode: "symlink", home, targets: ["claude"], repoRoot });
    assert.equal(replaced[0].kind, "symlink");
    assert.equal(replaced[0].pointsToRepo, true);
  }

  // --- unknown targets are an error, not silently ignored -------------------------------------
  {
    const home = freshHome();
    await assert.rejects(
      () => installSkill({ mode: "symlink", home, targets: ["claude", "cluade"], repoRoot }),
      /Unknown target\(s\): cluade\. Valid targets: antigravity, agents, claude, pi/,
    );
    assert.equal(
      (await inspectTarget(pathOf(home, "claude"), repoRoot)).exists,
      false,
      "a typo anywhere in --target must install nothing",
    );
  }

  // --- doctor: checks that the skill really works from the path agents will use --------------
  {
    const home = freshHome();
    await installSkill({ mode: "symlink", home, repoRoot });
    const healthy = await installSkill({ mode: "doctor", home, repoRoot });
    assert.equal(healthy.length, 4);
    for (const r of healthy) {
      assert.equal(r.healthy, true, `${r.id}: ${(r.problems || []).join("; ")}`);
      assert.equal(r.smoke.ok, true);
    }

    // A copy install is checked the same way, and ships everything the router needs.
    await installSkill({ mode: "copy", home, targets: ["claude"], repoRoot });
    const claudeDir = pathOf(home, "claude");
    let [claude] = await installSkill({ mode: "doctor", home, targets: ["claude"], repoRoot });
    assert.equal(claude.healthy, true, claude.problems.join("; "));

    // A helper that exits 0 with no output — the original silent failure — is reported.
    writeFileSync(join(claudeDir, "scripts", "route-request.mjs"), "// does nothing\n");
    [claude] = await installSkill({ mode: "doctor", home, targets: ["claude"], repoRoot });
    assert.equal(claude.healthy, false);
    assert.match(claude.problems.join("\n"), /no usable output/);

    // A missing helper is reported.
    rmSync(join(claudeDir, "scripts", "route-request.mjs"));
    [claude] = await installSkill({ mode: "doctor", home, targets: ["claude"], repoRoot });
    assert.equal(claude.healthy, false);
    assert.match(claude.problems.join("\n"), /route-request\.mjs not found/);

    // Frontmatter that some YAML parsers reject is reported.
    writeFileSync(
      join(claudeDir, "SKILL.md"),
      "---\nname: chrome-devrel\ndescription: Use when: oops\n---\n",
    );
    [claude] = await installSkill({ mode: "doctor", home, targets: ["claude"], repoRoot });
    assert.equal(claude.healthy, false);
    assert.match(claude.problems.join("\n"), /frontmatter/);

    // A target that is simply not installed is not a failure.
    await installSkill({ mode: "uninstall", home, targets: ["pi"], repoRoot });
    const [pi] = await installSkill({ mode: "doctor", home, targets: ["pi"], repoRoot });
    assert.equal(pi.healthy, null);
  }

  console.log(
    "Skill installer: mount, copy, repo-guard, uninstall, identity checks, argument errors, and doctor tests passed",
  );
} finally {
  // Symlinks here point at the real checkout: unlink them through the installer first so
  // the recursive delete below can never traverse into the repository, even after a failure.
  for (const home of homes) {
    try {
      await installSkill({ mode: "uninstall", home, repoRoot, force: true });
    } catch {
      // best effort
    }
    rmSync(home, { recursive: true, force: true });
  }
}
