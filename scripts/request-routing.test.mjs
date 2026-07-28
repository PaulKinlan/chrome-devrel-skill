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
const implementationFixture = JSON.parse(
  await readFile(
    resolve(root, "evals/regressions/implementation-browser-completion.json"),
    "utf8",
  ),
);
const launchRoute = {
  id: "named-launch-execution",
  mode: "execute",
  modules: [
    "modules/launch-execution.md",
    "modules/standards-and-incubation-analysis.md",
    "modules/implementation-and-issue-tracker-research.md",
    "modules/developer-signals.md",
    "modules/launch-acceptance.md",
    "modules/completion-loop.md",
  ],
};

assert.deepEqual(
  routeRequest(
    "/chrome-devrel I need to manage the launch of https://chromestatuslite.com/feature/5175745573945344 Connection Allowlists. I'm in DevRel",
    config,
  ),
  launchRoute,
);
assert.deepEqual(routeRequest(implementationFixture.input, config), launchRoute);

const standardsRoute = {
  id: "standards-incubation-analysis",
  mode: "analyze",
  modules: [
    "modules/standards-and-incubation-analysis.md",
    "modules/implementation-and-issue-tracker-research.md",
    "modules/completion-loop.md",
  ],
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

const implementationResearchRoute = {
  id: "implementation-tracker-research",
  mode: "research",
  modules: [
    "modules/implementation-and-issue-tracker-research.md",
    "modules/standards-and-incubation-analysis.md",
    "modules/developer-signals.md",
    "modules/completion-loop.md",
  ],
};
const directImplementationInputs = [
  "Research Feature X implementation research",
  "Review Feature X implementation status",
  "Run Feature X implementation analysis",
  "Trace Feature X implementation history",
  "Build Feature X implementation lineage",
  "Research Feature X in Chromium Issues",
  "Research Feature X in Gerrit",
  "Research Feature X in WebKit Bugzilla",
  "Research Feature X in Mozilla Bugzilla",
  "Research Feature X across issue trackers",
];
for (const input of directImplementationInputs) {
  assert.deepEqual(
    routeRequest(input, config),
    implementationResearchRoute,
    input,
  );
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

console.log("Request routing: 30 passed, 0 failed");
