#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MAX_DESCRIPTION_LENGTH,
  checkSkillFrontmatter,
  parseSkillFrontmatter,
} from "./lib/skill-frontmatter.mjs";

const wrap = (body) => `---\n${body}\n---\n# Title\n`;
const errorsFor = (body) => checkSkillFrontmatter(wrap(body)).errors;

// --- the shipped SKILL.md must stay loadable -------------------------------------------
const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const shipped = checkSkillFrontmatter(readFileSync(resolve(repoRoot, "SKILL.md"), "utf8"));
assert.deepEqual(shipped.errors, [], "SKILL.md frontmatter");
assert.equal(shipped.data.name, "chrome-devrel");

// --- accepted forms ---------------------------------------------------------------------
assert.deepEqual(
  parseSkillFrontmatter(wrap("name: my-skill\nversion: 0.2.0\ndescription: Does a thing, then another.")),
  { data: { name: "my-skill", version: "0.2.0", description: "Does a thing, then another." }, errors: [] },
);
assert.equal(
  parseSkillFrontmatter(wrap('name: a\ndescription: "Use when: asked, \\"quoted\\""')).data.description,
  'Use when: asked, "quoted"',
  "double-quoted scalars may contain ': '",
);
assert.equal(
  parseSkillFrontmatter(wrap("name: a\ndescription: 'It''s fine: really'")).data.description,
  "It's fine: really",
);
assert.equal(
  parseSkillFrontmatter(wrap("name: a\ndescription: >-\n  First line\n  second line: with a colon\nversion: 1")).data.description,
  "First line second line: with a colon",
  "folded block scalars are joined; the next key still parses",
);
assert.equal(
  parseSkillFrontmatter("\uFEFF---\r\nname: crlf\r\ndescription: ok\r\n---\r\n").data.name,
  "crlf",
  "BOM and CRLF are tolerated",
);

// --- rejected forms (each would break some YAML parser, or the skill loader) -------------
const hasError = (body, pattern) =>
  assert.ok(errorsFor(body).some((e) => pattern.test(e)), `expected /${pattern.source}/ in ${JSON.stringify(errorsFor(body))}`);

hasError("name: a\ndescription: Use when launching: assess it", /contains ": "/);
hasError("name: a\ndescription: ends with colon:", /contains ": "/);
hasError("name: a\ndescription: value # not a comment", /comment/);
hasError("name: a\ndescription: [a, b]", /indicator/);
hasError('name: a\ndescription: "never closed', /unterminated/);
hasError("name: a\ndescription: x\nname: b", /duplicate key/);
hasError("name: a\ndescription: x\nnested:\n  child: 1", /unsupported/);
hasError("description: no name here", /missing name/);
hasError("name: Bad_Name\ndescription: x", /lowercase/);
hasError("name: a", /missing description/);
hasError(`name: a\ndescription: ${"x".repeat(MAX_DESCRIPTION_LENGTH + 1)}`, /limit is 1024/);
assert.ok(checkSkillFrontmatter("# no frontmatter").errors[0].includes("must start with"));
assert.ok(checkSkillFrontmatter("---\nname: a\n").errors[0].includes("not closed"));

console.log("Skill frontmatter: shipped SKILL.md, accepted forms, and rejected forms passed");
