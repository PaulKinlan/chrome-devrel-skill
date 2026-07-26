#!/usr/bin/env node
// mdn-mutation-tests.mjs — creates invalid copies of MDN files and verifies
// the validator catches each regression. 7 tests, all must pass.

import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
let passed = 0;
let failed = 0;

async function withMutation(file, mutatedContent, name, expectedError) {
  const path = join(root, file);
  const original = await readFile(path, "utf8");
  try {
    await writeFile(path, mutatedContent, "utf8");
    try {
      const output = execSync("node scripts/validate-public-core.mjs 2>&1", {
        cwd: root,
        encoding: "utf8",
      });
      if (output.includes(expectedError)) {
        console.log(`✓ ${name}: caught`);
        passed++;
      } else {
        console.error(`✗ ${name}: NOT caught (expected "${expectedError}")`);
        failed++;
      }
    } catch (e) {
      const output = e.stdout || e.stderr || "";
      if (output.includes(expectedError)) {
        console.log(`✓ ${name}: caught`);
        passed++;
      } else {
        console.error(`✗ ${name}: NOT caught (expected "${expectedError}")`);
        console.error(`  Output: ${output.slice(-200)}`);
        failed++;
      }
    }
  } finally {
    await writeFile(path, original, "utf8");
  }
}

// Test 1: Event DOMxRef dot form
{
  const text = await readFile(join(root, "templates/mdn-interface.md"), "utf8");
  await withMutation(
    "templates/mdn-interface.md",
    text.replace(
      'DOMxRef("InterfaceName/eventName_event", "eventName")',
      'DOMxRef("InterfaceName.eventName_event")',
    ),
    "event DOMxRef dot form",
    "dot form",
  );
}

// Test 2: version_added: true claimed valid
{
  const text = await readFile(
    join(root, "templates/mdn-bcd-generation-guide.md"),
    "utf8",
  );
  await withMutation(
    "templates/mdn-bcd-generation-guide.md",
    text.replace("both forbidden", "both valid options"),
    "true claimed valid",
    "true",
  );
}

// Test 3: Constructor InterfaceName syntax
{
  const text = await readFile(
    join(root, "templates/mdn-constructor.md"),
    "utf8",
  );
  await withMutation(
    "templates/mdn-constructor.md",
    text.replace("new ConstructorName()", "new InterfaceName()"),
    "constructor InterfaceName syntax",
    "InterfaceName",
  );
}

// Test 4: Floating developer.mozilla.org URL
{
  const text = await readFile(
    join(root, "modules/mdn-reference-authoring.md"),
    "utf8",
  );
  await withMutation(
    "modules/mdn-reference-authoring.md",
    text.replace("github.com/mdn/content/blob/", "developer.mozilla.org/"),
    "floating MDN URL",
    "developer.mozilla.org",
  );
}

// Test 5: Invalid event label (wrong display text)
{
  const text = await readFile(join(root, "templates/mdn-interface.md"), "utf8");
  await withMutation(
    "templates/mdn-interface.md",
    text.replace(
      '"InterfaceName/eventName_event", "eventName"',
      '"InterfaceName/eventName_event", "eventName event"',
    ),
    "invalid event label",
    "bare event name",
  );
}

// Test 6: Unconditional spec_url (REQUIRED without standard_track condition)
{
  const text = await readFile(
    join(root, "templates/mdn-bcd-generation-guide.md"),
    "utf8",
  );
  await withMutation(
    "templates/mdn-bcd-generation-guide.md",
    text.replace(
      "Optional generally; REQUIRED when",
      "REQUIRED generally. Not conditional on",
    ),
    "unconditional spec_url",
    "spec_url",
  );
}

// Test 7: Lowercase module event dot-form
{
  const text = await readFile(
    join(root, "modules/mdn-reference-authoring.md"),
    "utf8",
  );
  await withMutation(
    "modules/mdn-reference-authoring.md",
    text.replace(
      'DOMxRef("InterfaceName/eventName_event", "eventName")',
      'DOMxRef("InterfaceName.eventname_event")',
    ),
    "lowercase module event dot-form",
    "dot",
  );
}

// Results
console.log(`\nMutation tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
