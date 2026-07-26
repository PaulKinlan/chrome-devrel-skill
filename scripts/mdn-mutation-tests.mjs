#!/usr/bin/env node
// mdn-mutation-tests.mjs — 7 mutation tests. Each asserts fixture changed,
// then requires validator nonzero exit + specific error pattern.

import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
let passed = 0;
let failed = 0;

async function withMutation(file, findStr, replaceStr, name, expectedError) {
  const path = join(root, file);
  const original = await readFile(path, "utf8");

  // Assert the anchor exists — if not, the mutation is a no-op
  if (!original.includes(findStr)) {
    console.error(`✗ ${name}: anchor not found in fixture (no-op mutation)`);
    failed++;
    return;
  }

  const mutated = original.replace(findStr, replaceStr);

  // Assert the mutation actually changed the content
  if (mutated === original) {
    console.error(`✗ ${name}: replacement produced no change`);
    failed++;
    return;
  }

  try {
    await writeFile(path, mutated, "utf8");
    let output = "";
    let exitCode = 0;
    try {
      output = execSync("node scripts/validate-public-core.mjs 2>&1", {
        cwd: root,
        encoding: "utf8",
        stdio: "pipe",
      });
    } catch (e) {
      output = e.stdout || e.stderr || "";
      exitCode = e.status ?? 1;
    }

    // Require nonzero exit (validator must fail on mutation)
    if (exitCode === 0) {
      console.error(`✗ ${name}: validator exited 0 (did not fail)`);
      failed++;
      return;
    }
    // Require specific error pattern
    if (!output.includes(expectedError)) {
      console.error(
        `✗ ${name}: validator failed but missing "${expectedError}"`,
      );
      console.error(`  Last output: ${output.slice(-300)}`);
      failed++;
      return;
    }
    console.log(
      `✓ ${name}: fixture changed, validator exit ${exitCode}, caught`,
    );
    passed++;
  } finally {
    await writeFile(path, original, "utf8");
  }
}

// Test 1: Event DOMxRef dot form
await withMutation(
  "templates/mdn-interface.md",
  'DOMxRef("InterfaceName/eventName_event", "eventName")',
  'DOMxRef("InterfaceName.eventName_event")',
  "event DOMxRef dot form",
  "dot form",
);

// Test 2: version_added true claimed valid
await withMutation(
  "templates/mdn-bcd-generation-guide.md",
  "both forbidden",
  "both valid options",
  "true claimed valid",
  "forbidden",
);

// Test 3: Constructor InterfaceName syntax
await withMutation(
  "templates/mdn-constructor.md",
  "new ConstructorName()",
  "new InterfaceName()",
  "constructor InterfaceName syntax",
  "InterfaceName",
);

// Test 4: Floating developer.mozilla.org URL
await withMutation(
  "modules/mdn-reference-authoring.md",
  "github.com/mdn/content/blob/",
  "developer.mozilla.org/",
  "floating MDN URL",
  "developer.mozilla.org",
);

// Test 5: Invalid event label (wrong display text)
await withMutation(
  "templates/mdn-interface.md",
  '"InterfaceName/eventName_event", "eventName"',
  '"InterfaceName/eventName_event", "eventName event"',
  "invalid event label",
  "bare event name",
);

// Test 6: Unconditional spec_url
await withMutation(
  "templates/mdn-bcd-generation-guide.md",
  "REQUIRED when standard_track:true, optional otherwise",
  "REQUIRED unconditionally for all entries",
  "unconditional spec_url",
  "unconditionally",
);

// Test 7: Lowercase module event dot-form
await withMutation(
  "modules/mdn-reference-authoring.md",
  'DOMxRef("InterfaceName/eventName_event", "eventName")',
  'DOMxRef("InterfaceName.eventname_event")',
  "lowercase module event dot-form",
  "dot",
);

console.log(`\nMutation tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
