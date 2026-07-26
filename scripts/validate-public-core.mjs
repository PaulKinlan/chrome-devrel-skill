#!/usr/bin/env node
// validate-public-core.mjs — no external dependencies
// Validates public templates, manifests, schemas, and eval status reconciliation.

import { access, readdir, readFile } from "node:fs/promises";
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
      if (
        file === "publishing-targets.manifest.json" && data.schemaVersion
      ) {
        ok(`template ${file}: parsed`);
      } else if (file.includes(".example.")) {
        ok(`template ${file}: example parsed`);
      } else if (
        file.startsWith("mdn-bcd") || file.startsWith("mdn-")
      ) {
        // MDN templates use different structures (frontmatter in .md, BCD in .json)
        ok(`template ${file}: parsed`);
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
    "editorial-blog-post",
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

// 7. MDN template checks: frontmatter, missing files, forbidden fields, fake BCD
try {
  const mdnFiles = (await readdir(join(root, "templates")))
    .filter((f) => f.startsWith("mdn-") && f.endsWith(".md"));

  const moduleText = await readFile(
    join(root, "modules/mdn-reference-authoring.md"),
    "utf8",
  );

  // Check module page-map references exist
  const pageMapRefs = moduleText.match(/`templates\/(mdn-[a-z-]+\.md)`/g) || [];
  for (const ref of pageMapRefs) {
    const filename = ref.replace(/`/g, "").replace("templates/", "");
    try {
      await access(join(root, "templates", filename));
      ok(`MDN page-map: ${filename} exists`);
    } catch {
      fail(
        `MDN page-map`,
        `module references ${filename} but file does not exist`,
      );
    }
  }

  // Check MDN templates for forbidden frontmatter fields
  const forbiddenFields = ["spec-url", "experimental"];
  for (const file of mdnFiles) {
    const text = await readFile(join(root, "templates", file), "utf8");
    const fm = text.startsWith("---") ? text.split("---")[1] : "";
    for (const field of forbiddenFields) {
      if (fm.includes(`${field}:`) || fm.includes(`${field} :`)) {
        fail(`MDN ${file}`, `forbidden frontmatter field: ${field}`);
      }
    }
  }

  // Check BCD template for fake version data
  const bcdText = await readFile(
    join(root, "templates/mdn-bcd-entry.json"),
    "utf8",
  );
  const bcd = JSON.parse(bcdText);
  let fakeVersions = 0;
  function checkVersions(obj, path) {
    if (typeof obj !== "object" || obj === null) return;
    if (
      typeof obj.version_added === "string" && obj.version_added !== "mirror" &&
      !obj.version_added.startsWith("REPLACE")
    ) {
      // Check if it looks like a real version (number-like)
      if (/^\d+/.test(obj.version_added) || obj.version_added === "preview") {
        fakeVersions++;
        fail(
          `BCD ${path}`,
          `version_added "${obj.version_added}" looks like real data — template should use null`,
        );
      }
    }
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "object") checkVersions(v, `${path}.${k}`);
    }
  }
  checkVersions(bcd, "root");
  if (fakeVersions === 0) {
    ok("BCD template: no fake version data (all null/placeholder)");
  }

  ok(
    `MDN: ${mdnFiles.length} templates checked, ${pageMapRefs.length} page-map references verified`,
  );
} catch (e) {
  fail("MDN validation", e.message);
}

// 8. MDN structural checks: frontmatter patterns, title/slug rules, required sections
try {
  const mdnMdFiles = (await readdir(join(root, "templates")))
    .filter((f) =>
      f.startsWith("mdn-") && f.endsWith(".md") && !f.includes("review") &&
      !f.includes("doc-plan") && !f.includes("examples")
    );

  // Forbidden frontmatter fields (except property short-title)
  const forbiddenMdFields = ["spec-url", "experimental"];

  for (const file of mdnMdFiles) {
    const text = await readFile(join(root, "templates", file), "utf8");
    const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      fail(`MDN ${file}`, "no frontmatter found");
      continue;
    }
    const fm = fmMatch[1];

    // Check forbidden fields
    for (const field of forbiddenMdFields) {
      if (fm.includes(`${field}:`)) {
        fail(`MDN ${file}`, `forbidden frontmatter field: ${field}`);
      }
    }

    // Check no prototype in title or slug
    if (fm.includes("prototype")) {
      fail(
        `MDN ${file}`,
        "title or slug contains 'prototype' — official MDN does not use prototype form",
      );
    }

    // Check title uses colon form for member pages (not dot form)
    const titleMatch = fm.match(/title:\s*"(.+)"/);
    if (titleMatch) {
      const title = titleMatch[1];
      // Interface pages don't use colon; member pages should
      const pageTypeMatch = fm.match(/page-type:\s*(\S+)/);
      const pageType = pageTypeMatch ? pageTypeMatch[1] : "";
      if (
        pageType.includes("method") || pageType.includes("property") ||
        pageType.includes("constructor") || pageType.includes("event")
      ) {
        if (!title.includes(":") && !title.includes("InterfaceName")) {
          // Template placeholder — skip if it's still a placeholder
        } else if (title.includes(".") && !title.includes(":")) {
          fail(
            `MDN ${file}`,
            `title uses dot form "${title}" — should use colon form`,
          );
        }
      }
    }

    // Check property template has short-title
    if (
      fm.includes("page-type: web-api-instance-property") ||
      fm.includes("page-type: web-api-static-property")
    ) {
      if (!fm.includes("short-title:")) {
        fail(`MDN ${file}`, "property template missing required short-title");
      }
    }

    // Check property template has Value section, not Syntax
    if (fm.includes("page-type: web-api-instance-property")) {
      if (text.includes("## Syntax")) {
        fail(
          `MDN ${file}`,
          "property template has Syntax section — should have Value instead",
        );
      }
      if (!text.includes("## Value")) {
        fail(`MDN ${file}`, "property template missing Value section");
      }
    }

    // Check interface section order: Constructor → Static → Instance for each type
    if (fm.includes("page-type: web-api-interface")) {
      const constructorIdx = text.indexOf("## Constructor");
      const staticPropIdx = text.indexOf("## Static properties");
      const instancePropIdx = text.indexOf("## Instance properties");
      const staticMethodIdx = text.indexOf("## Static methods");
      const instanceMethodIdx = text.indexOf("## Instance methods");
      const eventsIdx = text.indexOf("## Events");

      if (
        constructorIdx > 0 && staticPropIdx > 0 &&
        constructorIdx > staticPropIdx
      ) {
        fail(`MDN ${file}`, "Constructor should come before Static properties");
      }
      if (
        staticPropIdx > 0 && instancePropIdx > 0 &&
        staticPropIdx > instancePropIdx
      ) {
        fail(
          `MDN ${file}`,
          "Static properties should come before Instance properties",
        );
      }
      if (
        staticMethodIdx > 0 && instanceMethodIdx > 0 &&
        staticMethodIdx > instanceMethodIdx
      ) {
        fail(
          `MDN ${file}`,
          "Static methods should come before Instance methods",
        );
      }
    }
  }

  // Check BCD: all non-mirror version_added must be null
  const bcdText = await readFile(
    join(root, "templates/mdn-bcd-entry.json"),
    "utf8",
  );
  const bcd = JSON.parse(bcdText);
  let nonNullVersions = 0;
  function checkBcdVersions(obj, path) {
    if (typeof obj !== "object" || obj === null) return;
    if ("version_added" in obj) {
      const va = obj.version_added;
      if (va !== null && va !== "mirror" && va !== false && va !== true) {
        // String values that aren't "mirror" are potential fake data
        if (typeof va === "string" && va !== "mirror") {
          nonNullVersions++;
          fail(
            `BCD ${path}`,
            `version_added "${va}" — template should use null`,
          );
        }
      }
      // Check that ie:false is not present (should be null in template)
      if (va === false && path.includes(".ie")) {
        nonNullVersions++;
        fail(
          `BCD ${path}`,
          `version_added false — even ie should be null in template scaffold`,
        );
      }
    }
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "object") checkBcdVersions(v, `${path}.${k}`);
    }
  }
  checkBcdVersions(bcd, "root");
  if (nonNullVersions === 0) {
    ok("BCD template: all version_added are null/mirror (no factual claims)");
  }

  // Count unique page-map references
  const moduleText = await readFile(
    join(root, "modules/mdn-reference-authoring.md"),
    "utf8",
  );
  const allRefs = moduleText.match(/`templates\/(mdn-[a-z-]+\.md)`/g) || [];
  const uniqueRefs = new Set(allRefs.map((r) => r.replace(/`/g, "")));
  ok(
    `MDN page-map: ${allRefs.length} total references, ${uniqueRefs.size} unique files`,
  );

  ok(`MDN structural: ${mdnMdFiles.length} templates validated`);
} catch (e) {
  fail("MDN structural validation", e.message);
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
