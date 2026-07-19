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
const allowIncomplete = args.includes("--allow-incomplete");
const sha = (text) => createHash("sha256").update(text).digest("hex");
const parseJsonl = (text) => text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
const run = JSON.parse(await readFile(join(root, "run.json"), "utf8"));
const eventText = await readFile(join(root, "manifest.events.jsonl"), "utf8");
const featureText = await readFile(join(root, "manifest.features.jsonl"), "utf8");
const events = parseJsonl(eventText);
const features = parseJsonl(featureText);
const errors = [];
if (events.length !== run.denominator.launchEvents) errors.push(`event denominator mismatch: ${events.length}`);
if (features.length !== run.denominator.uniqueFeatures) errors.push(`feature denominator mismatch: ${features.length}`);
if (sha(eventText) !== run.checksums.eventsSha256) errors.push("event manifest checksum mismatch");
if (sha(featureText) !== run.checksums.featuresSha256) errors.push("feature manifest checksum mismatch");
if (new Set(events.map((e) => e.eventId)).size !== events.length) errors.push("duplicate event IDs");
if (new Set(features.map((f) => f.featureId)).size !== features.length) errors.push("duplicate feature IDs");
const requiredPhases = ["intake", "incubation", "prototype", "developerTrials", "wideReview", "experiment", "prepareToShip", "release", "adoption", "support", "deprecation"];
const requiredOutcomes = ["developerValue", "endUserImpact", "adoption", "interoperability", "implementationQuality", "evidenceAndCommunication", "support", "overall"];
const counts = { complete: 0, partial: 0, blocked: 0, pending: 0, invalid: 0 };
for (const feature of features) {
  try {
    await access(join(root, feature.detailEvidencePath));
  } catch {
    errors.push(`missing ChromeStatus detail: ${feature.featureId}`);
  }
  try {
    const report = JSON.parse(await readFile(join(root, feature.reportPath), "utf8"));
    const missingPhase = requiredPhases.filter((key) => !report.phaseReview?.[key]);
    const missingOutcome = requiredOutcomes.filter((key) => !report.outcomes?.[key]);
    if (report.schemaVersion !== 1 || report.feature?.id !== feature.featureId || !Array.isArray(report.sources) || missingPhase.length || missingOutcome.length || !report.completion?.status) {
      counts.invalid += 1;
      errors.push(`invalid report ${feature.featureId}: phases=${missingPhase.join(",")} outcomes=${missingOutcome.join(",")}`);
    } else if (counts[report.completion.status] !== undefined) {
      counts[report.completion.status] += 1;
    } else {
      counts.invalid += 1;
      errors.push(`invalid completion status ${feature.featureId}`);
    }
  } catch (error) {
    if (error.code === "ENOENT") counts.pending += 1;
    else {
      counts.invalid += 1;
      errors.push(`unreadable report ${feature.featureId}: ${error.message}`);
    }
  }
}
console.log(JSON.stringify({ runId: run.runId, launchEvents: events.length, features: features.length, reports: counts, errors: errors.length }, null, 2));
if (errors.length) console.error(errors.slice(0, 50).map((error) => `- ${error}`).join("\n"));
if (errors.length || (!allowIncomplete && (counts.pending || counts.invalid))) process.exitCode = 1;
