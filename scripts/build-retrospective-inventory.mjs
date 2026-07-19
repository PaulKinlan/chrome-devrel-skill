#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const API = "https://chromestatus.com/api/v0";
const XSSI = ")]}'";
const args = process.argv.slice(2);
const value = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const range = value("--milestones", "140-150").split("-").map(Number);
if (range.length !== 2 || range.some(Number.isNaN) || range[0] > range[1]) {
  throw new Error("--milestones must look like 140-150");
}
const runId = value("--run", `${new Date().toISOString().slice(0, 10)}-v${range[0]}-v${range[1]}`);
const root = resolve(value("--root", `retrospectives/runs/${runId}`));
const refresh = args.includes("--refresh");
const concurrency = Number(value("--concurrency", "4"));
const milestones = Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i);

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const stableJson = (valueToSerialize) => `${JSON.stringify(valueToSerialize, null, 2)}\n`;
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

async function atomicWrite(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.tmp-${process.pid}`;
  await writeFile(temp, content);
  await rename(temp, path);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function fetchJson(url, cachePath) {
  if (!refresh) {
    try {
      return await readJson(cachePath);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  let lastError;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "chrome-devrel-skill-retrospective/0.1" } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      let text = await response.text();
      if (text.startsWith(XSSI)) text = text.slice(XSSI.length).trimStart();
      const parsed = JSON.parse(text);
      await atomicWrite(cachePath, stableJson(parsed));
      return parsed;
    } catch (error) {
      lastError = error;
      if (attempt < 6) await sleep(Math.min(8000, 400 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250));
    }
  }
  throw new Error(`Failed ${url}: ${lastError?.message}`);
}

async function mapLimit(items, limit, fn) {
  const output = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      output[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, limit) }, worker));
  return output;
}

await mkdir(root, { recursive: true });
const milestoneData = [];
for (const milestone of milestones) {
  const cache = join(root, "evidence", "chromestatus", "milestones", `${milestone}.json`);
  const data = await fetchJson(`${API}/features?milestone=${milestone}`, cache);
  milestoneData.push({ milestone, data });
  console.error(`milestone ${milestone}: cached`);
}

const events = [];
for (const { milestone, data } of milestoneData) {
  for (const [category, features] of Object.entries(data.features_by_type || {})) {
    for (const feature of features) {
      events.push({
        eventId: `${milestone}:${category}:${feature.id}`,
        milestone,
        category,
        featureId: feature.id,
        name: feature.name,
        summary: feature.summary || "",
        chromeStatusUrl: `https://chromestatus.com/feature/${feature.id}`,
      });
    }
  }
}

events.sort((a, b) => a.milestone - b.milestone || a.category.localeCompare(b.category) || a.featureId - b.featureId);
const uniqueIds = [...new Set(events.map((event) => event.featureId))].sort((a, b) => a - b);

await mapLimit(uniqueIds, concurrency, async (id, index) => {
  const cache = join(root, "evidence", "chromestatus", "features", `${id}.json`);
  await fetchJson(`${API}/features/${id}`, cache);
  if ((index + 1) % 20 === 0 || index + 1 === uniqueIds.length) console.error(`feature details: ${index + 1}/${uniqueIds.length}`);
});

const eventsByFeature = new Map();
for (const event of events) {
  const list = eventsByFeature.get(event.featureId) || [];
  list.push({ eventId: event.eventId, milestone: event.milestone, category: event.category });
  eventsByFeature.set(event.featureId, list);
}

const features = [];
for (const id of uniqueIds) {
  const detailPath = join(root, "evidence", "chromestatus", "features", `${id}.json`);
  const detail = await readJson(detailPath);
  const first = events.find((event) => event.featureId === id);
  features.push({
    featureId: id,
    reportId: String(id),
    name: detail.name || first?.name || `Feature ${id}`,
    chromeStatusUrl: `https://chromestatus.com/feature/${id}`,
    launchEvents: eventsByFeature.get(id),
    detailEvidencePath: `evidence/chromestatus/features/${id}.json`,
    reportPath: `reports/${id}.json`,
    status: "pending",
  });
}

const eventJsonl = events.map((event) => JSON.stringify(event)).join("\n") + "\n";
const featureJsonl = features.map((feature) => JSON.stringify(feature)).join("\n") + "\n";
await atomicWrite(join(root, "manifest.events.jsonl"), eventJsonl);
await atomicWrite(join(root, "manifest.features.jsonl"), featureJsonl);

const countBy = (items, key) => Object.fromEntries([...items.reduce((map, item) => map.set(String(item[key]), (map.get(String(item[key])) || 0) + 1), new Map())]);
const manifest = {
  schemaVersion: 1,
  runId,
  generatedAt: new Date().toISOString(),
  source: `${API}/features?milestone=N and ${API}/features/:id`,
  milestones,
  denominator: {
    launchEvents: events.length,
    uniqueFeatures: features.length,
    reportsRequired: features.length,
  },
  counts: {
    byMilestone: countBy(events, "milestone"),
    byCategory: countBy(events, "category"),
  },
  checksums: {
    eventsSha256: sha256(eventJsonl),
    featuresSha256: sha256(featureJsonl),
  },
  completion: { complete: 0, partial: 0, blocked: 0, pending: features.length },
};
await atomicWrite(join(root, "run.json"), stableJson(manifest));
console.log(stableJson(manifest));
