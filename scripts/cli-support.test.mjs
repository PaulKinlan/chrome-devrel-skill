#!/usr/bin/env node
// Direct tests for the small helpers every CLI shares: is-main, cli-error, read-json-file.
// The CLIs themselves are exercised end to end in entrypoint.test.mjs, packet.test.mjs and
// prepare-launch-bundle.test.mjs; these pin the helpers' own edge cases.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { formatCliError } from "./lib/cli-error.mjs";
import { isMainModule } from "./lib/is-main.mjs";
import { readJsonFile } from "./lib/read-json-file.mjs";

const work = mkdtempSync(join(tmpdir(), "chrome-devrel-cli-support-"));

try {
  // --- formatCliError: expected failures are one line; programmer errors keep the stack ---
  assert.equal(
    formatCliError("packet", new Error("PATCH_INVALID: nope")),
    "packet: PATCH_INVALID: nope",
  );
  assert.equal(formatCliError("packet", "plain string"), "packet: plain string");

  for (const ErrorType of [TypeError, ReferenceError, RangeError]) {
    const text = formatCliError("packet", new ErrorType("it broke"));
    assert.ok(text.startsWith("packet: internal error\n"), `${ErrorType.name}: ${text}`);
    assert.match(text, /it broke/, ErrorType.name);
    assert.match(text, /\n\s+at /, `${ErrorType.name} should keep its stack`);
  }

  // A missing file is an expected failure: the native message already names the path.
  const absent = join(work, "absent.json");
  await assert.rejects(readJsonFile(absent), (error) => {
    assert.equal(error.code, "ENOENT");
    const text = formatCliError("packet", error);
    assert.ok(text.startsWith("packet: ENOENT"), text);
    assert.ok(text.includes(absent), text);
    assert.doesNotMatch(text, /\n\s+at /);
    return true;
  });

  // --- readJsonFile ---
  const good = join(work, "good.json");
  writeFileSync(good, '{"a": [1, 2, {"b": null}]}');
  assert.deepEqual(await readJsonFile(good), { a: [1, 2, { b: null }] });

  // A byte-order mark is accepted; JSON.parse alone rejects it.
  const withBom = join(work, "bom.json");
  writeFileSync(withBom, "\uFEFF{\"a\": 1}");
  assert.deepEqual(await readJsonFile(withBom), { a: 1 });

  // Corrupt, truncated and empty files all name the file, and keep the parser's reason.
  for (const [label, content] of [
    ["corrupt", "{not json"],
    ["truncated", '{"a": [1, 2'],
    ["empty", ""],
  ]) {
    const file = join(work, `${label}.json`);
    writeFileSync(file, content);
    await assert.rejects(readJsonFile(file), (error) => {
      assert.ok(
        error.message.startsWith(`${file} is not valid JSON: `),
        `${label}: ${error.message}`,
      );
      assert.ok(error.message.length > `${file} is not valid JSON: `.length, label);
      assert.ok(!(error instanceof SyntaxError), `${label}: should be a plain Error`);
      return true;
    });
  }

  // --- isMainModule: real-path comparison, not string comparison ---
  const odd = join(work, "my dir ü");
  mkdirSync(odd);
  const script = join(odd, "tool.mjs");
  const other = join(odd, "other.mjs");
  writeFileSync(script, "export {};\n");
  writeFileSync(other, "export {};\n");
  const link = join(work, "linked-tool.mjs");
  symlinkSync(script, link);

  const metaUrl = pathToFileURL(script).href;
  assert.equal(isMainModule(metaUrl, script), true, "same file");
  assert.equal(isMainModule(metaUrl, link), true, "reached through a symlink");
  assert.equal(isMainModule(pathToFileURL(link).href, script), true, "module is the symlink");
  assert.equal(isMainModule(metaUrl, other), false, "a different file");
  assert.equal(isMainModule(metaUrl, join(work, "missing.mjs")), false, "entry path that does not exist");
  assert.equal(isMainModule(metaUrl, ""), false, "no entry script, as in an interactive session");
  assert.equal(isMainModule("not a url", script), false, "unusable module URL");
  // The old guard compared raw strings, which fails for exactly these two cases:
  assert.notEqual(metaUrl, `file://${script}`, "a spaced or non-ASCII path is percent-encoded in the URL");
  assert.notEqual(pathToFileURL(link).href, pathToFileURL(script).href);

  console.log("CLI support helpers: is-main, cli-error, and read-json-file passed");
} finally {
  rmSync(work, { recursive: true, force: true });
}
