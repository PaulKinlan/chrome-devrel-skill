#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkPacket, initPacket, updatePacket } from "./packet.mjs";

const here = dirname(fileURLToPath(import.meta.url));

const root = mkdtempSync(join(tmpdir(), "chrome-devrel-packet-test-"));

try {
  // 1. Initialize packet with mock online ChromeStatus response
  const mockFetch = async () => ({
    ok: true,
    status: 200,
    async text() {
      return `)]}'\n${JSON.stringify({
        name: "Connection Allowlists",
        summary: "Allow origins to restrict outbound connections via policy.",
        browsers: { chrome: { desktop: 150 } },
      })}`;
    },
  });

  const initialized = await initPacket({
    dir: root,
    id: "5175745573945344",
    stage: "01-incubation",
    online: true,
    fetchImpl: mockFetch,
  });
  assert.equal(initialized.feature.name, "Connection Allowlists");
  assert.equal(initialized.feature.targetMilestone, 150);
  assert.equal(initialized.evidence.length, 1);
  assert.equal(initialized.evidence[0].id, "E1");

  // 2. Check initial readiness for 01-incubation (should remain-in-phase because problemValidity is still unknown)
  const initialCheck = await checkPacket({ dir: root, toPhase: "01-incubation" });
  assert.equal(initialCheck.recommendation, "remain-in-phase");
  assert.ok(initialCheck.missingEvidence.some((m) => m.includes("problemValidity")));

  // 3. Update packet with supported problemValidity, a risk R1, and a friction item F1
  const updated = await updatePacket({
    dir: root,
    summary: "Linked E1 to problemValidity and logged initial risk R1 and friction F1.",
    patch: {
      readiness: {
        problemValidity: {
          status: "supported",
          rationale: "Developer problem confirmed via ChromeStatus and public issue reports.",
          evidenceIds: ["E1"],
        },
      },
      risks: [
        {
          id: "R1",
          summary: "Header syntax could conflict with existing CSP reporting.",
          severity: "high",
          status: "open",
          owner: "eng-owner",
        },
      ],
      friction: [
        {
          id: "F1",
          summary: "DevTools console error lacks clear policy directive name.",
          category: "diagnostics",
          severity: "medium",
          status: "open",
          owner: "devtools-owner",
        },
      ],
    },
  });
  assert.deepEqual(updated.delta.addedIds, ["R1", "F1"]);

  // 4. High open risk blocks progression
  const blockedByRisk = await checkPacket({ dir: root, toPhase: "01-incubation" });
  assert.equal(blockedByRisk.recommendation, "remain-in-phase");
  assert.ok(blockedByRisk.blockers.some((b) => b.includes("OPEN_HIGH_RISK: R1")));

  // 5. Reject dropping existing IDs in strict mode or via _delete
  await assert.rejects(
    () =>
      updatePacket({
        dir: root,
        strictFullArrays: true,
        patch: { risks: [] },
      }),
    /ID_CONTINUITY_VIOLATION/,
  );
  await assert.rejects(
    () =>
      updatePacket({
        dir: root,
        patch: { friction: [{ id: "F1", _delete: true }] },
      }),
    /ID_CONTINUITY_VIOLATION/,
  );

  // 6. Mitigate R1 and verify F1 -> 01-incubation gate passes!
  await updatePacket({
    dir: root,
    summary: "Mitigated R1 and verified F1.",
    patch: {
      risks: [
        {
          id: "R1",
          summary: "Header syntax could conflict with existing CSP reporting.",
          severity: "high",
          status: "mitigated",
          owner: "eng-owner",
          mitigation: "Separated Reporting-Endpoints token parsing.",
        },
      ],
      friction: [
        {
          id: "F1",
          summary: "DevTools console error lacks clear policy directive name.",
          category: "diagnostics",
          severity: "medium",
          status: "verified",
          owner: "devtools-owner",
        },
      ],
    },
  });

  const passedCheck = await checkPacket({ dir: root, toPhase: "01-incubation" });
  assert.equal(passedCheck.recommendation, "progress", JSON.stringify(passedCheck));

  const md = readFileSync(join(root, "PACKET.md"), "utf8");
  assert.ok(md.includes("Connection Allowlists"));
  assert.ok(md.includes("`E1`"));
  assert.ok(md.includes("`R1`"));
  assert.ok(md.includes("`F1`"));

  // 7. A malformed patch is rejected by a stable code, and the packet files stay
  //    byte-for-byte identical. Before PATCH_UNKNOWN_KEY a mistyped key such as "risk"
  //    "succeeded" with an empty delta and recorded nothing.
  const snapshot = () =>
    `${readFileSync(join(root, "packet.json"), "utf8")}\n---\n${readFileSync(join(root, "PACKET.md"), "utf8")}`;
  const untouched = snapshot();
  const validRisk = { id: "R2", summary: "s", severity: "low", status: "open", owner: "o" };
  for (const [label, patch, pattern] of [
    ["mistyped collection key", { risk: [validRisk] }, /PATCH_UNKNOWN_KEY.*"risk"/],
    ["tool-managed history", { history: [] }, /PATCH_UNKNOWN_KEY.*"history"/],
    ["tool-managed schemaVersion", { schemaVersion: 2 }, /PATCH_UNKNOWN_KEY.*"schemaVersion"/],
    ["array instead of object", [validRisk], /PATCH_INVALID/],
    ["null patch", null, /PATCH_INVALID/],
    ["collection given as an object", { risks: validRisk }, /PATCH_INVALID.*"risks" must be an array/],
    ["feature given as a string", { feature: "owner" }, /PATCH_INVALID.*"feature" must be an object/],
    ["null jobs", { jobs: null }, /PATCH_INVALID.*"jobs" must be an object/],
    ["schema: severity outside the enum", { risks: [{ ...validRisk, severity: "catastrophic" }] }, /JSON_SCHEMA.*\/risks\/\d+\/severity/],
    ["schema: id shape", { risks: [{ ...validRisk, id: "risk-two" }] }, /JSON_SCHEMA.*\/risks\/\d+\/id/],
    ["schema: required fields missing", { risks: [{ id: "R2" }] }, /JSON_SCHEMA.*required property missing/],
  ]) {
    await assert.rejects(() => updatePacket({ dir: root, patch }), pattern, label);
    assert.equal(snapshot(), untouched, `${label}: a rejected update must not modify the packet`);
  }

  // 8. A corrupt packet.json is reported with its path, for every command that reads it
  const broken = join(root, "broken");
  mkdirSync(broken);
  writeFileSync(join(broken, "packet.json"), "{not json");
  for (const run of [
    () => checkPacket({ dir: broken }),
    () => updatePacket({ dir: broken, patch: {} }),
  ]) {
    await assert.rejects(run, (error) => {
      assert.ok(error.message.includes(join(broken, "packet.json")), error.message);
      assert.match(error.message, /not valid JSON/);
      return true;
    });
  }

  // 9. The CLI reports an expected failure as one readable line, never a stack trace,
  //    and keeps its exit codes: 1 for a failed command, 2 for a usage error.
  const cli = (...args) =>
    spawnSync(process.execPath, [join(here, "packet.mjs"), ...args], { encoding: "utf8", timeout: 60_000 });
  const patchFile = join(root, "patch.json");

  writeFileSync(patchFile, JSON.stringify({ risk: [validRisk] }));
  const mistyped = cli("update", "--dir", root, "--patch", patchFile);
  assert.equal(mistyped.status, 1, mistyped.stderr);
  assert.match(mistyped.stderr, /^packet: PATCH_UNKNOWN_KEY/);
  assert.doesNotMatch(mistyped.stderr, /\n\s+at /, "an expected failure must not print a stack trace");
  assert.equal(mistyped.stdout, "");
  assert.equal(snapshot(), untouched, "a rejected CLI update must not modify the packet");

  writeFileSync(patchFile, "{oops");
  const unreadable = cli("update", "--dir", root, "--patch", patchFile);
  assert.equal(unreadable.status, 1, unreadable.stderr);
  assert.ok(unreadable.stderr.includes(patchFile), "the unreadable patch file is named");
  assert.doesNotMatch(unreadable.stderr, /\n\s+at /);

  writeFileSync(patchFile, "null");
  const nullPatch = cli("update", "--dir", root, "--patch", patchFile, "--stage", "02-prototype");
  assert.equal(nullPatch.status, 1, nullPatch.stderr);
  assert.match(nullPatch.stderr, /^packet: PATCH_INVALID/, "--stage must not turn a null patch into a TypeError");

  writeFileSync(
    patchFile,
    JSON.stringify({ questions: [{ id: "Q1", question: "Which origins need the header?", status: "open", owner: "o" }] }),
  );
  const accepted = cli("update", "--dir", root, "--patch", patchFile, "--summary", "Logged Q1 via the CLI.");
  assert.equal(accepted.status, 0, accepted.stderr);
  const acceptedReport = JSON.parse(accepted.stdout);
  assert.equal(acceptedReport.status, "updated");
  assert.deepEqual(acceptedReport.delta.addedIds, ["Q1"]);

  assert.equal(cli("check", "--dir", join(root, "does-not-exist")).status, 1, "a missing packet is a failed command");
  assert.equal(cli("check", "--dir", root, "--to-phase", "99-nonsense").status, 1);
  assert.equal(cli("frobnicate", "--dir", root).status, 2, "unknown subcommand is a usage error");
  assert.equal(cli("update").status, 2, "--dir is required");

  console.log("Feature packet CLI: init, continuity guard, patch validation, corrupt-file reporting, CLI failure output, readiness check, and markdown render passed");
} finally {
  rmSync(root, { recursive: true, force: true });
}
