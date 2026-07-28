import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { inflateSync } from "node:zlib";
import { validateJsonSchema } from "./json-schema-lite.mjs";
import { parseTrustedDocumentationCommand } from "./trusted-receipt-command.mjs";

const REQUIRED_SIGNAL_FAMILIES = [
  "problem-workaround-communities",
  "framework-library-tooling",
  "surveys-research-usage",
  "browser-standards-issues",
  "adjacent-platform-alternatives",
  "public-product-support",
];
const UNRESOLVED_FRICTION = new Set([
  "open",
  "fixed-unverified",
  "disputed",
  "blocked",
  "decision-required",
  "accepted-risk",
]);
const TERMINAL_GOALS = new Set(["succeeded", "blocked", "decision_required", "not_applicable"]);

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
};
const attestationPayload = (run) => {
  const copy = structuredClone(run);
  copy.attestation = { algorithm: copy.attestation?.algorithm, keyId: copy.attestation?.keyId };
  return Buffer.from(JSON.stringify(canonicalize(copy)));
};
export function computeUnsignedManifestDigest(run) {
  const copy = structuredClone(run);
  delete copy.attestation;
  return sha256(Buffer.from(JSON.stringify(canonicalize(copy))));
}
export function computeLaunchAttestation(run, key) {
  const payload = attestationPayload(run);
  return {
    signedDigest: sha256(payload),
    signature: createHmac("sha256", key).update(payload).digest("hex"),
  };
}
const isDate = (value) => Number.isFinite(Date.parse(value));
const unique = (items) => new Set(items).size === items.length;
const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const transformFactValue = (value, transform) => {
  if (!transform || transform === "identity") return value;
  if (transform === "chrome-major") {
    const major = Number(String(value).match(/^(\d+)/)?.[1]);
    return Number.isInteger(major) ? major : undefined;
  }
  if (transform === "date-only") {
    if (typeof value !== "string") return undefined;
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    return match?.[0];
  }
  return undefined;
};
const pointerEscape = (token) => token.replace(/~/g, "~0").replace(/\//g, "~1");

export function jsonPointerGet(value, pointer) {
  if (pointer === "") return value;
  if (typeof pointer !== "string" || !pointer.startsWith("/")) return undefined;
  let current = value;
  for (const encoded of pointer.slice(1).split("/")) {
    const token = encoded.replace(/~1/g, "/").replace(/~0/g, "~");
    if (current === null || typeof current !== "object" || !(token in current)) {
      return undefined;
    }
    current = current[token];
  }
  return current;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function imageDimensions(bytes, mime) {
  if (
    mime !== "image/png" || bytes.length < 57 ||
    !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) return null;
  let offset = 8;
  let dimensions = null;
  const idat = [];
  let ended = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) return null;
    const type = bytes.subarray(offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    const expectedCrc = bytes.readUInt32BE(offset + 8 + length);
    if (crc32(Buffer.concat([type, data])) !== expectedCrc) return null;
    const name = type.toString("ascii");
    if (name === "IHDR") {
      if (length !== 13 || data[8] !== 8 || ![0, 2, 3, 4, 6].includes(data[9]) || data[12] !== 0) return null;
      const bytesPerPixel = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 })[data[9]];
      dimensions = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), bytesPerPixel };
    } else if (name === "IDAT") idat.push(data);
    else if (name === "IEND") { ended = true; break; }
    offset = end;
  }
  if (!dimensions || !idat.length || !ended) return null;
  try {
    const raw = inflateSync(Buffer.concat(idat));
    const stride = 1 + dimensions.width * dimensions.bytesPerPixel;
    if (raw.length !== dimensions.height * stride) return null;
    for (let y = 0; y < dimensions.height; y++) if (raw[y * stride] > 4) return null;
  } catch { return null; }
  return dimensions;
}

export function stripSourceComments(source) {
  let output = "";
  let state = "code";
  let quote = "";
  for (let i = 0; i < source.length; i++) {
    const char = source[i], next = source[i + 1];
    if (state === "line") { if (char === "\n") { state = "code"; output += char; } continue; }
    if (state === "block") { if (char === "*" && next === "/") { state = "code"; i++; } continue; }
    if (state === "html") { if (source.slice(i, i + 3) === "-->") { state = "code"; i += 2; } continue; }
    if (state === "string") {
      output += char;
      if (char === "\\") { output += source[++i] || ""; continue; }
      if (char === quote) state = "code";
      continue;
    }
    if (char === "<" && source.slice(i, i + 4) === "<!--") { state = "html"; i += 3; continue; }
    if (char === "/" && next === "/") { state = "line"; i++; continue; }
    if (char === "/" && next === "*") { state = "block"; i++; continue; }
    if (["'", "\"", "`"].includes(char)) { state = "string"; quote = char; output += char; continue; }
    output += char;
  }
  return output;
}

function walkVersionAdded(value, path = "") {
  const found = [];
  if (!value || typeof value !== "object") return found;
  for (const [key, child] of Object.entries(value)) {
    const pointer = `${path}/${pointerEscape(key)}`;
    if (key === "version_added" && child !== "mirror" && /\/support\/chrome\/version_added$/.test(pointer)) found.push({ pointer, value: child });
    else found.push(...walkVersionAdded(child, pointer));
  }
  return found;
}

function walkReleaseDates(value, path = "") {
  const found = [];
  if (!value || typeof value !== "object") return found;
  for (const [key, child] of Object.entries(value)) {
    const pointer = `${path}/${pointerEscape(key)}`;
    if (/^(scheduledStableDate|actualStableReleaseDate|releaseDate)$/i.test(key)) {
      found.push({ pointer, value: child });
    } else {
      found.push(...walkReleaseDates(child, pointer));
    }
  }
  return found;
}

export async function validateLaunchAcceptance(run, {
  root,
  online = false,
  fetchImpl = globalThis.fetch,
  now = new Date(),
  schema,
  semanticSourcePolicy,
  attestationKey,
  trustedDocumentationValidatorPath,
  trustedNodePath = process.execPath,
} = {}) {
  const errors = [];
  const add = (code, path, message) => errors.push({ code, path, message });
  if (schema) errors.push(...validateJsonSchema(run, schema));
  else add("SCHEMA_VALIDATOR_REQUIRED", "/", "launch acceptance schema must be supplied by the trusted validator");
  if (!run || run.schemaVersion !== 1) add("SCHEMA_VERSION", "/schemaVersion", "must equal 1");
  if (!attestationKey || String(attestationKey).length < 32) add("ATTESTATION_KEY_REQUIRED", "/attestation", "parent verifier key of at least 32 characters is required and must not be exposed to workers");
  else if (run?.attestation?.algorithm !== "hmac-sha256" || !run?.attestation?.keyId) add("ATTESTATION_FORMAT", "/attestation", "hmac-sha256 and keyId required");
  else {
    const expected = computeLaunchAttestation(run, attestationKey);
    const digestOk = run.attestation.signedDigest === expected.signedDigest;
    const actualSignature = Buffer.from(run.attestation.signature || "", "hex");
    const expectedSignature = Buffer.from(expected.signature, "hex");
    const signatureOk = actualSignature.length === expectedSignature.length && timingSafeEqual(actualSignature, expectedSignature);
    if (!digestOk || !signatureOk) add("ATTESTATION_INVALID", "/attestation", "manifest changed after parent attestation or key does not match");
  }
  if (!root) add("RUN_ROOT_REQUIRED", "/", "run root is required");
  const topRequired = ["runId", "feature", "interval", "declaredOutcome", "contract", "artifacts", "receipts", "browserSessions", "tests", "documentationExamples", "documentationGuide", "semanticClaims", "friction", "externalReports", "developerSignals", "goals"];
  for (const field of topRequired) if (!(field in (run || {}))) add("SCHEMA_REQUIRED", `/${field}`, "required field missing");
  if (!new Set(["succeeded", "partial", "blocked", "decision_required"]).has(run?.declaredOutcome)) add("SCHEMA_ENUM", "/declaredOutcome", String(run?.declaredOutcome));
  if (run?.declaredOutcome !== "succeeded") add("DECLARED_OUTCOME_NOT_SUCCESS", "/declaredOutcome", "acceptance success requires an explicit succeeded candidate that survives independent validation");
  if (!run?.feature?.id || !run?.feature?.name || !run?.feature?.stage || !Number.isInteger(run?.feature?.targetMilestone)) add("SCHEMA_FEATURE", "/feature", "id, name, stage, and integer targetMilestone required");
  const started = Date.parse(run?.interval?.startedAt);
  const ended = Date.parse(run?.interval?.endedAt);
  if (!Number.isFinite(started) || !Number.isFinite(ended) || ended < started) {
    add("INVALID_RUN_INTERVAL", "/interval", "startedAt and endedAt must be ordered ISO timestamps");
  }
  if (ended > now.getTime() + 5 * 60_000) add("FUTURE_RUN", "/interval/endedAt", "run ends in the future");

  const maps = {};
  for (const key of ["artifacts", "receipts", "browserSessions", "tests", "documentationExamples", "semanticClaims", "goals"]) {
    const list = Array.isArray(run?.[key]) ? run[key] : [];
    if (!Array.isArray(run?.[key])) add("MISSING_ARRAY", `/${key}`, "must be an array");
    const ids = list.map((item) => item?.id).filter(Boolean);
    if (!unique(ids) || ids.length !== list.length) add("DUPLICATE_ID", `/${key}`, "every item needs a unique ID");
    maps[key] = new Map(list.map((item) => [item.id, item]));
  }
  const requiredByCollection = {
    artifacts: ["id", "path", "type", "mime", "bytes", "sha256", "createdAt", "producer"],
    receipts: ["id", "producer", "argv", "cwd", "startedAt", "endedAt", "exitCode", "stdoutArtifactId", "stderrArtifactId", "subjectArtifactIds", "subjects"],
    browserSessions: ["id", "producer", "tool", "browserVersion", "browserMajor", "channel", "os", "startedAt", "endedAt", "eventLogArtifactId"],
    tests: ["id", "attemptRole", "contractIds", "sessionId", "route", "result", "startedAt", "endedAt", "interactions", "consoleBeforeArtifactId", "consoleAfterArtifactId", "networkBeforeArtifactId", "networkAfterArtifactId", "assertionArtifactId", "screenshotArtifactIds", "adjacentRegressionIds"],
    documentationExamples: ["id", "kind", "path", "contractIds", "standalone", "copyPasteReady", "receiptId"],
    semanticClaims: ["id", "type", "value", "assetPath", "assetJsonPointer", "source"],
    goals: ["id", "status", "evidenceArtifactIds"],
  };
  for (const [collection, fields] of Object.entries(requiredByCollection)) {
    for (const item of maps[collection].values()) {
      for (const field of fields) if (!(field in item)) add("SCHEMA_REQUIRED", `/${collection}/${item.id || "?"}/${field}`, "required field missing");
    }
  }
  const artifactBytes = new Map();
  const artifactJson = new Map();
  const runRoot = resolve(root || ".");
  let realRunRoot = runRoot;
  try { realRunRoot = await realpath(runRoot); }
  catch { add("RUN_ROOT_MISSING", "/", runRoot); }
  const seenArtifactPaths = new Set();

  for (const artifact of maps.artifacts.values()) {
    const full = resolve(runRoot, artifact.path || "");
    if (!full.startsWith(`${runRoot}${sep}`)) {
      add("ARTIFACT_PATH_ESCAPE", `/artifacts/${artifact.id}/path`, artifact.path);
      continue;
    }
    if (seenArtifactPaths.has(artifact.path)) add("ARTIFACT_PATH_REUSED", `/artifacts/${artifact.id}/path`, artifact.path);
    seenArtifactPaths.add(artifact.path);
    let realFull;
    try { realFull = await realpath(full); }
    catch { add("ARTIFACT_MISSING", `/artifacts/${artifact.id}/path`, artifact.path); continue; }
    if (!realFull.startsWith(`${realRunRoot}${sep}`)) {
      add("ARTIFACT_PATH_ESCAPE", `/artifacts/${artifact.id}/path`, artifact.path);
      continue;
    }
    let stat;
    try { stat = await lstat(full); }
    catch { add("ARTIFACT_MISSING", `/artifacts/${artifact.id}/path`, artifact.path); continue; }
    if (stat.isSymbolicLink()) { add("ARTIFACT_SYMLINK", `/artifacts/${artifact.id}/path`, artifact.path); continue; }
    if (!stat.isFile()) { add("ARTIFACT_NOT_FILE", `/artifacts/${artifact.id}/path`, artifact.path); continue; }
    const bytes = await readFile(full);
    artifactBytes.set(artifact.id, bytes);
    if (bytes.length !== artifact.bytes) add("ARTIFACT_SIZE_MISMATCH", `/artifacts/${artifact.id}/bytes`, `${artifact.bytes} != ${bytes.length}`);
    const digest = sha256(bytes);
    if (digest !== artifact.sha256) add("ARTIFACT_HASH_MISMATCH", `/artifacts/${artifact.id}/sha256`, `${artifact.sha256} != ${digest}`);
    const created = Date.parse(artifact.createdAt);
    if (!Number.isFinite(created) || created < started || created > ended) {
      add("ARTIFACT_OUTSIDE_RUN", `/artifacts/${artifact.id}/createdAt`, artifact.createdAt);
    }
    if (artifact.mime === "application/json") {
      try { artifactJson.set(artifact.id, JSON.parse(bytes.toString("utf8"))); }
      catch { add("ARTIFACT_INVALID_JSON", `/artifacts/${artifact.id}`, artifact.path); }
    }
    if (artifact.type === "screenshot") {
      if (bytes.length < 1024) add("SCREENSHOT_TOO_SMALL", `/artifacts/${artifact.id}`, `${bytes.length} bytes`);
      const dimensions = imageDimensions(bytes, artifact.mime);
      if (!dimensions) add("SCREENSHOT_INVALID_IMAGE", `/artifacts/${artifact.id}`, artifact.mime);
      else if (dimensions.width < 320 || dimensions.height < 200) {
        add("SCREENSHOT_DIMENSIONS", `/artifacts/${artifact.id}`, `${dimensions.width}x${dimensions.height}`);
      }
      if (!artifact.sessionId || !artifact.testId) add("SCREENSHOT_UNBOUND", `/artifacts/${artifact.id}`, "sessionId and testId required");
      if (!new Set(["parent-verifier", "chrome-devtools-mcp"]).has(artifact.producer)) {
        add("SCREENSHOT_UNTRUSTED_PRODUCER", `/artifacts/${artifact.id}/producer`, artifact.producer);
      }
    }
  }

  for (const receipt of maps.receipts.values()) {
    if (receipt.producer !== "command-wrapper") add("UNTRUSTED_RECEIPT", `/receipts/${receipt.id}/producer`, receipt.producer);
    for (const field of ["stdoutArtifactId", "stderrArtifactId"]) {
      if (!maps.artifacts.has(receipt[field])) add("RECEIPT_ARTIFACT_MISSING", `/receipts/${receipt.id}/${field}`, receipt[field]);
    }
    if (receipt.exitCode !== 0) add("COMMAND_FAILED", `/receipts/${receipt.id}/exitCode`, String(receipt.exitCode));
    if (!isDate(receipt.startedAt) || !isDate(receipt.endedAt) || Date.parse(receipt.startedAt) < started || Date.parse(receipt.endedAt) > ended || Date.parse(receipt.endedAt) < Date.parse(receipt.startedAt)) add("RECEIPT_TIME", `/receipts/${receipt.id}`, "receipt must be ordered inside run interval");
    if (!Array.isArray(receipt.argv) || receipt.argv.length === 0) add("RECEIPT_ARGV", `/receipts/${receipt.id}/argv`, "argv required");
    if (!Array.isArray(receipt.subjectArtifactIds) || receipt.subjectArtifactIds.length === 0) add("RECEIPT_SUBJECT_REQUIRED", `/receipts/${receipt.id}/subjectArtifactIds`, "validated subject artifacts required");
    for (const id of receipt.subjectArtifactIds || []) if (!maps.artifacts.has(id)) add("RECEIPT_SUBJECT_MISSING", `/receipts/${receipt.id}/subjectArtifactIds`, id);
    if (!Array.isArray(receipt.subjects) || !sameValue(receipt.subjects.map((item) => item.id), receipt.subjectArtifactIds)) add("RECEIPT_SUBJECT_MANIFEST", `/receipts/${receipt.id}/subjects`, "subjects must exactly match subjectArtifactIds in order");
    for (const subject of receipt.subjects || []) {
      const artifact = maps.artifacts.get(subject.id);
      if (!artifact || artifact.path !== subject.path || artifact.sha256 !== subject.sha256After) add("RECEIPT_SUBJECT_HASH_MISMATCH", `/receipts/${receipt.id}/subjects`, subject.id);
    }
  }

  for (const session of maps.browserSessions.values()) {
    const sessionStarted = Date.parse(session.startedAt);
    const sessionEnded = Date.parse(session.endedAt);
    if (!Number.isFinite(sessionStarted) || !Number.isFinite(sessionEnded) || sessionStarted < started || sessionEnded > ended || sessionEnded <= sessionStarted) add("BROWSER_SESSION_TIME", `/browserSessions/${session.id}`, "ordered session must be inside run interval");
    if (session.producer !== "parent-verifier" || session.tool !== "chrome-devtools-mcp") {
      add("UNTRUSTED_BROWSER_SESSION", `/browserSessions/${session.id}`, "parent verifier and chrome-devtools-mcp required");
    }
    const parsedMajor = Number(String(session.browserVersion || "").match(/(?:Chrome\/)?(\d+)/)?.[1]);
    if (parsedMajor !== session.browserMajor) add("BROWSER_VERSION_MISMATCH", `/browserSessions/${session.id}/browserMajor`, `${session.browserMajor} != ${parsedMajor}`);
    const eventLog = maps.artifacts.get(session.eventLogArtifactId);
    const eventData = eventLog ? artifactJson.get(eventLog.id) : null;
    if (!eventLog || eventLog.type !== "mcp-event-log") add("MCP_EVENT_LOG_MISSING", `/browserSessions/${session.id}/eventLogArtifactId`, session.eventLogArtifactId);
    else {
      if (eventLog.producer !== "chrome-devtools-mcp") add("MCP_EVENT_LOG_UNTRUSTED", `/browserSessions/${session.id}/eventLogArtifactId`, eventLog.producer);
      if (Date.parse(eventLog.createdAt) < Date.parse(session.endedAt)) add("MCP_EVENT_LOG_INCOMPLETE", `/browserSessions/${session.id}/eventLogArtifactId`, "event log must be finalized after session ends");
      if (!eventData || eventData.sessionId !== session.id || eventData.browserVersion !== session.browserVersion || !Array.isArray(eventData.calls) || eventData.calls.length === 0) add("MCP_EVENT_LOG_INVALID", `/browserSessions/${session.id}/eventLogArtifactId`, "session/version/non-empty calls must match");
      const versionCall = eventData?.calls?.find((call) => call.tool === "Browser.getVersion");
      if (!versionCall || versionCall.result !== session.browserVersion || !isDate(versionCall.at) || Date.parse(versionCall.at) < sessionStarted || Date.parse(versionCall.at) > sessionEnded) add("MCP_BROWSER_VERSION_CALL_MISSING", `/browserSessions/${session.id}/eventLogArtifactId`, "Browser.getVersion result/timestamp must match inside session");
    }
  }

  const screenshotUse = new Map();
  const screenshotHashUse = new Map();

  const contractIds = Array.isArray(run?.contract?.ids) ? run.contract.ids : [];
  const blockedIds = Array.isArray(run?.contract?.blockedIds) ? run.contract.blockedIds : [];
  if (!contractIds.length || !unique(contractIds)) add("CONTRACT_IDS", "/contract/ids", "non-empty unique IDs required");
  for (const id of blockedIds) if (!contractIds.includes(id)) add("UNKNOWN_BLOCKED_CONTRACT", "/contract/blockedIds", id);
  const frozenContractArtifact = maps.artifacts.get(run?.contract?.frozenManifestArtifactId);
  const frozenContract = frozenContractArtifact ? artifactJson.get(frozenContractArtifact.id) : null;
  if (!frozenContractArtifact || frozenContractArtifact.type !== "contract-manifest" || frozenContractArtifact.producer !== "parent-verifier") {
    add("CONTRACT_MANIFEST_MISSING", "/contract/frozenManifestArtifactId", run?.contract?.frozenManifestArtifactId);
  } else if (!frozenContract || frozenContract.featureId !== run.feature.id || !sameValue(frozenContract.contractIds, contractIds) || !sameValue(frozenContract.sourceArtifactIds, run.contract.sourceArtifactIds)) {
    add("CONTRACT_MANIFEST_MISMATCH", "/contract", "feature, IDs, and sources must match the parent-frozen manifest");
  } else {
    const contractRows = Array.isArray(frozenContract.contracts) ? frozenContract.contracts : [];
    if (!sameValue(contractRows.map((row) => row.id), contractIds) || contractRows.some((row) => !Array.isArray(row.surfaceTokens) || row.surfaceTokens.length === 0 || !Array.isArray(row.examplePatterns) || row.examplePatterns.length === 0)) add("CONTRACT_DETAILS_MISSING", "/contract", "ordered IDs plus non-empty surfaceTokens and examplePatterns required");
    const earliestTest = Math.min(...[...maps.tests.values()].map((test) => Date.parse(test.startedAt)));
    if (Date.parse(frozenContractArtifact.createdAt) >= earliestTest) add("CONTRACT_NOT_FROZEN_BEFORE_TEST", "/contract/frozenManifestArtifactId", frozenContractArtifact.createdAt);
  }
  for (const id of run?.contract?.sourceArtifactIds || []) {
    const source = maps.artifacts.get(id);
    if (!source || !new Set(["spec-snapshot", "idl-snapshot", "explainer-snapshot"]).has(source.type) || source.producer !== "parent-verifier") add("CONTRACT_SOURCE_INVALID", "/contract/sourceArtifactIds", id);
  }
  for (const item of run?.contract?.supersessions || []) {
    if (!maps.artifacts.has(item.evidenceArtifactId)) add("CONTRACT_SUPERSESSION_EVIDENCE", "/contract/supersessions", item.evidenceArtifactId);
    for (const id of item.toIds || []) if (!contractIds.includes(id)) add("CONTRACT_SUPERSESSION_TARGET", "/contract/supersessions", id);
  }

  for (const test of maps.tests.values()) {
    const session = maps.browserSessions.get(test.sessionId);
    if (!session) add("TEST_SESSION_MISSING", `/tests/${test.id}/sessionId`, test.sessionId);
    else if (Date.parse(test.startedAt) < Date.parse(session.startedAt) || Date.parse(test.endedAt) > Date.parse(session.endedAt)) add("TEST_OUTSIDE_BROWSER_SESSION", `/tests/${test.id}`, "test interval must be inside browser session");
    for (const id of test.contractIds || []) if (!contractIds.includes(id)) add("TEST_UNKNOWN_CONTRACT", `/tests/${test.id}/contractIds`, id);
    if (!Array.isArray(test.interactions) || test.interactions.length === 0) add("TEST_NO_INTERACTIONS", `/tests/${test.id}/interactions`, "visible interactions required");
    const evidenceExpectations = {
      consoleBeforeArtifactId: "console-log",
      consoleAfterArtifactId: "console-log",
      networkBeforeArtifactId: "network-log",
      networkAfterArtifactId: "network-log",
      assertionArtifactId: "assertion",
    };
    for (const [field, type] of Object.entries(evidenceExpectations)) {
      const artifact = maps.artifacts.get(test[field]);
      if (!artifact) add("TEST_EVIDENCE_MISSING", `/tests/${test.id}/${field}`, test[field]);
      else {
        if (artifact.type !== type) add("TEST_EVIDENCE_TYPE", `/tests/${test.id}/${field}`, `${artifact.type} != ${type}`);
        if (artifact.producer !== "parent-verifier" && artifact.producer !== "chrome-devtools-mcp") add("TEST_EVIDENCE_UNTRUSTED", `/tests/${test.id}/${field}`, artifact.producer);
        const captured = Date.parse(artifact.createdAt);
        if (captured < Date.parse(test.startedAt) || captured > Date.parse(test.endedAt)) add("TEST_EVIDENCE_TIME", `/tests/${test.id}/${field}`, artifact.createdAt);
        const data = artifactJson.get(artifact.id);
        if (field !== "assertionArtifactId") {
          const phase = field.includes("Before") ? "before" : "after";
          if (!data || data.sessionId !== test.sessionId || data.testId !== test.id || data.phase !== phase || !Array.isArray(data.entries)) add("TEST_EVIDENCE_ENVELOPE", `/tests/${test.id}/${field}`, "sessionId, testId, phase, and entries must match");
        }
      }
    }
    const assertion = artifactJson.get(test.assertionArtifactId);
    if (!assertion || assertion.testId !== test.id || assertion.sessionId !== test.sessionId || assertion.route !== test.route || assertion.result !== test.result || !Array.isArray(assertion.assertions) || assertion.assertions.length === 0) {
      add("ASSERTION_RECEIPT_MISMATCH", `/tests/${test.id}/assertionArtifactId`, test.assertionArtifactId);
    } else {
      const shaped = assertion.assertions.every((item) => item && typeof item.id === "string" && typeof item.passed === "boolean" && "expected" in item && "actual" in item);
      if (!shaped) add("ASSERTION_DETAILS_MISSING", `/tests/${test.id}/assertionArtifactId`, "id, passed, expected, and actual required");
      if (test.result === "pass" && assertion.assertions.some((item) => item.passed !== true)) add("ASSERTION_FALSE_PASS", `/tests/${test.id}/assertionArtifactId`, "every assertion must pass");
      if (test.result === "fail" && !assertion.assertions.some((item) => item.passed === false)) add("ASSERTION_FAILURE_MISSING", `/tests/${test.id}/assertionArtifactId`, "failed test requires a failed assertion");
    }
    const eventLog = session ? artifactJson.get(session.eventLogArtifactId) : null;
    const testCalls = eventLog?.calls?.filter((call) => call.testId === test.id) || [];
    const callInTime = (call) => isDate(call?.at) && Date.parse(call.at) >= Date.parse(test.startedAt) && Date.parse(call.at) <= Date.parse(test.endedAt);
    const navigateCall = testCalls.find((call) => call.tool === "navigate" && call.route === test.route && callInTime(call));
    if (!navigateCall) add("MCP_TEST_CALL_MISSING", `/tests/${test.id}`, "navigate with matching route/timestamp");
    for (const interaction of test.interactions || []) if (!testCalls.some((call) => call.tool === "interaction" && call.value === interaction && callInTime(call))) add("MCP_TEST_CALL_MISSING", `/tests/${test.id}`, `interaction:${interaction}`);
    for (const [tool, artifactIds] of Object.entries({
      console: [test.consoleBeforeArtifactId, test.consoleAfterArtifactId],
      network: [test.networkBeforeArtifactId, test.networkAfterArtifactId],
      assertion: [test.assertionArtifactId],
    })) for (const artifactId of artifactIds) if (!testCalls.some((call) => call.tool === tool && call.artifactId === artifactId && callInTime(call))) add("MCP_TEST_CALL_MISSING", `/tests/${test.id}`, `${tool}:${artifactId}`);
    if (!Array.isArray(test.screenshotArtifactIds) || test.screenshotArtifactIds.length === 0) {
      add("TEST_SCREENSHOT_REQUIRED", `/tests/${test.id}/screenshotArtifactIds`, "at least one saved screenshot required");
    }
    for (const screenshotId of test.screenshotArtifactIds || []) {
      if (screenshotUse.has(screenshotId)) add("SCREENSHOT_REUSED", `/tests/${test.id}/screenshotArtifactIds`, `${screenshotId} already used by ${screenshotUse.get(screenshotId)}`);
      screenshotUse.set(screenshotId, test.id);
      const artifact = maps.artifacts.get(screenshotId);
      if (artifact?.sha256 && screenshotHashUse.has(artifact.sha256) && screenshotHashUse.get(artifact.sha256) !== test.id) add("SCREENSHOT_HASH_REUSED", `/tests/${test.id}/screenshotArtifactIds`, `same bytes as ${screenshotHashUse.get(artifact.sha256)}`);
      if (artifact?.sha256) screenshotHashUse.set(artifact.sha256, test.id);
      if (!artifact || artifact.type !== "screenshot") add("TEST_SCREENSHOT_INVALID", `/tests/${test.id}/screenshotArtifactIds`, screenshotId);
      else {
        if (artifact.sessionId !== test.sessionId || artifact.testId !== test.id) add("SCREENSHOT_SESSION_MISMATCH", `/tests/${test.id}/screenshotArtifactIds`, screenshotId);
        if (!testCalls.some((call) => call.tool === "screenshot" && call.artifactId === screenshotId && callInTime(call))) add("MCP_TEST_CALL_MISSING", `/tests/${test.id}`, `screenshot:${screenshotId}`);
      }
    }
    for (const id of test.adjacentRegressionIds || []) {
      const regression = maps.tests.get(id);
      if (!regression || regression.attemptRole !== "regression" || regression.result !== "pass") add("ADJACENT_REGRESSION_INVALID", `/tests/${test.id}/adjacentRegressionIds`, id);
    }
    if (test.result === "pass" && (!session || !maps.artifacts.has(test.assertionArtifactId))) {
      add("UNATTESTED_TEST_PASS", `/tests/${test.id}`, "pass requires session and assertion evidence");
    }
  }

  if (!trustedDocumentationValidatorPath) add("TRUSTED_DOCS_VALIDATOR_REQUIRED", "/documentationExamples", "trusted validator path required");
  const parseDocsArgv = async (receipt) => {
    const result = await parseTrustedDocumentationCommand(receipt, { runRoot, trustedDocumentationValidatorPath, trustedNodePath });
    return result.ok ? result.parsed : null;
  };
  const requiredKinds = new Set(["feature-detection", "minimal", "branch-failure-integration", "realistic"]);
  const docCovered = new Set();
  for (const example of maps.documentationExamples.values()) {
    requiredKinds.delete(example.kind);
    if (example.standalone !== true || example.copyPasteReady !== true) add("EXAMPLE_NOT_COPY_PASTE", `/documentationExamples/${example.id}`, "standalone and copyPasteReady must be true");
    for (const id of example.contractIds || []) { docCovered.add(id); if (!contractIds.includes(id)) add("EXAMPLE_UNKNOWN_CONTRACT", `/documentationExamples/${example.id}/contractIds`, id); }
    const receipt = maps.receipts.get(example.receiptId);
    if (!receipt || receipt.exitCode !== 0) add("EXAMPLE_NOT_EXECUTED", `/documentationExamples/${example.id}/receiptId`, example.receiptId);
    const artifact = [...maps.artifacts.values()].find((item) => item.path === example.path);
    if (receipt && artifact && !receipt.subjectArtifactIds?.includes(artifact.id)) add("EXAMPLE_RECEIPT_UNRELATED", `/documentationExamples/${example.id}/receiptId`, example.receiptId);
    if (receipt && artifact) {
      const subject = receipt.subjects?.find((item) => item.id === artifact.id);
      if (!subject || subject.sha256Before !== subject.sha256After) add("EXAMPLE_RECEIPT_MUTATED_SUBJECT", `/documentationExamples/${example.id}/receiptId`, example.receiptId);
      const parsedDocs = await parseDocsArgv(receipt);
      const exactDocsCommand = parsedDocs && parsedDocs.unknown.length === 0 && resolve(parsedDocs.root || "") === runRoot && parsedDocs.contract === frozenContractArtifact?.path && parsedDocs.examples.includes(artifact.path);
      if (!exactDocsCommand || !artifactBytes.get(receipt.stdoutArtifactId)?.toString("utf8").includes("Documentation validation passed")) add("EXAMPLE_RECEIPT_COMMAND", `/documentationExamples/${example.id}/receiptId`, "trusted docs validator must execute with exact root/contract/example arguments and success output");
    }
    if (!artifact || artifact.type !== "documentation-example") add("EXAMPLE_ARTIFACT_MISSING", `/documentationExamples/${example.id}/path`, example.path);
    else {
      if (artifact.bytes < 200) add("EXAMPLE_TOO_THIN", `/documentationExamples/${example.id}/path`, `${artifact.bytes} bytes cannot contain a complete standalone example`);
      const text = artifactBytes.get(artifact.id)?.toString("utf8") || "";
      const executableText = stripSourceComments(text);
      for (const contractId of example.contractIds || []) {
        const row = frozenContract?.contracts?.find((item) => item.id === contractId);
        for (const token of row?.surfaceTokens || []) if (!executableText.includes(token)) add("EXAMPLE_CONTRACT_TOKEN_MISSING", `/documentationExamples/${example.id}/path`, `${contractId}:${token}`);
        for (const pattern of row?.examplePatterns || []) {
          try { if (!new RegExp(pattern).test(executableText)) add("EXAMPLE_CONTRACT_PATTERN_MISSING", `/documentationExamples/${example.id}/path`, `${contractId}:${pattern}`); }
          catch { add("CONTRACT_EXAMPLE_PATTERN_INVALID", "/contract", `${contractId}:${pattern}`); }
        }
      }
      if (example.kind === "feature-detection" && !/(?:in\s+globalThis|typeof\s+globalThis)/.test(executableText)) add("EXAMPLE_KIND_BEHAVIOR_MISSING", `/documentationExamples/${example.id}/path`, "feature detection must execute");
      if (example.kind === "branch-failure-integration" && (!/catch\s*\(|error/i.test(executableText) || !/(?:fallback|unsupported|denied)/i.test(executableText))) add("EXAMPLE_KIND_BEHAVIOR_MISSING", `/documentationExamples/${example.id}/path`, "failure and fallback branches required");
      if (example.kind === "realistic" && (!/<form[\s>]/i.test(executableText) || !/(?:recovery|retry|reset)/i.test(executableText) || !/await\s/.test(executableText))) add("EXAMPLE_KIND_BEHAVIOR_MISSING", `/documentationExamples/${example.id}/path`, "form/state, async behavior, and recovery required");
      if (/\b(?:TODO|FIXME|REPLACE_ME|PLACEHOLDER|YOUR_API_KEY)\b|<your-[^>]+>/i.test(text)) {
        add("EXAMPLE_PLACEHOLDER", `/documentationExamples/${example.id}/path`, example.path);
      }
    }
  }
  if (requiredKinds.size) add("EXAMPLE_LAYER_MISSING", "/documentationExamples", [...requiredKinds].join(", "));
  const requiredGuideSections = ["overview", "feature-detection-setup-fallback", "api-behavior-inventory", "options-errors-exceptions", "permissions-policies-security", "lifecycle-cleanup", "server-build-framework-deployment", "compatibility-progressive-enhancement", "accessibility-privacy-performance", "troubleshooting-diagnostics", "realistic-integration"];
  const guide = run?.documentationGuide;
  const guideArtifact = maps.artifacts.get(guide?.artifactId);
  const guideReceipt = maps.receipts.get(guide?.receiptId);
  if (!guideArtifact || guideArtifact.type !== "documentation-guide") add("DOCUMENTATION_GUIDE_MISSING", "/documentationGuide/artifactId", guide?.artifactId);
  else if (guideArtifact.bytes < 500) add("DOCUMENTATION_GUIDE_TOO_THIN", "/documentationGuide/artifactId", `${guideArtifact.bytes} bytes`);
  if (!guideReceipt || guideReceipt.exitCode !== 0 || !guideReceipt.subjectArtifactIds?.includes(guide?.artifactId)) add("DOCUMENTATION_GUIDE_UNVALIDATED", "/documentationGuide/receiptId", guide?.receiptId);
  else {
    const subject = guideReceipt.subjects?.find((item) => item.id === guide.artifactId);
    const parsedDocs = await parseDocsArgv(guideReceipt);
    const exactDocsCommand = parsedDocs && parsedDocs.unknown.length === 0 && resolve(parsedDocs.root || "") === runRoot && parsedDocs.contract === frozenContractArtifact?.path && parsedDocs.guide === guideArtifact?.path;
    if (!subject || subject.sha256Before !== subject.sha256After || !exactDocsCommand) add("DOCUMENTATION_GUIDE_RECEIPT_COMMAND", "/documentationGuide/receiptId", "trusted docs validator must execute with exact root/contract/guide arguments and stable subject hash");
  }
  for (const section of requiredGuideSections) if (!guide?.sections?.includes(section)) add("DOCUMENTATION_GUIDE_SECTION_MISSING", "/documentationGuide/sections", section);
  for (const id of contractIds) {
    if (!blockedIds.includes(id) && !docCovered.has(id)) add("EXAMPLE_COVERAGE_GAP", "/documentationExamples", id);
  }
  const finalTestCovered = new Set(
    [...maps.tests.values()].filter((test) => ["verification", "regression", "final"].includes(test.attemptRole) && test.result === "pass")
      .flatMap((test) => test.contractIds || []),
  );
  for (const id of contractIds) if (!blockedIds.includes(id) && !finalTestCovered.has(id)) add("RUNTIME_COVERAGE_GAP", "/tests", id);

  const claimsByAssetPointer = new Map();
  const adapters = semanticSourcePolicy?.adapters || {};
  if (!semanticSourcePolicy) add("SEMANTIC_SOURCE_POLICY_REQUIRED", "/semanticClaims", "trusted adapter policy required");
  for (const claim of maps.semanticClaims.values()) {
    claimsByAssetPointer.set(`${claim.assetPath}#${claim.assetJsonPointer}`, claim);
    const asset = [...maps.artifacts.values()].find((item) => item.path === claim.assetPath);
    const assetValue = asset ? jsonPointerGet(artifactJson.get(asset.id), claim.assetJsonPointer) : undefined;
    if (assetValue === undefined) add("CLAIM_ASSET_SELECTOR_MISSING", `/semanticClaims/${claim.id}/assetJsonPointer`, claim.assetJsonPointer);
    else if (!sameValue(assetValue, claim.value)) add("CLAIM_ASSET_MISMATCH", `/semanticClaims/${claim.id}/value`, JSON.stringify(assetValue));
    const adapter = adapters[claim.source?.adapter];
    let sourceUrl = null;
    if (!adapter) add("SEMANTIC_ADAPTER_UNKNOWN", `/semanticClaims/${claim.id}/source/adapter`, claim.source?.adapter);
    else {
      if (!adapter.claimTypes?.includes(claim.type)) add("SEMANTIC_ADAPTER_TYPE", `/semanticClaims/${claim.id}/type`, `${claim.type} not allowed by ${claim.source.adapter}`);
      try {
        const url = new URL(claim.source.liveUrl);
        sourceUrl = url;
        if (url.protocol !== "https:" || url.hostname !== adapter.hostname || !(new RegExp(adapter.pathPattern).test(url.pathname))) add("SEMANTIC_SOURCE_NOT_AUTHORITATIVE", `/semanticClaims/${claim.id}/source/liveUrl`, claim.source.liveUrl);
        for (const [key, rawExpected] of Object.entries(adapter.requiredQuery || {})) {
          const expected = rawExpected === "$targetMilestone" ? String(run.feature.targetMilestone) : rawExpected;
          if (url.searchParams.get(key) !== expected) add("SEMANTIC_SOURCE_QUERY", `/semanticClaims/${claim.id}/source/liveUrl`, `${key}=${expected} required`);
        }
      } catch { add("SEMANTIC_SOURCE_NOT_AUTHORITATIVE", `/semanticClaims/${claim.id}/source/liveUrl`, claim.source?.liveUrl); }
      if (!(new RegExp(adapter.sourcePointerPattern).test(claim.source?.jsonPointer || ""))) add("SEMANTIC_SOURCE_SELECTOR", `/semanticClaims/${claim.id}/source/jsonPointer`, claim.source?.jsonPointer);
      if (adapter.binding === "bcd-pointer-equality" && claim.source.jsonPointer !== claim.assetJsonPointer) add("SEMANTIC_BINDING", `/semanticClaims/${claim.id}`, "BCD asset and source pointers must match");
      if (adapter.binding === "chromestatus-feature-id" && sourceUrl?.pathname.split("/").filter(Boolean).at(-1) !== String(run.feature.id)) add("SEMANTIC_BINDING", `/semanticClaims/${claim.id}`, "ChromeStatus URL feature ID must match run feature ID");
    }
    if (claim.type === "bcd-version-added") {
      if (!/\/support\/chrome\/version_added$/.test(claim.assetJsonPointer || "") || !/\/support\/chrome\/version_added$/.test(claim.source?.jsonPointer || "")) add("BCD_SELECTOR_SEMANTICS", `/semanticClaims/${claim.id}`, "Chrome version_added selectors required");
      if (!(claim.value === false || (typeof claim.value === "string" && /^(?:≤)?\d+(?:\.\d+)?$/.test(claim.value)))) add("BCD_VERSION_FORMAT", `/semanticClaims/${claim.id}/value`, String(claim.value));
    }
    if (claim.type === "implementation-first-version" && !Number.isInteger(claim.value)) add("IMPLEMENTATION_VERSION_FORMAT", `/semanticClaims/${claim.id}/value`, String(claim.value));
    if (["target-milestone", "current-stable-milestone"].includes(claim.type) && !Number.isInteger(claim.value)) add("MILESTONE_FORMAT", `/semanticClaims/${claim.id}/value`, String(claim.value));
    if (claim.type === "scheduled-stable-date" && !/\/scheduledStableDate$/.test(claim.assetJsonPointer || "")) add("RELEASE_DATE_SEMANTICS", `/semanticClaims/${claim.id}`, "scheduled claim must target scheduledStableDate");
    if (claim.type === "actual-stable-release-date" && !/\/actualStableReleaseDate$/.test(claim.assetJsonPointer || "")) add("RELEASE_DATE_SEMANTICS", `/semanticClaims/${claim.id}`, "actual claim must target actualStableReleaseDate");
    const transform = adapter?.transformsByClaimType?.[claim.type] || adapter?.transform || "identity";
    const snapshot = maps.artifacts.get(claim.source?.snapshotArtifactId);
    const snapshotJson = snapshot ? artifactJson.get(snapshot.id) : undefined;
    const rawSourceValue = snapshot ? jsonPointerGet(snapshotJson, claim.source?.jsonPointer) : undefined;
    const sourceValue = transformFactValue(rawSourceValue, transform);
    if (!snapshot || snapshot.type !== "source-snapshot") add("CLAIM_SNAPSHOT_MISSING", `/semanticClaims/${claim.id}/source/snapshotArtifactId`, claim.source?.snapshotArtifactId);
    else if (sourceValue === undefined) add("CLAIM_SOURCE_SELECTOR_MISSING", `/semanticClaims/${claim.id}/source/jsonPointer`, claim.source?.jsonPointer);
    else if (!sameValue(sourceValue, claim.value)) add("VERSION_EVIDENCE_MISMATCH", `/semanticClaims/${claim.id}/value`, `${JSON.stringify(claim.value)} != ${JSON.stringify(sourceValue)}`);
    if (adapter?.binding === "schedule-target-milestone" && jsonPointerGet(snapshotJson, "/mstones/0/mstone") !== run.feature.targetMilestone) add("SEMANTIC_BINDING", `/semanticClaims/${claim.id}`, "schedule response milestone must match run target milestone");
    const retrieved = Date.parse(claim.source?.retrievedAt);
    if (!Number.isFinite(retrieved) || retrieved > ended || ended - retrieved > 48 * 60 * 60_000) add("CURRENTNESS_STALE", `/semanticClaims/${claim.id}/source/retrievedAt`, claim.source?.retrievedAt);
    if (!/^(?:git:[a-f0-9]{40}|sha256:[a-f0-9]{64})$/.test(claim.source?.revision || "")) {
      add("CLAIM_REVISION", `/semanticClaims/${claim.id}/source/revision`, claim.source?.revision);
    } else if (claim.source.revision.startsWith("sha256:") && snapshot && claim.source.revision !== `sha256:${snapshot.sha256}`) {
      add("CLAIM_REVISION_MISMATCH", `/semanticClaims/${claim.id}/source/revision`, `${claim.source.revision} != sha256:${snapshot.sha256}`);
    }
    if (claim.type === "target-milestone" && claim.value !== run?.feature?.targetMilestone) add("TARGET_MILESTONE_MISMATCH", `/semanticClaims/${claim.id}/value`, String(claim.value));
    if (["scheduled-stable-date", "actual-stable-release-date"].includes(claim.type) && !/^\d{4}-\d{2}-\d{2}$/.test(claim.value)) add("RELEASE_DATE_FORMAT", `/semanticClaims/${claim.id}/value`, String(claim.value));
    if (claim.type === "bcd-version-added" && !(typeof claim.value === "string" || claim.value === false)) add("BCD_VERSION_TYPE", `/semanticClaims/${claim.id}/value`, String(claim.value));
    if (online) {
      try {
        const response = await fetchImpl(claim.source.liveUrl, { headers: { accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        let live;
        if (typeof response.text === "function") {
          let text = await response.text();
          if (adapter?.stripXssi) text = text.replace(/^\)\]\}'\s*/, "");
          live = JSON.parse(text);
        } else live = await response.json();
        if (adapter?.binding === "schedule-target-milestone" && jsonPointerGet(live, "/mstones/0/mstone") !== run.feature.targetMilestone) add("SEMANTIC_BINDING", `/semanticClaims/${claim.id}`, "live schedule milestone must match run target milestone");
        const liveValue = transformFactValue(jsonPointerGet(live, claim.source.jsonPointer), transform);
        if (!sameValue(liveValue, claim.value)) add("LIVE_CLAIM_MISMATCH", `/semanticClaims/${claim.id}`, `${JSON.stringify(claim.value)} != ${JSON.stringify(liveValue)}`);
      } catch (error) {
        add("LIVE_SOURCE_BLOCKED", `/semanticClaims/${claim.id}/source/liveUrl`, error.message);
      }
    }
  }
  if (!online) add("ONLINE_FACTS_REQUIRED", "/declaredOutcome", "success requires fresh primary-source retrieval by validator");
  for (const requiredType of ["target-milestone", "current-stable-milestone"]) {
    if (![...maps.semanticClaims.values()].some((claim) => claim.type === requiredType)) add("REQUIRED_CLAIM_MISSING", "/semanticClaims", requiredType);
  }
  for (const artifact of maps.artifacts.values()) {
    if (artifact.type === "bcd-patch") {
      for (const found of walkVersionAdded(artifactJson.get(artifact.id))) {
        if (!claimsByAssetPointer.has(`${artifact.path}#${found.pointer}`)) add("UNREGISTERED_BCD_VERSION", `/artifacts/${artifact.id}`, `${artifact.path}#${found.pointer}`);
      }
    }
    if (artifact.type === "release-metadata") {
      for (const found of walkReleaseDates(artifactJson.get(artifact.id))) {
        if (!claimsByAssetPointer.has(`${artifact.path}#${found.pointer}`)) add("UNREGISTERED_RELEASE_DATE", `/artifacts/${artifact.id}`, `${artifact.path}#${found.pointer}`);
      }
    }
  }

  const frictionItems = Array.isArray(run?.friction?.items) ? run.friction.items : [];
  const frictionIds = frictionItems.map((item) => item.id);
  if (!unique(frictionIds)) add("DUPLICATE_FRICTION_ID", "/friction/items", "IDs must be unique");
  const expectedCounts = { verified: 0, open: 0, fixedUnverified: 0, disputed: 0, blocked: 0, decisionRequired: 0, acceptedRisk: 0 };
  const countKey = { verified: "verified", open: "open", "fixed-unverified": "fixedUnverified", disputed: "disputed", blocked: "blocked", "decision-required": "decisionRequired", "accepted-risk": "acceptedRisk" };
  for (const item of frictionItems) {
    expectedCounts[countKey[item.status]]++;
    const original = maps.tests.get(item.originalTestId);
    if (!original || original.result !== "fail") add("FRICTION_ORIGINAL_FAILURE_MISSING", `/friction/items/${item.id}/originalTestId`, item.originalTestId);
    for (const id of [...(item.beforeArtifactIds || []), ...(item.fixArtifactIds || []), ...(item.afterArtifactIds || [])]) if (!maps.artifacts.has(id)) add("FRICTION_ARTIFACT_MISSING", `/friction/items/${item.id}`, id);
    if (item.status === "verified") {
      const verification = maps.tests.get(item.verificationTestId);
      if (!verification || verification.result !== "pass" || verification.attemptRole !== "verification" || verification.reproductionOf !== item.originalTestId) add("FRICTION_VERIFICATION_MISSING", `/friction/items/${item.id}/verificationTestId`, item.verificationTestId);
      else {
        const originalSession = maps.browserSessions.get(original.sessionId);
        const verificationSession = maps.browserSessions.get(verification.sessionId);
        const sameEnvironment = originalSession && verificationSession && ["browserVersion", "browserMajor", "channel", "os", "flags", "policies", "profileId"].every((field) => sameValue(originalSession[field], verificationSession[field]));
        if (verification.route !== original.route || verification.platformEvidence !== original.platformEvidence || !sameValue(verification.contractIds, original.contractIds) || !sameValue(verification.interactions, original.interactions) || !sameEnvironment) add("FRICTION_REPRODUCTION_MISMATCH", `/friction/items/${item.id}/verificationTestId`, "route, environment, contracts, platform, and interactions must match");
        if (Date.parse(verification.startedAt) <= Date.parse(original.endedAt)) add("FRICTION_VERIFICATION_ORDER", `/friction/items/${item.id}/verificationTestId`, "verification must start after original failure ended");
        if (!sameValue([...(verification.adjacentRegressionIds || [])].sort(), [...(item.regressionTestIds || [])].sort())) add("FRICTION_REGRESSION_FRONTIER_MISMATCH", `/friction/items/${item.id}/regressionTestIds`, "verification and friction regression IDs must match");
        for (const id of item.fixArtifactIds || []) {
          const changedAt = Date.parse(maps.artifacts.get(id)?.createdAt);
          if (!(changedAt > Date.parse(original.endedAt) && changedAt < Date.parse(verification.startedAt))) add("FRICTION_FIX_ORDER", `/friction/items/${item.id}/fixArtifactIds`, id);
        }
        for (const id of item.afterArtifactIds || []) {
          const capturedAt = Date.parse(maps.artifacts.get(id)?.createdAt);
          if (capturedAt < Date.parse(verification.startedAt) || capturedAt > Date.parse(verification.endedAt)) add("FRICTION_AFTER_EVIDENCE_ORDER", `/friction/items/${item.id}/afterArtifactIds`, id);
        }
      }
      if (!item.fixArtifactIds?.length || !item.afterArtifactIds?.length || !item.changedSubjects?.length) add("FRICTION_FIX_EVIDENCE_MISSING", `/friction/items/${item.id}`, "fix, changed subject, and after artifacts required");
      for (const subject of item.changedSubjects || []) {
        const before = maps.artifacts.get(subject.beforeArtifactId);
        const after = maps.artifacts.get(subject.afterArtifactId);
        if (!before || !after || before.type !== "changed-subject-snapshot" || after.type !== "changed-subject-snapshot") add("FRICTION_CHANGED_SUBJECT_MISSING", `/friction/items/${item.id}/changedSubjects`, subject.path);
        else {
          if (before.sha256 === after.sha256) add("FRICTION_CHANGED_SUBJECT_UNCHANGED", `/friction/items/${item.id}/changedSubjects`, subject.path);
          const fixArtifacts = (item.fixArtifactIds || []).map((id) => maps.artifacts.get(id)).filter(Boolean);
          const latestFixTime = Math.max(...fixArtifacts.map((artifact) => Date.parse(artifact.createdAt)));
          if (Date.parse(before.createdAt) > Date.parse(original.endedAt) || !verification || Date.parse(after.createdAt) <= latestFixTime || Date.parse(after.createdAt) >= Date.parse(verification.startedAt)) add("FRICTION_CHANGED_SUBJECT_ORDER", `/friction/items/${item.id}/changedSubjects`, subject.path);
          const linkedChange = fixArtifacts.some((artifact) => {
            if (artifact.type !== "change-record") return false;
            const record = artifactJson.get(artifact.id);
            return record?.subjects?.some((entry) => entry.path === subject.path && entry.beforeSha256 === before.sha256 && entry.afterSha256 === after.sha256);
          });
          if (!linkedChange) add("FRICTION_FIX_SUBJECT_UNLINKED", `/friction/items/${item.id}/changedSubjects`, `${subject.path} with exact before/after hashes`);
        }
      }
      const beforeHashes = new Set((item.beforeArtifactIds || []).map((id) => maps.artifacts.get(id)?.sha256));
      if ((item.afterArtifactIds || []).every((id) => beforeHashes.has(maps.artifacts.get(id)?.sha256))) add("FRICTION_NO_CHANGED_EVIDENCE", `/friction/items/${item.id}`, "after evidence must differ");
      for (const id of item.regressionTestIds || []) {
        const regression = maps.tests.get(id);
        if (!regression || regression.result !== "pass" || regression.attemptRole !== "regression") add("FRICTION_REGRESSION_FAILED", `/friction/items/${item.id}/regressionTestIds`, id);
        else if (verification && Date.parse(regression.startedAt) <= Date.parse(verification.endedAt)) add("FRICTION_REGRESSION_ORDER", `/friction/items/${item.id}/regressionTestIds`, id);
      }
      if (item.category === "visual") {
        if ((original?.screenshotArtifactIds?.length || 0) < 1 || (verification?.screenshotArtifactIds?.length || 0) < 1) add("FRICTION_VISUAL_EVIDENCE_MISSING", `/friction/items/${item.id}`, "before and after screenshots required");
        else {
          const before = new Set(original.screenshotArtifactIds.map((id) => maps.artifacts.get(id)?.sha256));
          if (verification.screenshotArtifactIds.every((id) => before.has(maps.artifacts.get(id)?.sha256))) add("FRICTION_VISUAL_UNCHANGED", `/friction/items/${item.id}`, "before and after screenshot bytes must differ");
        }
      }
    }
    if (item.status === "accepted-risk" && (!item.acceptedBy || !maps.artifacts.has(item.acceptanceEvidenceArtifactId))) add("RISK_ACCEPTANCE_UNATTESTED", `/friction/items/${item.id}`, "human authority evidence required");
  }
  for (const test of maps.tests.values()) {
    if (test.result === "fail" && !frictionItems.some((item) => item.originalTestId === test.id)) add("FAILED_TEST_NOT_IN_FRICTION", `/tests/${test.id}`, "every failure must enter friction frontier");
  }
  for (const [key, value] of Object.entries(expectedCounts)) if (run?.friction?.counts?.[key] !== value) add("FRICTION_COUNT_MISMATCH", `/friction/counts/${key}`, `${run?.friction?.counts?.[key]} != ${value}`);
  for (const item of frictionItems) if (UNRESOLVED_FRICTION.has(item.status)) add("UNRESOLVED_FRICTION", `/friction/items/${item.id}/status`, item.status);

  const reports = Array.isArray(run?.externalReports?.items) ? run.externalReports.items : [];
  const reportCounts = { reproduced: 0, notReproduced: 0, blocked: 0, notAttempted: 0 };
  const reportKey = { reproduced: "reproduced", "not-reproduced": "notReproduced", blocked: "blocked", "not-attempted": "notAttempted" };
  if (!unique(reports.map((item) => item.id))) add("DUPLICATE_EXTERNAL_REPORT", "/externalReports/items", "IDs must be unique");
  for (const report of reports) {
    reportCounts[reportKey[report.status]]++;
    if (!maps.artifacts.has(report.sourceArtifactId)) add("EXTERNAL_REPORT_SOURCE_MISSING", `/externalReports/items/${report.id}/sourceArtifactId`, report.sourceArtifactId);
    const test = report.reproductionTestId ? maps.tests.get(report.reproductionTestId) : null;
    if (report.status === "reproduced") {
      if (!test || test.result !== "fail" || !frictionItems.some((item) => item.id === report.frictionId && item.originalTestId === test.id)) add("EXTERNAL_REPORT_REPRODUCTION_MISSING", `/externalReports/items/${report.id}`, "failed reproduction and linked friction required");
    } else if (report.status === "not-reproduced" && (!test || test.result !== "pass")) {
      add("EXTERNAL_REPORT_ATTEMPT_MISSING", `/externalReports/items/${report.id}`, "passing reproduction attempt required");
    }
  }
  for (const [key, value] of Object.entries(reportCounts)) if (run?.externalReports?.counts?.[key] !== value) add("EXTERNAL_REPORT_COUNT_MISMATCH", `/externalReports/counts/${key}`, `${run?.externalReports?.counts?.[key]} != ${value}`);
  if (reportCounts.blocked || reportCounts.notAttempted) add("EXTERNAL_REPORT_FRONTIER_OPEN", "/externalReports/counts", `${reportCounts.blocked} blocked, ${reportCounts.notAttempted} not attempted`);

  const signals = run?.developerSignals || {};
  const families = Array.isArray(signals.sourceFamilies) ? signals.sourceFamilies : [];
  const familyMap = new Map(families.map((item) => [item.id, item]));
  for (const id of REQUIRED_SIGNAL_FAMILIES) if (!familyMap.has(id)) add("SIGNAL_FAMILY_MISSING", "/developerSignals/sourceFamilies", id);
  const applicableComplete = families.filter((item) => item.applicability === "applicable" && item.status === "complete");
  if (applicableComplete.length < 4) add("SIGNAL_FAMILY_DEPTH", "/developerSignals/sourceFamilies", `${applicableComplete.length} complete applicable families; need at least 4`);
  if (families.some((item) => item.applicability === "applicable" && item.status === "blocked")) add("SIGNAL_RESEARCH_BLOCKED", "/developerSignals/sourceFamilies", "applicable source family blocked");
  const queries = Array.isArray(signals.queries) ? signals.queries : [];
  const queryMap = new Map(queries.map((item) => [item.id, item]));
  for (const family of applicableComplete) if (!queries.some((query) => query.sourceFamilyId === family.id && query.status === "complete")) add("SIGNAL_FAMILY_UNQUERIED", `/developerSignals/sourceFamilies/${family.id}`, family.id);
  for (const query of queries) {
    if (!familyMap.has(query.sourceFamilyId)) add("SIGNAL_QUERY_FAMILY_MISSING", `/developerSignals/queries/${query.id}`, query.sourceFamilyId);
    if (query.retrieved !== query.relevant + query.duplicate + query.screenedOut + query.blocked) add("SIGNAL_QUERY_DENOMINATOR", `/developerSignals/queries/${query.id}`, `${query.retrieved} != ${query.relevant}+${query.duplicate}+${query.screenedOut}+${query.blocked}`);
    const artifact = maps.artifacts.get(query.resultArtifactId);
    const results = artifact ? artifactJson.get(artifact.id) : null;
    if (!artifact || artifact.type !== "developer-signal-results" || artifact.producer !== "parent-verifier" || !Array.isArray(results)) add("SIGNAL_QUERY_EVIDENCE_MISSING", `/developerSignals/queries/${query.id}/resultArtifactId`, query.resultArtifactId);
    else {
      if (results.length !== query.retrieved) add("SIGNAL_QUERY_RESULT_COUNT", `/developerSignals/queries/${query.id}`, `${results.length} != ${query.retrieved}`);
      const dispositions = { relevant: 0, duplicate: 0, screenedOut: 0, blocked: 0 };
      for (const result of results) {
        if (!(result?.disposition in dispositions) || !result.canonicalUrl) add("SIGNAL_QUERY_RESULT_INVALID", `/developerSignals/queries/${query.id}`, JSON.stringify(result));
        else dispositions[result.disposition]++;
      }
      for (const key of Object.keys(dispositions)) if (dispositions[key] !== query[key]) add("SIGNAL_QUERY_DISPOSITION_COUNT", `/developerSignals/queries/${query.id}/${key}`, `${dispositions[key]} != ${query[key]}`);
    }
  }
  const signalItems = Array.isArray(signals.signals) ? signals.signals : [];
  if (!unique(signalItems.map((item) => item.id))) add("DUPLICATE_SIGNAL_ID", "/developerSignals/signals", "IDs must be unique");
  for (const item of signalItems) {
    const query = queryMap.get(item.queryId);
    if (!query) add("SIGNAL_QUERY_MISSING", `/developerSignals/signals/${item.id}`, item.queryId);
    const evidence = maps.artifacts.get(item.evidenceArtifactId);
    if (!evidence || evidence.type !== "developer-signal-evidence") add("SIGNAL_EVIDENCE_MISSING", `/developerSignals/signals/${item.id}/evidenceArtifactId`, item.evidenceArtifactId);
    const results = artifactJson.get(query?.resultArtifactId);
    const matched = Array.isArray(results) ? results.find((result) => result.disposition === "relevant" && result.canonicalUrl === item.canonicalUrl) : null;
    if (!matched) add("SIGNAL_RESULT_LINK_MISSING", `/developerSignals/signals/${item.id}/canonicalUrl`, item.canonicalUrl);
    else if (matched.independenceGroup !== item.independenceGroup) add("SIGNAL_INDEPENDENCE_MISMATCH", `/developerSignals/signals/${item.id}/independenceGroup`, `${item.independenceGroup} != ${matched.independenceGroup}`);
  }
  for (const query of queries) {
    const represented = signalItems.filter((item) => item.queryId === query.id).length;
    if (represented !== query.relevant) add("SIGNAL_RELEVANT_MISMATCH", `/developerSignals/queries/${query.id}/relevant`, `${query.relevant} != ${represented} ledger signals`);
  }
  const directionCounts = { supporting: 0, contradicting: 0, ambiguous: 0 };
  for (const item of signalItems) directionCounts[item.direction]++;
  for (const [key, value] of Object.entries(directionCounts)) if (signals.counts?.[key] !== value) add("SIGNAL_COUNT_MISMATCH", `/developerSignals/counts/${key}`, `${signals.counts?.[key]} != ${value}`);
  const completeQueries = queries.filter((item) => item.status === "complete").length;
  const blockedQueries = queries.filter((item) => item.status === "blocked").length;
  if (signals.counts?.completeQueries !== completeQueries || signals.counts?.blockedQueries !== blockedQueries) add("SIGNAL_QUERY_COUNT_MISMATCH", "/developerSignals/counts", `${completeQueries}/${blockedQueries}`);
  if (blockedQueries > 0) add("SIGNAL_QUERY_BLOCKED", "/developerSignals/queries", String(blockedQueries));
  if (!signals.stoppingRule?.trim() || !signals.saturation?.trim() || !signals.counterevidence?.trim()) add("SIGNAL_RESEARCH_NARRATIVE", "/developerSignals", "stoppingRule, saturation, and counterevidence required");
  const independenceGroups = new Set(signalItems.map((item) => item.independenceGroup)).size;
  if (signals.counts?.independenceGroups !== independenceGroups) add("SIGNAL_INDEPENDENCE_COUNT", "/developerSignals/counts/independenceGroups", `${signals.counts?.independenceGroups} != ${independenceGroups}`);
  if (signalItems.length && independenceGroups < 2) add("SIGNAL_INDEPENDENCE", "/developerSignals/signals", "at least two independent groups required when signals exist");
  if (!queries.some((query) => query.status === "complete" && query.intent === "falsify" && query.blocked === 0 && query.relevant + query.screenedOut > 0)) add("SIGNAL_FALSIFICATION_QUERY_MISSING", "/developerSignals/queries", "at least one completed falsification query with inspected non-blocked results required");
  if (directionCounts.contradicting === 0 && !/^No contradictory signal found\b/.test(signals.counterevidence || "")) add("SIGNAL_COUNTEREVIDENCE_UNSUPPORTED", "/developerSignals/counterevidence", "name contradicting evidence or explicitly state none found with limitations");
  const cutoff = Date.parse(signals.cutoff);
  if (!Number.isFinite(cutoff) || cutoff > ended) add("SIGNAL_CUTOFF", "/developerSignals/cutoff", signals.cutoff);

  const goals = [...maps.goals.values()];
  for (const goal of goals) {
    for (const id of goal.evidenceArtifactIds || []) if (!maps.artifacts.has(id)) add("GOAL_EVIDENCE_MISSING", `/goals/${goal.id}`, id);
    if (!TERMINAL_GOALS.has(goal.status)) add("GOAL_NOT_TERMINAL", `/goals/${goal.id}/status`, goal.status);
  }
  for (const goal of goals) if (goal.status !== "succeeded" && goal.status !== "not_applicable") add("GOAL_PREVENTS_SUCCESS", `/goals/${goal.id}/status`, goal.status);
  if (blockedIds.length) add("BLOCKED_CONTRACT_PREVENTS_SUCCESS", "/contract/blockedIds", blockedIds.join(", "));

  const computedOutcome = errors.length === 0 ? "succeeded" : "rejected";
  return {
    schemaVersion: 1,
    runId: run?.runId || null,
    declaredOutcome: run?.declaredOutcome || null,
    computedOutcome,
    errors,
    counts: {
      errors: errors.length,
      artifacts: maps.artifacts.size,
      tests: maps.tests.size,
      screenshots: [...maps.artifacts.values()].filter((item) => item.type === "screenshot").length,
      semanticClaims: maps.semanticClaims.size,
      friction: frictionItems.length,
      developerSignals: signalItems.length,
      contractTotal: contractIds.length,
      documentationCovered: docCovered.size,
      runtimeCovered: finalTestCovered.size,
    },
  };
}
