#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateImplementationContract,
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
const implementation = await readJson(
  "evals/regressions/implementation-browser-completion.json",
);
const standardsText = await readFile(
  resolve(root, "modules/standards-and-incubation-analysis.md"),
  "utf8",
);
const trackerText = await readFile(
  resolve(root, "modules/implementation-and-issue-tracker-research.md"),
  "utf8",
);
const completionText = await readFile(
  resolve(root, "modules/completion-loop.md"),
  "utf8",
);
const launchText = await readFile(
  resolve(root, "modules/launch-execution.md"),
  "utf8",
);

assert.deepEqual(validateLaunchContract(launch), []);
assert.deepEqual(validateStandardsContract(standards, standardsText), []);
assert.deepEqual(
  validateImplementationContract(
    implementation,
    trackerText,
    completionText,
    launchText,
  ),
  [],
);

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
    "Chromium issue tracker removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText.replace(
          "https://issues.chromium.org/issues?q=",
          "https://example.invalid/issues",
        ),
        completionText,
        launchText,
      ),
  ],
  [
    "shared WPT history removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText.replace("web-platform-tests history", "selected tests"),
        completionText,
        launchText,
      ),
  ],
  [
    "position implementation separation removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText.replace(
          "Do not infer a browser's position from implementation activity",
          "Infer position from implementation activity",
        ),
        completionText,
        launchText,
      ),
  ],
  [
    "query partition removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText.replace(
          "query_total = complete_queries + blocked_queries",
          "query_total = complete_queries",
        ),
        completionText,
        launchText,
      ),
  ],
  [
    "result reconciliation removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText.replace(
          "reported_result_total = retrieved_result_refs + unretrieved_result_refs",
          "reported totals are optional",
        ),
        completionText,
        launchText,
      ),
  ],
  [
    "result reference partition removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText.replace(
          "result_ref_total = relevant_analyzed + duplicate + screened_out + detail_blocked + unretrieved_result_refs",
          "result_ref_total = relevant_analyzed",
        ),
        completionText,
        launchText,
      ),
  ],
  [
    "change partition removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText.replace(
          "change_total = open + merged_active + merged_reverted + abandoned + blocked_changes",
          "change_total = open + merged + reverted",
        ),
        completionText,
        launchText,
      ),
  ],
  [
    "Chrome runtime gate removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText,
        completionText,
        launchText.replace(
          "browser execution is a hard evidence gate",
          "browser execution is optional",
        ),
      ),
  ],
  [
    "completion autonomy removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText,
        completionText.replace(
          "Do not end with “Would you like me to write/test/build…?”",
          "Ask what to do next",
        ),
        launchText,
      ),
  ],
  [
    "goal total partition removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText,
        completionText.replace(
          "goal_total = pending + in_progress + succeeded + failed_retryable + blocked + decision_required + not_applicable",
          "goal_total = succeeded + blocked",
        ),
        launchText,
      ),
  ],
  [
    "goal terminal partition removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText,
        completionText.replace(
          "goal_terminal = succeeded + blocked + decision_required + not_applicable",
          "goal_terminal = succeeded",
        ),
        launchText,
      ),
  ],
  [
    "in progress completion rule removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText,
        completionText.replace("`in_progress = 0`", "`in_progress may remain`") ,
        launchText,
      ),
  ],
  [
    "terminal equality removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText,
        completionText.replace(
          "`goal_total = goal_terminal`",
          "`goal totals need not reconcile`",
        ),
        launchText,
      ),
  ],
  [
    "success blocked rule removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText,
        completionText.replace(
          "**Succeeded** requires `blocked = 0` and `decision_required = 0`",
          "**Succeeded** may include blocked goals",
        ),
        launchText,
      ),
  ],
  [
    "retry novelty removed",
    () =>
      validateImplementationContract(
        implementation,
        trackerText,
        completionText.replace(
          "Every retry must record a materially changed hypothesis",
          "Retries may repeat unchanged",
        ),
        launchText,
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

console.log(`Behavior contracts: 3 baselines + ${mutations.length} mutations passed`);
