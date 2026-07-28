#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { auditText } from "./lib/security-surface.mjs";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const root = resolve(value("--root", fileURLToPath(new URL("..", import.meta.url))));
const mode = value("--mode", "index");
if (!new Set(["index", "worktree"]).has(mode)) {
  throw new Error(`--mode must be index or worktree, got ${mode}`);
}
const git = (gitArgs, options = {}) =>
  execFileSync("git", gitArgs, { cwd: root, ...options });

const list = mode === "index"
  ? git(["ls-files", "--cached", "-z"]).toString("utf8")
  : git(["ls-files", "--cached", "--others", "--exclude-standard", "-z"])
      .toString("utf8");
const files = [...new Set(list.split("\0").filter(Boolean))].sort();
const read = (path) => {
  if (mode === "index") return git(["show", `:${path}`]);
  return readFileSync(resolve(root, path));
};
const existsInMode = (path) => {
  try {
    read(path);
    return true;
  } catch {
    return false;
  }
};
const policyPath = "security/external-source-domains.json";
if (!existsInMode(policyPath)) {
  throw new Error(`${policyPath} is missing from the audited ${mode}`);
}
const policy = JSON.parse(read(policyPath).toString("utf8"));
const errors = [];
const hostFiles = new Map();
let bytes = 0;
let scanned = 0;

for (const path of files) {
  if (path.startsWith("retrospectives/runs/")) {
    errors.push(`${path}: raw retrospective runs must remain outside the installable tree`);
    continue;
  }
  const full = resolve(root, path);
  if (!full.startsWith(`${root}${sep}`)) {
    errors.push(`${path}: path escapes repository root`);
    continue;
  }
  if (!existsInMode(path)) continue;

  if (mode === "index") {
    const record = git(["ls-files", "-s", "--", path]).toString("utf8");
    if (record.startsWith("120000 ")) {
      errors.push(`${path}: tracked symlinks are forbidden in the distributable tree`);
      continue;
    }
  } else {
    let stat;
    try {
      stat = lstatSync(full);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) {
      errors.push(`${path}: symlinks are forbidden in the distributable tree`);
      continue;
    }
    if (!stat.isFile()) continue;
  }

  const content = read(path);
  bytes += content.length;
  scanned++;
  const { errors: textErrors, hosts } = auditText(
    path,
    content.toString("utf8"),
    policy,
  );
  errors.push(...textErrors);
  for (const host of hosts) {
    if (!hostFiles.has(host)) hostFiles.set(host, new Set());
    hostFiles.get(host).add(path);
  }
}

const maxBytes = 8 * 1024 * 1024;
if (bytes > maxBytes) {
  errors.push(`audited ${mode} surface is ${bytes} bytes; limit is ${maxBytes}`);
}
for (const host of Object.keys(policy.allowedHosts || {})) {
  if (!hostFiles.has(host)) errors.push(`allowlisted hostname is unused: ${host}`);
}

if (errors.length > 0) {
  console.error(`Security surface ${mode} audit failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}
console.log(
  `Security surface (${mode}): ${scanned} files, ${bytes} bytes, ${hostFiles.size} URL hostnames, 0 errors`,
);
