#!/usr/bin/env node
// install-skill.mjs — zero-dependency installer and local skill mounter
// Mounts (via symlink) or copies chrome-devrel into local agent skill directories:
// - Antigravity / Jetski: ~/.gemini/config/skills/chrome-devrel
// - Universal .agents:    ~/.agents/skills/chrome-devrel
// - Claude Code:          ~/.claude/skills/chrome-devrel
// - Pi Agent:             ~/.pi/agent/skills/chrome-devrel

import { spawnSync } from "node:child_process";
import {
  cp,
  lstat,
  mkdir,
  readlink,
  realpath,
  rm,
  symlink,
  unlink,
} from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { isMainModule } from "./lib/is-main.mjs";
import {
  checkSkillFrontmatter,
  parseSkillFrontmatter,
} from "./lib/skill-frontmatter.mjs";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

export const SKILL_NAME = "chrome-devrel";

export const DISTRIBUTABLE_ENTRIES = [
  "SKILL.md",
  "README.md",
  "CODE_OF_CONDUCT.md",
  "LICENSE",
  "config",
  "modules",
  "phases",
  "research",
  "templates",
  "schemas",
  "scripts",
];

/** Bad command-line usage: reported without a stack trace and exits with status 2. */
class UsageError extends Error {}

export function getDefaultTargets(home = homedir()) {
  return [
    {
      id: "antigravity",
      label: "Antigravity / Jetski",
      path: join(home, ".gemini", "config", "skills", SKILL_NAME),
    },
    {
      id: "agents",
      label: "Universal .agents",
      path: join(home, ".agents", "skills", SKILL_NAME),
    },
    {
      id: "claude",
      label: "Claude Code",
      path: join(home, ".claude", "skills", SKILL_NAME),
    },
    {
      id: "pi",
      label: "Pi Agent",
      path: join(home, ".pi", "agent", "skills", SKILL_NAME),
    },
  ];
}

export function parseArgs(argv) {
  const out = {
    mode: "symlink", // "symlink" | "copy" | "status" | "doctor" | "uninstall"
    home: homedir(),
    targets: [], // empty = all default targets
    force: false,
    json: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const next = argv[++i];
      if (next === undefined || next.startsWith("--")) {
        throw new UsageError(`${arg} requires a value`);
      }
      return next;
    };
    switch (arg) {
      case "--symlink":
      case "--mount":
        out.mode = "symlink";
        break;
      case "--copy":
        out.mode = "copy";
        break;
      case "--status":
        out.mode = "status";
        break;
      case "--doctor":
        out.mode = "doctor";
        break;
      case "--uninstall":
        out.mode = "uninstall";
        break;
      case "--home":
        out.home = resolve(value());
        break;
      case "--target":
        out.targets.push(
          ...value()
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
        break;
      case "--force":
        out.force = true;
        break;
      case "--json":
        out.json = true;
        break;
      case "-h":
      case "--help":
        out.help = true;
        break;
      default:
        throw new UsageError(`Unknown option: ${arg}`);
    }
  }
  return out;
}

function readSkillName(dir) {
  try {
    return (
      parseSkillFrontmatter(readFileSync(join(dir, "SKILL.md"), "utf8")).data
        .name ?? null
    );
  } catch {
    return null;
  }
}

const MISSING = {
  exists: false,
  kind: "missing",
  linkTarget: null,
  resolvedPath: null,
  pointsToRepo: false,
  hasSkillMd: false,
  skillName: null,
};

export async function inspectTarget(targetPath, repoRoot = REPO_ROOT) {
  const realRepo = await realpath(repoRoot);
  let stat;
  try {
    stat = await lstat(targetPath);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return { ...MISSING };
    throw error;
  }

  if (stat.isSymbolicLink()) {
    const linkTarget = await readlink(targetPath);
    let resolved = null;
    let pointsToRepo = false;
    try {
      resolved = await realpath(targetPath);
      pointsToRepo = resolved === realRepo;
    } catch {
      // broken symlink
    }
    return {
      exists: true,
      kind: "symlink",
      linkTarget,
      resolvedPath: resolved,
      pointsToRepo,
      hasSkillMd: resolved ? existsSync(join(resolved, "SKILL.md")) : false,
      skillName: resolved ? readSkillName(resolved) : null,
    };
  }
  if (stat.isDirectory()) {
    return {
      exists: true,
      kind: "directory",
      linkTarget: null,
      resolvedPath: await realpath(targetPath),
      pointsToRepo: false,
      hasSkillMd: existsSync(join(targetPath, "SKILL.md")),
      skillName: readSkillName(targetPath),
    };
  }
  return { ...MISSING, exists: true, kind: "other" };
}

/**
 * Why replacing or removing this target needs --force, or null when it is safe.
 * A symlink is always safe: only the link goes, never what it points at. A real
 * directory is only removed when it is recognisably a chrome-devrel install.
 */
function blockedReason(info) {
  if (!info.exists || info.kind === "symlink") return null;
  if (info.kind === "directory") {
    if (info.skillName === SKILL_NAME) return null;
    return `a directory that is not a ${SKILL_NAME} install (${
      info.skillName ? `its SKILL.md is named "${info.skillName}"` : "no readable SKILL.md"
    })`;
  }
  return "neither a directory nor a symlink";
}

async function removeTarget(path, info) {
  // Never recurse through a link: removing a mount must not touch the checkout it points at.
  if (info.kind === "symlink") await unlink(path);
  else await rm(path, { recursive: true, force: true });
}

function isInside(parent, child) {
  const rel = relative(parent, child);
  return rel === "" || !(rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel));
}

/**
 * Run the router through `targetPath` — the path agents will actually use — and
 * check it answers. This catches the failures a file-exists check cannot: a script
 * that exits 0 with no output, a broken import, a missing config file.
 */
export function smokeTest(targetPath, { timeoutMs = 15_000 } = {}) {
  const script = join(targetPath, "scripts", "route-request.mjs");
  if (!existsSync(script)) {
    return { ok: false, detail: "scripts/route-request.mjs not found" };
  }
  const run = spawnSync(process.execPath, [script, "doctor smoke test"], {
    encoding: "utf8",
    timeout: timeoutMs,
    cwd: tmpdir(),
  });
  if (run.error) return { ok: false, detail: run.error.message };
  if (run.status !== 0) {
    const output = `${run.stderr}${run.stdout}`.trim().slice(0, 200);
    return { ok: false, detail: `router exited ${run.status}: ${output}` };
  }
  try {
    const routed = JSON.parse(run.stdout);
    if (typeof routed.mode === "string") {
      return { ok: true, detail: `router answered (mode: ${routed.mode})` };
    }
  } catch {
    // fall through
  }
  return { ok: false, detail: "router produced no usable output" };
}

function diagnose(info, path) {
  if (!info.exists) return { healthy: null, problems: [] };
  const problems = [];
  let smoke;
  if (info.kind === "other") {
    problems.push("not a directory or symlink");
  } else if (info.kind === "symlink" && !info.resolvedPath) {
    problems.push(`broken symlink -> ${info.linkTarget}`);
  } else if (!info.hasSkillMd) {
    problems.push("SKILL.md not found");
  } else {
    try {
      const { errors } = checkSkillFrontmatter(
        readFileSync(join(info.resolvedPath, "SKILL.md"), "utf8"),
      );
      problems.push(...errors.map((e) => `SKILL.md frontmatter: ${e}`));
    } catch (error) {
      problems.push(`cannot read SKILL.md: ${error.message}`);
    }
    if (info.skillName && info.skillName !== SKILL_NAME) {
      problems.push(`SKILL.md name is "${info.skillName}", expected "${SKILL_NAME}"`);
    }
    smoke = smokeTest(path);
    if (!smoke.ok) problems.push(smoke.detail);
  }
  return { healthy: problems.length === 0, problems, smoke };
}

export async function installSkill({
  mode = "symlink",
  home = homedir(),
  targets = [],
  force = false,
  repoRoot = REPO_ROOT,
} = {}) {
  const realRepo = await realpath(repoRoot);
  const allTargets = getDefaultTargets(home);

  const unknown = targets.filter((id) => !allTargets.some((t) => t.id === id));
  if (unknown.length > 0) {
    throw new UsageError(
      `Unknown target(s): ${unknown.join(", ")}. Valid targets: ${allTargets
        .map((t) => t.id)
        .join(", ")}`,
    );
  }
  const selected =
    targets.length > 0
      ? allTargets.filter((t) => targets.includes(t.id))
      : allTargets;

  for (const t of selected) {
    const resolvedTarget = resolve(t.path);
    if (isInside(realRepo, resolvedTarget)) {
      throw new Error(
        `Refusing to install inside the repository tree (${resolvedTarget}); symlinks inside the repo are forbidden by security-surface audit.`,
      );
    }
  }

  const results = [];

  if (mode === "status" || mode === "doctor") {
    for (const t of selected) {
      const info = await inspectTarget(t.path, realRepo);
      const diagnosis = mode === "doctor" ? diagnose(info, t.path) : {};
      results.push({ ...t, ...info, ...diagnosis, action: "inspected" });
    }
    return results;
  }

  if (mode !== "symlink" && mode !== "copy" && mode !== "uninstall") {
    throw new Error(`Unsupported mode: ${mode}`);
  }

  // Inspect every target before changing any of them, so a refusal never leaves
  // a half-applied install behind.
  const prior = new Map();
  const blocked = [];
  for (const t of selected) {
    const info = await inspectTarget(t.path, realRepo);
    prior.set(t.id, info);
    const reason = blockedReason(info);
    if (reason) blocked.push(`  ${t.path}: ${reason}`);
  }
  if (blocked.length > 0 && !force) {
    const verb = mode === "uninstall" ? "remove" : "replace";
    throw new Error(
      `Refusing to ${verb} paths that are not a ${SKILL_NAME} install:\n${blocked.join(
        "\n",
      )}\nRe-run with --force to ${verb} them anyway.`,
    );
  }

  for (const t of selected) {
    const before = prior.get(t.id);

    if (mode === "uninstall") {
      if (before.exists) await removeTarget(t.path, before);
      const after = await inspectTarget(t.path, realRepo);
      results.push({
        ...t,
        ...after,
        action: before.exists ? "removed" : "noop",
      });
      continue;
    }

    await mkdir(dirname(t.path), { recursive: true });
    if (before.exists) await removeTarget(t.path, before);

    if (mode === "symlink") {
      await symlink(realRepo, t.path, process.platform === "win32" ? "junction" : "dir");
    } else {
      await mkdir(t.path, { recursive: true });
      for (const entry of DISTRIBUTABLE_ENTRIES) {
        const src = join(realRepo, entry);
        if (!existsSync(src)) continue;
        await cp(src, join(t.path, entry), { recursive: true });
      }
    }

    const after = await inspectTarget(t.path, realRepo);
    results.push({
      ...t,
      ...after,
      previousKind: before.kind,
      action: mode === "symlink" ? "mounted" : "copied",
    });
  }

  return results;
}

const HELP = `Usage: node scripts/install-skill.mjs [--symlink | --copy | --status | --doctor | --uninstall]
                                      [--target antigravity,agents,claude,pi]
                                      [--home <dir>] [--force] [--json]

Options:
  --symlink, --mount  Mount live repo checkout via symlink into agent skill directories (default)
  --copy              Copy distributable skill files into agent skill directories
  --status            Show what is installed where
  --doctor            Status plus a smoke test through each installed path: checks that SKILL.md
                      parses and that the helper scripts really run from where agents call them
  --uninstall         Remove installed skill symlinks/directories
  --target <ids>      Comma-separated subset of targets (antigravity, agents, claude, pi)
  --home <dir>        Override home directory (for testing or custom environments)
  --force             Replace or remove a target even when it is not a ${SKILL_NAME} install
  --json              Emit machine-readable JSON output

Existing symlinks are always safe to replace. A real directory is only replaced when its
SKILL.md is named ${SKILL_NAME}; anything else needs --force.
`;

function describeState(r) {
  if (r.kind === "symlink") {
    return `symlink -> ${r.resolvedPath || r.linkTarget} (live=${r.pointsToRepo})`;
  }
  if (r.kind === "directory") return `directory copy (SKILL.md=${r.hasSkillMd})`;
  return r.kind === "other" ? "not a directory or symlink" : "missing";
}

if (isMainModule(import.meta.url)) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.help) {
      console.log(HELP);
      process.exit(0);
    }
    const results = await installSkill(opts);
    if (opts.json) {
      console.log(
        JSON.stringify(
          { repoRoot: REPO_ROOT, node: process.versions.node, mode: opts.mode, results },
          null,
          2,
        ),
      );
    } else {
      const extra = opts.mode === "doctor" ? ` — node ${process.versions.node}` : "";
      console.log(`${SKILL_NAME} skill (${opts.mode}) — source: ${REPO_ROOT}${extra}`);
      for (const r of results) {
        if (opts.mode === "doctor") {
          const mark = r.healthy === true ? "✓" : r.healthy === false ? "✗" : "–";
          const tail =
            r.healthy === true
              ? ` — ${r.smoke?.detail ?? "ok"}`
              : r.healthy === false
                ? `\n        ${r.problems.join("\n        ")}`
                : " — not installed";
          console.log(`  ${mark} ${r.label.padEnd(22)} ${r.path} :: ${describeState(r)}${tail}`);
        } else {
          console.log(`  [${r.action}] ${r.label.padEnd(22)} ${r.path} :: ${describeState(r)}`);
        }
      }
      if (opts.mode === "symlink" || opts.mode === "copy") {
        console.log(
          "\nDone. Start a new agent session so it loads the skill, then try:\n" +
            "  Help me progress <feature or link>. I'm the <PM / engineer / DevRel>. The decision is <decision, or \"work out the next decision\">.\n" +
            "Check it any time with: node scripts/install-skill.mjs --doctor",
        );
      }
    }
    if (opts.mode === "doctor" && results.some((r) => r.healthy === false)) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`install-skill: ${error.message}`);
    if (error instanceof UsageError) console.error("Run with --help for usage.");
    process.exit(error instanceof UsageError ? 2 : 1);
  }
}
