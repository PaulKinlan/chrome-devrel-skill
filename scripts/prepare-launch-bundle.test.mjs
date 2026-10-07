#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initPacket } from "./packet.mjs";
import {
  attestLaunchBundle,
  initLaunchBundle,
  refreshLaunchBundle,
  summarizeAttestation,
} from "./prepare-launch-bundle.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const packetDir = mkdtempSync(join(tmpdir(), "chrome-devrel-bundle-packet-"));
const runDir = mkdtempSync(join(tmpdir(), "chrome-devrel-bundle-run-"));

// A stand-in for the primary sources that serves `payload`, in the shapes the validator reads.
const serving = (payload) => async (url) => ({
  ok: true,
  status: 200,
  async text() {
    const body = JSON.stringify(payload);
    return String(url).includes("chromestatus.com") ? `)]}'\n${body}` : body;
  },
  async json() {
    return payload;
  },
});

try {
  // 1. Initialize a feature packet in packetDir
  await initPacket({
    dir: packetDir,
    id: "5175745573945344",
    name: "Connection Allowlists",
    stage: "06-prepare-to-ship",
    milestone: 150,
  });

  // 2. Scaffold a Phase 6 launch bundle from the feature packet
  const { manifestPath } = await initLaunchBundle({
    root: runDir,
    packetPath: join(packetDir, "packet.json"),
    contracts: ["C1", "C2", "C3"],
    surfaceToken: "ConnectionAllowlist",
    bcdPath: "/api/ConnectionAllowlist/__compat/support/chrome/version_added",
  });

  // 3. Edit an example file, then run refreshLaunchBundle to verify receipt + hash resync
  const detectPath = join(runDir, "examples/detect.html");
  const updatedDetect = readFileSync(detectPath, "utf8").replace(
    "Ready with fallback",
    "Ready with verified progressive enhancement fallback",
  );
  writeFileSync(detectPath, updatedDetect);
  await refreshLaunchBundle({ root: runDir, manifestPath });

  // 4. Attest and validate with mock primary source responses matching facts.json
  const facts = JSON.parse(readFileSync(join(runDir, "evidence/facts.json"), "utf8"));
  const mockFetch = serving(facts);

  const { result, outputPath } = await attestLaunchBundle({
    root: runDir,
    manifestPath,
    keyId: "test-parent-verifier",
    fetchImpl: mockFetch,
  });

  assert.equal(result.computedOutcome, "succeeded", JSON.stringify(result.errors, null, 2));
  assert.equal(result.diagnosticOutcome, "succeeded");
  const savedReport = JSON.parse(readFileSync(outputPath, "utf8"));
  assert.equal(savedReport.computedOutcome, "succeeded");
  assert.equal(savedReport.counts.contractTotal, 3);
  assert.equal(savedReport.counts.documentationCovered, 3);
  assert.equal(savedReport.counts.runtimeCovered, 3);

  // 5. The scaffolder's own output must fail closed. These cases attest the real bundle
  //    from steps 2-4, not a hand-built fixture, so they catch a scaffold that would let
  //    a bad bundle through. Every case runs offline against a stand-in fetch.
  const attestWith = async (fetchImpl) =>
    (
      await attestLaunchBundle({
        root: runDir,
        manifestPath,
        keyId: "test-parent-verifier",
        fetchImpl,
      })
    ).result;
  const codesOf = (outcome) => new Set((outcome.errors ?? []).map((error) => error.code));
  const describe = (outcome) => JSON.stringify(outcome.errors?.slice(0, 4), null, 2);

  // 5a. An example edited after the last refresh no longer matches the recorded hash.
  const refreshedDetect = readFileSync(detectPath, "utf8");
  writeFileSync(detectPath, `${refreshedDetect}\n<!-- edited after refresh -->`);
  const edited = await attestWith(mockFetch);
  assert.notEqual(edited.computedOutcome, "succeeded", "an edited example must not attest");
  assert.ok(codesOf(edited).has("ARTIFACT_HASH_MISMATCH"), describe(edited));
  // Restoring the file makes the same bundle attest again, so the failure came from the
  // edit and not from state the first attestation left behind.
  writeFileSync(detectPath, refreshedDetect);
  const restored = await attestWith(mockFetch);
  assert.equal(restored.computedOutcome, "succeeded", describe(restored));

  // 5b. Primary sources that disagree with the recorded claims.
  const disagreeing = await attestWith(serving({ ...facts, browsers: { chrome: { desktop: 999 } } }));
  assert.equal(disagreeing.computedOutcome, "rejected");
  assert.ok(codesOf(disagreeing).has("LIVE_CLAIM_MISMATCH"), describe(disagreeing));

  // 5c. Primary sources that cannot be read are a blocked check, never a pass.
  const unreadable = {
    "fetch rejects": async () => {
      throw new Error("ENETDOWN");
    },
    "HTTP 500": async () => ({
      ok: false,
      status: 500,
      async text() {
        return "upstream failure";
      },
      async json() {
        throw new Error("not json");
      },
    }),
    "HTML where JSON is expected": async () => ({
      ok: true,
      status: 200,
      async text() {
        return "<html>sign in to use this network</html>";
      },
      async json() {
        throw new Error("not json");
      },
    }),
  };
  for (const [label, fetchImpl] of Object.entries(unreadable)) {
    const blocked = await attestWith(fetchImpl);
    assert.equal(blocked.computedOutcome, "rejected", `${label}: ${describe(blocked)}`);
    assert.equal(blocked.diagnosticOutcome, "terminally_blocked", `${label}: ${describe(blocked)}`);
    assert.ok(codesOf(blocked).has("LIVE_SOURCE_BLOCKED"), `${label}: ${describe(blocked)}`);
  }

  // 6. What `attest` prints: quiet on success, the first ten errors otherwise.
  const quiet = summarizeAttestation({
    result: { computedOutcome: "succeeded", diagnosticOutcome: "succeeded", errors: [] },
    outputPath: "/run/acceptance-run.json",
  });
  assert.deepEqual(quiet, {
    status: "attested",
    computedOutcome: "succeeded",
    diagnosticOutcome: "succeeded",
    outputPath: "/run/acceptance-run.json",
  });

  const twelveErrors = Array.from({ length: 12 }, (_, index) => ({
    code: `E${index}`,
    path: `/artifacts/${index}`,
    message: `message ${index}`,
    detail: "x".repeat(2000),
  }));
  const loud = summarizeAttestation({
    result: { computedOutcome: "rejected", diagnosticOutcome: "rejected", errors: twelveErrors },
    outputPath: "/run/acceptance-run.json",
  });
  assert.equal(loud.errorCount, 12);
  assert.equal(loud.errors.length, 10);
  assert.deepEqual(loud.errors[0], { code: "E0", path: "/artifacts/0", message: "message 0" });
  assert.ok(loud.errors.every((error) => Object.keys(error).length === 3));

  // A rejected result with no errors array must not crash the summary.
  assert.deepEqual(
    summarizeAttestation({
      result: { computedOutcome: "rejected", diagnosticOutcome: "rejected" },
      outputPath: "/run/acceptance-run.json",
    }),
    {
      status: "attested",
      computedOutcome: "rejected",
      diagnosticOutcome: "rejected",
      outputPath: "/run/acceptance-run.json",
    },
  );

  // A real rejection, not a hand-built one, summarizes to usable entries.
  const realSummary = summarizeAttestation({
    result: disagreeing,
    outputPath: "/run/acceptance-run.json",
  });
  assert.equal(realSummary.computedOutcome, "rejected");
  assert.ok(realSummary.errorCount >= 1);
  assert.ok(
    realSummary.errors.every(
      (error) =>
        typeof error.code === "string" &&
        typeof error.path === "string" &&
        typeof error.message === "string",
    ),
    JSON.stringify(realSummary.errors),
  );

  // 7. The command line reports a bad input in one readable line that names the file,
  //    and a bad --packet leaves no run directory behind. Only commands that fail before
  //    any network call are spawned here: `attest` would reach the real primary sources.
  const cli = (...args) =>
    spawnSync(process.execPath, [join(here, "prepare-launch-bundle.mjs"), ...args], {
      encoding: "utf8",
    });
  const assertConcise = (outcome, pattern, label) => {
    const seen = `${label}\n  exit ${outcome.status}\n  stdout: ${JSON.stringify(outcome.stdout)}\n  stderr: ${JSON.stringify(outcome.stderr)}`;
    assert.equal(outcome.status, 1, seen);
    assert.match(outcome.stderr, /^prepare-launch-bundle: /, `${seen}\n  expected the tool prefix`);
    assert.match(outcome.stderr, pattern, `${seen}\n  expected ${pattern}`);
    assert.doesNotMatch(outcome.stderr, /\n\s+at /, `${seen}\n  expected no stack trace`);
    assert.equal(outcome.stdout, "", `${seen}\n  expected nothing on stdout`);
  };

  const corruptPacket = join(packetDir, "corrupt-packet.json");
  writeFileSync(corruptPacket, "{not json");
  const strayRun = join(packetDir, "run-that-must-not-exist");
  assertConcise(
    cli("init", "--root", strayRun, "--packet", corruptPacket),
    /corrupt-packet\.json is not valid JSON/,
    "init with a corrupt packet",
  );
  assert.equal(existsSync(strayRun), false, "a bad --packet must not create the run directory");

  const missingPacket = join(packetDir, "no-such-packet.json");
  assertConcise(
    cli("init", "--root", strayRun, "--packet", missingPacket),
    /no-such-packet\.json/,
    "init with a missing packet",
  );
  assert.equal(existsSync(strayRun), false, "a missing --packet must not create the run directory");

  const corruptRun = mkdtempSync(join(packetDir, "corrupt-run-"));
  writeFileSync(join(corruptRun, "launch-acceptance.json"), "{not json");
  assertConcise(
    cli("refresh", "--root", corruptRun),
    /launch-acceptance\.json is not valid JSON/,
    "refresh with a corrupt manifest",
  );

  const emptyRun = mkdtempSync(join(packetDir, "empty-run-"));
  assertConcise(
    cli("refresh", "--root", emptyRun),
    /launch-acceptance\.json/,
    "refresh with no manifest",
  );

  console.log(
    "Prepare launch bundle: packet import, receipt execution, hash refresh, online attestation, fail-closed cases, and CLI error output passed",
  );
} finally {
  rmSync(packetDir, { recursive: true, force: true });
  rmSync(runDir, { recursive: true, force: true });
}
