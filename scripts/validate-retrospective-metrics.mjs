#!/usr/bin/env node
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const root = resolve(value("--root", "retrospectives/runs/2026-07-19-v140-v150"));
const sha = (text) => createHash("sha256").update(text).digest("hex");
const parseJsonl = (text) => text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
const features = parseJsonl(await readFile(join(root, "manifest.features.jsonl"), "utf8"));
const manifest = JSON.parse(await readFile(join(root, "evidence/metrics/manifest.json"), "utf8"));
const errors = [];
const allowedStatuses = new Set(["exact-counter", "web-feature-family-counter", "origin-trial-counter", "multiple-counters", "no-public-counter-mapped"]);
if (manifest.denominator?.features !== features.length) errors.push(`metrics denominator mismatch: ${manifest.denominator?.features} != ${features.length}`);
if (manifest.features?.length !== features.length) errors.push(`metrics feature rows mismatch: ${manifest.features?.length} != ${features.length}`);
if (new Set(manifest.features?.map((item) => item.featureId)).size !== features.length) errors.push("duplicate or missing metrics feature IDs");
for (const source of manifest.sources || []) {
  try {
    const text = await readFile(join(root, source.path), "utf8");
    if (sha(text) !== source.sha256) errors.push(`source checksum mismatch: ${source.path}`);
  } catch (error) { errors.push(`missing metrics source: ${source.path} (${error.message})`); }
}
const rows = new Map((manifest.features || []).map((item) => [item.featureId, item]));
const timelineChecks = new Map();
for (const feature of features) {
  const row = rows.get(feature.featureId);
  if (!row) { errors.push(`missing metrics row: ${feature.featureId}`); continue; }
  if (!allowedStatuses.has(row.mappingStatus)) errors.push(`invalid mapping status ${feature.featureId}: ${row.mappingStatus}`);
  try {
    const path = join(root, row.path);
    const text = await readFile(path, "utf8");
    if (sha(text) !== row.sha256) errors.push(`feature metrics checksum mismatch: ${feature.featureId}`);
    const evidence = JSON.parse(text);
    if (evidence.featureId !== feature.featureId || evidence.mappingStatus !== row.mappingStatus) errors.push(`feature metrics identity mismatch: ${feature.featureId}`);
    if (!Array.isArray(evidence.metrics) || evidence.metrics.length !== row.counters) errors.push(`counter count mismatch: ${feature.featureId}`);
    if (!evidence.interpretation?.notEquivalentTo?.includes("unique developers")) errors.push(`missing interpretation guard: ${feature.featureId}`);
    for (const metric of evidence.metrics || []) {
      if (!Number.isInteger(metric.bucketId) || !["feature", "webfeature", "css"].includes(metric.type)) errors.push(`invalid metric identity: ${feature.featureId}`);
      if (!metric.timelineEvidencePath || !metric.timelineSha256 || !metric.timelineUrl) errors.push(`incomplete timeline provenance: ${feature.featureId}`);
      timelineChecks.set(metric.timelineEvidencePath, metric.timelineSha256);
    }
  } catch (error) { errors.push(`unreadable feature metrics ${feature.featureId}: ${error.message}`); }
}
for (const [path, expected] of timelineChecks) {
  try {
    const text = await readFile(join(root, path), "utf8");
    if (sha(text) !== expected) errors.push(`timeline checksum mismatch: ${path}`);
    const data = JSON.parse(text);
    if (!Array.isArray(data)) errors.push(`timeline is not an array: ${path}`);
  } catch (error) { errors.push(`missing timeline ${path}: ${error.message}`); }
}
console.log(JSON.stringify({
  features: features.length,
  mappedFeatures: manifest.counts?.mappedFeatures,
  unmapped: manifest.counts?.unmapped,
  mappedCounters: manifest.counts?.mappedCounters,
  timelineFiles: timelineChecks.size,
  errors: errors.length,
}, null, 2));
if (errors.length) {
  console.error(errors.slice(0, 100).map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
}
