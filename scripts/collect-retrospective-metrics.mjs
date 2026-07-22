#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const root = resolve(value("--root", "retrospectives/runs/2026-07-19-v140-v150"));
const refresh = args.includes("--refresh");
const metricsRoot = join(root, "evidence", "metrics");
const sourceRoot = join(metricsRoot, "source");
const timelineRoot = join(metricsRoot, "timelines");
const featureRoot = join(metricsRoot, "features");
const sha = (value) => createHash("sha256").update(value).digest("hex");
const parseJsonl = (text) => text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
const stripXssi = (text) => text.replace(/^\)\]\}'\s*/, "");
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

await Promise.all([sourceRoot, timelineRoot, featureRoot].map((dir) => mkdir(dir, { recursive: true })));

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function fetchText(url, attempts = 4) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "chrome-devrel-skill-retrospective/1" } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      last = error;
      if (attempt < attempts) await sleep(500 * 2 ** (attempt - 1));
    }
  }
  throw new Error(`Failed to fetch ${url}: ${last?.message || last}`);
}

async function cachedSource(name, url) {
  const path = join(sourceRoot, name);
  let text;
  if (!refresh && await exists(path)) text = await readFile(path, "utf8");
  else {
    text = await fetchText(url);
    JSON.parse(stripXssi(text));
    await writeFile(path, `${JSON.stringify(JSON.parse(stripXssi(text)), null, 2)}\n`);
    text = await readFile(path, "utf8");
  }
  return { name, url, path, text, json: JSON.parse(stripXssi(text)), sha256: sha(text) };
}

const githubHead = await cachedSource(
  "web-features-mappings-commit.json",
  "https://api.github.com/repos/web-platform-dx/web-features-mappings/commits/main",
);
const mappingsCommit = githubHead.json.sha;
const sourceSpecs = [
  ["featurepopularity.json", "https://chromestatus.com/data/featurepopularity"],
  ["webfeaturepopularity.json", "https://chromestatus.com/data/webfeaturepopularity"],
  ["csspopularity.json", "https://chromestatus.com/data/csspopularity"],
  ["webdxfeatures.json", "https://chromestatus.com/api/v0/webdxfeatures"],
  ["channels.json", "https://chromestatus.com/api/v0/channels?start=140&end=150"],
  ["chrome-use-counters.json", `https://raw.githubusercontent.com/web-platform-dx/web-features-mappings/${mappingsCommit}/mappings/chrome-use-counters.json`],
];
const sources = [githubHead];
for (const [name, url] of sourceSpecs) sources.push(await cachedSource(name, url));
const byName = Object.fromEntries(sources.map((source) => [source.name, source]));

const snapshots = {
  feature: byName["featurepopularity.json"].json,
  webfeature: byName["webfeaturepopularity.json"].json,
  css: byName["csspopularity.json"].json,
};
const snapshotByBucket = Object.fromEntries(Object.entries(snapshots).map(([type, rows]) => [
  type,
  new Map(rows.map((row) => [Number(row.bucket_id), row])),
]));
const normalize = (value) => String(value || "").toLowerCase().replace(/^k(?:draft_)?/, "").replace(/[^a-z0-9]/g, "");
const snapshotByName = Object.fromEntries(Object.entries(snapshots).map(([type, rows]) => [
  type,
  new Map(rows.map((row) => [normalize(row.property_name), row])),
]));
const counterMappings = byName["chrome-use-counters.json"].json;
const channels = byName["channels.json"].json;
const manifest = parseJsonl(await readFile(join(root, "manifest.features.jsonl"), "utf8"));

function parseTimelineUrl(url) {
  const match = String(url || "").match(/chromestatus\.com\/metrics\/(feature|webfeature|css)\/timeline\/(?:popularity|animated)\/(\d+)/i);
  return match ? { type: match[1].toLowerCase(), bucketId: Number(match[2]) } : null;
}

function stableDateFor(milestone) {
  const value = channels[String(milestone)]?.stable_date;
  return value ? value.slice(0, 10) : null;
}

function addCandidate(map, candidate) {
  if (!candidate || !["feature", "webfeature", "css"].includes(candidate.type) || !Number.isInteger(candidate.bucketId)) return;
  const key = `${candidate.type}:${candidate.bucketId}`;
  const current = map.get(key);
  if (!current) map.set(key, { ...candidate, evidence: [candidate.evidence].filter(Boolean) });
  else {
    current.evidence.push(candidate.evidence);
    if (current.scope !== "exact" && candidate.scope === "exact") current.scope = "exact";
    current.confidence = current.confidence === "exact" || candidate.confidence === "exact" ? "exact" : current.confidence;
  }
}

function mapFeature(record) {
  const candidates = new Map();
  const measurement = record.measurement || "";
  const webFeature = record.web_feature;
  const directEnum = String(record.webdx_usecounter_enum || "");

  if (/^\d+$/.test(directEnum)) addCandidate(candidates, {
    type: "webfeature", bucketId: Number(directEnum), scope: "exact", confidence: "exact",
    evidence: "ChromeStatus webdx_usecounter_enum",
  });

  const mapped = webFeature && counterMappings[webFeature];
  if (mapped) {
    const parsed = parseTimelineUrl(mapped.url);
    addCandidate(candidates, { ...parsed, scope: "web-feature-family", confidence: "declared-family",
      evidence: `web-features-mappings chrome-use-counters for ${webFeature}` });
  }

  if (webFeature && !["Missing feature", "TBD", "None"].includes(webFeature)) {
    for (const type of ["webfeature", "feature", "css"]) {
      const row = snapshotByName[type].get(normalize(webFeature));
      if (row) addCandidate(candidates, {
        type, bucketId: Number(row.bucket_id), scope: type === "css" ? "property-family" : "web-feature-family",
        confidence: "name-matched-family",
        evidence: `ChromeStatus web_feature ${webFeature} exactly normalizes to ${type} counter ${row.property_name}`,
      });
    }
  }

  for (const match of measurement.matchAll(/chromestatus\.com\/metrics\/(feature|webfeature|css)\/timeline\/(?:popularity|animated)\/(\d+)/gi)) {
    addCandidate(candidates, { type: match[1].toLowerCase(), bucketId: Number(match[2]), scope: "exact", confidence: "exact",
      evidence: "Exact ChromeStatus metrics timeline URL in feature measurement field" });
  }
  for (const match of measurement.matchAll(/WebDXFeature::k([A-Za-z0-9_]+)/g)) {
    const row = snapshotByName.webfeature.get(normalize(match[1]));
    if (row) addCandidate(candidates, { type: "webfeature", bucketId: Number(row.bucket_id), scope: "exact", confidence: "exact",
      evidence: `WebDXFeature::k${match[1]} named in feature measurement field` });
  }
  for (const match of measurement.matchAll(/(?:WebFeature::k|UseCounter(?:s)?[: ]+)([A-Za-z][A-Za-z0-9_]+)/g)) {
    const row = snapshotByName.feature.get(normalize(match[1]));
    if (row) addCandidate(candidates, { type: "feature", bucketId: Number(row.bucket_id), scope: "exact", confidence: "exact",
      evidence: `${match[0]} named in feature measurement field` });
  }
  // ChromeStatus measurement prose often names counters without a URL or WebFeature:: prefix.
  // Only accept an exact, case-insensitive public property name; never fuzzy-match prose.
  for (const type of ["webfeature", "feature", "css"]) {
    for (const row of snapshots[type]) {
      const propertyName = String(row.property_name || "");
      if (propertyName.length >= 6 && measurement.toLowerCase().includes(propertyName.toLowerCase())) {
        addCandidate(candidates, { type, bucketId: Number(row.bucket_id), scope: "exact", confidence: "declared-name",
          evidence: `Public ${type} counter ${propertyName} is named verbatim in the ChromeStatus measurement field` });
      }
    }
  }
  for (const stage of record.stages || []) {
    if (Number.isInteger(stage.ot_use_counter_bucket_number)) addCandidate(candidates, {
      type: "feature", bucketId: stage.ot_use_counter_bucket_number, scope: "origin-trial", confidence: "exact",
      evidence: `ChromeStatus origin-trial stage ${stage.id} use-counter bucket`,
    });
  }

  const cssTokens = new Set();
  for (const match of record.name.matchAll(/`([^`]+)`/g)) cssTokens.add(match[1]);
  const propertyMatch = record.name.match(/^CSS\s+([a-z][a-z0-9-]*)\s+property\b/i);
  if (propertyMatch) cssTokens.add(propertyMatch[1]);
  for (const token of cssTokens) {
    const row = snapshotByName.css.get(normalize(token));
    if (row) addCandidate(candidates, { type: "css", bucketId: Number(row.bucket_id), scope: "property", confidence: "exact-title",
      evidence: `Exact CSS property token ${token} in ChromeStatus feature title` });
  }
  return [...candidates.values()];
}

const timelineCache = new Map();
async function timelineFor(type, bucketId) {
  const key = `${type}:${bucketId}`;
  if (timelineCache.has(key)) return timelineCache.get(key);
  const name = `${type}-${bucketId}.json`;
  const path = join(timelineRoot, name);
  const url = `https://chromestatus.com/data/timeline/${type}popularity?bucket_id=${bucketId}`;
  let rows;
  if (!refresh && await exists(path)) rows = JSON.parse(await readFile(path, "utf8"));
  else {
    rows = JSON.parse(stripXssi(await fetchText(url)));
    await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
  }
  const result = { key, name, path, url, rows, sha256: sha(await readFile(path, "utf8")) };
  timelineCache.set(key, result);
  return result;
}

function nearestOnOrAfter(rows, target, maxDays = 21) {
  if (!target) return null;
  const targetMs = Date.parse(`${target}T00:00:00Z`);
  const found = rows.find((row) => {
    const delta = Date.parse(`${row.date}T00:00:00Z`) - targetMs;
    return delta >= 0 && delta <= maxDays * 86400000;
  });
  return found || null;
}

function summarize(rows, stableDates) {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const positive = sorted.find((row) => Number(row.day_percentage) > 0) || null;
  const latest = sorted.at(-1) || null;
  const peak = sorted.reduce((best, row) => !best || row.day_percentage > best.day_percentage ? row : best, null);
  const checkpoints = stableDates.map(({ milestone, date, category }) => {
    const day = (offset) => date ? new Date(Date.parse(`${date}T00:00:00Z`) + offset * 86400000).toISOString().slice(0, 10) : null;
    return {
      milestone, category, stableDate: date,
      atStable: nearestOnOrAfter(sorted, date),
      day30: nearestOnOrAfter(sorted, day(30)),
      day90: nearestOnOrAfter(sorted, day(90)),
      day180: nearestOnOrAfter(sorted, day(180)),
    };
  });
  return { points: sorted.length, firstObservedPositive: positive, latest, peak, launchCheckpoints: checkpoints };
}

const records = [];
const counts = { exact: 0, family: 0, trial: 0, multiple: 0, unmapped: 0, mappedFeatures: 0, mappedCounters: 0 };
for (const item of manifest) {
  const detailPath = join(root, item.detailEvidencePath);
  const detail = JSON.parse(await readFile(detailPath, "utf8"));
  const candidates = mapFeature(detail);
  const eventDates = item.launchEvents.map((event) => ({ ...event, date: stableDateFor(event.milestone) }));
  const metrics = [];
  for (const candidate of candidates) {
    const timeline = await timelineFor(candidate.type, candidate.bucketId);
    const latest = snapshotByBucket[candidate.type].get(candidate.bucketId) || null;
    metrics.push({
      ...candidate,
      propertyName: latest?.property_name || timeline.rows[0]?.property_name || null,
      latestSnapshot: latest,
      timelineUrl: timeline.url,
      timelineEvidencePath: `evidence/metrics/timelines/${timeline.name}`,
      timelineSha256: timeline.sha256,
      summary: summarize(timeline.rows, eventDates.map((event) => ({ milestone: event.milestone, category: event.category, date: event.date }))),
    });
  }
  let mappingStatus = "no-public-counter-mapped";
  if (metrics.length > 1) mappingStatus = "multiple-counters";
  else if (metrics.length === 1 && metrics[0].scope === "exact") mappingStatus = "exact-counter";
  else if (metrics.length === 1 && metrics[0].scope === "origin-trial") mappingStatus = "origin-trial-counter";
  else if (metrics.length === 1) mappingStatus = "web-feature-family-counter";
  if (metrics.length) counts.mappedFeatures++;
  if (metrics.length > 1) counts.multiple++;
  else if (!metrics.length) counts.unmapped++;
  else if (metrics[0].scope === "exact") counts.exact++;
  else if (metrics[0].scope === "origin-trial") counts.trial++;
  else counts.family++;
  counts.mappedCounters += metrics.length;

  const evidence = {
    schemaVersion: 1,
    featureId: item.featureId,
    featureName: item.name,
    collectedAt: new Date().toISOString(),
    launchEvents: eventDates,
    mappingStatus,
    chromeStatusFields: {
      webFeature: detail.web_feature ?? null,
      webdxUseCounterEnum: detail.webdx_usecounter_enum ?? null,
      measurement: detail.measurement ?? null,
      originTrialCounters: (detail.stages || []).filter((stage) => stage.ot_use_counter_bucket_number != null).map((stage) => ({
        stageId: stage.id, bucketId: stage.ot_use_counter_bucket_number, counterName: stage.ot_webfeature_use_counter ?? null,
      })),
    },
    metrics,
    interpretation: {
      numerator: "Chrome page loads on which the counter fired at least once",
      denominator: "Measured Chrome HTTP/HTTPS page loads across official channels and platforms",
      notEquivalentTo: ["unique developers", "unique sites", "unique users", "successful task completion", "developer satisfaction", "end-user benefit"],
      cautions: [
        "A WebDX family counter may cover more behavior than this individual ChromeStatus launch.",
        "Counter instrumentation may include detection or probing depending on the counter implementation.",
        "UMA data reflects participating Chrome clients and the dominant milestone; enterprise and opt-out populations may be underrepresented.",
        "Zero, missing, or delayed points are not proof of zero real-world use.",
      ],
    },
    sourceUrls: {
      currentFeature: "https://chromestatus.com/metrics/feature/popularity",
      currentWebFeature: "https://chromestatus.com/metrics/webfeature/popularity",
      currentCss: "https://chromestatus.com/metrics/css/popularity",
      useCounterDocumentation: "https://chromium.googlesource.com/chromium/src/+/main/docs/use_counter_wiki.md",
      mappings: `https://github.com/web-platform-dx/web-features-mappings/blob/${mappingsCommit}/mappings/chrome-use-counters.json`,
    },
  };
  const path = join(featureRoot, `${item.featureId}.json`);
  await writeFile(path, `${JSON.stringify(evidence, null, 2)}\n`);
  records.push({ featureId: item.featureId, path: `evidence/metrics/features/${item.featureId}.json`, mappingStatus, counters: metrics.length, sha256: sha(await readFile(path, "utf8")) });
}

const metricsManifest = {
  schemaVersion: 1,
  runId: JSON.parse(await readFile(join(root, "run.json"), "utf8")).runId,
  generatedAt: new Date().toISOString(),
  denominator: { features: manifest.length },
  counts,
  mappingCommit: mappingsCommit,
  sources: sources.map((source) => ({ url: source.url, path: `evidence/metrics/source/${source.name}`, sha256: source.sha256 })),
  features: records,
};
await writeFile(join(metricsRoot, "manifest.json"), `${JSON.stringify(metricsManifest, null, 2)}\n`);
console.log(JSON.stringify({ runId: metricsManifest.runId, features: manifest.length, ...counts, sources: sources.length, timelines: timelineCache.size }, null, 2));
