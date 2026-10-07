// skill-frontmatter.mjs — strict, dependency-free reader for SKILL.md frontmatter.
//
// An agent only loads a skill if its frontmatter parses, and YAML parsers disagree
// about edge cases (an unquoted ": " inside a description is the classic one). This
// reader accepts the small subset a skill needs — `key: value` lines with plain or
// quoted scalars, plus folded/literal block scalars — and reports anything else
// instead of guessing, so a frontmatter that passes here is safe in any parser.

export const MAX_NAME_LENGTH = 64;
export const MAX_DESCRIPTION_LENGTH = 1024;

const BLOCK_SCALAR = /^[>|][+-]?\d*$/;
const KEY_LINE = /^([A-Za-z0-9_-]+):(?: +(.*))?$/;

/** Parse only: returns `{ data, errors }` where errors are syntax problems. */
export function parseSkillFrontmatter(text) {
  const data = {};
  const errors = [];
  const lines = String(text).replace(/^\uFEFF/, "").split(/\r?\n/);

  if (lines[0] !== "---") {
    return { data, errors: ["SKILL.md must start with a --- frontmatter line"] };
  }
  const end = lines.indexOf("---", 1);
  if (end === -1) {
    return { data, errors: ["frontmatter is not closed by a --- line"] };
  }

  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.startsWith("#")) continue;

    const match = KEY_LINE.exec(line);
    if (!match) {
      errors.push(`line ${i + 1}: unsupported frontmatter syntax "${line.trim().slice(0, 60)}"`);
      continue;
    }
    const key = match[1];
    const value = (match[2] ?? "").trimEnd();
    if (key in data) {
      errors.push(`line ${i + 1}: duplicate key "${key}"`);
      continue;
    }

    if (BLOCK_SCALAR.test(value)) {
      const body = [];
      while (i + 1 < end && (lines[i + 1].startsWith(" ") || lines[i + 1].trim() === "")) {
        body.push(lines[++i]);
      }
      const folded = value.startsWith(">");
      const text = body.map((l) => l.trim());
      data[key] = (folded ? text.join(" ").replace(/ {2,}/g, " ") : text.join("\n")).trim();
    } else if (value.startsWith('"') || value.startsWith("'")) {
      const quote = value[0];
      if (value.length < 2 || !value.endsWith(quote)) {
        errors.push(`line ${i + 1}: "${key}" has an unterminated ${quote} string`);
        continue;
      }
      const inner = value.slice(1, -1);
      data[key] = quote === "'" ? inner.replace(/''/g, "'") : inner.replace(/\\(["\\])/g, "$1");
    } else {
      if (/^[[\]{}&*!%@`]/.test(value)) {
        errors.push(`line ${i + 1}: "${key}" starts with a YAML indicator character; quote it`);
      } else if (value.includes(": ") || value.endsWith(":")) {
        errors.push(`line ${i + 1}: "${key}" contains ": " which YAML reads as a nested key; quote it or use a block scalar (>-)`);
      } else if (/\s#/.test(value)) {
        errors.push(`line ${i + 1}: "${key}" contains " #" which YAML reads as a comment; quote it`);
      }
      data[key] = value;
    }
  }
  return { data, errors };
}

/** Parse plus the rules every skill must satisfy: `{ data, errors }`. */
export function checkSkillFrontmatter(text) {
  const { data, errors } = parseSkillFrontmatter(text);
  const problems = [...errors];

  if (!data.name) {
    problems.push("missing name");
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name) || data.name.length > MAX_NAME_LENGTH) {
    problems.push(`name "${data.name}" must be lowercase letters, digits and single hyphens, at most ${MAX_NAME_LENGTH} characters`);
  }
  if (!data.description) {
    problems.push("missing description");
  } else if (data.description.length > MAX_DESCRIPTION_LENGTH) {
    problems.push(`description is ${data.description.length} characters; the limit is ${MAX_DESCRIPTION_LENGTH}`);
  }
  return { data, errors: problems };
}
