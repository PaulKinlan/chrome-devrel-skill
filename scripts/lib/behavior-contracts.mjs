export const launchDenominators = {
  inventory_total: "pass + fail + blocked",
  inventory_tested: "pass + fail",
  report_attempted: "reproduced + not_reproduced",
  report_total: "reproduced + not_reproduced + blocked + not_attempted",
  hypotheses: "outside all execution denominators until converted to test IDs",
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
        "realistic integrated",
        "real implementation",
        "chrome-devtools-mcp",
        "physical-device",
        "inventory_total",
        "observed friction",
        "report_attempted",
        "mdn/content",
        "patch-ready",
        "artifact and evidence paths",
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
