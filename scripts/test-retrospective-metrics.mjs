#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve("retrospectives/runs/2026-07-19-v140-v150");
const read = async (path) => JSON.parse(await readFile(join(root, path), "utf8"));
const manifest = await read("evidence/metrics/manifest.json");
assert.equal(manifest.denominator.features, 291);
assert.equal(manifest.features.length, 291);
assert.equal(manifest.counts.mappedFeatures + manifest.counts.unmapped, 291);
assert.ok(manifest.counts.mappedCounters >= manifest.counts.mappedFeatures);

const exact = await read("evidence/metrics/features/4547107962486784.json");
assert.equal(exact.mappingStatus, "exact-counter");
assert.equal(exact.metrics[0].type, "webfeature");
assert.equal(exact.metrics[0].bucketId, 438);
assert.equal(exact.metrics[0].propertyName, "FlexWrapBalance");
assert.equal(exact.metrics[0].scope, "exact");
assert.equal(exact.metrics[0].summary.launchCheckpoints[1].stableDate, "2026-06-30");
assert.ok(exact.metrics[0].summary.latest.day_percentage > 0);

const family = await read("evidence/metrics/features/4552801607483392.json");
assert.equal(family.mappingStatus, "web-feature-family-counter");
assert.equal(family.metrics[0].scope, "web-feature-family");
assert.equal(family.metrics[0].propertyName, "Highlight");
assert.equal(family.launchEvents[0].date, "2025-09-02");
assert.ok(family.interpretation.notEquivalentTo.includes("unique developers"));

const unmappedRow = manifest.features.find((item) => item.mappingStatus === "no-public-counter-mapped");
assert.ok(unmappedRow, "at least one unmapped feature remains explicit");
const unmapped = await read(unmappedRow.path);
assert.equal(unmapped.metrics.length, 0);
assert.ok("measurement" in unmapped.chromeStatusFields);

for (const row of manifest.features) {
  const evidence = await read(row.path);
  assert.equal(evidence.featureId, row.featureId);
  assert.equal(evidence.metrics.length, row.counters);
  for (const metric of evidence.metrics) {
    assert.ok(metric.evidence.length > 0);
    assert.match(metric.timelineUrl, /^https:\/\/chromestatus\.com\/data\/timeline\//);
    assert.ok(metric.summary.points >= 0);
  }
}
console.log(`PASS retrospective metrics: ${manifest.features.length} features, ${manifest.counts.mappedFeatures} mapped, ${manifest.counts.unmapped} explicit unmapped`);
