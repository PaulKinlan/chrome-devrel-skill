#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateLaunchContract,
  validateStandardsContract,
} from "./lib/behavior-contracts.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const readJson = async (path) =>
  JSON.parse(await readFile(resolve(root, path), "utf8"));
const launch = await readJson(
  "evals/regressions/launch-management-execution.json",
);
const standards = await readJson(
  "evals/regressions/standards-incubation-link-closure.json",
);
const standardsText = await readFile(
  resolve(root, "modules/standards-and-incubation-analysis.md"),
  "utf8",
);

assert.deepEqual(validateLaunchContract(launch), []);
assert.deepEqual(validateStandardsContract(standards, standardsText), []);

const mutations = [
  [
    "missing evidence boundary",
    () => {
      const value = structuredClone(standards);
      delete value.evidenceBoundary;
      return validateStandardsContract(value, standardsText);
    },
  ],
  [
    "duplicate undercounted",
    () => {
      const value = structuredClone(standards);
      value.denominatorRules.relevant_link_total = "analyzed + blocked";
      return validateStandardsContract(value, standardsText);
    },
  ],
  [
    "no-signal rule removed",
    () =>
      validateStandardsContract(
        standards,
        standardsText.replace("They do **not** mean neutral", "They may mean neutral"),
      ),
  ],
  [
    "pagination rule removed",
    () =>
      validateStandardsContract(
        standards,
        standardsText.replace("retrieve all pages", "retrieve some pages"),
      ),
  ],
  [
    "closed screening removed",
    () =>
      validateStandardsContract(
        standards,
        standardsText.replace("screen every closed item", "sample closed items"),
      ),
  ],
  [
    "canonical cycle rule removed",
    () =>
      validateStandardsContract(
        standards,
        standardsText.replace(
          "Maintain a visited-node set and edge set",
          "Follow links without a visited set",
        ),
      ),
  ],
  [
    "frontier closure removed",
    () =>
      validateStandardsContract(
        standards,
        standardsText.replace(
          "Process a recorded frontier queue until it is empty",
          "Stop when enough sources have been read",
        ),
      ),
  ],
  [
    "launch authority boundary removed",
    () => {
      const value = structuredClone(launch);
      value.forbiddenBehaviors = value.forbiddenBehaviors.filter(
        (item) => !item.includes("without a separate explicit action request"),
      );
      return validateLaunchContract(value);
    },
  ],
];

for (const [name, mutate] of mutations) {
  assert.ok(mutate().length > 0, `mutation was not caught: ${name}`);
}

console.log(`Behavior contracts: 2 baselines + ${mutations.length} mutations passed`);
