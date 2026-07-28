#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { computeLaunchAttestation, validateLaunchAcceptance } from "./lib/launch-acceptance.mjs";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const clone = (value) => structuredClone(value);
const startedAt = "2026-07-28T12:00:00.000Z";
const createdAt = "2026-07-28T12:15:00.000Z";
const endedAt = "2026-07-28T13:00:00.000Z";
const now = new Date("2026-07-28T13:01:00.000Z");
const attestationKey = "test-only-parent-key-that-is-longer-than-thirty-two-bytes";
const root = mkdtempSync(join(tmpdir(), "launch-acceptance-test-"));
const outsideRoot = mkdtempSync(join(tmpdir(), "launch-acceptance-outside-"));
const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const trustedDocumentationValidatorPath = join(repoRoot, "scripts/validate-documentation-example.mjs");
const schema = JSON.parse(readFileSync(join(repoRoot, "schemas/launch-acceptance.schema.json"), "utf8"));
const semanticSourcePolicy = {
  adapters: {
    "test-facts": {
      claimTypes: ["bcd-version-added", "target-milestone", "current-stable-milestone", "scheduled-stable-date", "actual-stable-release-date", "implementation-first-version"],
      hostname: "facts.example",
      pathPattern: "^/current\\.json$",
      sourcePointerPattern: "^/",
    },
  },
};

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const name = Buffer.from(type, "ascii");
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  name.copy(output, 4);
  data.copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
  return output;
};
const png = (seed) => {
  const width = 640, height = 480;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(height * (1 + width * 4));
  let value = seed;
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width * 4; x++) {
      value = (value * 1664525 + 1013904223) >>> 0;
      raw[y * (1 + width * 4) + 1 + x] = value & 0xff;
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0)),
  ]);
};

const artifacts = [];
const addArtifact = (id, path, value, { type = "evidence", mime = "application/json", producer = "parent-verifier", sessionId, testId, capturedAt = createdAt } = {}) => {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
  writeFileSync(full, bytes);
  artifacts.push({ id, path, type, mime, bytes: bytes.length, sha256: sha256(bytes), createdAt: capturedAt, producer, ...(sessionId ? { sessionId } : {}), ...(testId ? { testId } : {}) });
  return id;
};

const facts = {
  feature: { targetMilestone: 150, currentStableMilestone: 150, scheduledStableDate: "2026-07-29" },
  bcd: { api: { ExampleAPI: { __compat: { support: { chrome: { version_added: "150" } } } } } },
};
const bcdPatch = facts.bcd;
const releaseMetadata = { targetMilestone: 150, currentStableMilestone: 150, scheduledStableDate: "2026-07-29" };
addArtifact("facts", "evidence/facts.json", facts, { type: "source-snapshot" });
addArtifact("spec", "evidence/spec.json", { featureId: "feature-1", primitives: ["C1", "C2", "C3"] }, { type: "spec-snapshot", capturedAt: startedAt });
addArtifact("contract", "evidence/contract.json", { featureId: "feature-1", contractIds: ["C1", "C2", "C3"], sourceArtifactIds: ["spec"], contracts: [{ id: "C1", surfaceTokens: ["ExampleAPI"], examplePatterns: ["globalThis\\.ExampleAPI"] }, { id: "C2", surfaceTokens: ["ExampleAPI"], examplePatterns: ["globalThis\\.ExampleAPI"] }, { id: "C3", surfaceTokens: ["ExampleAPI"], examplePatterns: ["globalThis\\.ExampleAPI"] }] }, { type: "contract-manifest", capturedAt: startedAt });
addArtifact("bcd", "patches/bcd.json", bcdPatch, { type: "bcd-patch" });
addArtifact("release", "patches/release.json", releaseMetadata, { type: "release-metadata" });
const testTiming = {
  "T-before": ["2026-07-28T12:10:00.000Z", "2026-07-28T12:20:00.000Z"],
  "T-verify": ["2026-07-28T12:25:00.000Z", "2026-07-28T12:35:00.000Z"],
  "T-regression": ["2026-07-28T12:36:00.000Z", "2026-07-28T12:45:00.000Z"],
  "T-final": ["2026-07-28T12:46:00.000Z", "2026-07-28T12:55:00.000Z"],
};
const mcpCalls = [{ tool: "Browser.getVersion", result: "Chrome/150.0.1.0", at: startedAt }];
for (const [testId, [testStartedAt, testEndedAt]] of Object.entries(testTiming)) {
  const route = testId === "T-verify" ? "http://127.0.0.1/T-before" : `http://127.0.0.1/${testId}`;
  mcpCalls.push({ tool: "navigate", testId, route, at: testStartedAt });
  for (const value of ["click Run", "inspect visible result"]) mcpCalls.push({ tool: "interaction", testId, value, at: testEndedAt });
  for (const artifactId of [`${testId}-console-before`, `${testId}-console-after`]) mcpCalls.push({ tool: "console", testId, artifactId, at: testEndedAt });
  for (const artifactId of [`${testId}-network-before`, `${testId}-network-after`]) mcpCalls.push({ tool: "network", testId, artifactId, at: testEndedAt });
  mcpCalls.push({ tool: "assertion", testId, artifactId: `${testId}-assertion`, at: testEndedAt });
  mcpCalls.push({ tool: "screenshot", testId, artifactId: `${testId}-shot`, at: testEndedAt });
}
addArtifact("mcp-log", "evidence/mcp-events.json", { sessionId: "S1", browserVersion: "Chrome/150.0.1.0", calls: mcpCalls }, { type: "mcp-event-log", producer: "chrome-devtools-mcp", capturedAt: endedAt });
addArtifact("stdout", "receipts/examples.stdout.txt", "Documentation validation passed: 4 example(s) + guide, 1 contract token(s)\n", { type: "command-stdout", mime: "text/plain", producer: "command-wrapper" });
addArtifact("stderr", "receipts/examples.stderr.txt", "", { type: "command-stderr", mime: "text/plain", producer: "command-wrapper" });

const examples = [
  ["detect", "feature-detection", "examples/detect.html", ["C1"]],
  ["minimal", "minimal", "examples/minimal.html", ["C1", "C2"]],
  ["failure", "branch-failure-integration", "examples/failure.html", ["C2", "C3"]],
  ["realistic", "realistic", "examples/realistic.html", ["C1", "C2", "C3"]],
];
for (const [id, kind, path, contractIds] of examples) {
  const realisticOpen = kind === "realistic" ? '<form id="workflow"><label>Policy <input name="policy" value="default"></label>' : "<main>";
  const realisticClose = kind === "realistic" ? '<button type="reset">Reset recovery state</button></form>' : "</main>";
  addArtifact(`example-${id}`, path, `<!doctype html><meta charset="utf-8"><title>${id}</title>${realisticOpen}<h1>${id} ExampleAPI example</h1><p id="requirements">Secure context and supported Chrome build required.</p><button id="run" type="button">Run example</button><output id="status" aria-live="polite">Ready with fallback</output>${realisticClose}<script>const status=document.querySelector('#status');const supported='ExampleAPI' in globalThis;const api=globalThis.ExampleAPI;document.querySelector('#run').addEventListener('click',async()=>{if(!supported){status.value='Unsupported; fallback active';return;}try{status.value='Running';await api.run();status.value='Completed successfully';}catch(error){status.value='Error: '+error.message+'; retry or fallback';}});</script>`, { type: "documentation-example", mime: "text/html", producer: "worker" });
}
addArtifact("guide", "docs/guide.md", `# Complete ExampleAPI developer guide\n\n## Overview\nThis guide explains the developer job and support boundary.\n\n## Feature detection, setup, and fallback\nDetect the capability, declare secure-context and policy requirements, and preserve a useful unsupported path.\n\n## API and behavior inventory\nC1, C2, and C3 map to independently runnable examples. Use globalThis.ExampleAPI after feature detection.\n\n## Options, errors, and exceptions\nShow successful, denied, malformed, empty, and recovery states.\n\n## Permissions, policies, and security\nDocument user control, enterprise policy, and origin constraints.\n\n## Lifecycle and cleanup\nHandle navigation, cancellation, cleanup, and repeated use.\n\n## Server, build, framework, and deployment\nInclude exact headers, server commands, dependencies, and integration boundaries.\n\n## Compatibility and progressive enhancement\nState browser support and fallback without UA sniffing.\n\n## Accessibility, privacy, and performance\nCover keyboard, announcements, data exposure, resources, and low-end devices.\n\n## Troubleshooting and diagnostics\nExplain visible errors, console/network diagnostics, and recovery.\n\n## Realistic integration\nCompose state, controls, recovery, and adjacent APIs in a product-like flow.\n`, { type: "documentation-guide", mime: "text/markdown", producer: "worker" });
const testDefs = [
  ["T-before", "baseline", "fail", 1, ...testTiming["T-before"]],
  ["T-verify", "verification", "pass", 2, ...testTiming["T-verify"]],
  ["T-regression", "regression", "pass", 3, ...testTiming["T-regression"]],
  ["T-final", "final", "pass", 4, ...testTiming["T-final"]],
];
for (const [id, role, result, seed, testStartedAt, testEndedAt] of testDefs) {
  const common = { capturedAt: testEndedAt, producer: "chrome-devtools-mcp" };
  addArtifact(`${id}-console-before`, `evidence/${id}-console-before.json`, { sessionId: "S1", testId: id, phase: "before", entries: [] }, { type: "console-log", ...common });
  addArtifact(`${id}-console-after`, `evidence/${id}-console-after.json`, { sessionId: "S1", testId: id, phase: "after", entries: [] }, { type: "console-log", ...common });
  addArtifact(`${id}-network-before`, `evidence/${id}-network-before.json`, { sessionId: "S1", testId: id, phase: "before", entries: [] }, { type: "network-log", ...common });
  addArtifact(`${id}-network-after`, `evidence/${id}-network-after.json`, { sessionId: "S1", testId: id, phase: "after", entries: [] }, { type: "network-log", ...common });
  const route = id === "T-verify" ? "http://127.0.0.1/T-before" : `http://127.0.0.1/${id}`;
  addArtifact(`${id}-assertion`, `evidence/${id}-assertion.json`, { testId: id, sessionId: "S1", route, result, assertions: [{ id: "visible-result", passed: result === "pass", expected: "Completed successfully", actual: result === "pass" ? "Completed successfully" : "Error" }] }, { type: "assertion", capturedAt: testEndedAt });
  addArtifact(`${id}-shot`, `evidence/${id}.png`, png(seed), { type: "screenshot", mime: "image/png", producer: "chrome-devtools-mcp", sessionId: "S1", testId: id, capturedAt: testEndedAt });
}
addArtifact("target-before", "evidence/target-before.html", "<script>ExampleAPI.broken()</script>\n", { type: "changed-subject-snapshot", mime: "text/html", capturedAt: "2026-07-28T12:19:00.000Z" });
addArtifact("target-after", "evidence/target-after.html", "<script>ExampleAPI.fixed()</script>\n", { type: "changed-subject-snapshot", mime: "text/html", capturedAt: "2026-07-28T12:23:00.000Z" });
addArtifact("fix", "changes/fix.json", { subjects: [{ path: "examples/minimal.html", beforeSha256: artifacts.find((item) => item.id === "target-before").sha256, afterSha256: artifacts.find((item) => item.id === "target-after").sha256 }], summary: "Replace broken ExampleAPI call with fixed integration." }, { type: "change-record", producer: "worker", capturedAt: "2026-07-28T12:22:00.000Z" });
addArtifact("risk-acceptance", "evidence/risk-acceptance.json", { accepted: false }, { type: "authority-evidence" });

const semanticClaims = [
  ["claim-target", "target-milestone", 150, "patches/release.json", "/targetMilestone", "/feature/targetMilestone"],
  ["claim-current", "current-stable-milestone", 150, "patches/release.json", "/currentStableMilestone", "/feature/currentStableMilestone"],
  ["claim-date", "scheduled-stable-date", "2026-07-29", "patches/release.json", "/scheduledStableDate", "/feature/scheduledStableDate"],
  ["claim-bcd", "bcd-version-added", "150", "patches/bcd.json", "/api/ExampleAPI/__compat/support/chrome/version_added", "/bcd/api/ExampleAPI/__compat/support/chrome/version_added"],
].map(([id, type, value, assetPath, assetJsonPointer, jsonPointer]) => ({
  id, type, value, assetPath, assetJsonPointer,
  source: { adapter: "test-facts", snapshotArtifactId: "facts", jsonPointer, liveUrl: "https://facts.example/current.json", retrievedAt: createdAt, revision: `git:${"a".repeat(40)}` },
}));

const sourceFamilies = [
  "problem-workaround-communities", "framework-library-tooling", "surveys-research-usage",
  "browser-standards-issues", "adjacent-platform-alternatives", "public-product-support",
].map((id) => ({ id, applicability: "applicable", status: "complete", rationale: "Relevant public evidence family searched to the frozen cutoff." }));
const queryResults = [
  [{ canonicalUrl: "https://developer.example/need", disposition: "relevant", independenceGroup: "community-a" }],
  [{ canonicalUrl: "https://framework.example/concern", disposition: "relevant", independenceGroup: "maintainer-b" }],
  [], [], [], [],
];
const queries = sourceFamilies.map((family, index) => {
  const resultArtifactId = `Q${index + 1}-results`;
  addArtifact(resultArtifactId, `signals/Q${index + 1}.json`, queryResults[index], { type: "developer-signal-results" });
  return {
    id: `Q${index + 1}`, sourceFamilyId: family.id, url: `https://search.example/q${index + 1}`,
    terms: ["developer need", "workaround"], intent: index === 1 ? "falsify" : "neutral", status: "complete", retrieved: index < 2 ? 1 : 0,
    relevant: index < 2 ? 1 : 0, duplicate: 0, screenedOut: 0, blocked: 0, resultArtifactId,
  };
});
addArtifact("D1-evidence", "signals/D1.json", { quote: "We need a less brittle policy flow." }, { type: "developer-signal-evidence" });
addArtifact("D2-evidence", "signals/D2.json", { quote: "Existing framework controls may be enough." }, { type: "developer-signal-evidence" });
const signalItems = [
  { id: "D1", queryId: "Q1", canonicalUrl: "https://developer.example/need", independenceGroup: "community-a", direction: "supporting", directness: "self-report", developerJob: "Configure a connection policy", need: "Avoid brittle manual configuration", workaround: "Custom server policy", limitations: "One public report; not representative", publicability: "public", evidenceArtifactId: "D1-evidence" },
  { id: "D2", queryId: "Q2", canonicalUrl: "https://framework.example/concern", independenceGroup: "maintainer-b", direction: "contradicting", directness: "opinion", developerJob: "Deploy across browsers", need: "Interoperable fallback", workaround: "Existing framework controls", limitations: "Maintainer opinion, not usage evidence", publicability: "public", evidenceArtifactId: "D2-evidence" },
];

const docsValidationArgv = [process.execPath, trustedDocumentationValidatorPath, "--root", root, "--contract", "evidence/contract.json", "--example", "examples/detect.html", "--example", "examples/minimal.html", "--example", "examples/failure.html", "--example", "examples/realistic.html", "--guide", "docs/guide.md"];
const docsValidation = spawnSync(docsValidationArgv[0], docsValidationArgv.slice(1), { cwd: repoRoot, encoding: "utf8" });
assert.equal(docsValidation.status, 0, docsValidation.stderr);
const receiptSubjectIds = ["example-detect", "example-minimal", "example-failure", "example-realistic", "guide"];
const receiptSubjects = receiptSubjectIds.map((id) => { const artifact = artifacts.find((item) => item.id === id); return { id, path: artifact.path, sha256Before: artifact.sha256, sha256After: artifact.sha256 }; });
const run = {
  schemaVersion: 1, attestation: { algorithm: "hmac-sha256", keyId: "test-parent", signedDigest: "0".repeat(64), signature: "0".repeat(64) }, runId: "valid-launch-run", feature: { id: "feature-1", name: "Example API", stage: "prepare-to-ship", targetMilestone: 150 },
  interval: { startedAt, endedAt }, declaredOutcome: "succeeded",
  contract: { ids: ["C1", "C2", "C3"], blockedIds: [], frozenManifestArtifactId: "contract", sourceArtifactIds: ["spec"], supersessions: [] }, artifacts,
  receipts: [{ id: "R-examples", producer: "command-wrapper", argv: docsValidationArgv, cwd: root, startedAt, endedAt: createdAt, exitCode: 0, stdoutArtifactId: "stdout", stderrArtifactId: "stderr", subjectArtifactIds: receiptSubjectIds, subjects: receiptSubjects }],
  browserSessions: [{ id: "S1", producer: "parent-verifier", tool: "chrome-devtools-mcp", browserVersion: "Chrome/150.0.1.0", browserMajor: 150, channel: "stable", os: "Linux", flags: [], policies: [], profileId: "fresh-profile-1", startedAt, endedAt, eventLogArtifactId: "mcp-log" }],
  tests: testDefs.map(([id, attemptRole, result, _seed, testStartedAt, testEndedAt]) => ({
    id, attemptRole, contractIds: ["C1", "C2", "C3"], sessionId: "S1", route: id === "T-verify" ? "http://127.0.0.1/T-before" : `http://127.0.0.1/${id}`,
    result, startedAt: testStartedAt, endedAt: testEndedAt, interactions: ["click Run", "inspect visible result"],
    consoleBeforeArtifactId: `${id}-console-before`, consoleAfterArtifactId: `${id}-console-after`,
    networkBeforeArtifactId: `${id}-network-before`, networkAfterArtifactId: `${id}-network-after`,
    assertionArtifactId: `${id}-assertion`, screenshotArtifactIds: [`${id}-shot`],
    adjacentRegressionIds: id === "T-verify" ? ["T-regression"] : [],
    ...(id === "T-verify" ? { reproductionOf: "T-before" } : {}), platformEvidence: "viewport-only",
  })),
  documentationExamples: examples.map(([id, kind, path, contractIds]) => ({ id: `DOC-${id}`, kind, path, contractIds, standalone: true, copyPasteReady: true, receiptId: "R-examples" })),
  documentationGuide: { artifactId: "guide", receiptId: "R-examples", sections: ["overview", "feature-detection-setup-fallback", "api-behavior-inventory", "options-errors-exceptions", "permissions-policies-security", "lifecycle-cleanup", "server-build-framework-deployment", "compatibility-progressive-enhancement", "accessibility-privacy-performance", "troubleshooting-diagnostics", "realistic-integration"] },
  semanticClaims,
  friction: { items: [{ id: "F1", sourceClass: "discovered-during-run", severity: "high", category: "sample", status: "verified", originalTestId: "T-before", beforeArtifactIds: ["T-before-assertion", "target-before"], fixArtifactIds: ["fix"], afterArtifactIds: ["T-verify-assertion"], changedSubjects: [{ path: "examples/minimal.html", beforeArtifactId: "target-before", afterArtifactId: "target-after" }], verificationTestId: "T-verify", regressionTestIds: ["T-regression"] }], counts: { verified: 1, open: 0, fixedUnverified: 0, disputed: 0, blocked: 0, decisionRequired: 0, acceptedRisk: 0 } },
  externalReports: { items: [], counts: { reproduced: 0, notReproduced: 0, blocked: 0, notAttempted: 0 } },
  developerSignals: { cutoff: endedAt, stoppingRule: "Stop after every applicable source family is reconciled and two successive batches add no new job, workaround, objection, or segment.", sourceFamilies, queries, signals: signalItems, counts: { supporting: 1, contradicting: 1, ambiguous: 0, completeQueries: 6, blockedQueries: 0, independenceGroups: 2 }, saturation: "All six declared public source families were queried; the final two queries added no new segment.", counterevidence: "One independent maintainer source argues existing framework controls may be sufficient." },
  goals: [{ id: "G1", status: "succeeded", evidenceArtifactIds: ["T-final-assertion", "T-final-shot", "bcd", "release"] }],
};

Object.assign(run.attestation, computeLaunchAttestation(run, attestationKey));
const fetchImpl = async () => ({ ok: true, status: 200, async json() { return facts; } });
const validate = (candidate, options = {}) => validateLaunchAcceptance(candidate, { root, online: true, fetchImpl, now, schema, semanticSourcePolicy, attestationKey, trustedDocumentationValidatorPath, ...options });
const expectCode = async (candidate, code, options) => {
  const result = await validate(candidate, options);
  assert.ok(result.errors.some((error) => error.code === code), `${code} not found in ${JSON.stringify(result.errors, null, 2)}`);
};

try {
  const valid = await validate(run);
  assert.equal(valid.computedOutcome, "succeeded", JSON.stringify(valid.errors, null, 2));

  const noKey = await validateLaunchAcceptance(run, { root, online: true, fetchImpl, now, schema, semanticSourcePolicy, trustedDocumentationValidatorPath });
  assert.ok(noKey.errors.some((error) => error.code === "ATTESTATION_KEY_REQUIRED"));

  const wrongBcd = clone(run); wrongBcd.semanticClaims.find((c) => c.id === "claim-bcd").value = "140";
  await expectCode(wrongBcd, "VERSION_EVIDENCE_MISMATCH");

  const stale = clone(run); stale.semanticClaims[0].source.retrievedAt = "2026-01-01T00:00:00.000Z";
  await expectCode(stale, "CURRENTNESS_STALE");

  const offline = await validateLaunchAcceptance(run, { root, online: false, now, schema, semanticSourcePolicy, attestationKey, trustedDocumentationValidatorPath });
  assert.ok(offline.errors.some((error) => error.code === "ONLINE_FACTS_REQUIRED"));

  const missingScreenshotPath = join(root, "evidence/T-final.png");
  renameSync(missingScreenshotPath, `${missingScreenshotPath}.missing`);
  await expectCode(run, "ARTIFACT_MISSING");
  renameSync(`${missingScreenshotPath}.missing`, missingScreenshotPath);

  const tampered = clone(run); tampered.artifacts.find((a) => a.id === "T-final-shot").sha256 = "0".repeat(64);
  await expectCode(tampered, "ARTIFACT_HASH_MISMATCH");

  const wrongSession = clone(run); wrongSession.artifacts.find((a) => a.id === "T-final-shot").sessionId = "other";
  await expectCode(wrongSession, "SCREENSHOT_SESSION_MISMATCH");

  const noMcp = clone(run); noMcp.browserSessions[0].eventLogArtifactId = "missing";
  await expectCode(noMcp, "MCP_EVENT_LOG_MISSING");

  const fakeBrowser = clone(run); fakeBrowser.browserSessions[0].producer = "worker";
  await expectCode(fakeBrowser, "UNTRUSTED_BROWSER_SESSION");

  const wrongMajor = clone(run); wrongMajor.browserSessions[0].browserMajor = 140;
  await expectCode(wrongMajor, "BROWSER_VERSION_MISMATCH");

  const fakeReceipt = clone(run); fakeReceipt.receipts[0].producer = "worker";
  await expectCode(fakeReceipt, "UNTRUSTED_RECEIPT");

  const fixedUnverified = clone(run); fixedUnverified.friction.items[0].status = "fixed-unverified"; fixedUnverified.friction.counts.verified = 0; fixedUnverified.friction.counts.fixedUnverified = 1;
  await expectCode(fixedUnverified, "UNRESOLVED_FRICTION");

  const noVerification = clone(run); noVerification.friction.items[0].verificationTestId = "missing";
  await expectCode(noVerification, "FRICTION_VERIFICATION_MISSING");

  const failedRegression = clone(run); failedRegression.tests.find((t) => t.id === "T-regression").result = "fail";
  await expectCode(failedRegression, "FRICTION_REGRESSION_FAILED");

  const coverageGap = clone(run); coverageGap.documentationExamples = coverageGap.documentationExamples.map((item) => ({ ...item, contractIds: item.contractIds.filter((id) => id !== "C3") }));
  await expectCode(coverageGap, "EXAMPLE_COVERAGE_GAP");

  const placeholderPath = join(root, "examples/minimal.html");
  const originalExample = readFileSync(placeholderPath);
  writeFileSync(placeholderPath, "<button>TODO</button>");
  const placeholderRun = clone(run); const placeholderArtifact = placeholderRun.artifacts.find((a) => a.id === "example-minimal"); placeholderArtifact.bytes = 22; placeholderArtifact.sha256 = sha256(Buffer.from("<button>TODO</button>"));
  await expectCode(placeholderRun, "EXAMPLE_PLACEHOLDER");
  await expectCode(placeholderRun, "EXAMPLE_TOO_THIN");
  writeFileSync(placeholderPath, originalExample);

  const signalBlocked = clone(run); signalBlocked.developerSignals.sourceFamilies[0].status = "blocked";
  await expectCode(signalBlocked, "SIGNAL_RESEARCH_BLOCKED");

  const badQuery = clone(run); badQuery.developerSignals.queries[0].retrieved = 99;
  await expectCode(badQuery, "SIGNAL_QUERY_DENOMINATOR");

  const missingFamily = clone(run); missingFamily.developerSignals.sourceFamilies.pop();
  await expectCode(missingFamily, "SIGNAL_FAMILY_MISSING");

  const unregisteredBcd = clone(run); const bcdArtifact = unregisteredBcd.artifacts.find((a) => a.id === "bcd"); const extraBcd = { ...bcdPatch, api: { ...bcdPatch.api, Other: { __compat: { support: { chrome: { version_added: "150" } } } } } }; writeFileSync(join(root, bcdArtifact.path), `${JSON.stringify(extraBcd, null, 2)}\n`); bcdArtifact.bytes = readFileSync(join(root, bcdArtifact.path)).length; bcdArtifact.sha256 = sha256(readFileSync(join(root, bcdArtifact.path)));
  await expectCode(unregisteredBcd, "UNREGISTERED_BCD_VERSION");
  writeFileSync(join(root, bcdArtifact.path), `${JSON.stringify(bcdPatch, null, 2)}\n`);

  const partialBypass = clone(run);
  partialBypass.declaredOutcome = "partial";
  partialBypass.contract.blockedIds = ["C3"];
  partialBypass.friction.items[0].status = "fixed-unverified";
  partialBypass.friction.counts.verified = 0; partialBypass.friction.counts.fixedUnverified = 1;
  partialBypass.developerSignals.sourceFamilies[0].status = "blocked";
  partialBypass.goals[0].status = "blocked";
  const partialResult = await validate(partialBypass, { online: false });
  assert.equal(partialResult.computedOutcome, "rejected");
  for (const code of ["DECLARED_OUTCOME_NOT_SUCCESS", "ONLINE_FACTS_REQUIRED", "UNRESOLVED_FRICTION", "SIGNAL_RESEARCH_BLOCKED", "GOAL_PREVENTS_SUCCESS", "BLOCKED_CONTRACT_PREVENTS_SUCCESS"]) assert.ok(partialResult.errors.some((error) => error.code === code), code);

  const extraProperty = clone(run); extraProperty.untrustedOverride = true;
  await expectCode(extraProperty, "JSON_SCHEMA");

  const dataSource = clone(run); dataSource.semanticClaims[0].source.liveUrl = "data:application/json,%7B%7D";
  await expectCode(dataSource, "SEMANTIC_SOURCE_NOT_AUTHORITATIVE");

  const banana = clone(run); banana.semanticClaims.find((claim) => claim.id === "claim-bcd").value = "banana";
  await expectCode(banana, "BCD_VERSION_FORMAT");

  const dateSemantics = clone(run); dateSemantics.semanticClaims.find((claim) => claim.id === "claim-date").type = "actual-stable-release-date";
  await expectCode(dateSemantics, "RELEASE_DATE_SEMANTICS");

  const assertionPath = join(root, "evidence/T-final-assertion.json");
  const originalAssertion = readFileSync(assertionPath);
  const falseAssertion = Buffer.from(`${JSON.stringify({ testId: "T-final", sessionId: "S1", route: "http://127.0.0.1/T-final", result: "fail", assertions: [{ id: "visible-result", passed: false }] }, null, 2)}\n`);
  writeFileSync(assertionPath, falseAssertion);
  const falseAssertionRun = clone(run); const falseAssertionArtifact = falseAssertionRun.artifacts.find((a) => a.id === "T-final-assertion"); falseAssertionArtifact.bytes = falseAssertion.length; falseAssertionArtifact.sha256 = sha256(falseAssertion);
  await expectCode(falseAssertionRun, "ASSERTION_RECEIPT_MISMATCH");
  writeFileSync(assertionPath, originalAssertion);

  const falsePassAssertion = Buffer.from(`${JSON.stringify({ testId: "T-final", sessionId: "S1", route: "http://127.0.0.1/T-final", result: "pass", assertions: [{ id: "visible-result", passed: false, expected: "Completed successfully", actual: "Error" }] }, null, 2)}\n`);
  writeFileSync(assertionPath, falsePassAssertion);
  const falsePassRun = clone(run); const falsePassArtifact = falsePassRun.artifacts.find((a) => a.id === "T-final-assertion"); falsePassArtifact.bytes = falsePassAssertion.length; falsePassArtifact.sha256 = sha256(falsePassAssertion);
  await expectCode(falsePassRun, "ASSERTION_FALSE_PASS");
  writeFileSync(assertionPath, originalAssertion);

  const fakeDocsReceipt = clone(run); fakeDocsReceipt.receipts[0].argv = ["true"];
  await expectCode(fakeDocsReceipt, "EXAMPLE_RECEIPT_COMMAND");

  const duplicateDocsArgs = clone(run); duplicateDocsArgs.receipts[0].argv.splice(2, 0, "--root", outsideRoot, "--contract", "decoy-contract.json", "--guide", "decoy-guide.md");
  await expectCode(duplicateDocsArgs, "EXAMPLE_RECEIPT_COMMAND");

  const lateContract = clone(run); lateContract.artifacts.find((artifact) => artifact.id === "contract").createdAt = "2026-07-28T12:11:00.000Z";
  await expectCode(lateContract, "CONTRACT_NOT_FROZEN_BEFORE_TEST");

  const unrelatedSignal = clone(run); unrelatedSignal.developerSignals.signals[0].canonicalUrl = "https://developer.example/unrelated";
  await expectCode(unrelatedSignal, "SIGNAL_RESULT_LINK_MISSING");

  const emptyFalsification = clone(run); emptyFalsification.developerSignals.queries[1].intent = "neutral"; emptyFalsification.developerSignals.queries[2].intent = "falsify";
  await expectCode(emptyFalsification, "SIGNAL_FALSIFICATION_QUERY_MISSING");

  const copiedScreenshotPath = join(root, "evidence/T-final-copy.png");
  writeFileSync(copiedScreenshotPath, readFileSync(join(root, "evidence/T-regression.png")));
  const copiedScreenshot = clone(run); const sourceShot = copiedScreenshot.artifacts.find((artifact) => artifact.id === "T-regression-shot"); copiedScreenshot.artifacts.push({ ...sourceShot, id: "T-final-copy-shot", path: "evidence/T-final-copy.png", testId: "T-final" }); copiedScreenshot.tests.find((test) => test.id === "T-final").screenshotArtifactIds = ["T-final-copy-shot"];
  await expectCode(copiedScreenshot, "SCREENSHOT_HASH_REUSED");
  rmSync(copiedScreenshotPath);

  const ancientSession = clone(run); ancientSession.browserSessions[0].startedAt = "1999-01-01T00:00:00.000Z"; ancientSession.browserSessions[0].endedAt = "1999-01-01T01:00:00.000Z";
  await expectCode(ancientSession, "BROWSER_SESSION_TIME");

  const blockedFalsificationPath = join(root, "signals/Q2.json");
  const originalQ2 = readFileSync(blockedFalsificationPath);
  const blockedQ2 = Buffer.from(`${JSON.stringify([{ canonicalUrl: "https://framework.example/concern", disposition: "blocked", independenceGroup: "maintainer-b" }], null, 2)}\n`);
  writeFileSync(blockedFalsificationPath, blockedQ2);
  const blockedFalsification = clone(run); const blockedQ2Artifact = blockedFalsification.artifacts.find((a) => a.id === "Q2-results"); blockedQ2Artifact.bytes = blockedQ2.length; blockedQ2Artifact.sha256 = sha256(blockedQ2); blockedFalsification.developerSignals.queries[1].relevant = 0; blockedFalsification.developerSignals.queries[1].blocked = 1; blockedFalsification.developerSignals.signals = blockedFalsification.developerSignals.signals.filter((signal) => signal.queryId !== "Q2"); blockedFalsification.developerSignals.counts.contradicting = 0; blockedFalsification.developerSignals.counts.independenceGroups = 1; blockedFalsification.developerSignals.counterevidence = "No contradictory signal found in the completed non-blocked searches; blocked framework detail limits confidence.";
  await expectCode(blockedFalsification, "SIGNAL_FALSIFICATION_QUERY_MISSING");
  writeFileSync(blockedFalsificationPath, originalQ2);

  const fixPath = join(root, "changes/fix.json");
  const originalFix = readFileSync(fixPath);
  const unrelatedFix = Buffer.from(`${JSON.stringify({ subjects: [{ path: "unrelated.txt", beforeSha256: "0".repeat(64), afterSha256: "1".repeat(64) }] }, null, 2)}\n`);
  writeFileSync(fixPath, unrelatedFix);
  const unrelatedFixRun = clone(run); const unrelatedFixArtifact = unrelatedFixRun.artifacts.find((a) => a.id === "fix"); unrelatedFixArtifact.bytes = unrelatedFix.length; unrelatedFixArtifact.sha256 = sha256(unrelatedFix);
  await expectCode(unrelatedFixRun, "FRICTION_FIX_SUBJECT_UNLINKED");
  writeFileSync(fixPath, originalFix);

  const commentOnlyPath = join(root, "examples/detect.html");
  const originalDetect = readFileSync(commentOnlyPath);
  const commentOnly = Buffer.from('<!doctype html><!-- ExampleAPI globalThis.ExampleAPI --><main><button>Run</button><output id="status">Unsupported fallback</output></main><script>// ExampleAPI globalThis.ExampleAPI typeof globalThis\ndocument.querySelector("button").onclick=()=>{};</script>');
  writeFileSync(commentOnlyPath, commentOnly);
  const commentOnlyRun = clone(run); const commentArtifact = commentOnlyRun.artifacts.find((a) => a.id === "example-detect"); commentArtifact.bytes = commentOnly.length; commentArtifact.sha256 = sha256(commentOnly); const commentSubject = commentOnlyRun.receipts[0].subjects.find((item) => item.id === "example-detect"); commentSubject.sha256Before = commentArtifact.sha256; commentSubject.sha256After = commentArtifact.sha256;
  await expectCode(commentOnlyRun, "EXAMPLE_CONTRACT_TOKEN_MISSING");
  writeFileSync(commentOnlyPath, originalDetect);

  const emptyMcpPath = join(root, "evidence/mcp-events.json");
  const originalMcp = readFileSync(emptyMcpPath);
  const emptyMcp = Buffer.from("{}\n");
  writeFileSync(emptyMcpPath, emptyMcp);
  const emptyMcpRun = clone(run); const emptyMcpArtifact = emptyMcpRun.artifacts.find((a) => a.id === "mcp-log"); emptyMcpArtifact.bytes = emptyMcp.length; emptyMcpArtifact.sha256 = sha256(emptyMcp); emptyMcpArtifact.producer = "worker";
  await expectCode(emptyMcpRun, "MCP_EVENT_LOG_UNTRUSTED");
  await expectCode(emptyMcpRun, "MCP_EVENT_LOG_INVALID");
  writeFileSync(emptyMcpPath, originalMcp);

  const reusedScreenshot = clone(run); reusedScreenshot.tests.find((test) => test.id === "T-final").screenshotArtifactIds = ["T-regression-shot"];
  await expectCode(reusedScreenshot, "SCREENSHOT_REUSED");

  const shrunkContract = clone(run); shrunkContract.contract.ids = ["C1"];
  shrunkContract.tests.forEach((test) => { test.contractIds = ["C1"]; });
  shrunkContract.documentationExamples.forEach((example) => { example.contractIds = ["C1"]; });
  await expectCode(shrunkContract, "CONTRACT_MANIFEST_MISMATCH");

  const missingAdjacent = clone(run); missingAdjacent.tests.find((test) => test.id === "T-verify").adjacentRegressionIds = ["does-not-exist"];
  missingAdjacent.friction.items[0].regressionTestIds = ["does-not-exist"];
  await expectCode(missingAdjacent, "ADJACENT_REGRESSION_INVALID");

  const zeroSignals = clone(run);
  zeroSignals.developerSignals.signals = [];
  zeroSignals.developerSignals.counts.supporting = 0; zeroSignals.developerSignals.counts.contradicting = 0; zeroSignals.developerSignals.counts.independenceGroups = 0;
  for (const [index, query] of zeroSignals.developerSignals.queries.entries()) { query.retrieved = 0; query.relevant = 0; query.resultArtifactId = `Q${Math.max(3, index + 1)}-results`; }
  zeroSignals.developerSignals.counterevidence = "none";
  await expectCode(zeroSignals, "SIGNAL_COUNTEREVIDENCE_UNSUPPORTED");

  const blockedReport = clone(run); blockedReport.externalReports.items = [{ id: "ER1", sourceArtifactId: "D1-evidence", status: "blocked" }]; blockedReport.externalReports.counts.blocked = 1;
  await expectCode(blockedReport, "EXTERNAL_REPORT_FRONTIER_OPEN");

  const outsideFile = join(outsideRoot, "outside.txt"); writeFileSync(outsideFile, "outside\n"); symlinkSync(outsideRoot, join(root, "escape"));
  const symlinkEscape = clone(run); const outsideBytes = readFileSync(outsideFile); symlinkEscape.artifacts.push({ id: "outside", path: "escape/outside.txt", type: "evidence", mime: "text/plain", bytes: outsideBytes.length, sha256: sha256(outsideBytes), createdAt, producer: "worker" });
  await expectCode(symlinkEscape, "ARTIFACT_PATH_ESCAPE");
  rmSync(join(root, "escape"));

  const liveMismatch = async () => ({ ok: true, status: 200, async json() { return { ...facts, feature: { ...facts.feature, currentStableMilestone: 149 } }; } });
  const currentMismatch = await validateLaunchAcceptance(run, { root, online: true, fetchImpl: liveMismatch, now, schema, semanticSourcePolicy, attestationKey, trustedDocumentationValidatorPath });
  assert.ok(currentMismatch.errors.some((error) => error.code === "LIVE_CLAIM_MISMATCH"));

  console.log("Launch acceptance: 1 valid baseline + 44 rejected mutations passed");
} finally {
  rmSync(root, { recursive: true, force: true });
  rmSync(outsideRoot, { recursive: true, force: true });
}
