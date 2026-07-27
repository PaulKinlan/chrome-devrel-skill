#!/usr/bin/env node
// evals/validate-eval-results.mjs — provenance & integrity validator for
// independent eval runs produced by evals/run.mjs.
//
// Enforces the integrity guarantees the scoring policy depends on:
//   * run.json denominators and checksums are internally consistent;
//   * a result marked "complete" can only claim independence when responder and
//     judge are genuinely distinct fresh-context invocations (different PIDs,
//     no shared session, both recorded);
//   * same-context / self-judged results are rejected — they may not be labelled
//     independent, and a complete-but-non-independent result is an error;
//   * responder and judge raw outputs differ (the judge did not echo the
//     candidate response as its own verdict);
//   * the responder skill staging never includes evals/ or scripts/.
//
// This validator deliberately treats a *score* as non-proof: it never passes a
// case because its number looks good. It only checks provenance and structure.

import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const EVALS = join(ROOT, "evals");
const sha256 = (t) => createHash("sha256").update(t, "utf8").digest("hex");
const errors = [];
const checks = [];
const ok = (m) => checks.push(`✓ ${m}`);
const fail = (m) => errors.push(m);

const args = process.argv.slice(2);
const runArgIdx = args.indexOf("--run");
const runId = runArgIdx >= 0 ? args[runArgIdx + 1] : null;
let runDir = runId ? join(EVALS, "runs", runId) : null;

if (!runDir) {
  // If no run specified, validate the most recent run dir, if any.
  const runsDir = join(EVALS, "runs");
  if (existsSync(runsDir)) {
    const subs = (await readdir(runsDir, { withFileTypes: true }))
      .filter((d) => d.isDirectory()).map((d) => d.name).sort();
    if (subs.length) {
      runDir = join(runsDir, subs[subs.length - 1]);
      console.log(`no --run given; validating latest: ${runDir}`);
    }
  }
}

if (!runDir || !existsSync(join(runDir, "run.json"))) {
  console.error("usage: node evals/validate-eval-results.mjs --run <RUN_ID>");
  console.error("(no run.json found; run evals/run.mjs first)");
  process.exit(2);
}

const run = JSON.parse(await readFile(join(runDir, "run.json"), "utf8"));

// 1. Fixed inputs present and checksums recorded.
if (!run.fixedInputs?.casesSha256 || !run.fixedInputs?.rubricSha256) {
  fail("run.json missing fixedInputs checksums");
} else {
  ok(`run.json records fixed input checksums (cases ${run.fixedInputs.casesSha256.slice(0, 10)}…, rubric ${run.fixedInputs.rubricSha256.slice(0, 10)}…)`);
}
// Recompute and confirm checksums match the current files (fixed inputs unchanged).
const casesBytes = await readFile(join(EVALS, "cases.json"), "utf8");
const rubricBytes = await readFile(join(EVALS, "rubric.json"), "utf8");
if (run.fixedInputs?.casesSha256 && sha256(casesBytes) !== run.fixedInputs.casesSha256) {
  fail("cases.json changed since this run (checksum mismatch) — run is no longer reproducible against current fixtures");
} else {
  ok("cases.json checksum matches run record (fixtures unchanged)");
}
if (run.fixedInputs?.rubricSha256 && sha256(rubricBytes) !== run.fixedInputs.rubricSha256) {
  fail("rubric.json changed since this run (checksum mismatch)");
} else {
  ok("rubric.json checksum matches run record (fixtures unchanged)");
}

// 2. Denominator integrity.
const eligible = Array.isArray(run.eligible) ? run.eligible : [];
if (run.denominator?.eligible !== eligible.length) {
  fail(`denominator.eligible (${run.denominator?.eligible}) ≠ eligible.length (${eligible.length})`);
} else {
  ok(`eligible denominator exact: ${eligible.length}`);
}
const status = run.status || {};
const summed = (status.complete || 0) + (status.unscored || 0) + (status.blocked || 0) + (status.pending || 0);
if (summed !== eligible.length) {
  fail(`status counts sum (${summed}) ≠ eligible (${eligible.length})`);
} else {
  ok(`status counts sum to denominator (${summed} = ${eligible.length}): complete=${status.complete} unscored=${status.unscored} blocked=${status.blocked} pending=${status.pending}`);
}

// 3. Responder skill staging must exclude evals/ and scripts/.
const staged = join(runDir, "worker", "responder-skill");
for (const banned of ["evals", "scripts", "retrospectives"]) {
  if (existsSync(join(staged, banned))) {
    fail(`responder skill staging leaks ${banned}/ (responder could read answers)`);
  }
}
if (!errors.some((e) => e.includes("staging leaks"))) {
  ok("responder skill staging excludes evals/scripts/retrospectives (no answer leakage)");
}

// 4. Per-case provenance.
let completeCount = 0;
let independentCount = 0;
let nonIndependentComplete = 0;
for (const caseId of eligible) {
  const normPath = join(runDir, "worker", "normalized", `${caseId}.json`);
  if (!existsSync(normPath)) {
    if ((status.pending || 0) > 0) continue; // not yet run
    fail(`missing normalized result for ${caseId} but status has no pending`);
    continue;
  }
  const n = JSON.parse(await readFile(normPath, "utf8"));
  const r = n.responder;
  const j = n.judge;

  // status field must match a terminal state
  if (!["complete", "unscored", "blocked"].includes(n.status)) {
    fail(`${caseId}: invalid status ${n.status}`);
  }

  if (n.status === "blocked") {
    if (j) fail(`${caseId}: blocked but has a judge record (should not have been judged)`);
    continue;
  }
  if (n.status === "unscored") {
    if (!r) fail(`${caseId}: unscored but no responder record`);
    continue;
  }

  // complete: full provenance required
  completeCount++;
  if (!r || !j) { fail(`${caseId}: complete but missing responder or judge record`); continue; }

  const samePid = r.pid != null && j.pid != null && r.pid === j.pid;
  const sameSession = r.session != null && j.session != null && r.session === j.session && r.session !== null;
  if (samePid) fail(`${caseId}: responder and judge share PID ${r.pid} (same context)`);
  if (sameSession) fail(`${caseId}: responder and judge share session (same context)`);
  if (!r.provider || !r.model || !j.provider || !j.model) {
    fail(`${caseId}: missing provider/model in provenance`);
  }

  // Reject same-context / self-judged independence claims.
  const actuallyIndependent = !samePid && !sameSession && r.pid && j.pid;
  if (n.independentContext && !actuallyIndependent) {
    fail(`${caseId}: claims independentContext but provenance shows shared context — REJECTED`);
  }
  if (n.status === "complete" && !n.independentContext) {
    nonIndependentComplete++;
    fail(`${caseId}: complete but NOT independent — must not be cited as a verified baseline`);
  } else if (actuallyIndependent) {
    independentCount++;
  }

  // Judge verdict must differ from the response (not an echo).
  if (r.sha256 && j.sha256 && r.sha256 === j.sha256) {
    fail(`${caseId}: judge raw output identical to responder raw output (echo, not a judgment)`);
  }

  // Denominator recorded exactly.
  const vd = n.verdict?.denominator;
  if (!vd || vd.focusTotal !== (n.verdict?.focusScores ? Object.keys(n.verdict.focusScores).length + (vd.focusUnable || 0) : 0)) {
    // focusTotal should equal scored + unable
  }
  if (vd && vd.focusScored + (vd.focusUnable || 0) !== vd.focusTotal) {
    fail(`${caseId}: focus denominator not exact (scored ${vd.focusScored} + unable ${vd.focusUnable || 0} ≠ total ${vd.focusTotal})`);
  }
  // Caveat present (score is not proof).
  if (!n.caveat || !/not.*(fact|proof|verification)/i.test(n.caveat)) {
    fail(`${caseId}: missing 'score is not proof' caveat`);
  }
  // Critical-failure cap honoured in recorded flag.
  if (Array.isArray(n.verdict?.criticalFailures)) {
    const hits = n.verdict.criticalFailures.filter((c) => c.hit === true).length;
    if (hits > 0 && !n.verdict.capped) fail(`${caseId}: ${hits} critical failure(s) hit but verdict not capped`);
  }
}

ok(`provenance: ${completeCount} complete, ${independentCount} independent, ${nonIndependentComplete} complete-but-non-independent (must be 0)`);

// Output
for (const c of checks) console.log(c);
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
} else {
  console.log(`\nValidated eval run '${run.runId}': ${checks.length} checks, 0 errors.`);
}
