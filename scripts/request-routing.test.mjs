#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRouting, routeRequest } from "./route-request.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const config = await loadRouting();
const standardsFixture = JSON.parse(
  await readFile(
    resolve(root, "evals/regressions/standards-incubation-link-closure.json"),
    "utf8",
  ),
);

assert.deepEqual(
  routeRequest(
    "/chrome-devrel I need to manage the launch of https://chromestatuslite.com/feature/5175745573945344 Connection Allowlists. I'm in DevRel",
    config,
  ),
  {
    id: "named-launch-execution",
    mode: "execute",
    modules: [
      "modules/launch-execution.md",
      "modules/standards-and-incubation-analysis.md",
    ],
  },
);

const standardsRoute = {
  id: "standards-incubation-analysis",
  mode: "analyze",
  modules: ["modules/standards-and-incubation-analysis.md"],
};
assert.deepEqual(routeRequest(standardsFixture.input, config), standardsRoute);
const directStandardsInputs = [
  "Review Feature X for feature readiness",
  "Review Feature X for feature-readiness",
  "Review Feature X for launch readiness",
  "Review Feature X for launch-readiness",
  "Review Feature X for release readiness",
  "Review Feature X for release-readiness",
  "Analyze interoperability for Feature X",
  "Check the standard position for Feature X",
  "Check the standard positions for Feature X",
  "Check the standards position for Feature X",
  "Check the standards positions for Feature X",
  "Check the standard-position for Feature X",
  "Check the standard-positions for Feature X",
  "Check the standards-position for Feature X",
  "Check the standards-positions for Feature X",
];
for (const input of directStandardsInputs) {
  assert.deepEqual(routeRequest(input, config), standardsRoute, input);
}

assert.deepEqual(
  routeRequest(
    "Assess Feature X at its current stage for developer enablement. What is the next decision?",
    config,
  ),
  { id: "stage-diagnosis", mode: "diagnose", modules: [] },
);

const mutated = structuredClone(config);
mutated.rules.find((rule) => rule.id === "named-launch-execution").patterns = [];
assert.notEqual(
  routeRequest("I need to manage the launch of Feature X", mutated).id,
  "named-launch-execution",
  "mutation must break the exact launch route",
);

console.log("Request routing: 19 passed, 0 failed");
