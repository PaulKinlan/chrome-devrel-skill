#!/usr/bin/env node
// packet.mjs — Persistent multi-session feature packet CLI (Phases 00-10)
// Enforces append-only ID continuity across evidence (E*), risks (R*), friction (F*),
// questions (Q*), and assets (A*), checks phase-gate readiness, and renders PACKET.md.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { reportCliError } from "./lib/cli-error.mjs";
import { isMainModule } from "./lib/is-main.mjs";
import { validateJsonSchema } from "./lib/json-schema-lite.mjs";
import { readJsonFile } from "./lib/read-json-file.mjs";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

export const VALID_STAGES = [
  "00-intake",
  "01-incubation",
  "02-prototype",
  "03-developer-trials",
  "04-wide-review",
  "05-experiment",
  "06-prepare-to-ship",
  "07-release",
  "08-adoption",
  "09-support",
  "10-deprecation",
];

const PHASE_REQUIRED_DIMENSIONS = {
  "01-incubation": ["problemValidity"],
  "02-prototype": ["problemValidity", "developerDemand"],
  "03-developer-trials": ["problemValidity", "developerDemand", "apiErgonomics"],
  "04-wide-review": [
    "problemValidity",
    "endUserImpact",
    "developerDemand",
    "apiErgonomics",
    "interoperability",
    "accessibilityPrivacySecurity",
  ],
  "05-experiment": [
    "problemValidity",
    "endUserImpact",
    "developerDemand",
    "apiErgonomics",
    "accessibilityPrivacySecurity",
    "measurement",
  ],
  "06-prepare-to-ship": [
    "problemValidity",
    "endUserImpact",
    "developerDemand",
    "apiErgonomics",
    "interoperability",
    "accessibilityPrivacySecurity",
    "frameworkServerIntegration",
    "docsAndSamples",
    "supportability",
    "measurement",
  ],
  "07-release": [
    "problemValidity",
    "endUserImpact",
    "developerDemand",
    "apiErgonomics",
    "interoperability",
    "accessibilityPrivacySecurity",
    "frameworkServerIntegration",
    "docsAndSamples",
    "supportability",
    "measurement",
  ],
  "08-adoption": ["docsAndSamples", "frameworkServerIntegration", "measurement"],
  "09-support": ["supportability", "docsAndSamples", "measurement"],
  "10-deprecation": ["endUserImpact", "interoperability", "supportability", "measurement"],
};

const COLLECTIONS = ["evidence", "risks", "friction", "questions", "assets"];

// Everything an update patch may touch. updatePacket ignores any other key, and for a
// ledger that exists so evidence cannot silently vanish, a mistyped key ("risk",
// "evidences") that "succeeds" while recording nothing is the worst possible failure.
const PATCHABLE_OBJECTS = ["feature", "jobs", "readiness"];
const PATCHABLE_KEYS = [...PATCHABLE_OBJECTS, ...COLLECTIONS];

export function assertPatchShape(patch) {
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
    throw new Error('PATCH_INVALID: a patch must be a JSON object such as {"risks": [...]}.');
  }
  const unknown = Object.keys(patch).filter((key) => !PATCHABLE_KEYS.includes(key));
  if (unknown.length > 0) {
    throw new Error(
      `PATCH_UNKNOWN_KEY: ${unknown.map((key) => `"${key}"`).join(", ")} would be silently ignored. ` +
        `Patchable fields: ${PATCHABLE_KEYS.join(", ")}.`,
    );
  }
  for (const key of PATCHABLE_OBJECTS) {
    const value = patch[key];
    if (value !== undefined && (value === null || typeof value !== "object" || Array.isArray(value))) {
      throw new Error(`PATCH_INVALID: "${key}" must be an object.`);
    }
  }
  for (const key of COLLECTIONS) {
    if (patch[key] !== undefined && !Array.isArray(patch[key])) {
      throw new Error(`PATCH_INVALID: "${key}" must be an array of items, each with an "id".`);
    }
  }
}

export async function loadPacketSchema() {
  return JSON.parse(
    await readFile(join(REPO_ROOT, "schemas/feature-packet.schema.json"), "utf8"),
  );
}

export async function loadPacketTemplate() {
  return JSON.parse(
    await readFile(join(REPO_ROOT, "templates/feature-packet.template.json"), "utf8"),
  );
}

export function renderPacketMarkdown(packet) {
  const f = packet.feature;
  const lines = [
    `# Feature Packet: ${f.name} (${f.id})`,
    "",
    `- **Stage:** \`${f.stage}\``,
    `- **Target Milestone:** M${f.targetMilestone}`,
    `- **Owner:** \`${f.owner}\``,
    `- **Current Decision:** ${f.currentDecision}`,
    `- **ChromeStatus:** ${f.chromestatusUrl || "not linked"}`,
    `- **Last Updated:** ${f.updatedAt}`,
    "",
    "## Jobs & Assumptions",
    "",
    `- **Developer Job:** ${packet.jobs.developerJob}`,
    `- **End-User Benefit:** ${packet.jobs.endUserBenefit}`,
    `- **Alternatives:** ${(packet.jobs.alternatives || []).join("; ") || "none recorded"}`,
    `- **Highest-Risk Assumptions:**`,
    ...(packet.jobs.highestRiskAssumptions || []).map((a) => `  - ${a}`),
    "",
    "## Readiness Matrix",
    "",
    "| Dimension | Status | Evidence IDs | Rationale |",
    "| --- | --- | --- | --- |",
  ];

  for (const [dim, val] of Object.entries(packet.readiness || {})) {
    const ev = (val.evidenceIds || []).join(", ") || "—";
    lines.push(`| \`${dim}\` | **${val.status}** | ${ev} | ${val.rationale} |`);
  }

  lines.push("", "## Evidence Ledger (Append-Only)", "");
  if (!packet.evidence?.length) {
    lines.push("_No evidence items recorded yet._");
  } else {
    lines.push("| ID | Kind | Status | Claim | Source | Retrieved |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const item of packet.evidence) {
      lines.push(
        `| \`${item.id}\` | ${item.kind} | ${item.status} | ${item.claim} | ${item.sourceUrl} | ${item.retrievedAt} |`,
      );
    }
  }

  lines.push("", "## Risk Register (Append-Only)", "");
  if (!packet.risks?.length) {
    lines.push("_No risks recorded yet._");
  } else {
    lines.push("| ID | Severity | Status | Owner | Summary | Mitigation |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const item of packet.risks) {
      lines.push(
        `| \`${item.id}\` | ${item.severity} | ${item.status} | \`${item.owner}\` | ${item.summary} | ${item.mitigation || "—"} |`,
      );
    }
  }

  lines.push("", "## Friction Frontier (Append-Only)", "");
  if (!packet.friction?.length) {
    lines.push("_No friction items recorded yet._");
  } else {
    lines.push("| ID | Category | Severity | Status | Owner | Summary |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const item of packet.friction) {
      lines.push(
        `| \`${item.id}\` | ${item.category} | ${item.severity} | ${item.status} | \`${item.owner}\` | ${item.summary} |`,
      );
    }
  }

  lines.push("", "## Open & Resolved Questions (Append-Only)", "");
  if (!packet.questions?.length) {
    lines.push("_No questions recorded yet._");
  } else {
    lines.push("| ID | Status | Owner | Question | Answer |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const item of packet.questions) {
      lines.push(
        `| \`${item.id}\` | ${item.status} | \`${item.owner}\` | ${item.question} | ${item.answer || "—"} |`,
      );
    }
  }

  lines.push("", "## Asset Inventory (Append-Only)", "");
  if (!packet.assets?.length) {
    lines.push("_No assets recorded yet._");
  } else {
    lines.push("| ID | Type | Status | Owner | Path / URL |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const item of packet.assets) {
      lines.push(
        `| \`${item.id}\` | ${item.type} | ${item.status} | \`${item.owner}\` | \`${item.pathOrUrl}\` |`,
      );
    }
  }

  lines.push("", "## Phase & Delta History", "");
  for (const h of packet.history || []) {
    const added = h.delta?.addedIds?.length ? `added: ${h.delta.addedIds.join(", ")}` : "added: none";
    const changed = h.delta?.statusChanges?.length
      ? `status changes: ${h.delta.statusChanges.join(", ")}`
      : "status changes: none";
    lines.push(`- **${h.at}** (\`${h.fromStage}\` → \`${h.toStage}\`): ${h.summary} _(${added}; ${changed})_`);
  }
  lines.push("");
  return lines.join("\n");
}

export async function initPacket({
  dir,
  id,
  name,
  stage = "01-incubation",
  milestone = 150,
  owner = "owner-required",
  decision = "Determine next lifecycle gate and required evidence",
  online = false,
  fetchImpl = globalThis.fetch,
  now = new Date(),
} = {}) {
  if (!dir || !id) {
    throw new Error("initPacket requires --dir and --id");
  }
  const template = await loadPacketTemplate();
  const schema = await loadPacketSchema();
  const nowIso = now.toISOString();

  const packet = structuredClone(template);
  packet.feature.id = String(id);
  packet.feature.name = name || `Feature ${id}`;
  packet.feature.chromestatusUrl = /^\d+$/.test(String(id))
    ? `https://chromestatus.com/feature/${id}`
    : `https://chromestatus.com/features`;
  packet.feature.stage = stage;
  packet.feature.targetMilestone = Number(milestone);
  packet.feature.owner = owner;
  packet.feature.currentDecision = decision;
  packet.feature.updatedAt = nowIso;
  packet.history = [
    {
      at: nowIso,
      fromStage: "00-intake",
      toStage: stage,
      summary: "Initialized persistent feature packet.",
      delta: { addedIds: [], statusChanges: [] },
    },
  ];

  if (online && /^\d+$/.test(String(id))) {
    const csUrl = `https://chromestatus.com/api/v0/features/${id}`;
    const res = await fetchImpl(csUrl, { headers: { accept: "application/json" } });
    if (res.ok) {
      const raw = await res.text();
      const data = JSON.parse(raw.replace(/^\)\]\}'\s*/, ""));
      if (data.name && !name) packet.feature.name = data.name;
      const mstone =
        data?.browsers?.chrome?.desktop ||
        data?.browsers?.chrome?.android ||
        data?.browsers?.chrome?.webview;
      if (Number.isInteger(mstone)) packet.feature.targetMilestone = mstone;
      if (data.summary) packet.jobs.developerJob = data.summary;
      packet.evidence.push({
        id: "E1",
        kind: "fact",
        claim: `ChromeStatus entry "${packet.feature.name}" targets milestone ${packet.feature.targetMilestone}`,
        sourceUrl: csUrl,
        retrievedAt: nowIso,
        status: "active",
      });
      packet.history[0].delta.addedIds.push("E1");
    }
  }

  const schemaErrors = validateJsonSchema(packet, schema);
  if (schemaErrors.length > 0) {
    throw new Error(`Invalid packet schema: ${JSON.stringify(schemaErrors)}`);
  }

  const targetDir = resolve(dir);
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, "packet.json"), `${JSON.stringify(packet, null, 2)}\n`);
  await writeFile(join(targetDir, "PACKET.md"), renderPacketMarkdown(packet));
  return packet;
}

export function mergeCollectionWithContinuity(collectionName, existingList = [], incomingList = []) {
  const existingById = new Map(existingList.map((item) => [item.id, item]));
  const incomingById = new Map(incomingList.map((item) => [item.id, item]));

  // Check if incomingList is a full replacement array that dropped an existing ID
  // Callers may either pass incremental items (to upsert) or a full array.
  // To support both safely while forbidding deletion, we merge incoming items by ID
  // and reject any explicit `{ _delete: true }` or missing ID when `strictFullArray` is set.
  const addedIds = [];
  const statusChanges = [];
  const mergedMap = new Map(existingById);

  for (const [id, item] of incomingById.entries()) {
    if (item && item._delete) {
      throw new Error(
        `ID_CONTINUITY_VIOLATION: Cannot delete ${collectionName} ID ${id}; mark status as retired/superseded/verified instead.`,
      );
    }
    if (!existingById.has(id)) {
      addedIds.push(id);
      mergedMap.set(id, item);
    } else {
      const prev = existingById.get(id);
      if (prev.status !== item.status) {
        statusChanges.push(`${id}:${prev.status}->${item.status}`);
      }
      mergedMap.set(id, { ...prev, ...item });
    }
  }

  return {
    items: [...mergedMap.values()],
    addedIds,
    statusChanges,
  };
}

export async function updatePacket({
  dir,
  patch = {},
  strictFullArrays = false,
  summary = "Updated feature packet.",
  now = new Date(),
} = {}) {
  assertPatchShape(patch);
  const targetDir = resolve(dir);
  const packetPath = join(targetDir, "packet.json");
  const current = await readJsonFile(packetPath);
  const schema = await loadPacketSchema();
  const nowIso = now.toISOString();

  const next = structuredClone(current);
  const fromStage = current.feature.stage;

  if (patch.feature) {
    next.feature = { ...current.feature, ...patch.feature, updatedAt: nowIso };
  } else {
    next.feature.updatedAt = nowIso;
  }

  if (patch.jobs) {
    next.jobs = { ...current.jobs, ...patch.jobs };
  }

  const addedIds = [];
  const statusChanges = [];

  if (patch.readiness) {
    for (const [dim, val] of Object.entries(patch.readiness)) {
      const prev = current.readiness?.[dim];
      if (prev && prev.status !== val.status) {
        statusChanges.push(`readiness.${dim}:${prev.status}->${val.status}`);
      }
      next.readiness[dim] = { ...(prev || {}), ...val };
    }
  }

  for (const col of COLLECTIONS) {
    if (Array.isArray(patch[col])) {
      if (strictFullArrays) {
        const incomingIds = new Set(patch[col].map((item) => item.id));
        for (const existing of current[col] || []) {
          if (!incomingIds.has(existing.id)) {
            throw new Error(
              `ID_CONTINUITY_VIOLATION: Update dropped existing ${col} ID ${existing.id}. Preserve the ID and update its status instead.`,
            );
          }
        }
      }
      const merged = mergeCollectionWithContinuity(col, current[col], patch[col]);
      next[col] = merged.items;
      addedIds.push(...merged.addedIds);
      statusChanges.push(...merged.statusChanges);
    }
  }

  const toStage = next.feature.stage;
  next.history.push({
    at: nowIso,
    fromStage,
    toStage,
    summary,
    delta: { addedIds, statusChanges },
  });

  const schemaErrors = validateJsonSchema(next, schema);
  if (schemaErrors.length > 0) {
    throw new Error(`Updated packet failed schema validation: ${JSON.stringify(schemaErrors)}`);
  }

  await writeFile(packetPath, `${JSON.stringify(next, null, 2)}\n`);
  await writeFile(join(targetDir, "PACKET.md"), renderPacketMarkdown(next));
  return { packet: next, delta: { fromStage, toStage, addedIds, statusChanges } };
}

export async function checkPacket({ dir, toPhase } = {}) {
  const targetDir = resolve(dir);
  const packet = await readJsonFile(join(targetDir, "packet.json"));
  const schema = await loadPacketSchema();
  const schemaErrors = validateJsonSchema(packet, schema);

  const targetStage = toPhase || packet.feature.stage;
  if (!VALID_STAGES.includes(targetStage)) {
    throw new Error(`Unknown lifecycle stage: ${targetStage}`);
  }

  const requiredDims = PHASE_REQUIRED_DIMENSIONS[targetStage] || ["problemValidity"];
  const blockers = [];
  const missingEvidence = [];
  const acceptedRisks = [];

  for (const error of schemaErrors) {
    blockers.push(`SCHEMA: ${error.path} ${error.message}`);
  }

  const evidenceIds = new Set((packet.evidence || []).map((e) => e.id));
  for (const [dim, state] of Object.entries(packet.readiness || {})) {
    for (const refId of state.evidenceIds || []) {
      if (!evidenceIds.has(refId)) {
        blockers.push(`BROKEN_EVIDENCE_LINK: readiness.${dim} references missing evidence ID ${refId}`);
      }
    }
    if (state.status === "contradicted") {
      blockers.push(`CONTRADICTED_DIMENSION: readiness.${dim} is contradicted (${state.rationale})`);
    } else if (requiredDims.includes(dim)) {
      if (state.status === "unknown") {
        missingEvidence.push(`readiness.${dim} is unknown (required for ${targetStage})`);
      } else if (state.status === "supported" && (!state.evidenceIds || state.evidenceIds.length === 0)) {
        blockers.push(`UNLINKED_SUPPORTED_CLAIM: readiness.${dim} is marked supported without any evidenceIds`);
      }
    }
  }

  for (const risk of packet.risks || []) {
    if (risk.status === "blocked" || (risk.status === "open" && risk.severity === "high")) {
      blockers.push(`OPEN_HIGH_RISK: ${risk.id} (${risk.summary}) [owner: ${risk.owner}]`);
    } else if (risk.status === "accepted-risk") {
      acceptedRisks.push(`${risk.id}: ${risk.summary} (owner: ${risk.owner})`);
    }
  }

  for (const item of packet.friction || []) {
    if (["open", "fixed-unverified", "disputed", "blocked", "decision-required"].includes(item.status)) {
      if (targetStage === "06-prepare-to-ship" || targetStage === "07-release" || item.severity === "high") {
        blockers.push(`UNRESOLVED_FRICTION: ${item.id} is ${item.status} (${item.summary})`);
      }
    } else if (item.status === "accepted-risk") {
      acceptedRisks.push(`${item.id}: ${item.summary} (owner: ${item.owner})`);
    }
  }

  let recommendation = "progress";
  if (blockers.length > 0 || missingEvidence.length > 0) {
    recommendation = "remain-in-phase";
  } else if (acceptedRisks.length > 0) {
    recommendation = "progress-with-accepted-risk";
  }

  return {
    featureId: packet.feature.id,
    currentStage: packet.feature.stage,
    targetStage,
    recommendation,
    blockers,
    missingEvidence,
    acceptedRisks,
    counts: {
      evidence: (packet.evidence || []).length,
      risks: (packet.risks || []).length,
      friction: (packet.friction || []).length,
      questions: (packet.questions || []).length,
      assets: (packet.assets || []).length,
    },
  };
}

const HELP = `Usage:
  node scripts/packet.mjs init --dir <dir> --id <feature-id> [--name <name>] [--stage <stage>] [--milestone <n>] [--owner <owner>] [--decision <text>] [--online]
  node scripts/packet.mjs update --dir <dir> --patch <patch.json> [--strict] [--summary <text>]
  node scripts/packet.mjs check --dir <dir> [--to-phase <stage>]
  node scripts/packet.mjs render --dir <dir>
`;

if (isMainModule(import.meta.url)) {
  const args = process.argv.slice(2);
  const subcommand = args[0];
  const value = (name, fallback) => {
    const idx = args.indexOf(name);
    return idx === -1 ? fallback : args[idx + 1];
  };

  if (!subcommand || args.includes("-h") || args.includes("--help")) {
    console.log(HELP);
    process.exit(subcommand ? 0 : 2);
  }

  const dir = value("--dir");
  if (!dir) {
    console.error("Error: --dir <packet-dir> is required.");
    process.exit(2);
  }

  try {
    if (subcommand === "init") {
      const packet = await initPacket({
        dir,
        id: value("--id"),
        name: value("--name"),
        stage: value("--stage", "01-incubation"),
        milestone: Number(value("--milestone", "150")),
        owner: value("--owner", "owner-required"),
        decision: value("--decision", "Determine next lifecycle gate and required evidence"),
        online: args.includes("--online"),
      });
      console.log(JSON.stringify({ status: "initialized", dir: resolve(dir), feature: packet.feature }, null, 2));
    } else if (subcommand === "update") {
      const patchPath = value("--patch");
      const patch = patchPath ? await readJsonFile(resolve(patchPath)) : {};
      assertPatchShape(patch);
      if (value("--stage")) {
        patch.feature = { ...(patch.feature || {}), stage: value("--stage") };
      }
      if (value("--decision")) {
        patch.feature = { ...(patch.feature || {}), currentDecision: value("--decision") };
      }
      const result = await updatePacket({
        dir,
        patch,
        strictFullArrays: args.includes("--strict"),
        summary: value("--summary", "Updated feature packet."),
      });
      console.log(JSON.stringify({ status: "updated", delta: result.delta }, null, 2));
    } else if (subcommand === "check") {
      const report = await checkPacket({ dir, toPhase: value("--to-phase") });
      console.log(JSON.stringify(report, null, 2));
      if (report.recommendation === "remain-in-phase") process.exit(1);
    } else if (subcommand === "render") {
      const targetDir = resolve(dir);
      const packet = await readJsonFile(join(targetDir, "packet.json"));
      await writeFile(join(targetDir, "PACKET.md"), renderPacketMarkdown(packet));
      console.log(`Rendered ${join(targetDir, "PACKET.md")}`);
    } else {
      console.error(`Unknown subcommand: ${subcommand}`);
      process.exit(2);
    }
  } catch (error) {
    reportCliError("packet", error);
  }
}
