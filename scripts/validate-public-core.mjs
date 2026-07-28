#!/usr/bin/env node
// validate-public-core.mjs — no external dependencies
// Validates public templates, manifests, schemas, and eval status reconciliation.

import { access, readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  validateImplementationContract,
  validateLaunchContract,
  validateStandardsContract,
} from "./lib/behavior-contracts.mjs";
import { loadRouting, routeRequest } from "./route-request.mjs";

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

// 7. MDN template checks: frontmatter, page-map, structural, BCD guide
try {
  const mdnMdFiles = (await readdir(join(root, "templates")))
    .filter((f) => f.startsWith("mdn-") && f.endsWith(".md"));
  const moduleText = await readFile(
    join(root, "modules/mdn-reference-authoring.md"),
    "utf8",
  );

  // Check no deleted BCD JSON scaffold exists
  try {
    await access(join(root, "templates/mdn-bcd-entry.json"));
    fail(
      "MDN BCD",
      "mdn-bcd-entry.json should be deleted (replaced by generation guide)",
    );
  } catch {
    ok("MDN BCD: no invalid JSON scaffold (guide used instead)");
  }

  // Check module does not reference npx @mdn/browser-compat-data
  if (moduleText.includes("npx @mdn/browser-compat-data")) {
    fail(
      "MDN module",
      "references npx @mdn/browser-compat-data (should be clone/npm install/npm test)",
    );
  } else {
    ok("MDN module: no npx @mdn/browser-compat-data references");
  }

  // Page-map: verify all referenced template files exist
  const pageMapRefs = moduleText.match(/`templates\/(mdn-[a-z-]+\.md)`/g) || [];
  const uniqueRefs = [
    ...new Set(
      pageMapRefs.map((r) => r.replace(/`/g, "").replace("templates/", "")),
    ),
  ];
  let missingFiles = 0;
  for (const filename of uniqueRefs) {
    try {
      await access(join(root, "templates", filename));
    } catch {
      fail(
        `MDN page-map`,
        `module references ${filename} but file does not exist`,
      );
      missingFiles++;
    }
  }
  if (missingFiles === 0) {
    ok(
      `MDN page-map: ${pageMapRefs.length} total refs, ${uniqueRefs.length} unique files, all exist`,
    );
  }

  // Member templates that require short-title
  const shortTitleRequired = [
    "mdn-constructor.md",
    "mdn-method.md",
    "mdn-property.md",
    "mdn-event.md",
  ];
  // Forbidden frontmatter fields
  const forbiddenFields = ["spec-url", "experimental"];

  for (const file of mdnMdFiles) {
    if (
      file.includes("review") || file.includes("doc-plan") ||
      file.includes("examples") || file.includes("generation")
    ) continue;
    const text = await readFile(join(root, "templates", file), "utf8");
    const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      fail(`MDN ${file}`, "no frontmatter");
      continue;
    }
    const fm = fmMatch[1];

    // Forbidden fields
    for (const field of forbiddenFields) {
      if (fm.includes(`${field}:`)) {
        fail(`MDN ${file}`, `forbidden field: ${field}`);
      }
    }

    // No prototype in title/slug
    if (fm.includes("prototype")) {
      fail(`MDN ${file}`, "title/slug contains 'prototype'");
    }

    // short-title required for member templates
    if (shortTitleRequired.includes(file) && !fm.includes("short-title:")) {
      fail(`MDN ${file}`, "missing required short-title");
    }

    // Property: Value not Syntax
    if (fm.includes("web-api-instance-property")) {
      if (text.includes("## Syntax")) {
        fail(`MDN ${file}`, "property has Syntax (should be Value)");
      }
      if (!text.includes("## Value")) {
        fail(`MDN ${file}`, "property missing Value section");
      }
    }

    // Interface section order
    if (fm.includes("web-api-interface")) {
      const sections = [
        "## Constructor",
        "## Static properties",
        "## Instance properties",
        "## Static methods",
        "## Instance methods",
        "## Events",
      ];
      const positions = sections.map((s) => text.indexOf(s)).filter((p) =>
        p > 0
      );
      for (let i = 1; i < positions.length; i++) {
        if (positions[i] < positions[i - 1]) {
          fail(
            `MDN ${file}`,
            `section order: ${sections[i]} before ${sections[i - 1]}`,
          );
        }
      }
    }
  }

  // Check APIRef in member templates
  const apiRefRequired = [
    "mdn-interface.md",
    "mdn-constructor.md",
    "mdn-method.md",
    "mdn-property.md",
    "mdn-event.md",
  ];
  let apiRefMissing = 0;
  for (const file of apiRefRequired) {
    const text = await readFile(join(root, "templates", file), "utf8");
    if (!text.includes("{{APIRef")) {
      fail(`MDN ${file}`, "missing {{APIRef}} macro");
      apiRefMissing++;
    }
  }
  if (apiRefMissing === 0) ok("MDN: APIRef present in all member templates");

  // Check event short-title is bare (not "eventName event")
  const eventText = await readFile(
    join(root, "templates/mdn-event.md"),
    "utf8",
  );
  const eventFm = eventText.match(/^---\n([\s\S]*?)\n---/)?.[1] || "";
  if (eventFm.match(/short-title:\s*".*event"/)) {
    fail(
      "MDN event short-title",
      'should be bare event name, not "eventName event"',
    );
  } else if (eventFm.includes("short-title:")) {
    ok("MDN event short-title: bare event name form");
  }

  // Check constructor short-title uses ConstructorName not InterfaceName
  const constructorText = await readFile(
    join(root, "templates/mdn-constructor.md"),
    "utf8",
  );
  if (constructorText.includes('short-title: "_InterfaceName_()"')) {
    fail(
      "MDN constructor short-title",
      "should use ConstructorName, not InterfaceName (e.g. Audio() not HTMLAudioElement())",
    );
  } else if (constructorText.includes("short-title:")) {
    ok("MDN constructor short-title: ConstructorName form");
  }

  // Check GroupData path in module
  if (moduleText.includes("_data/GroupData")) {
    fail(
      "MDN module",
      "references old GroupData path (_data/) — should be files/jsondata/GroupData.json",
    );
  } else if (moduleText.includes("jsondata/GroupData")) {
    ok("MDN module: correct GroupData path (files/jsondata/GroupData.json)");
  }

  // Check interface template uses slash-path DOMxRef for events/static
  const interfaceText = await readFile(
    join(root, "templates/mdn-interface.md"),
    "utf8",
  );
  if (interfaceText.includes('DOMxRef("InterfaceName.eventName')) {
    fail(
      "MDN interface",
      "event DOMxRef uses dot form — should use slash-path (InterfaceName/eventName_event)",
    );
  }
  if (interfaceText.includes('DOMxRef("InterfaceName.static')) {
    fail(
      "MDN interface",
      "static DOMxRef uses dot form — should use slash-path (InterfaceName/methodName_static)",
    );
  }

  // Check no floating provenance URLs in module
  if (moduleText.includes("blob/main/") || moduleText.includes("blob/HEAD/")) {
    fail(
      "MDN module",
      "contains floating blob/main/ or blob/HEAD/ URLs — must pin to commit SHA",
    );
  } else {
    ok("MDN module: all source URLs pinned to commit SHAs");
  }

  // Check BCD guide: no version_added true/null guidance
  const bcdGuide = await readFile(
    join(root, "templates/mdn-bcd-generation-guide.md"),
    "utf8",
  );
  if (bcdGuide.includes("version_added: true") && !bcdGuide.includes("NOT")) {
    fail("BCD guide", "mentions version_added: true without prohibiting it");
  }
  if (
    bcdGuide.includes("version_added: null") && !bcdGuide.includes("forbidden")
  ) {
    fail(
      "BCD guide",
      "mentions version_added: null without noting it is forbidden",
    );
  }

  // Check interface DOMxRef uses slash-path with display labels
  const interfaceText2 = await readFile(
    join(root, "templates/mdn-interface.md"),
    "utf8",
  );
  const dotDomxRef = interfaceText2.match(/DOMxRef\("InterfaceName\.[A-Z]/g);
  if (dotDomxRef && dotDomxRef.length > 0) {
    fail(
      "MDN interface",
      `${dotDomxRef.length} DOMxRef use dot form (InterfaceName.X) — must use slash-path with display label`,
    );
  } else {
    ok("MDN interface: all DOMxRef use slash-path form");
  }
  // Check events have DOMxRef with display label (not bare text)
  if (interfaceText2.match(/^- \`eventname\`/m)) {
    fail(
      "MDN interface",
      "events use bare text — must use {{DOMxRef with slash-path and display label}}",
    );
  } else {
    ok("MDN interface: events use DOMxRef with slash-path");
  }

  // Check constructor slug uses ConstructorName
  const constructorText2 = await readFile(
    join(root, "templates/mdn-constructor.md"),
    "utf8",
  );
  if (
    constructorText2.includes("slug: Web/API/_InterfaceName_/_InterfaceName_")
  ) {
    fail(
      "MDN constructor",
      "slug uses InterfaceName — must use ConstructorName (e.g., HTMLAudioElement/Audio)",
    );
  } else {
    ok("MDN constructor: slug uses ConstructorName");
  }
  if (
    constructorText2.includes(
      "browser-compat: api._InterfaceName_._InterfaceName_",
    )
  ) {
    fail(
      "MDN constructor",
      "browser-compat uses InterfaceName — must use ConstructorName",
    );
  } else {
    ok("MDN constructor: browser-compat uses ConstructorName");
  }

  // All-file floating provenance scan (modules + templates)
  const allMdFiles = [...mdnMdFiles, "mdn-bcd-generation-guide.md"];
  let floatingCount = 0;
  for (const file of allMdFiles) {
    try {
      const text = await readFile(join(root, "templates", file), "utf8");
      if (
        text.includes("blob/main/") || text.includes("blob/HEAD/") ||
        text.includes("raw.githubusercontent.com/") && text.includes("/main/")
      ) {
        fail(
          `MDN ${file}`,
          "contains floating blob/main or blob/HEAD URL — must pin to SHA",
        );
        floatingCount++;
      }
    } catch {}
  }
  // Also scan module
  if (
    moduleText.includes("blob/main/") || moduleText.includes("blob/HEAD/") ||
    (moduleText.includes("raw.githubusercontent.com/") &&
      moduleText.includes("/main/"))
  ) {
    fail("MDN module", "contains floating URL — must pin to SHA");
    floatingCount++;
  }
  if (floatingCount === 0) ok("MDN: no floating provenance URLs in any file");

  // Semantic BCD check: version_added true must not be presented as valid
  const bcdGuide2 = await readFile(
    join(root, "templates/mdn-bcd-generation-guide.md"),
    "utf8",
  );
  // Check that the guide explicitly states true is forbidden
  if (
    !bcdGuide2.includes("`true`") ||
    !bcdGuide2.toLowerCase().includes("forbidden")
  ) {
    fail(
      "BCD guide",
      "does not explicitly state that true is forbidden for version_added",
    );
  } else {
    ok("BCD guide: explicitly states true is forbidden");
  }
  // Check no file says null is valid/placeholder
  const nullValidPatterns = [
    "version_added.*null.*valid",
    "null.*placeholder",
    "uses.*null",
  ];
  let nullIssues = 0;
  for (const pattern of nullValidPatterns) {
    const re = new RegExp(pattern, "i");
    if (
      re.test(bcdGuide2) && !bcdGuide2.toLowerCase().includes("null.*forbidden")
    ) {
      fail(
        "BCD guide",
        "presents null as valid or placeholder — null is forbidden",
      );
      nullIssues++;
    }
  }
  if (nullIssues === 0) ok("BCD guide: null not presented as valid");

  // Check constructor template doesn't use InterfaceName in syntax
  const constructorText3 = await readFile(
    join(root, "templates/mdn-constructor.md"),
    "utf8",
  );
  if (constructorText3.includes("new InterfaceName(")) {
    fail(
      "MDN constructor",
      "syntax uses new InterfaceName() — must use new ConstructorName()",
    );
  } else {
    ok("MDN constructor: syntax uses ConstructorName");
  }

  // Check module for dot-form DOMxRef (not slash-path)
  const moduleDomxRefDot = moduleText.match(
    /DOMxRef\("InterfaceName\.[a-zA-Z]/g,
  );
  if (moduleDomxRefDot && moduleDomxRefDot.length > 0) {
    fail(
      "MDN module",
      `${moduleDomxRefDot.length} DOMxRef use dot form in module — must use slash-path`,
    );
  } else {
    ok("MDN module: all DOMxRef use slash-path form");
  }

  // Scan ALL files for developer.mozilla.org URLs (live, not pinned)
  const allScanFiles = [
    ...mdnMdFiles.map((f) => join("templates", f)),
    "modules/mdn-reference-authoring.md",
  ];
  let liveUrlCount = 0;
  for (const relPath of allScanFiles) {
    try {
      const text = await readFile(join(root, relPath), "utf8");
      const matches = text.match(/developer\.mozilla\.org/g);
      if (matches) {
        fail(
          `MDN ${relPath}`,
          `${matches.length} developer.mozilla.org URLs — must pin to GitHub blob SHA or label as live`,
        );
        liveUrlCount += matches.length;
      }
    } catch {}
  }
  if (liveUrlCount === 0) ok("MDN: no unpinned developer.mozilla.org URLs");

  // Check spec_url is conditional in BCD guide
  const bcdGuide3 = await readFile(
    join(root, "templates/mdn-bcd-generation-guide.md"),
    "utf8",
  );
  // Check spec_url is conditional in BCD guide
  // Every spec_url mention with "REQUIRED" must also mention "standard_track"
  const specUrlLines2 = bcdGuide3.split("\n").filter((l) =>
    l.toLowerCase().includes("spec_url") &&
    l.toLowerCase().includes("required") &&
    !l.toLowerCase().includes("standard_track")
  );
  if (specUrlLines2.length > 0) {
    fail(
      "BCD guide",
      `spec_url REQUIRED without standard_track condition: ${
        specUrlLines2[0].trim()
      }`,
    );
  } else if (bcdGuide3.includes("REQUIRED unconditionally")) {
    fail(
      "BCD guide",
      "spec_url described as REQUIRED unconditionally — must be conditional on standard_track:true",
    );
  } else {
    ok("BCD guide: spec_url conditional on standard_track:true");
  }

  // Check event DOMxRef display label is bare (not "eventName event")
  const interfaceText3 = await readFile(
    join(root, "templates/mdn-interface.md"),
    "utf8",
  );
  const eventLabelMatch = interfaceText3.match(
    /DOMxRef\("InterfaceName\/eventName_event",\s*"([^"]+)"\)/,
  );
  if (eventLabelMatch) {
    if (/ event$/i.test(eventLabelMatch[1])) {
      fail(
        "MDN interface",
        `event DOMxRef label "${
          eventLabelMatch[1]
        }" should be bare event name, not "X event"`,
      );
    } else {
      ok(
        `MDN interface: event DOMxRef label is bare ("${eventLabelMatch[1]}")`,
      );
    }
  }

  // Check static method target-label pair is exact
  const staticMethodMatch = interfaceText3.match(
    /DOMxRef\("InterfaceName\/staticMethodName_static",\s*"([^"]+)"\)/,
  );
  if (staticMethodMatch) {
    if (staticMethodMatch[1] !== "InterfaceName.staticMethodName()") {
      fail(
        "MDN interface",
        `static method label "${
          staticMethodMatch[1]
        }" should be "InterfaceName.staticMethodName()"`,
      );
    } else {
      ok("MDN interface: static method target-label pair exact");
    }
  }

  // Check static property target-label pair is exact
  const staticPropMatch = interfaceText3.match(
    /DOMxRef\("InterfaceName\/staticPropertyName_static",\s*"([^"]+)"\)/,
  );
  if (staticPropMatch) {
    if (staticPropMatch[1] !== "InterfaceName.staticPropertyName") {
      fail(
        "MDN interface",
        `static property label "${
          staticPropMatch[1]
        }" should be "InterfaceName.staticPropertyName"`,
      );
    } else {
      ok("MDN interface: static property target-label pair exact");
    }
  }

  // Check spec_url is conditional in BCD guide (must mention standard_track)
  const bcdGuide4 = await readFile(
    join(root, "templates/mdn-bcd-generation-guide.md"),
    "utf8",
  );
  const specUrlLines = bcdGuide4.split("\n").filter((l) =>
    l.includes("spec_url")
  );
  let specUrlConditional = true;
  for (const line of specUrlLines) {
    if (
      line.toLowerCase().includes("required") &&
      !line.toLowerCase().includes("standard_track")
    ) {
      specUrlConditional = false;
      fail(
        "BCD guide",
        `spec_url described as required without standard_track condition: ${line.trim()}`,
      );
    }
  }
  if (specUrlConditional) {
    ok("BCD guide: spec_url conditional on standard_track");
  }

  // Adversarial: parse ALL DOMxRef in interface, validate target-label pairs
  const allDomxRef = interfaceText3.matchAll(
    /DOMxRef\("([^"]+)",\s*"([^"]+)"\)/g,
  );
  let pairErrors = 0;
  for (const match of allDomxRef) {
    const target = match[1];
    const label = match[2];
    if (target.endsWith("_event") && / event$/i.test(label)) {
      fail(
        "MDN interface DOMxRef",
        `event target "${target}" label "${label}" should not end with " event"`,
      );
      pairErrors++;
    }
    if (target.endsWith("_static")) {
      const member = target.split("/").pop()?.replace("_static", "");
      if (member && member.startsWith("static") && !label.includes(member)) {
        fail(
          "MDN interface DOMxRef",
          `static target "${target}" label "${label}" missing member "${member}"`,
        );
        pairErrors++;
      }
    }
  }
  if (pairErrors === 0) {
    ok("MDN interface: all DOMxRef target-label pairs valid");
  }

  // Check APIRef semantics: no stale member-list/page-tree language
  const stalePatterns = [
    "auto-generates the list of",
    "Reads from the page tree",
    "subpages are automatically listed",
    "auto-generates.*member list",
  ];
  let staleCount = 0;
  for (const pattern of stalePatterns) {
    const re = new RegExp(pattern, "i");
    if (re.test(moduleText)) {
      fail("MDN module APIRef", `stale language: "${pattern}"`);
      staleCount++;
    }
  }
  // Must contain correct concepts
  if (!moduleText.includes("renders") || !moduleText.includes("sidebar")) {
    fail("MDN module APIRef", "missing required concept: renders sidebar");
    staleCount++;
  }
  if (
    !moduleText.includes("tag-discovered") &&
    !moduleText.includes("Tag-discovered")
  ) {
    fail("MDN module APIRef", "missing required concept: tag discovery");
    staleCount++;
  }
  if (!moduleText.includes("GroupData")) {
    fail("MDN module APIRef", "missing required concept: GroupData");
    staleCount++;
  }
  if (staleCount === 0) {
    ok(
      "MDN module APIRef: correct semantics (sidebar, tag discovery, GroupData)",
    );
  }

  // Check no dead URL patterns (index.md/API_ in pinned paths)
  const moduleText2 = await readFile(
    join(root, "modules/mdn-reference-authoring.md"),
    "utf8",
  );
  if (moduleText2.includes("index.md/API_")) {
    fail(
      "MDN module",
      "contains dead URL pattern index.md/API_ — use api_X_template/index.md",
    );
  } else {
    ok("MDN module: no dead source URL patterns");
  }

  // Check APIRef in overview template
  const overviewText = await readFile(
    join(root, "templates/mdn-api-overview.md"),
    "utf8",
  );
  if (!overviewText.includes("{{APIRef")) {
    fail("MDN overview", "missing {{APIRef}} macro");
  } else {
    ok("MDN overview: APIRef present");
  }

  ok(`MDN: ${mdnMdFiles.length} templates validated`);
} catch (e) {
  fail("MDN validation", e.message);
}

// 8. Feature-development behavioral regression contracts
try {
  const launchText = await readFile(
    join(root, "modules/launch-execution.md"),
    "utf8",
  );
  const skillText = await readFile(join(root, "SKILL.md"), "utf8");
  const phaseText = await readFile(
    join(root, "phases/06-prepare-to-ship.md"),
    "utf8",
  );
  const promptText = await readFile(
    join(root, "modules/feature-development-prompts.md"),
    "utf8",
  );
  const standardsText = await readFile(
    join(root, "modules/standards-and-incubation-analysis.md"),
    "utf8",
  );
  const trackerText = await readFile(
    join(root, "modules/implementation-and-issue-tracker-research.md"),
    "utf8",
  );
  const completionText = await readFile(
    join(root, "modules/completion-loop.md"),
    "utf8",
  );
  const fixture = await readJson(
    "evals/regressions/launch-management-execution.json",
  );
  const standardsFixture = await readJson(
    "evals/regressions/standards-incubation-link-closure.json",
  );
  const implementationFixture = await readJson(
    "evals/regressions/implementation-browser-completion.json",
  );
  const routing = await loadRouting();

  const launchContractErrors = validateLaunchContract(fixture);
  if (launchContractErrors.length === 0) {
    ok("launch regression: shape, execution rules, authority, and denominators valid");
  } else {
    fail("launch regression", launchContractErrors.join("; "));
  }

  const standardsContractErrors = validateStandardsContract(
    standardsFixture,
    standardsText,
  );
  if (standardsContractErrors.length === 0) {
    ok("standards regression: bounded graph closure, status semantics, and denominators valid");
  } else {
    fail("standards regression", standardsContractErrors.join("; "));
  }

  const implementationContractErrors = validateImplementationContract(
    implementationFixture,
    trackerText,
    completionText,
    launchText,
  );
  if (implementationContractErrors.length === 0) {
    ok("implementation regression: cross-browser trackers, Chrome runtime, and completion loop valid");
  } else {
    fail("implementation regression", implementationContractErrors.join("; "));
  }

  const standardsHeadings = [
    "## Non-negotiable status semantics",
    "## Build the source graph",
    "## Freeze and reconcile the research universe",
    "## Follow substantive cross-links to closure",
    "## Reconstruct chronology and current state",
    "## Analyze the entire incubation surface",
    "## Engine-position analysis",
  ];
  const missingStandardsHeadings = standardsHeadings.filter((heading) =>
    !standardsText.includes(heading)
  );
  if (missingStandardsHeadings.length === 0) {
    ok("standards module: evidence-graph stages remain structurally discoverable");
  } else {
    fail("standards module", `missing headings: ${missingStandardsHeadings.join(", ")}`);
  }

  const headings = [
    "## Default execution contract",
    "### Layer 0",
    "### Layer 1",
    "### Layer 2",
    "### Layer 3",
    "## Run the implementation, not just the source",
    "## Audit and prepare documentation",
  ];
  const missingHeadings = headings.filter((heading) =>
    !launchText.includes(heading)
  );
  if (missingHeadings.length === 0) {
    ok("launch module: execution stages remain structurally discoverable");
  } else {
    fail("launch module", `missing headings: ${missingHeadings.join(", ")}`);
  }

  const launchRoute = routeRequest(fixture.input, routing);
  const standardsRoute = routeRequest(standardsFixture.input, routing);
  const implementationRoute = routeRequest(implementationFixture.input, routing);
  const declaredStandardsRoutes = [
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
  ].map((input) => routeRequest(input, routing));
  const declaredImplementationRoutes = [
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
  ].map((input) => routeRequest(input, routing));
  if (
    launchRoute.mode === "execute" &&
    launchRoute.modules.includes("modules/launch-execution.md") &&
    launchRoute.modules.includes("modules/standards-and-incubation-analysis.md") &&
    launchRoute.modules.includes("modules/implementation-and-issue-tracker-research.md") &&
    launchRoute.modules.includes("modules/completion-loop.md") &&
    implementationRoute.mode === "execute" &&
    implementationRoute.modules.includes("modules/launch-execution.md") &&
    implementationRoute.modules.includes("modules/implementation-and-issue-tracker-research.md") &&
    implementationRoute.modules.includes("modules/completion-loop.md") &&
    standardsRoute.mode === "analyze" &&
    standardsRoute.modules.includes("modules/standards-and-incubation-analysis.md") &&
    standardsRoute.modules.includes("modules/implementation-and-issue-tracker-research.md") &&
    standardsRoute.modules.includes("modules/completion-loop.md") &&
    declaredStandardsRoutes.every((route) =>
      route.mode === "analyze" &&
      route.modules.includes("modules/standards-and-incubation-analysis.md") &&
      route.modules.includes("modules/implementation-and-issue-tracker-research.md") &&
      route.modules.includes("modules/completion-loop.md")
    ) &&
    declaredImplementationRoutes.every((route) =>
      route.mode === "research" &&
      route.modules.includes("modules/implementation-and-issue-tracker-research.md") &&
      route.modules.includes("modules/standards-and-incubation-analysis.md") &&
      route.modules.includes("modules/completion-loop.md")
    ) &&
    skillText.includes("modules/launch-execution.md") &&
    phaseText.includes("modules/launch-execution.md") &&
    promptText.includes("modules/launch-execution.md") &&
    skillText.includes("modules/standards-and-incubation-analysis.md") &&
    phaseText.includes("modules/standards-and-incubation-analysis.md") &&
    promptText.includes("modules/standards-and-incubation-analysis.md") &&
    launchText.includes("modules/standards-and-incubation-analysis.md") &&
    skillText.includes("modules/implementation-and-issue-tracker-research.md") &&
    phaseText.includes("modules/implementation-and-issue-tracker-research.md") &&
    promptText.includes("modules/implementation-and-issue-tracker-research.md") &&
    launchText.includes("modules/implementation-and-issue-tracker-research.md") &&
    skillText.includes("modules/completion-loop.md") &&
    phaseText.includes("modules/completion-loop.md") &&
    promptText.includes("modules/completion-loop.md") &&
    launchText.includes("modules/completion-loop.md")
  ) {
    ok("feature routing: exact regression prompts execute/analyze through linked contracts");
  } else {
    fail("feature routing", "executable route or linked entry point is incomplete");
  }
} catch (e) {
  fail("launch execution validation", e.message);
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
