#!/usr/bin/env node
// evals/run.mjs — durable independent eval runner for the Chrome DevRel skill.
//
// Design goals (see evals/README.md "Independent eval runner"):
//   * Fresh responder context per case, loading ONLY the skill (a staged copy
//     that physically excludes evals/ and scripts/, so the responder cannot read
//     the rubric, expected answers, or prior scores).
//   * Separate fresh judge context per case, blind to the responder's identity,
//     session, model, and provider; scores observable behavior only.
//   * Fixed inputs (cases.json, rubric.json) pinned by SHA-256 for the whole run.
//   * Atomic outputs, per-case hard timeouts, bounded retries, resume.
//   * Honest blocked/unscored states; a numeric score is NEVER proof of
//     correctness and is recorded with an explicit caveat.
//   * Provenance recorded per phase (provider/model/pid/timestamps/raw sha256);
//     a result is "independent" only when responder and judge are distinct
//     fresh-context invocations.
//   * Portable and secret-safe: ROOT is derived from this file's location; no
//     hard-coded home paths; no credentials are read, stored, or logged. The
//     `pi` CLI handles auth from its own configuration.
//
// No third-party dependencies. Node >= 18.

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  cp,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const EVALS = join(ROOT, "evals");
const RUNNER_VERSION = 1;

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const out = {
    run: null,
    cases: [],
    all: false,
    pilot: false,
    list: false,
    dryRun: false,
    force: [], // case ids to force re-run even if complete
    responderModel: process.env.EVAL_RESPONDER_MODEL || "zai/glm-5.2",
    judgeModel: process.env.EVAL_JUDGE_MODEL || "anthropic/claude-haiku-4",
    responderThinking: process.env.EVAL_RESPONDER_THINKING || "medium",
    responderTools: process.env.EVAL_RESPONDER_TOOLS || "read",
    responderTimeout: Number(process.env.EVAL_RESPONDER_TIMEOUT || 600),
    judgeTimeout: Number(process.env.EVAL_JUDGE_TIMEOUT || 300),
    attempts: Number(process.env.EVAL_ATTEMPTS || 2),
    piBin: process.env.EVAL_PI_BIN || "pi",
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "--run": out.run = next(); break;
      case "--case": out.cases.push(...next().split(",").map((s) => s.trim()).filter(Boolean)); break;
      case "--all": out.all = true; break;
      case "--pilot": out.pilot = true; break;
      case "--list": out.list = true; break;
      case "--dry-run": out.dryRun = true; break;
      case "--force": out.force.push(...next().split(",").map((s) => s.trim()).filter(Boolean)); break;
      case "--responder-model": out.responderModel = next(); break;
      case "--judge-model": out.judgeModel = next(); break;
      case "--responder-thinking": out.responderThinking = next(); break;
      case "--responder-tools": out.responderTools = next(); break;
      case "--responder-timeout": out.responderTimeout = Number(next()); break;
      case "--judge-timeout": out.judgeTimeout = Number(next()); break;
      case "--attempts": out.attempts = Number(next()); break;
      case "--pi-bin": out.piBin = next(); break;
      case "-h": case "--help": out.help = true; break;
      default:
        if (a.startsWith("--")) { console.error(`unknown option: ${a}`); process.exit(2); }
    }
  }
  return out;
}

const HELP = `Usage: node evals/run.mjs --run <RUN_ID> [--case a,b | --pilot | --all]
                [--responder-model provider/id] [--judge-model provider/id]
                [--responder-thinking medium] [--responder-timeout 600]
                [--judge-timeout 300] [--attempts 2] [--force a,b] [--dry-run] [--list]

Eligibility:
  --case a,b,c   run exactly these case ids (must exist in cases.json)
  --pilot        run the small representative pilot set
  --all          run every case in cases.json (fixed denominator)

Independence:
  responder and judge are separate fresh-context 'pi -p' invocations.
  Defaults: responder=zai/glm-5.2 (skill's intended model), judge=anthropic/claude-haiku-4.
  Override either with --responder-model / --judge-model or
  EVAL_RESPONDER_MODEL / EVAL_JUDGE_MODEL. The judge is blind to the responder's identity.
  Responder tools default to 'read' (modules only, no web) — use --responder-tools
  to widen (e.g. for research-heavy cases that need search).

Env: EVAL_PI_BIN (default 'pi'); EVAL_* overrides for all of the above.
`;

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

async function atomicWrite(path, data) {
  await mkdir(join(path, ".."), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tmp, data);
  await rename(tmp, path);
}
const atomicWriteJSON = (path, obj) => atomicWrite(path, JSON.stringify(obj, null, 2) + "\n");

function splitModel(spec) {
  // "provider/id" or "provider/id:thinking" or bare "id"
  let thinking = null;
  let core = spec;
  const ti = spec.lastIndexOf(":thinking:");
  // pi uses "provider/id:high" form; we keep thinking separate via flag instead.
  if (spec.includes("/")) {
    const [provider, ...rest] = spec.split("/");
    return { provider, model: rest.join("/") };
  }
  return { provider: null, model: spec };
}

function nowIso() { return new Date().toISOString(); }

// Spawn a process group, capture stdout/stderr, kill the whole group on timeout.
function runTimed(bin, args, { timeoutMs, captureDir, label }) {
  return new Promise((resolveP) => {
    const startedAt = nowIso();
    const startMs = Date.now();
    let out = "";
    let err = "";
    let timedOut = false;
    let exited = false;
    const child = spawn(bin, args, {
      stdio: ["ignore", "pipe", "pipe"],
      detached: true, // new process group so we can kill children
      env: { ...process.env },
    });
    const pid = child.pid;
    const outChunks = [];
    const errChunks = [];
    child.stdout.on("data", (d) => outChunks.push(d));
    child.stderr.on("data", (d) => errChunks.push(d));
    const timer = setTimeout(() => {
      timedOut = true;
      try { process.kill(-pid, "SIGTERM"); } catch {}
      setTimeout(() => { try { process.kill(-pid, "SIGKILL"); } catch {} }, 5000);
    }, timeoutMs);
    child.on("error", (e) => {
      if (exited) return; exited = true;
      clearTimeout(timer);
      resolveP({ ok: false, pid, startedAt, endedAt: nowIso(), durationMs: Date.now() - startMs, exitCode: null, signal: null, timedOut: false, spawnError: String(e), stdout: "", stderr: String(e) });
    });
    child.on("close", (code, signal) => {
      if (exited) return; exited = true;
      clearTimeout(timer);
      out = Buffer.concat(outChunks).toString("utf8");
      err = Buffer.concat(errChunks).toString("utf8");
      resolveP({
        ok: !timedOut && code === 0,
        pid, startedAt, endedAt: nowIso(), durationMs: Date.now() - startMs,
        exitCode: code, signal, timedOut, spawnError: null, stdout: out, stderr: err,
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Fixed inputs
// ---------------------------------------------------------------------------
async function loadFixedInputs() {
  const casesDoc = JSON.parse(await readFile(join(EVALS, "cases.json"), "utf8"));
  const rubric = JSON.parse(await readFile(join(EVALS, "rubric.json"), "utf8"));
  const judgeInstructions = await readFile(join(EVALS, "judge-instructions.md"), "utf8");
  const casesBytes = await readFile(join(EVALS, "cases.json"), "utf8");
  const rubricBytes = await readFile(join(EVALS, "rubric.json"), "utf8");
  return {
    casesDoc, rubric, judgeInstructions,
    casesSha256: sha256(casesBytes),
    rubricSha256: sha256(rubricBytes),
  };
}

// ---------------------------------------------------------------------------
// Responder skill staging (leakage prevention)
// ---------------------------------------------------------------------------
// Only these top-level entries are staged. evals/, scripts/, retrospectives/,
// .git, .gitignore, .pi are deliberately excluded so a responder can never read
// the rubric, expected answers, prior scores, or run tooling.
const SKILL_ALLOWLIST = [
  "SKILL.md", "README.md", "CODE_OF_CONDUCT.md", "LICENSE",
  "modules", "phases", "research", "templates", "schemas",
];

async function stageResponderSkill(destDir) {
  await rm(destDir, { recursive: true, force: true });
  await mkdir(destDir, { recursive: true });
  for (const entry of SKILL_ALLOWLIST) {
    const src = join(ROOT, entry);
    if (!existsSync(src)) continue;
    await cp(src, join(destDir, entry), { recursive: true });
  }
  // Defensive: assert no evals/scripts leaked into staging.
  for (const banned of ["evals", "scripts", "retrospectives"]) {
    if (existsSync(join(destDir, banned))) {
      throw new Error(`staging leakage: ${banned} present in responder skill`);
    }
  }
  return destDir;
}

// ---------------------------------------------------------------------------
// Prompt assembly
// ---------------------------------------------------------------------------
function buildResponderPrompt(casePrompt) {
  // Fair, answer-neutral harness framing: produce a complete autonomous
  // response. Does not reveal any rubric, expected, forbidden, or evaluation.
  return [
    "You are operating with the Chrome DevRel skill loaded. A colleague has sent",
    "you the request below. Produce your complete, autonomous DevRel response as",
    "the skill directs: perform the diagnosis, assessment, challenge, and plan,",
    "and produce any requested artifact in full.",
    "",
    "Because this is a non-interactive context, do not block on clarifying",
    "questions. If you would normally interrogate first, state those questions",
    "and your working assumptions explicitly, then proceed to the full response.",
    "Keep every label the skill defines (fact / signal / commitment / hypothesis",
    "/ recommendation / unknown / contradiction) distinct, and never invent",
    "evidence, sources, commitments, positions, metrics, or approvals.",
    "",
    "---- REQUEST START ----",
    casePrompt,
    "---- REQUEST END ----",
  ].join("\n");
}

function buildJudgePrompt({ rubric, judgeInstructions, testCase, candidateResponse }) {
  const fixtures = {
    focus: testCase.focus,
    expected: testCase.expected,
    forbidden: testCase.forbidden,
  };
  const criticalFailures = rubric.criticalFailures.map((d, i) => ({ index: i, description: d }));
  const rubricSubset = {
    scale: rubric.scale,
    focusDimensions: rubric.dimensions.filter((d) => fixtures.focus.includes(d.id)),
    criticalFailures,
  };
  return [
    judgeInstructions.trim(),
    "",
    "## Rubric (fixed for this case)",
    "",
    "```json",
    JSON.stringify(rubricSubset, null, 2),
    "```",
    "",
    "## Case fixtures (score against these only)",
    "",
    "```json",
    JSON.stringify(fixtures, null, 2),
    "```",
    "",
    "## Candidate response (anonymous; you know nothing about its origin)",
    "",
    "```",
    candidateResponse,
    "```",
    "",
    "Now emit the JSON object described in your instructions. Score only the",
    "dimensions in the focus list, one critical-failure entry per item in order,",
    "one forbidden and one expected entry per item in order. Nothing else.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Judge output parsing (robust to fences / surrounding prose)
// ---------------------------------------------------------------------------
function extractJsonObject(text) {
  if (!text) return null;
  // strip markdown code fences
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeVerdict({ testCase, parsed, responder, judge }) {
  const errors = [];
  const focus = testCase.focus || [];
  const focusScores = {};
  const scoreRationale = {};
  const unableToScore = Array.isArray(parsed?.unableToScore) ? parsed.unableToScore : [];

  for (const dim of focus) {
    if (unableToScore.includes(dim)) continue;
    const raw = parsed?.focusScores?.[dim];
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > 4) {
      errors.push(`focus dimension ${dim}: missing or invalid score (${JSON.stringify(raw)})`);
      continue;
    }
    focusScores[dim] = n;
    scoreRationale[dim] = typeof parsed?.scoreRationale?.[dim] === "string"
      ? parsed.scoreRationale[dim] : "";
  }

  const scoredDims = Object.keys(focusScores);
  const total = scoredDims.reduce((a, k) => a + focusScores[k], 0);
  const maxTotal = focus.length * 4;
  // average on the 0-4 scale (mean over scored dimensions), matching prior result format
  const average = scoredDims.length ? total / scoredDims.length : null;

  const criticalFailures = Array.isArray(parsed?.criticalFailures)
    ? parsed.criticalFailures : [];
  const criticalHits = criticalFailures.filter((c) => c && c.hit === true);
  const capped = criticalHits.length > 0;

  const expectedBehaviors = Array.isArray(parsed?.expectedBehaviors)
    ? parsed.expectedBehaviors : [];
  const forbiddenBehaviors = Array.isArray(parsed?.forbiddenBehaviors)
    ? parsed.forbiddenBehaviors : [];
  const expectedMetCount = expectedBehaviors.filter((e) => e && e.met === true).length;
  const forbiddenPresentCount = forbiddenBehaviors.filter((f) => f && f.present === true).length;

  return {
    focusScores,
    scoreRationale,
    unableToScore,
    total,
    maxTotal,
    average: average !== null ? Number(average.toFixed(3)) : null,
    averageLabel: average !== null ? `${total}/${maxTotal}` : "n/a",
    capped,
    criticalHitCount: criticalHits.length,
    criticalFailures,
    expectedBehaviors,
    expectedMetCount,
    forbiddenBehaviors,
    forbiddenPresentCount,
    confidence: typeof parsed?.confidence === "string" ? parsed.confidence : "unknown",
    parseErrors: errors,
    denominator: {
      focusScored: scoredDims.length,
      focusTotal: focus.length,
      focusUnable: unableToScore.length,
      criticalAssessed: criticalFailures.length,
      criticalTotal: testCase ? (testCase.focus ? 1 : 1) : 1, // filled by caller
    },
  };
}

// ---------------------------------------------------------------------------
// Per-case pipeline
// ---------------------------------------------------------------------------
async function runResponder({ opts, fixed, runDir, stagedSkill, testCase }) {
  const logBase = join(runDir, "worker", "logs", `${testCase.id}.responder`);
  const prompt = buildResponderPrompt(testCase.prompt);
  let last = null;
  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    const args = [
      "-p", "--no-session", "--no-context-files", "--no-extensions",
      "--model", opts.responderModel,
      "--thinking", opts.responderThinking,
      "--tools", opts.responderTools,
      "--skill", stagedSkill,
      prompt,
    ];
    const res = await runTimed(opts.piBin, args, {
      timeoutMs: opts.responderTimeout * 1000,
      label: `${testCase.id} responder a${attempt}`,
    });
    await atomicWrite(`${logBase}.attempt-${attempt}.out.txt`, res.stdout || "");
    await atomicWrite(`${logBase}.attempt-${attempt}.err.log`,
      `exit=${res.exitCode} signal=${res.signal} timedOut=${res.timedOut} spawnError=${res.spawnError || ""} pid=${res.pid} durationMs=${res.durationMs}\n` +
      `startedAt=${res.startedAt} endedAt=${res.endedAt}\n--- stderr ---\n${res.stderr || ""}\n`);
    last = { attempt, ...res };
    if (res.ok && (res.stdout || "").trim()) return last;
  }
  return last; // last failed attempt
}

async function runJudge({ opts, fixed, runDir, testCase, candidateResponse }) {
  const logBase = join(runDir, "worker", "logs", `${testCase.id}.judge`);
  const prompt = buildJudgePrompt({
    rubric: fixed.rubric,
    judgeInstructions: fixed.judgeInstructions,
    testCase,
    candidateResponse,
  });
  let last = null;
  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    const args = [
      "-p", "--no-session", "--no-context-files", "--no-extensions",
      "--model", opts.judgeModel,
      "--tools", "",
      prompt,
    ];
    const res = await runTimed(opts.piBin, args, {
      timeoutMs: opts.judgeTimeout * 1000,
      label: `${testCase.id} judge a${attempt}`,
    });
    await atomicWrite(`${logBase}.attempt-${attempt}.out.txt`, res.stdout || "");
    await atomicWrite(`${logBase}.attempt-${attempt}.err.log`,
      `exit=${res.exitCode} signal=${res.signal} timedOut=${res.timedOut} spawnError=${res.spawnError || ""} pid=${res.pid} durationMs=${res.durationMs}\n` +
      `startedAt=${res.startedAt} endedAt=${res.endedAt}\n--- stderr ---\n${res.stderr || ""}\n`);
    last = { attempt, ...res };
    if (res.ok) {
      const parsed = extractJsonObject(res.stdout || "");
      if (parsed) return { ...last, parsed };
    }
  }
  return last; // last failed attempt (parsed may be null)
}

function provenanceOk(responder, judge) {
  // Independent only if distinct fresh-context invocations.
  if (!responder || !judge) return false;
  if (!responder.pid || !judge.pid) return false;
  if (responder.pid === judge.pid) return false;
  // --no-session means no shared session; distinct pid + distinct start suffices.
  if (!responder.startedAt || !judge.startedAt) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Human-readable result
// ---------------------------------------------------------------------------
function renderResultMd({ testCase, opts, runId, normalized, responder, judge }) {
  const v = normalized;
  const status = v.status;
  const lines = [];
  lines.push(`# Eval result: \`${testCase.id}\``);
  lines.push("");
  lines.push(`**Status: ${status.toUpperCase()}** — independent fresh-context responder + separate fresh-context judge.`);
  lines.push("");
  lines.push(`**Case:** ${testCase.title}  `);
  lines.push(`**Run:** \`${runId}\`  `);
  lines.push(`**Date:** ${responder?.startedAt || nowIso()}`);
  lines.push("");
  lines.push("## Provenance");
  lines.push("");
  lines.push("| Role | Provider | Model | PID | Started | Ended | Duration |");
  lines.push("| ---- | -------- | ----- | --- | ------- | ----- | -------- |");
  const row = (label, p, meta) => {
    const { provider, model } = splitModel(meta || "");
    lines.push(`| ${label} | ${provider || "?"} | ${model || "?"} | ${p?.pid || "-"} | ${p?.startedAt || "-"} | ${p?.endedAt || "-"} | ${p?.durationMs || "-"}ms |`);
  };
  row("Responder", responder, opts.responderModel);
  row("Judge", judge, opts.judgeModel);
  lines.push("");
  lines.push(`- **Independent contexts:** ${v.independentContext ? "yes (distinct PIDs, separate `--no-session` invocations)" : "NO — see residual risks"}`);
  lines.push(`- **Responder saw the skill only** (staged copy excludes evals/scripts); **judge saw only the rubric, this case's fixtures, and the anonymized response.**`);
  lines.push("");
  lines.push("> Caveat: scores below are rubric judgments of observable behavior. They are NOT factual verification of the response and do not prove the response is correct. Process success is not proof of correctness.");
  lines.push("");
  if (status === "blocked") {
    lines.push("## Blocked");
    lines.push("");
    lines.push("The responder did not produce usable output after all attempts (timeout, non-zero exit, or empty). No judgment was attempted. The case remains unscored and is safe to resume.");
    lines.push("");
    lines.push(`Last responder attempt: exit=${responder?.exitCode} timedOut=${responder?.timedOut}. See \`worker/logs/${testCase.id}.responder.*\`.`);
    return lines.join("\n");
  }
  if (status === "unscored") {
    lines.push("## Unscored");
    lines.push("");
    lines.push("A responder output was retained, but the judge did not produce a parseable, schema-conformant verdict after all attempts. No scores are invented. The case remains unscored and is safe to resume.");
    lines.push("");
    if (v.parseErrors?.length) {
      lines.push("Parse errors:");
      for (const e of v.parseErrors) lines.push(`- ${e}`);
    }
    return lines.join("\n");
  }
  // complete
  lines.push("## Focus dimensions (0–4)");
  lines.push("");
  lines.push("| Dimension | Score | Rationale |");
  lines.push("| --------- | ----- | --------- |");
  for (const dim of testCase.focus) {
    if (v.unableToScore.includes(dim)) {
      lines.push(`| ${dim} | unscored | judge could not determine |`);
    } else {
      lines.push(`| ${dim} | ${v.focusScores[dim] ?? "?"} | ${(v.scoreRationale[dim] || "").replace(/\|/g, "\\|")} |`);
    }
  }
  lines.push("");
  lines.push(`**Total: ${v.averageLabel}** across ${v.denominator.focusTotal} focus dimensions ` +
    `(${v.denominator.focusScored} scored, ${v.denominator.focusUnable} unable). ` +
    `Average ${v.average != null ? v.average.toFixed(2) : "n/a"}/4.0.`);
  if (v.capped) {
    lines.push("");
    lines.push(`**CAPPED by ${v.criticalHitCount} critical failure(s).** Per scoring policy a critical failure caps the result regardless of aggregate score.`);
  }
  lines.push("");
  lines.push("### Expected behaviors");
  lines.push("");
  lines.push("| Behavior | Met? |");
  lines.push("| -------- | ---- |");
  for (const e of (v.expectedBehaviors)) {
    lines.push(`| ${(e.behavior || "").replace(/\|/g, "\\|")} | ${e.met ? "yes" : "no"} |`);
  }
  lines.push("");
  lines.push("### Forbidden behaviors");
  lines.push("");
  lines.push("| Behavior | Present? |");
  lines.push("| -------- | -------- |");
  for (const f of (v.forbiddenBehaviors)) {
    lines.push(`| ${(f.behavior || "").replace(/\|/g, "\\|")} | ${f.present ? "YES" : "no"} |`);
  }
  lines.push("");
  if (v.criticalFailures.some((c) => c.hit)) {
    lines.push("### Critical failures triggered");
    lines.push("");
    for (const c of v.criticalFailures) {
      if (c.hit) lines.push(`- ${c.description} — _evidence: ${(c.evidence || "(none cited)").replace(/\n/g, " ")}_`);
    }
    lines.push("");
  }
  lines.push(`Judge confidence: ${v.confidence || "unknown"}.`);
  lines.push("");
  lines.push(`Raw responder output: \`worker/logs/${testCase.id}.responder.attempt-${responder?.attempt}.out.txt\`. ` +
    `Raw judge output: \`worker/logs/${testCase.id}.judge.attempt-${judge?.attempt}.out.txt\`.`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Eligibility
// ---------------------------------------------------------------------------
const PILOT_CASES = [
  "partner-interest-is-not-shipping",
  "governance-routing-and-measurement-design",
  "artifact-first-weak-evidence",
];

function resolveEligible(casesDoc, opts) {
  const allIds = casesDoc.cases.map((c) => c.id);
  const known = new Set(allIds);
  let chosen;
  if (opts.all) chosen = allIds.slice();
  else if (opts.pilot) chosen = PILOT_CASES.slice();
  else if (opts.cases.length) chosen = opts.cases.slice();
  else throw new Error("specify --case, --pilot, or --all (use --list to see cases)");
  const unknown = chosen.filter((id) => !known.has(id));
  if (unknown.length) throw new Error(`unknown case id(s): ${unknown.join(", ")}`);
  // de-dupe, preserve order
  return [...new Set(chosen)];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || !process.argv.slice(2).length) { console.log(HELP); return; }

  const fixed = await loadFixedInputs();

  if (opts.list) {
    console.log(`cases.json sha256: ${fixed.casesSha256}`);
    console.log(`rubric.json sha256: ${fixed.rubricSha256}`);
    console.log(`cases (${fixed.casesDoc.cases.length}):`);
    for (const c of fixed.casesDoc.cases) {
      const mark = PILOT_CASES.includes(c.id) ? " [pilot]" : "";
      console.log(`  - ${c.id} (${c.mode})${mark}`);
    }
    return;
  }

  const eligible = resolveEligible(fixed.casesDoc, opts);
  const today = new Date().toISOString().slice(0, 10);
  const runId = opts.run || `${today}-run`;
  const runDir = join(EVALS, "runs", runId);
  const stagedSkill = join(runDir, "worker", "responder-skill");
  await mkdir(join(runDir, "worker", "logs"), { recursive: true });
  await mkdir(join(runDir, "worker", "status"), { recursive: true });
  await mkdir(join(runDir, "worker", "normalized"), { recursive: true });
  await mkdir(join(runDir, "results"), { recursive: true });

  const runMeta = {
    runId,
    runnerVersion: RUNNER_VERSION,
    createdAt: nowIso(),
    fixedInputs: { casesSha256: fixed.casesSha256, rubricSha256: fixed.rubricSha256 },
    config: {
      responderModel: opts.responderModel,
      judgeModel: opts.judgeModel,
      responderThinking: opts.responderThinking,
      responderTools: opts.responderTools,
      judgeTools: "",
      responderTimeoutS: opts.responderTimeout,
      judgeTimeoutS: opts.judgeTimeout,
      attempts: opts.attempts,
      piBin: opts.piBin,
    },
    eligible,
    denominator: { eligible: eligible.length },
    status: { complete: 0, unscored: 0, blocked: 0, pending: eligible.length },
    cases: {},
  };

  // Stage the responder skill once (leakage-proof copy).
  if (!opts.dryRun) {
    await stageResponderSkill(stagedSkill);
    runMeta.responderSkillSha256 = sha256(await readFile(join(stagedSkill, "SKILL.md"), "utf8"));
  }

  console.log(`run: ${runId}`);
  console.log(`dir:  ${runDir}`);
  console.log(`eligible: ${eligible.length} case(s): ${eligible.join(", ")}`);
  console.log(`responder: ${opts.responderModel} (thinking ${opts.responderThinking}, tools read, timeout ${opts.responderTimeout}s)`);
  console.log(`judge:     ${opts.judgeModel} (no skill, no tools, timeout ${opts.judgeTimeout}s)`);
  console.log(`cases sha256: ${fixed.casesSha256}`);
  console.log(`rubric sha256: ${fixed.rubricSha256}`);
  if (opts.dryRun) {
    console.log("\n--dry-run: not invoking models.");
    await atomicWriteJSON(join(runDir, "run.json"), runMeta);
    return;
  }

  const byId = new Map(fixed.casesDoc.cases.map((c) => [c.id, c]));

  for (const caseId of eligible) {
    const testCase = byId.get(caseId);
    const statusPath = join(runDir, "worker", "status", `${caseId}.json`);
    const normPath = join(runDir, "worker", "normalized", `${caseId}.json`);

    // Resume: skip if already complete+valid, unless forced.
    if (!opts.force.includes(caseId) && existsSync(normPath)) {
      try {
        const existing = JSON.parse(await readFile(normPath, "utf8"));
        if (existing.status === "complete" && existing.independentContext) {
          console.log(`[${caseId}] skip (already complete+independent)`);
          runMeta.status.pending -= 1;
          runMeta.status.complete += 1;
          runMeta.cases[caseId] = { status: "complete", independent: true, resumed: true };
          continue;
        }
      } catch {}
    }

    await atomicWriteJSON(statusPath, { caseId, status: "active", updatedAt: nowIso() });
    console.log(`\n[${caseId}] responder…`);
    const responder = await runResponder({ opts, fixed, runDir, stagedSkill, testCase });
    const responderOk = !!(responder && responder.ok && (responder.stdout || "").trim());
    if (!responderOk) {
      const normalized = {
        caseId, status: "blocked", independentContext: false, runId,
        responder: responder ? phaseRecord(responder, opts.responderModel) : null,
        judge: null, caveat: "responder produced no usable output; not scored.",
      };
      await atomicWriteJSON(normPath, normalized);
      await atomicWrite(join(runDir, "results", `${caseId}.md`),
        renderResultMd({ testCase, opts, runId, normalized: { ...normalized, status: "blocked" }, responder, judge: null }));
      await atomicWriteJSON(statusPath, { caseId, status: "blocked", updatedAt: nowIso() });
      runMeta.status.pending -= 1; runMeta.status.blocked += 1;
      runMeta.cases[caseId] = { status: "blocked", independent: false };
      console.log(`[${caseId}] BLOCKED (no usable responder output)`);
      continue;
    }
    console.log(`[${caseId}] judge…`);
    const judge = await runJudge({ opts, fixed, runDir, testCase, candidateResponse: responder.stdout });
    const parsed = judge && judge.parsed !== undefined ? judge.parsed : extractJsonObject(judge?.stdout || "");
    const verdict = normalizeVerdict({ testCase, parsed, responder, judge });
    // fill critical total
    verdict.denominator.criticalTotal = fixed.rubric.criticalFailures.length;

    const independent = provenanceOk(responder, judge) && parsed !== null && !verdict.parseErrors.length;
    const scorable = parsed !== null && verdict.parseErrors.length === 0
      && verdict.denominator.focusScored === verdict.denominator.focusTotal - verdict.denominator.focusUnable;
    const status = scorable ? "complete" : "unscored";

    const normalized = {
      caseId, runId, status, independentContext: independent,
      responder: phaseRecord(responder, opts.responderModel),
      judge: judge ? phaseRecord(judge, opts.judgeModel) : null,
      responderRawSha256: sha256(responder.stdout || ""),
      judgeRawSha256: judge ? sha256(judge.stdout || "") : null,
      responderRawChars: (responder.stdout || "").length,
      verdict,
      caveat: "Scores are rubric judgments of observable behavior, not factual verification. Process success is not proof of correctness.",
    };
    await atomicWriteJSON(normPath, normalized);
    await atomicWrite(join(runDir, "results", `${caseId}.md`),
      renderResultMd({ testCase, opts, runId, normalized: { ...normalized, ...verdict, status }, responder, judge }));
    await atomicWriteJSON(statusPath, { caseId, status, updatedAt: nowIso() });

    runMeta.status.pending -= 1;
    if (status === "complete") runMeta.status.complete += 1;
    else runMeta.status.unscored += 1;
    runMeta.cases[caseId] = {
      status, independent,
      total: verdict.averageLabel, capped: verdict.capped, parseErrors: verdict.parseErrors.length,
    };
    console.log(`[${caseId}] ${status.toUpperCase()} (${verdict.averageLabel}${verdict.capped ? ", CAPPED" : ""}${!independent ? ", non-independent" : ""})`);
    runMeta.updatedAt = nowIso();
    await atomicWriteJSON(join(runDir, "run.json"), runMeta);
  }

  runMeta.updatedAt = nowIso();
  runMeta.finishedAt = nowIso();
  await atomicWriteJSON(join(runDir, "run.json"), runMeta);

  console.log("\n== run summary ==");
  console.log(JSON.stringify({
    runId, eligible: runMeta.denominator.eligible,
    complete: runMeta.status.complete, unscored: runMeta.status.unscored,
    blocked: runMeta.status.blocked, pending: runMeta.status.pending,
  }, null, 2));
  console.log(`\nValidate: node evals/validate-eval-results.mjs --run ${runId}`);
}

function phaseRecord(res, modelSpec) {
  const { provider, model } = splitModel(modelSpec);
  return {
    provider, model,
    pid: res?.pid || null,
    session: null, // --no-session: ephemeral, no shared session
    attempt: res?.attempt || null,
    startedAt: res?.startedAt || null,
    endedAt: res?.endedAt || null,
    durationMs: res?.durationMs || null,
    exitCode: res?.exitCode ?? null,
    timedOut: !!res?.timedOut,
    rawChars: (res?.stdout || "").length,
    sha256: sha256(res?.stdout || ""),
  };
}

main().catch((e) => { console.error(e); process.exit(1); });
