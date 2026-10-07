#!/usr/bin/env node
// test-all.mjs — run every validation gate CI runs, in the same order, with one command.
//
//   node scripts/test-all.mjs              run everything, summarise, exit 1 if anything failed
//   node scripts/test-all.mjs --bail       stop at the first failing gate
//   node scripts/test-all.mjs --only <s>   run only gates whose name or script contains <s>
//   node scripts/test-all.mjs --verbose    show the output of passing gates too
//   node scripts/test-all.mjs --list       print the gates and exit
//
// CI runs exactly this command, so this list is the single source of truth.
// The security audit is a hard gate: if it fails, nothing else runs. Locally it audits the
// working tree (so untracked files are covered); in GitHub Actions it audits the index,
// i.e. exactly what would be committed — re-run it after staging if you want that view.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inCI = process.env.GITHUB_ACTIONS === "true";

const gates = [
  {
    name: "Security surface audit",
    script: "scripts/audit-security-surface.mjs",
    args: ["--mode", inCI ? "index" : "worktree"],
    hard: true,
  },
  { name: "Security audit mutations", script: "scripts/security-surface.test.mjs" },
  { name: "Retrospective metrics fixture", script: "scripts/test-retrospective-metrics.mjs" },
  { name: "Retrospective metrics corpus", script: "scripts/validate-retrospective-metrics.mjs" },
  { name: "Retrospective run archive", script: "scripts/validate-retrospective-run.mjs" },
  { name: "Launch acceptance and negative mutations", script: "scripts/launch-acceptance.test.mjs" },
  { name: "Trusted command receipts", script: "scripts/run-with-receipt.test.mjs" },
  { name: "Untrusted receipt commands and env leakage", script: "scripts/trusted-receipt-command.test.mjs" },
  { name: "Parent-key isolation during receipt replay", script: "scripts/receipt-key-isolation.test.mjs" },
  { name: "Request routing", script: "scripts/request-routing.test.mjs" },
  { name: "Behavioral contracts and mutations", script: "scripts/behavior-contracts.test.mjs" },
  { name: "Public core", script: "scripts/validate-public-core.mjs" },
  { name: "Eval fixture structure", script: "evals/validate.mjs" },
  { name: "MDN mutation guards", script: "scripts/mdn-mutation-tests.mjs" },
  { name: "Skill frontmatter", script: "scripts/skill-frontmatter.test.mjs" },
  { name: "Skill installer and doctor", script: "scripts/install-skill.test.mjs" },
  { name: "CLI entry points via symlink and spaced paths", script: "scripts/entrypoint.test.mjs" },
  { name: "CLI support helpers", script: "scripts/cli-support.test.mjs" },
  { name: "Feature packet CLI", script: "scripts/packet.test.mjs" },
  { name: "Launch bundle scaffolder and attestation", script: "scripts/prepare-launch-bundle.test.mjs" },
];

// --- arguments -------------------------------------------------------------------------
const args = process.argv.slice(2);
const usage = (message) => {
  console.error(`test-all: ${message}\nUsage: node scripts/test-all.mjs [--bail] [--verbose] [--only <text>] [--list]`);
  process.exit(2);
};
const onlyIndex = args.indexOf("--only");
const only = onlyIndex === -1 ? null : args[onlyIndex + 1];
if (onlyIndex !== -1 && (!only || only.startsWith("-"))) usage("--only requires a value");
for (const [i, arg] of args.entries()) {
  if (i === onlyIndex + 1 && onlyIndex !== -1) continue;
  if (!["--bail", "--verbose", "--list", "--only"].includes(arg)) usage(`unknown option ${arg}`);
}
const bail = args.includes("--bail");
const verbose = args.includes("--verbose");

const selected = only
  ? gates.filter(
      (g) =>
        g.name.toLowerCase().includes(only.toLowerCase()) ||
        g.script.toLowerCase().includes(only.toLowerCase()),
    )
  : gates;
if (selected.length === 0) usage(`no gate matches "${only}"`);

if (args.includes("--list")) {
  for (const [i, g] of gates.entries()) {
    console.log(`${String(i + 1).padStart(2)}. ${g.name}\n    node ${[g.script, ...(g.args ?? [])].join(" ")}`);
  }
  process.exit(0);
}

// --- environment note ------------------------------------------------------------------
const nvmrcPath = join(root, ".nvmrc");
const wantMajor = existsSync(nvmrcPath)
  ? Number.parseInt(readFileSync(nvmrcPath, "utf8").trim().replace(/^v/, ""), 10)
  : null;
const haveMajor = Number.parseInt(process.versions.node, 10);
console.log(
  `node v${process.versions.node}` +
    (wantMajor && wantMajor !== haveMajor
      ? ` — CI runs Node ${wantMajor}; results on other versions can differ`
      : ""),
);

// --- run -------------------------------------------------------------------------------
const indent = (text) => text.split("\n").map((line) => `    ${line}`).join("\n");

function runGate(gate) {
  const started = Date.now();
  const result = spawnSync(process.execPath, [join(root, gate.script), ...(gate.args ?? [])], {
    cwd: root,
    encoding: "utf8",
    timeout: 5 * 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trimEnd();
  const ok = result.status === 0 && !result.error;
  const reason = result.error
    ? result.error.code === "ETIMEDOUT"
      ? "timed out"
      : result.error.message
    : `exit ${result.status}${result.signal ? ` (${result.signal})` : ""}`;
  return { ok, output, reason, seconds: ((Date.now() - started) / 1000).toFixed(1) };
}

const failures = [];
let passed = 0;
const started = Date.now();

// A test file that no gate runs would silently never run in CI either.
if (!only) {
  const registered = new Set(gates.map((g) => g.script));
  const unregistered = readdirSync(join(root, "scripts"))
    .filter((file) => file.endsWith(".test.mjs"))
    .map((file) => `scripts/${file}`)
    .filter((script) => !registered.has(script));
  if (unregistered.length > 0) {
    failures.push("Every scripts/*.test.mjs is registered");
    console.log(`✗ Every scripts/*.test.mjs is registered — add to the gates in scripts/test-all.mjs:`);
    console.log(indent(unregistered.join("\n")));
    if (bail) process.exit(1);
  }
}

for (const gate of selected) {
  if (inCI) console.log(`::group::${gate.name}`);
  const r = runGate(gate);
  if (inCI) {
    if (r.output) console.log(r.output);
    console.log("::endgroup::");
    if (!r.ok) console.log(`::error title=${gate.name}::${r.reason}`);
  }
  console.log(`${r.ok ? "✓" : "✗"} ${gate.name} (${r.seconds}s)${r.ok ? "" : ` — ${r.reason}`}`);
  if (!inCI && r.output && (verbose || !r.ok)) {
    const lines = r.output.split("\n");
    const shown = verbose ? lines : lines.slice(-60);
    if (shown.length < lines.length) console.log(indent(`… ${lines.length - shown.length} earlier lines hidden; use --verbose`));
    console.log(indent(shown.join("\n")));
  }

  if (r.ok) {
    passed++;
    continue;
  }
  failures.push(gate.name);
  if (gate.hard) {
    console.log(`\nStopping: ${gate.name} gates everything else.`);
    process.exit(1);
  }
  if (bail) break;
}

const total = ((Date.now() - started) / 1000).toFixed(1);
if (failures.length === 0) {
  console.log(`\nAll ${passed} gates passed in ${total}s`);
} else {
  console.log(`\n${passed} passed, ${failures.length} failed in ${total}s:`);
  for (const name of failures) console.log(`  ✗ ${name}`);
  process.exit(1);
}
