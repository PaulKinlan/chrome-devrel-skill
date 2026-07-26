#!/usr/bin/env node
// mdn-mutation-tests.mjs — creates invalid copies of MDN files and verifies
// the validator catches each regression. Run after validate-public-core.mjs passes.

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const mutantDir = join(root, ".mutation-test-tmp");
let passed = 0;
let failed = 0;

function test(name, mutation, expectedErrorPattern) {
  try {
    // Run validator and capture output
    const output = execSync("node scripts/validate-public-core.mjs 2>&1", {
      cwd: root,
      encoding: "utf8",
    });
    if (output.includes(expectedErrorPattern)) {
      console.log(`✓ ${name}: caught "${expectedErrorPattern}"`);
      passed++;
    } else {
      console.error(
        `✗ ${name}: validator did NOT catch "${expectedErrorPattern}"`,
      );
      failed++;
    }
  } catch (e) {
    const output = e.stdout || e.stderr || "";
    if (output.includes(expectedErrorPattern)) {
      console.log(`✓ ${name}: caught "${expectedErrorPattern}"`);
      passed++;
    } else {
      console.error(
        `✗ ${name}: validator did NOT catch "${expectedErrorPattern}"`,
      );
      console.error(`  Output: ${output.slice(-200)}`);
      failed++;
    }
  }
}

async function withMutation(file, mutatedContent, name, expectedError) {
  const path = join(root, file);
  const original = await readFile(path, "utf8");
  try {
    await writeFile(path, mutatedContent, "utf8");
    test(name, null, expectedError);
  } finally {
    await writeFile(path, original, "utf8");
  }
}

// Test 1: Event DOMxRef dot form should fail
await withMutation(
  "templates/mdn-interface.md",
  (await readFile(join(root, "templates/mdn-interface.md"), "utf8"))
    .replace(
      'DOMxRef("InterfaceName/eventName_event", "eventName")',
      'DOMxRef("InterfaceName.eventName_event")',
    ),
  "mutation: event DOMxRef dot form",
  "dot form",
);

// Test 2: version_added: true claimed valid should fail
await withMutation(
  "templates/mdn-bcd-generation-guide.md",
  (await readFile(join(root, "templates/mdn-bcd-generation-guide.md"), "utf8"))
    .replace("both forbidden", "both valid options"),
  "mutation: true claimed valid",
  "true",
);

// Test 3: Constructor using InterfaceName in syntax should fail
await withMutation(
  "templates/mdn-constructor.md",
  (await readFile(join(root, "templates/mdn-constructor.md"), "utf8"))
    .replace("new ConstructorName()", "new InterfaceName()"),
  "mutation: constructor InterfaceName syntax",
  "InterfaceName",
);

// Test 4: Floating developer.mozilla.org URL should fail
await withMutation(
  "modules/mdn-reference-authoring.md",
  (await readFile(join(root, "modules/mdn-reference-authoring.md"), "utf8"))
    .replace("github.com/mdn/content/blob/", "developer.mozilla.org/"),
  "mutation: floating MDN URL",
  "developer.mozilla.org",
);

// Test 5: Module DOMxRef dot form should fail
const moduleText = await readFile(
  join(root, "modules/mdn-reference-authoring.md"),
  "utf8",
);
if (
  moduleText.includes('DOMxRef("InterfaceName/eventName_event", "eventName")')
) {
  await withMutation(
    "modules/mdn-reference-authoring.md",
    moduleText.replace(
      'DOMxRef("InterfaceName/eventName_event", "eventName")',
      'DOMxRef("InterfaceName.eventName_event")',
    ),
    "mutation: module DOMxRef dot form",
    "dot",
  );
}

// Results
console.log(`\nMutation tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
