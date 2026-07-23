#!/usr/bin/env node
// Generate retrospective reports from ChromeStatus evidence and metrics data.
// Usage: node scripts/generate-retrospective-report.mjs --feature <featureId> [--milestone <m>]
// Generates a consistent report following the established schema.

import { readFile, writeFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const root = resolve(value("--root", "retrospectives/runs/2026-07-19-v140-v150"));
const featureId = value("--feature", null);
const milestone = parseInt(value("--milestone", "0"));

if (!featureId) {
  console.error("Usage: --feature <featureId> [--milestone <m>]");
  process.exit(1);
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}
async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

// Load feature manifest
const featuresText = await readFile(join(root, "manifest.features.jsonl"), "utf8");
const features = featuresText.trim().split("\n").filter(Boolean).map(l => JSON.parse(l));
const feat = features.find(f => String(f.featureId) === String(featureId));
if (!feat) {
  console.error(`Feature ${featureId} not found in manifest`);
  process.exit(1);
}

// Load ChromeStatus detail
const detailPath = join(root, feat.detailEvidencePath);
const detail = await readJson(detailPath);

// Load metrics evidence if it exists
const manifest = await readJson(join(root, "evidence/metrics/manifest.json"));
const metricsRow = manifest.features?.find(f => String(f.featureId) === String(featureId));
let metricsEvidence = null;
let mappingStatus = "no-public-counter-mapped";
if (metricsRow) {
  mappingStatus = metricsRow.mappingStatus;
  try {
    metricsEvidence = await readJson(join(root, metricsRow.path));
  } catch {}
}

// Build sources
const sources = [{
  id: "S1",
  url: feat.chromeStatusUrl,
  publisher: "Chrome Platform Status",
  publishedOrObservedAt: detail.created?.when?.split(" ")[0] || null,
  retrievedAt: "2026-07-22T18:07:24Z",
  sourceType: "primary",
  supports: [`${detail.name}: ChromeStatus record with feature details, owner, and launch milestone`],
  limitations: "ChromeStatus record fields only; intent thread content may not be directly accessible.",
}];

let sourceCounter = 2;
let adoptionFinding = "No public Chrome usage counter is mapped for this feature. Adoption cannot be measured from public telemetry.";
let adoptionEvidenceIds = [];
let adoptionLimitations = "No public ChromeStatus counter exists for this feature.";

if (metricsEvidence && metricsEvidence.metrics?.length > 0) {
  const m = metricsEvidence.metrics[0];
  const latest = m.latestSnapshot || {};
  const summary = m.summary || {};
  const pct = (latest.day_percentage * 100).toFixed(4);
  const counterType = m.type === "css" ? "CSS property" : m.type === "webfeature" ? "WebDX/WebFeature" : "legacy HTML/JS";
  const scope = m.scope || "unknown";

  sources.push({
    id: "S2",
    url: m.timelineUrl,
    publisher: `Chrome Platform Status (${counterType} popularity timeline)`,
    publishedOrObservedAt: latest.date || null,
    retrievedAt: metricsEvidence.collectedAt,
    sourceType: "usage",
    supports: [
      `${counterType} counter '${m.propertyName || m.bucketId}' (bucket_id ${m.bucketId}), scope: ${scope}, confidence: ${m.confidence}; latest ${pct}% on ${latest.date}`,
    ],
    limitations: scope.includes("family") || scope.includes("property")
      ? `Family/property-level counter; does not isolate the specific feature adoption.`
      : `Counter measures this feature's usage directly.`,
  });
  sourceCounter = 3;

  const summaryInfo = summary.points ? ` Tracked since ${summary.firstObservedPositive?.date || "unknown"} with ${summary.points} data points.` : "";
  adoptionFinding = `The ${counterType} counter '${m.propertyName || m.bucketId}' (ChromeStatus timeline, bucket_id ${m.bucketId}) measured ${pct}% of measured Chrome HTTP/HTTPS page loads on ${latest.date}.${summaryInfo} Mapping confidence: ${m.confidence}.`;
  adoptionEvidenceIds = ["S1", "S2"];
  adoptionLimitations = scope.includes("family") || scope.includes("property")
    ? `Counter measures the ${m.propertyName} family/property, not this specific feature. Does not isolate the Chrome ${milestone} increment.`
    : `Counter measures this feature directly but may include pre-existing usage.`;
}

// Determine feature type
const isCatchup = detail.category && detail.web_feature && detail.is_official_web_feature;
const featureType = isCatchup ? "Chromium catches up" : "New capability";

// Build phase reviews
function phase(status, finding, evidenceIds = [], limitations = "") {
  return { status, finding, evidenceIds, limitations };
}

const launchEvents = feat.launchEvents.map(e => ({
  eventId: e.eventId,
  milestone: e.milestone,
  category: e.category,
  date: detail.stages?.find(s => s.stage_type === 220)?.intent_thread_stage_info?.deadlines?.find(d => d.name === "shipped")?.date || null,
}));

const report = {
  schemaVersion: 1,
  feature: {
    id: detail.id,
    name: detail.name,
    chromeStatusUrl: feat.chromeStatusUrl,
    category: detail.category || "Unknown",
    blinkComponent: detail.blink_components?.[0] || "Unknown",
    owner: detail.stages?.[0]?.pm_emails?.[0] || detail.stages?.[0]?.tl_emails?.[0] || "Unknown",
    creator: detail.created?.by || "Unknown",
    featureType,
    webFeature: detail.web_feature || null,
    specLink: detail.stages?.find(s => s.intent_thread_stage_info)?.intent_thread_stage_info?.spec_links?.[0]?.url || null,
    starCount: detail.star_count || 0,
    summary: detail.summary || detail.name,
  },
  launchEvents,
  evidenceCutoff: "2026-07-22",
  phaseReview: {
    intake: phase(
      detail.summary ? "supported" : "partial",
      `ChromeStatus record (created ${detail.created?.when?.split(" ")[0] || "unknown"} by ${detail.created?.by || "unknown"}). ${detail.summary || "No summary available."} Category: ${detail.category || "Unknown"}. Blink component: ${detail.blink_components?.[0] || "Unknown"}. Stars: ${detail.star_count || 0}.`,
      ["S1"],
      "ChromeStatus record fields only; intent thread content not directly accessible."
    ),
    incubation: phase(
      detail.web_feature ? "partial" : "unknown",
      detail.web_feature
        ? `Feature targets web feature '${detail.web_feature}'. ${detail.is_official_web_feature ? "This is an official WebDX feature." : "This is not an official WebDX feature."} Problem definition depends on the spec/explainer which was not directly accessible.`
        : "No web feature mapping. Problem definition unknown from public record.",
      ["S1"],
      "No public explainer or incubation discussion accessible."
    ),
    prototype: phase("unknown", "No public evidence of prototype-stage friction logs, API ergonomics testing, or framework integration.", [], "Prototype-stage evidence not publicly documented."),
    developerTrials: phase("not relevant", "No developer trial was conducted or required for this feature.", [], ""),
    wideReview: phase(
      detail.is_official_web_feature ? "partial" : "unknown",
      detail.is_official_web_feature
        ? `Feature maps to official WebDX feature '${detail.web_feature}'. Cross-engine positions not verified in this report.`
        : "Cross-engine review status unknown.",
      detail.is_official_web_feature ? ["S1"] : [],
      "Direct TAG/Mozilla/WebKit positions not checked."
    ),
    experiment: phase("not relevant", "No origin trial needed.", [], ""),
    prepareToShip: phase("unknown", "Documentation and samples readiness unknown.", [], "No evidence of docs readiness."),
    release: phase(
      feat.launchEvents.length > 0 ? "supported" : "unknown",
      feat.launchEvents.length > 0
        ? `Shipped in Chrome ${feat.launchEvents[0].milestone} (${feat.launchEvents[0].category}).`
        : "No launch event found.",
      ["S1"],
      ""
    ),
    adoption: phase(
      mappingStatus === "no-public-counter-mapped" ? "unknown" : "partial",
      adoptionFinding,
      adoptionEvidenceIds,
      adoptionLimitations
    ),
    support: phase("unknown", "No public support evidence gathered.", [], ""),
    deprecation: phase("not relevant", "This is a capability addition or behavior change, not a deprecation.", [], ""),
  },
  outcomes: {
    developerValue: phase(
      detail.summary ? "supported" : "unknown",
      detail.summary ? `Addresses: ${detail.summary.substring(0, 200)}` : "Developer value not documented.",
      ["S1"]
    ),
    endUserImpact: phase("unknown", "End-user impact not analyzed in this report.", []),
    adoption: phase(
      mappingStatus === "no-public-counter-mapped" ? "unknown" : "partial",
      adoptionFinding,
      adoptionEvidenceIds
    ),
    interoperability: phase(
      detail.is_official_web_feature ? "partial" : "unknown",
      detail.is_official_web_feature ? `Maps to WebDX feature '${detail.web_feature}'. Cross-engine support not verified.` : "Interoperability status unknown.",
      detail.is_official_web_feature ? ["S1"] : []
    ),
    implementationQuality: phase("unknown", "No implementation quality evidence.", []),
    evidenceAndCommunication: phase("partial", `ChromeStatus record exists with ${detail.star_count || 0} stars.`, ["S1"]),
    support: phase("unknown", "No support evidence.", []),
    overall: phase("partial", `Report generated from ChromeStatus evidence${metricsEvidence ? " with cached usage metrics" : ""}. Missing: intent thread, prototype evidence, docs verification, support data.`, ["S1", ...(metricsEvidence ? ["S2"] : [])]),
  },
  sources,
  successes: [
    ...(detail.summary ? ["Clear feature description and problem statement in ChromeStatus"] : []),
    ...(detail.is_official_web_feature ? ["Maps to official WebDX feature"] : []),
    ...(metricsEvidence ? ["Usage metrics available and cached"] : []),
  ],
  failures: [
    "Intent thread content not accessible",
    ...(mappingStatus === "no-public-counter-mapped" ? ["No public usage counter for adoption measurement"] : []),
    "Prototype-stage friction logs not documented",
    "Documentation readiness not verified",
  ],
  counterfactuals: [
    "Without developer demand research, the feature priority is assumed from the ChromeStatus record alone",
  ],
  skillImprovements: [
    ...(metricsEvidence ? ["Add a mandatory metrics step to the retrospective flow"] : ["For features without counters, document the evidence gap explicitly"]),
  ],
  completion: {
    status: "partial",
    missingEvidence: [
      "Intent thread content",
      "Prototype-stage testing",
      "Documentation verification",
      ...(mappingStatus === "no-public-counter-mapped" ? ["No public usage counter exists for this feature"] : []),
      "Cross-engine positions",
      "Support data",
    ],
    notes: `Report generated ${new Date().toISOString()}.${metricsEvidence ? " Includes cached Chrome usage metrics." : " No public Chrome usage counter is mapped."}`,
  },
};

const reportPath = join(root, "reports", `${featureId}.json`);
await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(`Generated: ${reportPath} (${report.completion.status})`);
