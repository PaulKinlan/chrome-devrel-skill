#!/usr/bin/env node
// validate-public-core.mjs — no external dependencies
// Validates public templates, manifests, schemas, and eval status reconciliation.

import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const errors = [];
const checks = [];

function ok(name) {
  checks.push(`✓ ${name}`);
}
function fail(name, detail) {
  errors.push(`${name}: ${detail}`);
}

async function readJson(path) {
  return JSON.parse(await readFile(join(root, path), "utf8"));
}

// 1. Parse all template JSON files
const templateDir = "templates";
const templateFiles = (await readdir(join(root, templateDir)))
  .filter((f) => f.endsWith(".json"));

for (const file of templateFiles) {
  try {
    const data = await readJson(`${templateDir}/${file}`);
    if (!data.schemaVersion && !data.metricId && !data.artifactType) {
      // publishing-targets has schemaVersion at top level
      if (file === "publishing-targets.manifest.json" && data.schemaVersion) {
        ok(`template ${file}: parsed`);
      } else if (file.includes(".example.")) {
        ok(`template ${file}: example parsed`);
      } else {
        fail(`template ${file}`, "missing schemaVersion or identifier");
      }
    } else {
      ok(`template ${file}: parsed`);
    }
  } catch (e) {
    fail(`template ${file}`, e.message);
  }
}

// 2. Validate schema file parses
try {
  const schema = await readJson("schemas/private-overlay-manifest.schema.json");
  if (schema.required && schema.required.includes("inputs")) {
    ok("schema: private-overlay-manifest required fields present");
  } else {
    fail("schema", "missing required fields in private-overlay-manifest");
  }
} catch (e) {
  fail("schema", e.message);
}

// 3. Validate safe overlay example
try {
  const example = await readJson(
    "templates/private-overlay-manifest.example.json",
  );
  if (example.schemaVersion !== 1) {
    fail("overlay-example", "schemaVersion must be 1");
  }
  if (!example.team || !example.lastUpdated) {
    fail("overlay-example", "missing team/lastUpdated");
  }
  if (!Array.isArray(example.inputs)) {
    fail("overlay-example", "inputs must be array");
  }

  for (const input of example.inputs) {
    if (!input.id || !input.type || !input.title) {
      fail(
        `overlay-example input ${input.id || "?"}`,
        "missing required fields",
      );
    }
    const validTypes = [
      "roadmap",
      "partner-discussion",
      "internal-feedback",
      "unreleased-spec",
      "decision-thread",
      "measurement-data",
      "other",
    ];
    if (!validTypes.includes(input.type)) {
      fail(`overlay-example ${input.id}`, `invalid type: ${input.type}`);
    }
    const validConsent = ["none", "partial", "full"];
    if (!validConsent.includes(input.consentForPublicUse)) {
      fail(
        `overlay-example ${input.id}`,
        `invalid consent: ${input.consentForPublicUse}`,
      );
    }
    if (input.location && input.location.startsWith("http")) {
      fail(`overlay-example ${input.id}`, "location must not be a public URL");
    }
  }
  ok("overlay-example: all invariants valid");
} catch (e) {
  fail("overlay-example", e.message);
}

// 4. Validate publishing targets: no reviewRequired, artifact types match templates
try {
  const targets = await readJson("templates/publishing-targets.manifest.json");
  const validArtifactTypes = [
    "problem-brief",
    "research-plan",
    "compatibility-matrix",
    "partner-trial-brief",
    "demo-plan",
    "docs-gap-analysis",
    "launch-brief",
    "speaker-deck",
    "adoption-plan",
    "support-pack",
    "mdn-reference",
    "mdn-bcd-entry",
    "youtube-announcement",
  ];
  for (const target of targets.targets) {
    if (target.reviewRequired) {
      fail(
        `publishing-target ${target.artifactType}`,
        "still uses reviewRequired (should be suggestedReviewRoutes)",
      );
    }
    if (!target.suggestedReviewRoutes) {
      fail(
        `publishing-target ${target.artifactType}`,
        "missing suggestedReviewRoutes",
      );
    }
    if (!validArtifactTypes.includes(target.artifactType)) {
      fail(
        `publishing-target`,
        `unknown artifact type: ${target.artifactType}`,
      );
    }
  }
  ok(`publishing-targets: ${targets.targets.length} types, all advisory`);
} catch (e) {
  fail("publishing-targets", e.message);
}

// 5. Validate owner map template
try {
  const ownerMap = await readJson("templates/owner-map.template.json");
  if (!ownerMap.roles || !Array.isArray(ownerMap.roles)) {
    fail("owner-map", "missing roles array");
  }
  const ids = ownerMap.roles.map((r) => r.archetype);
  if (new Set(ids).size !== ids.length) {
    fail("owner-map", "duplicate archetypes");
  }
  ok(`owner-map: ${ownerMap.roles.length} role archetypes, unique`);
} catch (e) {
  fail("owner-map", e.message);
}

// 6. Reconcile eval status counts
try {
  const cases = await readJson("evals/cases.json");
  const totalCases = cases.cases.length;

  // Count result files
  const resultDir = "evals/results";
  let resultCount = 0;
  try {
    const files = await readdir(join(root, resultDir));
    resultCount = files.filter((f) => f.endsWith(".md")).length;
  } catch {
    // results dir might not exist
  }

  // Read README, extract scoring status table only
  const readme = await readFile(join(root, "evals/README.md"), "utf8");
  const scoringSection = readme.split("## Scoring status summary")[1] || "";
  const tableRows = scoringSection.split("\n").filter((l) => l.startsWith("|"));
  const counts = [];
  for (const row of tableRows.slice(1)) {
    const cells = row.split("|").map((c) => c.trim());
    const countStr = cells[2]?.replace(/\*/g, "").trim();
    const n = parseInt(countStr, 10);
    if (Number.isFinite(n)) counts.push(n);
  }

  const tableTotal = counts[counts.length - 1];
  if (tableTotal === totalCases) {
    ok(
      `eval reconciliation: table total (${tableTotal}) = cases (${totalCases})`,
    );
  } else {
    fail(
      "eval reconciliation",
      `table total (${tableTotal}) ≠ cases (${totalCases})`,
    );
  }

  const intermediateSum = counts.slice(0, -1).reduce((a, b) => a + b, 0);
  if (intermediateSum === totalCases) {
    ok(
      `eval reconciliation: status counts sum (${intermediateSum}) = total (${totalCases})`,
    );
  } else {
    fail(
      "eval reconciliation",
      `status counts sum (${intermediateSum}) ≠ total (${totalCases})`,
    );
  }
} catch (e) {
  fail("eval reconciliation", e.message);
}

// Output
for (const c of checks) console.log(c);
if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
} else {
  console.log(`\nValidated public core: ${checks.length} checks, 0 errors.`);
}
