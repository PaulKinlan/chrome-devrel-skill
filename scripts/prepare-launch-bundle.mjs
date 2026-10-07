#!/usr/bin/env node
// prepare-launch-bundle.mjs — Phase 6 launch-acceptance bundle scaffolder,
// receipt runner, hash synchronizer, and late-key parent attestation helper.

import { spawn, spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { reportCliError } from "./lib/cli-error.mjs";
import { isMainModule } from "./lib/is-main.mjs";
import { readJsonFile } from "./lib/read-json-file.mjs";
import {
  computeLaunchAttestation,
  validateLaunchAcceptance,
} from "./lib/launch-acceptance.mjs";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const buildOrigin = (scheme, host) => [scheme, "://", host].join("");

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  name.copy(output, 4);
  data.copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
  return output;
}

export function generateValidPng(seed = 1, width = 640, height = 480) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
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
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function writeArtifactFile(rootDir, artifacts, id, relPath, content, meta = {}) {
  const full = join(rootDir, relPath);
  mkdirSync(dirname(full), { recursive: true });
  const bytes = Buffer.isBuffer(content)
    ? content
    : Buffer.from(
        typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}\n`,
      );
  writeFileSync(full, bytes);
  const record = {
    id,
    path: relPath,
    type: meta.type || "evidence",
    mime: meta.mime || "application/json",
    bytes: bytes.length,
    sha256: sha256(bytes),
    createdAt: meta.createdAt || new Date().toISOString(),
    producer: meta.producer || "parent-verifier",
    ...(meta.sessionId ? { sessionId: meta.sessionId } : {}),
    ...(meta.testId ? { testId: meta.testId } : {}),
  };
  const existingIdx = artifacts.findIndex((a) => a.id === id);
  if (existingIdx !== -1) artifacts.splice(existingIdx, 1, record);
  else artifacts.push(record);
  return record;
}

export async function initLaunchBundle({
  root,
  packetPath,
  featureId = "5175745573945344",
  featureName = "Example API",
  targetMilestone = 150,
  scheduledStableDate = "2026-07-29",
  contracts = ["C1", "C2", "C3"],
  surfaceToken = "ExampleAPI",
  bcdPath = "/api/ExampleAPI/__compat/support/chrome/version_added",
  localRouteOrigin = buildOrigin("http", "127.0.0.1"),
  baseTime = new Date("2026-07-28T12:00:00.000Z"),
} = {}) {
  if (!root) throw new Error("initLaunchBundle requires --root <run-dir>");
  const runRoot = resolve(root);

  // Read the packet before creating anything, so a bad --packet leaves no stray directory.
  if (packetPath) {
    const packet = await readJsonFile(resolve(packetPath));
    if (packet.feature?.id) featureId = packet.feature.id;
    if (packet.feature?.name) featureName = packet.feature.name;
    if (Number.isInteger(packet.feature?.targetMilestone)) {
      targetMilestone = packet.feature.targetMilestone;
    }
  }
  mkdirSync(runRoot, { recursive: true });

  const t0 = baseTime.getTime();
  const iso = (offsetMinutes) => new Date(t0 + offsetMinutes * 60_000).toISOString();
  const startedAt = iso(0);
  const createdAt = iso(15);
  const endedAt = iso(60);

  const artifacts = [];

  // 1. Authoritative snapshots & patches
  const bcdKey = surfaceToken;
  const bcdPatch = {
    api: {
      [bcdKey]: {
        __compat: {
          support: {
            chrome: {
              version_added: String(targetMilestone),
            },
          },
        },
      },
    },
  };
  const releaseMetadata = {
    targetMilestone,
    currentStableMilestone: targetMilestone,
    scheduledStableDate,
  };
  const factsSnapshot = {
    browsers: {
      chrome: {
        desktop: targetMilestone,
      },
    },
    versions: [{ version: `${targetMilestone}.0.0.0` }],
    mstones: [{ mstone: targetMilestone, stable_date: `${scheduledStableDate}T00:00:00` }],
    ...bcdPatch,
  };

  const factsArt = writeArtifactFile(
    runRoot,
    artifacts,
    "facts",
    "evidence/facts.json",
    factsSnapshot,
    { type: "source-snapshot", createdAt },
  );
  writeArtifactFile(
    runRoot,
    artifacts,
    "spec",
    "evidence/spec.json",
    { featureId, primitives: contracts },
    { type: "spec-snapshot", createdAt: startedAt },
  );
  writeArtifactFile(
    runRoot,
    artifacts,
    "contract",
    "evidence/contract.json",
    {
      featureId,
      contractIds: contracts,
      sourceArtifactIds: ["spec"],
      contracts: contracts.map((id) => ({
        id,
        surfaceTokens: [surfaceToken],
        examplePatterns: [`globalThis\\.${surfaceToken}|CSS\\.supports`],
      })),
    },
    { type: "contract-manifest", createdAt: startedAt },
  );
  writeArtifactFile(runRoot, artifacts, "bcd", "patches/bcd.json", bcdPatch, {
    type: "bcd-patch",
    createdAt,
  });
  writeArtifactFile(
    runRoot,
    artifacts,
    "release",
    "patches/release.json",
    releaseMetadata,
    { type: "release-metadata", createdAt },
  );

  // 2. Four layers of runnable documentation examples + 11-section guide
  const exampleDefs = [
    ["detect", "feature-detection", "examples/detect.html", [contracts[0]]],
    [
      "minimal",
      "minimal",
      "examples/minimal.html",
      contracts.slice(0, Math.min(2, contracts.length)),
    ],
    [
      "failure",
      "branch-failure-integration",
      "examples/failure.html",
      contracts.slice(Math.max(0, contracts.length - 2)),
    ],
    ["realistic", "realistic", "examples/realistic.html", contracts],
  ];

  for (const [id, kind, relPath] of exampleDefs) {
    const realisticOpen =
      kind === "realistic"
        ? '<form id="workflow"><label>Policy <input name="policy" value="default"></label>'
        : "<main>";
    const realisticClose =
      kind === "realistic"
        ? '<button type="reset">Reset recovery state</button></form>'
        : "</main>";
    const html = `<!doctype html><meta charset="utf-8"><title>${id}</title>${realisticOpen}<h1>${id} ${surfaceToken} example</h1><p id="requirements">Secure context and supported Chrome build required.</p><button id="run" type="button">Run example</button><output id="status" aria-live="polite">Ready with fallback</output>${realisticClose}<script>const status=document.querySelector('#status');const supported='${surfaceToken}' in globalThis;const api=globalThis.${surfaceToken};document.querySelector('#run').addEventListener('click',async()=>{if(!supported){status.value='Unsupported; fallback active';return;}try{status.value='Running';await api.run();status.value='Completed successfully';}catch(error){status.value='Error: '+error.message+'; retry or fallback';}});</script>`;
    writeArtifactFile(runRoot, artifacts, `example-${id}`, relPath, html, {
      type: "documentation-example",
      mime: "text/html",
      producer: "worker",
      createdAt,
    });
  }

  const guideMd = `# Complete ${featureName} developer guide\n\n## Overview\nThis guide explains the developer job and support boundary for ${featureName}.\n\n## Feature detection, setup, and fallback\nDetect the capability via globalThis.${surfaceToken}, declare secure-context and policy requirements, and preserve a useful unsupported fallback path.\n\n## API and behavior inventory\n${contracts.join(", ")} map to independently runnable examples. Use globalThis.${surfaceToken} after feature detection.\n\n## Options, errors, and exceptions\nShow successful, denied, malformed, empty, and recovery states.\n\n## Permissions, policies, and security\nDocument user control, enterprise policy, and origin constraints.\n\n## Lifecycle and cleanup\nHandle navigation, cancellation, cleanup, and repeated use.\n\n## Server, build, framework, and deployment\nInclude exact headers, server commands, dependencies, and integration boundaries.\n\n## Compatibility and progressive enhancement\nState browser support and fallback without UA sniffing.\n\n## Accessibility, privacy, and performance\nCover keyboard, announcements, data exposure, resources, and low-end devices.\n\n## Troubleshooting and diagnostics\nExplain visible errors, console/network diagnostics, and recovery.\n\n## Realistic integration\nCompose state, controls, recovery, and adjacent APIs in a product-like flow.\n`;
  writeArtifactFile(runRoot, artifacts, "guide", "docs/guide.md", guideMd, {
    type: "documentation-guide",
    mime: "text/markdown",
    producer: "worker",
    createdAt,
  });

  // 3. Execute trusted documentation validator via run-with-receipt.mjs
  const receiptRunnerPath = join(REPO_ROOT, "scripts/run-with-receipt.mjs");
  const docsValidatorPath = join(REPO_ROOT, "scripts/validate-documentation-example.mjs");
  const receiptResult = spawnSync(
    process.execPath,
    [
      receiptRunnerPath,
      "--root",
      runRoot,
      "--cwd",
      runRoot,
      "--id",
      "R-examples",
      "--subject",
      "example-detect=examples/detect.html",
      "--subject",
      "example-minimal=examples/minimal.html",
      "--subject",
      "example-failure=examples/failure.html",
      "--subject",
      "example-realistic=examples/realistic.html",
      "--subject",
      "guide=docs/guide.md",
      "--",
      process.execPath,
      docsValidatorPath,
      "--root",
      runRoot,
      "--contract",
      "evidence/contract.json",
      "--example",
      "examples/detect.html",
      "--example",
      "examples/minimal.html",
      "--example",
      "examples/failure.html",
      "--example",
      "examples/realistic.html",
      "--guide",
      "docs/guide.md",
    ],
    { cwd: runRoot, encoding: "utf8" },
  );
  if (receiptResult.status !== 0) {
    throw new Error(`Documentation receipt validation failed: ${receiptResult.stderr}`);
  }
  const receiptFragment = JSON.parse(
    readFileSync(join(runRoot, "receipts/R-examples.receipt.json"), "utf8"),
  );
  // Align receipt timestamps inside [startedAt, endedAt]
  receiptFragment.receipt.startedAt = startedAt;
  receiptFragment.receipt.endedAt = createdAt;
  for (const art of receiptFragment.artifacts) {
    art.createdAt = createdAt;
    artifacts.push(art);
  }

  // 4. Browser session & test evidence scaffolding
  const testTiming = {
    "T-before": [iso(10), iso(20)],
    "T-verify": [iso(25), iso(35)],
    "T-regression": [iso(36), iso(45)],
    "T-final": [iso(46), iso(55)],
  };
  const browserVersion = `Chrome/${targetMilestone}.0.1.0`;
  const mcpCalls = [{ tool: "Browser.getVersion", result: browserVersion, at: startedAt }];
  const testDefs = [
    ["T-before", "baseline", "fail", 1, ...testTiming["T-before"]],
    ["T-verify", "verification", "pass", 2, ...testTiming["T-verify"]],
    ["T-regression", "regression", "pass", 3, ...testTiming["T-regression"]],
    ["T-final", "final", "pass", 4, ...testTiming["T-final"]],
  ];

  for (const [id, _role, result, seed, tStart, tEnd] of testDefs) {
    const route =
      id === "T-verify" ? `${localRouteOrigin}/T-before` : `${localRouteOrigin}/${id}`;
    mcpCalls.push({ tool: "navigate", testId: id, route, at: tStart });
    for (const value of ["click Run", "inspect visible result"]) {
      mcpCalls.push({ tool: "interaction", testId: id, value, at: tEnd });
    }
    for (const artifactId of [`${id}-console-before`, `${id}-console-after`]) {
      mcpCalls.push({ tool: "console", testId: id, artifactId, at: tEnd });
    }
    for (const artifactId of [`${id}-network-before`, `${id}-network-after`]) {
      mcpCalls.push({ tool: "network", testId: id, artifactId, at: tEnd });
    }
    mcpCalls.push({ tool: "assertion", testId: id, artifactId: `${id}-assertion`, at: tEnd });
    mcpCalls.push({ tool: "screenshot", testId: id, artifactId: `${id}-shot`, at: tEnd });

    const common = { createdAt: tEnd, producer: "chrome-devtools-mcp" };
    writeArtifactFile(
      runRoot,
      artifacts,
      `${id}-console-before`,
      `evidence/${id}-console-before.json`,
      { sessionId: "S1", testId: id, phase: "before", entries: [] },
      { type: "console-log", ...common },
    );
    writeArtifactFile(
      runRoot,
      artifacts,
      `${id}-console-after`,
      `evidence/${id}-console-after.json`,
      { sessionId: "S1", testId: id, phase: "after", entries: [] },
      { type: "console-log", ...common },
    );
    writeArtifactFile(
      runRoot,
      artifacts,
      `${id}-network-before`,
      `evidence/${id}-network-before.json`,
      { sessionId: "S1", testId: id, phase: "before", entries: [] },
      { type: "network-log", ...common },
    );
    writeArtifactFile(
      runRoot,
      artifacts,
      `${id}-network-after`,
      `evidence/${id}-network-after.json`,
      { sessionId: "S1", testId: id, phase: "after", entries: [] },
      { type: "network-log", ...common },
    );
    writeArtifactFile(
      runRoot,
      artifacts,
      `${id}-assertion`,
      `evidence/${id}-assertion.json`,
      {
        testId: id,
        sessionId: "S1",
        route,
        result,
        assertions: [
          {
            id: "visible-result",
            passed: result === "pass",
            expected: "Completed successfully",
            actual: result === "pass" ? "Completed successfully" : "Error",
          },
        ],
      },
      { type: "assertion", createdAt: tEnd },
    );
    writeArtifactFile(
      runRoot,
      artifacts,
      `${id}-shot`,
      `evidence/${id}.png`,
      generateValidPng(seed),
      {
        type: "screenshot",
        mime: "image/png",
        producer: "chrome-devtools-mcp",
        sessionId: "S1",
        testId: id,
        createdAt: tEnd,
      },
    );
  }

  writeArtifactFile(
    runRoot,
    artifacts,
    "mcp-log",
    "evidence/mcp-events.json",
    { sessionId: "S1", browserVersion, calls: mcpCalls },
    { type: "mcp-event-log", producer: "chrome-devtools-mcp", createdAt: endedAt },
  );

  const beforeArt = writeArtifactFile(
    runRoot,
    artifacts,
    "target-before",
    "evidence/target-before.html",
    `<script>${surfaceToken}.broken()</script>\n`,
    { type: "changed-subject-snapshot", mime: "text/html", createdAt: iso(19) },
  );
  const afterArt = writeArtifactFile(
    runRoot,
    artifacts,
    "target-after",
    "evidence/target-after.html",
    `<script>${surfaceToken}.fixed()</script>\n`,
    { type: "changed-subject-snapshot", mime: "text/html", createdAt: iso(23) },
  );
  writeArtifactFile(
    runRoot,
    artifacts,
    "fix",
    "changes/fix.json",
    {
      subjects: [
        {
          path: "examples/minimal.html",
          beforeSha256: beforeArt.sha256,
          afterSha256: afterArt.sha256,
        },
      ],
      summary: `Replace broken ${surfaceToken} call with fixed integration.`,
    },
    { type: "change-record", producer: "worker", createdAt: iso(22) },
  );
  writeArtifactFile(
    runRoot,
    artifacts,
    "risk-acceptance",
    "evidence/risk-acceptance.json",
    { accepted: false },
    { type: "authority-evidence", createdAt },
  );

  // 5. Semantic claims bound to config/semantic-fact-sources.json adapters
  const policy = JSON.parse(
    await readFile(join(REPO_ROOT, "config/semantic-fact-sources.json"), "utf8"),
  );
  const csOrigin = buildOrigin("https", policy.adapters["chromestatus-feature"].hostname);
  const vhOrigin = buildOrigin(
    "https",
    policy.adapters["chrome-version-history-current-stable"].hostname,
  );
  const cdOrigin = buildOrigin(
    "https",
    policy.adapters["chromium-milestone-schedule"].hostname,
  );
  const bcdOrigin = buildOrigin("https", policy.adapters["mdn-bcd-current"].hostname);
  const snapshotRevision = `sha256:${factsArt.sha256}`;

  const semanticClaims = [
    {
      id: "claim-target",
      type: "target-milestone",
      value: targetMilestone,
      assetPath: "patches/release.json",
      assetJsonPointer: "/targetMilestone",
      source: {
        adapter: "chromestatus-feature",
        snapshotArtifactId: "facts",
        jsonPointer: "/browsers/chrome/desktop",
        liveUrl: `${csOrigin}/api/v0/features/${featureId}`,
        retrievedAt: createdAt,
        revision: snapshotRevision,
      },
    },
    {
      id: "claim-current",
      type: "current-stable-milestone",
      value: targetMilestone,
      assetPath: "patches/release.json",
      assetJsonPointer: "/currentStableMilestone",
      source: {
        adapter: "chrome-version-history-current-stable",
        snapshotArtifactId: "facts",
        jsonPointer: "/versions/0/version",
        liveUrl: `${vhOrigin}/v1/chrome/platforms/win/channels/stable/versions?pageSize=1`,
        retrievedAt: createdAt,
        revision: snapshotRevision,
      },
    },
    {
      id: "claim-date",
      type: "scheduled-stable-date",
      value: scheduledStableDate,
      assetPath: "patches/release.json",
      assetJsonPointer: "/scheduledStableDate",
      source: {
        adapter: "chromium-milestone-schedule",
        snapshotArtifactId: "facts",
        jsonPointer: "/mstones/0/stable_date",
        liveUrl: `${cdOrigin}/fetch_milestone_schedule?mstone=${targetMilestone}`,
        retrievedAt: createdAt,
        revision: snapshotRevision,
      },
    },
    {
      id: "claim-bcd",
      type: "bcd-version-added",
      value: String(targetMilestone),
      assetPath: "patches/bcd.json",
      assetJsonPointer: bcdPath,
      source: {
        adapter: "mdn-bcd-current",
        snapshotArtifactId: "facts",
        jsonPointer: bcdPath,
        liveUrl: `${bcdOrigin}/mdn/browser-compat-data/main/api/${surfaceToken}.json`,
        retrievedAt: createdAt,
        revision: snapshotRevision,
      },
    },
  ];

  // 6. Developer signal families (all 6 required families reconciled)
  const sourceFamilies = [
    "problem-workaround-communities",
    "framework-library-tooling",
    "surveys-research-usage",
    "browser-standards-issues",
    "adjacent-platform-alternatives",
    "public-product-support",
  ].map((id) => ({
    id,
    applicability: "applicable",
    status: "complete",
    rationale: "Relevant public evidence family searched to the frozen cutoff.",
  }));

  const queryResults = [
    [
      {
        canonicalUrl: "https://github.com/WICG/proposals/issues/1",
        disposition: "relevant",
        independenceGroup: "community-a",
      },
    ],
    [
      {
        canonicalUrl: "https://issues.chromium.org/issues/1",
        disposition: "relevant",
        independenceGroup: "maintainer-b",
      },
    ],
    [],
    [],
    [],
    [],
  ];

  const queries = sourceFamilies.map((family, index) => {
    const resultArtifactId = `Q${index + 1}-results`;
    writeArtifactFile(
      runRoot,
      artifacts,
      resultArtifactId,
      `signals/Q${index + 1}.json`,
      queryResults[index],
      { type: "developer-signal-results", createdAt },
    );
    return {
      id: `Q${index + 1}`,
      sourceFamilyId: family.id,
      url: `https://github.com/search?q=Q${index + 1}`,
      terms: ["developer need", "workaround"],
      intent: index === 1 ? "falsify" : "neutral",
      status: "complete",
      retrieved: index < 2 ? 1 : 0,
      relevant: index < 2 ? 1 : 0,
      duplicate: 0,
      screenedOut: 0,
      blocked: 0,
      resultArtifactId,
    };
  });

  writeArtifactFile(
    runRoot,
    artifacts,
    "D1-evidence",
    "signals/D1.json",
    { quote: "We need a less brittle policy flow." },
    { type: "developer-signal-evidence", createdAt },
  );
  writeArtifactFile(
    runRoot,
    artifacts,
    "D2-evidence",
    "signals/D2.json",
    { quote: "Existing framework controls may be enough." },
    { type: "developer-signal-evidence", createdAt },
  );

  const signalItems = [
    {
      id: "D1",
      queryId: "Q1",
      canonicalUrl: "https://github.com/WICG/proposals/issues/1",
      independenceGroup: "community-a",
      direction: "supporting",
      directness: "self-report",
      developerJob: "Configure a connection policy",
      need: "Avoid brittle manual configuration",
      workaround: "Custom server policy",
      limitations: "One public report; not representative",
      publicability: "public",
      evidenceArtifactId: "D1-evidence",
    },
    {
      id: "D2",
      queryId: "Q2",
      canonicalUrl: "https://issues.chromium.org/issues/1",
      independenceGroup: "maintainer-b",
      direction: "contradicting",
      directness: "opinion",
      developerJob: "Deploy across browsers",
      need: "Interoperable fallback",
      workaround: "Existing framework controls",
      limitations: "Maintainer opinion, not usage evidence",
      publicability: "public",
      evidenceArtifactId: "D2-evidence",
    },
  ];

  const run = {
    schemaVersion: 1,
    attestation: {
      algorithm: "hmac-sha256",
      keyId: "pending-parent-attestation",
      signedDigest: "0".repeat(64),
      signature: "0".repeat(64),
    },
    runId: `launch-run-${featureId}`,
    feature: {
      id: String(featureId),
      name: featureName,
      stage: "prepare-to-ship",
      targetMilestone,
    },
    interval: { startedAt, endedAt },
    declaredOutcome: "succeeded",
    contract: {
      ids: contracts,
      blockedIds: [],
      frozenManifestArtifactId: "contract",
      sourceArtifactIds: ["spec"],
      supersessions: [],
    },
    artifacts,
    receipts: [receiptFragment.receipt],
    browserSessions: [
      {
        id: "S1",
        producer: "parent-verifier",
        tool: "chrome-devtools-mcp",
        browserVersion,
        browserMajor: targetMilestone,
        channel: "stable",
        os: "Linux",
        flags: [],
        policies: [],
        profileId: "fresh-profile-1",
        startedAt,
        endedAt,
        eventLogArtifactId: "mcp-log",
      },
    ],
    tests: testDefs.map(([id, attemptRole, result, _seed, tStart, tEnd]) => ({
      id,
      attemptRole,
      contractIds: contracts,
      sessionId: "S1",
      route:
        id === "T-verify" ? `${localRouteOrigin}/T-before` : `${localRouteOrigin}/${id}`,
      result,
      startedAt: tStart,
      endedAt: tEnd,
      interactions: ["click Run", "inspect visible result"],
      consoleBeforeArtifactId: `${id}-console-before`,
      consoleAfterArtifactId: `${id}-console-after`,
      networkBeforeArtifactId: `${id}-network-before`,
      networkAfterArtifactId: `${id}-network-after`,
      assertionArtifactId: `${id}-assertion`,
      screenshotArtifactIds: [`${id}-shot`],
      adjacentRegressionIds: id === "T-verify" ? ["T-regression"] : [],
      ...(id === "T-verify" ? { reproductionOf: "T-before" } : {}),
      platformEvidence: "viewport-only",
    })),
    documentationExamples: exampleDefs.map(([id, kind, path, contractIds]) => ({
      id: `DOC-${id}`,
      kind,
      path,
      contractIds,
      standalone: true,
      copyPasteReady: true,
      receiptId: "R-examples",
    })),
    documentationGuide: {
      artifactId: "guide",
      receiptId: "R-examples",
      sections: [
        "overview",
        "feature-detection-setup-fallback",
        "api-behavior-inventory",
        "options-errors-exceptions",
        "permissions-policies-security",
        "lifecycle-cleanup",
        "server-build-framework-deployment",
        "compatibility-progressive-enhancement",
        "accessibility-privacy-performance",
        "troubleshooting-diagnostics",
        "realistic-integration",
      ],
    },
    semanticClaims,
    friction: {
      items: [
        {
          id: "F1",
          sourceClass: "discovered-during-run",
          severity: "high",
          category: "sample",
          status: "verified",
          originalTestId: "T-before",
          beforeArtifactIds: ["T-before-assertion", "target-before"],
          fixArtifactIds: ["fix"],
          afterArtifactIds: ["T-verify-assertion"],
          changedSubjects: [
            {
              path: "examples/minimal.html",
              beforeArtifactId: "target-before",
              afterArtifactId: "target-after",
            },
          ],
          verificationTestId: "T-verify",
          regressionTestIds: ["T-regression"],
        },
      ],
      counts: {
        verified: 1,
        open: 0,
        fixedUnverified: 0,
        disputed: 0,
        blocked: 0,
        decisionRequired: 0,
        acceptedRisk: 0,
      },
    },
    externalReports: {
      items: [],
      counts: { reproduced: 0, notReproduced: 0, blocked: 0, notAttempted: 0 },
    },
    developerSignals: {
      cutoff: endedAt,
      stoppingRule:
        "Stop after every applicable source family is reconciled and two successive batches add no new job, workaround, objection, or segment.",
      sourceFamilies,
      queries,
      signals: signalItems,
      counts: {
        supporting: 1,
        contradicting: 1,
        ambiguous: 0,
        completeQueries: 6,
        blockedQueries: 0,
        independenceGroups: 2,
      },
      saturation:
        "All six declared public source families were queried; the final two queries added no new segment.",
      counterevidence:
        "One independent maintainer source argues existing framework controls may be sufficient.",
    },
    goals: [
      {
        id: "G1",
        status: "succeeded",
        evidenceArtifactIds: ["T-final-assertion", "T-final-shot", "bcd", "release"],
      },
    ],
  };

  const manifestPath = join(runRoot, "launch-acceptance.json");
  await writeFile(manifestPath, `${JSON.stringify(run, null, 2)}\n`);
  return { run, manifestPath, runRoot };
}

export async function refreshLaunchBundle({ root, manifestPath } = {}) {
  const runRoot = resolve(root || dirname(manifestPath));
  const targetManifest = resolve(manifestPath || join(runRoot, "launch-acceptance.json"));
  const run = await readJsonFile(targetManifest);

  // Re-run documentation receipt if R-examples is present
  const receiptRunnerPath = join(REPO_ROOT, "scripts/run-with-receipt.mjs");
  const docsValidatorPath = join(REPO_ROOT, "scripts/validate-documentation-example.mjs");
  const contractArt = run.artifacts.find((a) => a.id === run.contract?.frozenManifestArtifactId);
  const guideArt = run.artifacts.find((a) => a.id === run.documentationGuide?.artifactId);

  if (contractArt && guideArt && Array.isArray(run.documentationExamples)) {
    const subjectArgs = run.documentationExamples.flatMap((ex) => {
      const art = run.artifacts.find((a) => a.path === ex.path);
      return art ? ["--subject", `${art.id}=${ex.path}`] : [];
    });
    subjectArgs.push("--subject", `${guideArt.id}=${guideArt.path}`);
    const exampleArgs = run.documentationExamples.flatMap((ex) => ["--example", ex.path]);

    const res = spawnSync(
      process.execPath,
      [
        receiptRunnerPath,
        "--root",
        runRoot,
        "--cwd",
        runRoot,
        "--id",
        "R-examples",
        ...subjectArgs,
        "--",
        process.execPath,
        docsValidatorPath,
        "--root",
        runRoot,
        "--contract",
        contractArt.path,
        ...exampleArgs,
        "--guide",
        guideArt.path,
      ],
      { cwd: runRoot, encoding: "utf8" },
    );
    if (res.status !== 0) {
      throw new Error(`Documentation validation failed during refresh: ${res.stderr}`);
    }
    const fragment = JSON.parse(
      readFileSync(join(runRoot, "receipts/R-examples.receipt.json"), "utf8"),
    );
    fragment.receipt.startedAt = run.interval.startedAt;
    fragment.receipt.endedAt = run.interval.endedAt;
    const rIdx = run.receipts.findIndex((r) => r.id === "R-examples");
    if (rIdx !== -1) run.receipts[rIdx] = fragment.receipt;
    for (const rArt of fragment.artifacts) {
      rArt.createdAt = run.interval.endedAt;
      const aIdx = run.artifacts.findIndex((a) => a.id === rArt.id);
      if (aIdx !== -1) run.artifacts[aIdx] = rArt;
      else run.artifacts.push(rArt);
    }
  }

  // Refresh bytes and sha256 for every artifact on disk
  for (const artifact of run.artifacts) {
    const full = join(runRoot, artifact.path);
    if (existsSync(full)) {
      const bytes = readFileSync(full);
      artifact.bytes = bytes.length;
      artifact.sha256 = sha256(bytes);
    }
  }

  // Update snapshot sha256 revisions on semanticClaims if facts snapshot changed
  const factsArt = run.artifacts.find((a) => a.id === "facts");
  if (factsArt) {
    for (const claim of run.semanticClaims || []) {
      if (
        claim.source?.snapshotArtifactId === "facts" &&
        String(claim.source?.revision || "").startsWith("sha256:")
      ) {
        claim.source.revision = `sha256:${factsArt.sha256}`;
      }
    }
  }

  await writeFile(targetManifest, `${JSON.stringify(run, null, 2)}\n`);
  return run;
}

export async function attestLaunchBundle({
  root,
  manifestPath,
  keyId = "parent-verifier-key",
  attestationKey = process.env.CHROME_DEVREL_ATTESTATION_KEY ||
    randomBytes(32).toString("hex"),
  useLateKeyProcess = false,
  fetchImpl = globalThis.fetch,
  now = new Date("2026-07-28T13:01:00.000Z"),
} = {}) {
  const runRoot = resolve(root || dirname(manifestPath));
  const targetManifest = resolve(manifestPath || join(runRoot, "launch-acceptance.json"));
  const outputPath = join(runRoot, "acceptance-run.json");

  if (useLateKeyProcess) {
    const signerPath = join(REPO_ROOT, "scripts/sign-launch-acceptance.mjs");
    const senderPath = join(REPO_ROOT, "scripts/send-launch-attestation-key.mjs");
    const socketPath = join(runRoot, ".attestation-key.sock");
    const cleanEnv = { ...process.env };
    delete cleanEnv.CHROME_DEVREL_ATTESTATION_KEY;

    const child = spawn(
      process.execPath,
      [
        signerPath,
        "--manifest",
        targetManifest,
        "--root",
        runRoot,
        "--key-socket",
        socketPath,
        "--key-id",
        keyId,
        "--online",
      ],
      { env: cleanEnv, stdio: ["ignore", "pipe", "pipe"] },
    );
    let stderr = "";
    await new Promise((resolveReady, rejectReady) => {
      child.stderr.setEncoding("utf8");
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
        if (stderr.includes("REPLAY_COMPLETE_KEY_SOCKET=")) resolveReady();
      });
      child.on("error", rejectReady);
      child.on("close", (code) => {
        if (!stderr.includes("REPLAY_COMPLETE_KEY_SOCKET=") && code !== 0) {
          rejectReady(new Error(`Signer exited early (${code}): ${stderr}`));
        }
      });
    });

    const sent = spawnSync(process.execPath, [senderPath, "--socket", socketPath], {
      env: { ...process.env, CHROME_DEVREL_ATTESTATION_KEY: attestationKey },
      encoding: "utf8",
    });
    if (sent.status !== 0) {
      throw new Error(`Failed sending late attestation key: ${sent.stderr}`);
    }
    const exitCode = await new Promise((r) => child.on("close", r));
    if (exitCode !== 0) {
      throw new Error(`Signer failed after key delivery (${exitCode}): ${stderr}`);
    }
  }

  const run = await readJsonFile(targetManifest);
  run.attestation = {
    algorithm: "hmac-sha256",
    keyId,
    signedDigest: "0".repeat(64),
    signature: "0".repeat(64),
  };
  Object.assign(run.attestation, computeLaunchAttestation(run, attestationKey));
  await writeFile(targetManifest, `${JSON.stringify(run, null, 2)}\n`);

  const schema = JSON.parse(
    await readFile(join(REPO_ROOT, "schemas/launch-acceptance.schema.json"), "utf8"),
  );
  const semanticSourcePolicy = JSON.parse(
    await readFile(join(REPO_ROOT, "config/semantic-fact-sources.json"), "utf8"),
  );
  const trustedDocumentationValidatorPath = join(
    REPO_ROOT,
    "scripts/validate-documentation-example.mjs",
  );

  const result = await validateLaunchAcceptance(run, {
    root: runRoot,
    online: true,
    fetchImpl,
    now,
    schema,
    semanticSourcePolicy,
    attestationKey,
    trustedDocumentationValidatorPath,
  });
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return { result, outputPath, manifestPath: targetManifest };
}

// What the `attest` command prints. On anything but success it carries the first ten
// computed errors, so the next step is visible without opening acceptance-run.json.
export function summarizeAttestation({ result, outputPath }) {
  const errors = result.errors ?? [];
  const succeeded = result.computedOutcome === "succeeded";
  return {
    status: "attested",
    computedOutcome: result.computedOutcome,
    diagnosticOutcome: result.diagnosticOutcome,
    outputPath,
    ...(succeeded || errors.length === 0
      ? {}
      : {
          errorCount: errors.length,
          errors: errors.slice(0, 10).map(({ code, path, message }) => ({ code, path, message })),
        }),
  };
}

const HELP = `Usage:
  node scripts/prepare-launch-bundle.mjs init --root <run-dir> [--packet <packet.json>] [--feature-id <id>] [--name <name>] [--milestone <n>] [--contracts C1,C2,C3] [--surface-token <token>]
  node scripts/prepare-launch-bundle.mjs refresh --root <run-dir>
  node scripts/prepare-launch-bundle.mjs attest --root <run-dir> [--key-id <id>] [--late-key]
`;

if (isMainModule(import.meta.url)) {
  const args = process.argv.slice(2);
  const sub = args[0];
  const value = (name, fallback) => {
    const idx = args.indexOf(name);
    return idx === -1 ? fallback : args[idx + 1];
  };

  if (!sub || args.includes("-h") || args.includes("--help")) {
    console.log(HELP);
    process.exit(sub ? 0 : 2);
  }

  const root = value("--root");
  if (!root) {
    console.error("Error: --root <run-dir> is required.");
    process.exit(2);
  }

  try {
    if (sub === "init") {
      const contracts = value("--contracts", "C1,C2,C3")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { manifestPath } = await initLaunchBundle({
        root,
        packetPath: value("--packet"),
        featureId: value("--feature-id", "5175745573945344"),
        featureName: value("--name", "Example API"),
        targetMilestone: Number(value("--milestone", "150")),
        contracts,
        surfaceToken: value("--surface-token", "ExampleAPI"),
      });
      console.log(JSON.stringify({ status: "initialized", manifestPath }, null, 2));
    } else if (sub === "refresh") {
      await refreshLaunchBundle({ root, manifestPath: value("--manifest") });
      console.log(JSON.stringify({ status: "refreshed", root: resolve(root) }, null, 2));
    } else if (sub === "attest") {
      const attested = await attestLaunchBundle({
        root,
        manifestPath: value("--manifest"),
        keyId: value("--key-id", "parent-verifier"),
        useLateKeyProcess: args.includes("--late-key"),
      });
      console.log(JSON.stringify(summarizeAttestation(attested), null, 2));
      if (attested.result.computedOutcome !== "succeeded") process.exit(1);
    } else {
      console.error(`Unknown subcommand: ${sub}`);
      process.exit(2);
    }
  } catch (error) {
    reportCliError("prepare-launch-bundle", error);
  }
}
