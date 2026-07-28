export const launchDenominators = {
  inventory_total: "pass + fail + blocked",
  inventory_tested: "pass + fail",
  report_attempted: "reproduced + not_reproduced",
  report_total: "reproduced + not_reproduced + blocked + not_attempted",
  friction_total: "verified + open + fixed_unverified + disputed + blocked + decision_required + accepted_risk",
  friction_resolved: "verified",
  signal_query_total: "complete_queries + blocked_queries",
  signal_retrieved: "relevant + duplicate + screened_out + blocked",
  hypotheses: "outside all execution denominators until converted to test IDs",
};

export const implementationDenominators = {
  query_total: "complete_queries + blocked_queries",
  reported_result_total: "retrieved_result_refs + unretrieved_result_refs",
  retrieved_result_refs:
    "relevant_analyzed + duplicate + screened_out + detail_blocked",
  result_ref_total:
    "relevant_analyzed + duplicate + screened_out + detail_blocked + unretrieved_result_refs",
  change_total:
    "open + merged_active + merged_reverted + abandoned + blocked_changes",
  signal_query_total: "complete_signal_queries + blocked_signal_queries",
  signal_retrieved: "relevant_signals + duplicate_signals + screened_out_signals + blocked_signal_details",
  goal_total:
    "pending + in_progress + succeeded + failed_retryable + blocked + decision_required + not_applicable",
  goal_terminal: "succeeded + blocked + decision_required + not_applicable",
  goal_completion:
    "pending = 0; in_progress = 0; failed_retryable = 0; goal_total = goal_terminal",
};

export const standardsDenominators = {
  link_total: "analyzed + duplicate + out_of_scope + blocked",
  relevant_link_total: "analyzed + duplicate + blocked",
  relevant_link_complete: "analyzed + duplicate",
  unique_relevant_node_total: "analyzed_unique + blocked_unique",
  unique_relevant_node_complete: "analyzed_unique",
  question_total: "resolved + open + disputed + superseded",
  repo_item_total:
    "analyzed_open + design_significant_closed + screened_out_closed + blocked_items",
  repo_item_reconciled:
    "analyzed_open + design_significant_closed + screened_out_closed",
};

function validateShape(fixture, name) {
  const errors = [];
  if (!fixture || fixture.schemaVersion !== 1) errors.push(`${name}: schemaVersion`);
  if (fixture?.status !== "contract-fixture-not-model-scored") {
    errors.push(`${name}: honest unscored status`);
  }
  if (!fixture?.id || !fixture?.input || !fixture?.intent) {
    errors.push(`${name}: id/input/intent`);
  }
  for (const field of ["requiredBehaviors", "forbiddenBehaviors"]) {
    if (!Array.isArray(fixture?.[field]) || fixture[field].length === 0) {
      errors.push(`${name}: ${field}`);
    } else if (new Set(fixture[field]).size !== fixture[field].length) {
      errors.push(`${name}: duplicate ${field}`);
    }
  }
  if (!fixture?.evidenceBoundary?.trim()) errors.push(`${name}: evidenceBoundary`);
  return errors;
}

function validateExactObject(actual, expected, name) {
  const errors = [];
  if (!actual || typeof actual !== "object" || Array.isArray(actual)) {
    return [`${name}: missing object`];
  }
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();
  if (actualKeys.join("\n") !== expectedKeys.join("\n")) {
    errors.push(`${name}: keys`);
  }
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) errors.push(`${name}: ${key}`);
  }
  return errors;
}

function missingConcepts(items, concepts, name) {
  return concepts
    .filter((concept) => !items.some((item) => item.includes(concept)))
    .map((concept) => `${name}: ${concept}`);
}

export function validateLaunchContract(fixture) {
  const errors = validateShape(fixture, "launch");
  if (
    !fixture?.input?.startsWith("/chrome-devrel I need to manage the launch") ||
    !fixture.input.includes("5175745573945344") ||
    !fixture.input.endsWith("I'm in DevRel")
  ) {
    errors.push("launch: exact trigger");
  }
  errors.push(
    ...missingConcepts(
      fixture?.requiredBehaviors || [],
      [
        "coverage manifest",
        "independently runnable",
        "comprehensive copy-paste-ready",
        "realistic integrated",
        "real implementation",
        "chrome-devtools-mcp",
        "physical-device",
        "inventory_total",
        "observed friction",
        "report_attempted",
        "mdn/content",
        "patch-ready",
        "Chromium Issues Gerrit and source",
        "hard Chrome runtime gate",
        "continue public research and reversible local",
        "completion goal ledger",
        "artifact and evidence paths",
        "session-bound screenshots",
        "fresh field-level primary evidence",
        "developer-signal frontier",
        "verified friction closure",
        "online launch-acceptance validator",
      ],
      "launch required",
    ),
    ...missingConcepts(
      fixture?.forbiddenBehaviors || [],
      [
        "stop after producing a plan",
        "hypotheses",
        "mocked",
        "viewport emulation",
        "claim MDN",
        "without a separate explicit action request",
        "generic prose patch-ready",
        "ask whether to write build test fix or validate",
        "failed retryable goals",
        "model-authored claims as launch acceptance",
        "open or fixed-unverified friction as resolved",
        "issue counts implementation activity or usage as developer demand",
      ],
      "launch forbidden",
    ),
    ...validateExactObject(
      fixture?.denominatorRules,
      launchDenominators,
      "launch denominators",
    ),
  );
  return errors;
}

export function validateImplementationContract(
  fixture,
  trackerText,
  completionText,
  launchText,
) {
  const errors = validateShape(fixture, "implementation");
  if (!fixture?.input?.includes("Actually launch and test the feature in Chrome")) {
    errors.push("implementation: exact Chrome trigger");
  }
  errors.push(
    ...missingConcepts(
      fixture?.requiredBehaviors || [],
      [
        "query vocabulary",
        "Chromium Issues",
        "WebKit Bugzilla",
        "Mozilla Bugzilla",
        "shared WPT",
        "exact query URLs",
        "implementation lineage",
        "separate browser standards position",
        "developer-signal source families",
        "supporting contradicting and ambiguous",
        "chrome-devtools-mcp",
        "runtime validation blocked",
        "reversible goals",
        "until goals succeed",
        "three correction attempts",
        "materially change a hypothesis",
        "exact goal query result change browser test",
      ],
      "implementation required",
    ),
    ...missingConcepts(
      fixture?.forbiddenBehaviors || [],
      [
        "one umbrella bug",
        "only open Chromium changes",
        "proof of working runtime behavior",
        "without launching and testing",
        "replace Chrome runtime execution",
        "ask the user whether to write build test",
        "failed retryable pending or in progress goals",
        "retry exhaustion into blocked",
        "marking exact goals blocked",
        "infer developer demand from implementation activity",
      ],
      "implementation forbidden",
    ),
    ...validateExactObject(
      fixture?.denominatorRules,
      implementationDenominators,
      "implementation denominators",
    ),
  );

  const trackerRules = [
    "https://issues.chromium.org/issues?q=",
    "https://chromium-review.googlesource.com/q/status:open+-is:wip",
    "https://bugs.webkit.org/buglist.cgi?quicksearch=",
    "https://bugzilla.mozilla.org/buglist.cgi?quicksearch=",
    "open, merged, abandoned, and reverted states",
    "web-platform-tests history",
    "Do not infer a browser's position from implementation activity",
    "query_total = complete_queries + blocked_queries",
    "reported_result_total = retrieved_result_refs + unretrieved_result_refs",
    "retrieved_result_refs = relevant_analyzed + duplicate + screened_out + detail_blocked",
    "result_ref_total = relevant_analyzed + duplicate + screened_out + detail_blocked + unretrieved_result_refs",
    "change_total = open + merged_active + merged_reverted + abandoned + blocked_changes",
    "A zero-result query",
    "modules/developer-signals.md",
    "problem/workaround communities",
    "supporting/contradicting/ambiguous",
  ];
  const completionRules = [
    "Do not end with “Would you like me to write/test/build…?”",
    "goal_total = pending + in_progress + succeeded + failed_retryable + blocked + decision_required + not_applicable",
    "goal_terminal = succeeded + blocked + decision_required + not_applicable",
    "pending = 0",
    "in_progress = 0",
    "failed_retryable = 0",
    "goal_total = goal_terminal",
    "**Succeeded** requires `blocked = 0` and `decision_required = 0`",
    "at most three correction attempts",
    "Every retry must record a materially changed hypothesis",
    "Retry-budget exhaustion alone is not a blocker",
    "Execute until success or terminal blockage",
    "Use `chrome-devtools-mcp`",
  ];
  const launchRules = [
    "browser execution is a hard evidence gate",
    "Launch Chrome and use `chrome-devtools-mcp`",
  ];
  for (const rule of trackerRules) {
    if (!trackerText?.includes(rule)) errors.push(`tracker module: ${rule}`);
  }
  for (const rule of completionRules) {
    if (!completionText?.includes(rule)) errors.push(`completion module: ${rule}`);
  }
  for (const rule of launchRules) {
    if (!launchText?.includes(rule)) errors.push(`launch module: ${rule}`);
  }
  return errors;
}

export function validateStandardsContract(fixture, standardsText) {
  const errors = validateShape(fixture, "standards");
  if (!fixture?.input?.includes("Treat no signal as no recorded position, not neutral")) {
    errors.push("standards: exact status trigger");
  }
  errors.push(
    ...missingConcepts(
      fixture?.requiredBehaviors || [],
      [
        "no signal",
        "formal browser-project positions",
        "complete Mozilla and WebKit",
        "complete TAG review",
        "incubation explainers",
        "Chromium Issues Gerrit source and tests",
        "freeze a retrieval cutoff",
        "paginated open and closed",
        "canonicalize node identities",
        "every substantive cross-link",
        "unprocessed relevant frontier",
        "separate link-edge and unique-evidence-node denominators",
        "dated chronology",
        "reviewer confirmation",
        "design-significant closed",
        "contradictions",
      ],
      "standards required",
    ),
    ...missingConcepts(
      fixture?.forbiddenBehaviors || [],
      [
        "as neutral",
        "formal browser-project position",
        "closed TAG issue as approval",
        "opening comments",
        "omit relevant cross-links",
        "reviewer-accepted",
        "no anticipated specification",
        "infer likely implementation",
      ],
      "standards forbidden",
    ),
    ...validateExactObject(
      fixture?.denominatorRules,
      standardsDenominators,
      "standards denominators",
    ),
  );

  const semanticRules = [
    "They do **not** mean neutral",
    "record a retrieval cutoff timestamp",
    "retrieve all pages",
    "screen every closed item",
    "Extract links deterministically",
    "Maintain a visited-node set and edge set",
    "Process a recorded frontier queue until it is empty",
    "relevant_link_total = analyzed + duplicate + blocked",
    "unique_relevant_node_total = analyzed_unique + blocked_unique",
  ];
  for (const rule of semanticRules) {
    if (!standardsText?.includes(rule)) errors.push(`standards module: ${rule}`);
  }
  return errors;
}
