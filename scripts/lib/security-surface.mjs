export const URL_PATTERN = /https?:\/\/[^\s<>"'`)\]}]+/gi;

// package.json is the one file npm acts on by itself. In the distributable tree it may hold
// descriptive metadata and the single pinned `test` script, so that no install hook,
// dependency, or executable can ship with the skill.
const PACKAGE_JSON_KEYS = new Set([
  "name",
  "version",
  "private",
  "description",
  "license",
  "author",
  "keywords",
  "repository",
  "homepage",
  "bugs",
  "engines",
  "scripts",
]);
const PACKAGE_TEST_SCRIPT = "node scripts/test-all.mjs";

function auditPackageJson(path, text) {
  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch (error) {
    return [`${path}: not valid JSON (${error.message})`];
  }
  if (manifest === null || typeof manifest !== "object" || Array.isArray(manifest)) {
    return [`${path}: must be a JSON object`];
  }

  const errors = [];
  for (const key of Object.keys(manifest)) {
    if (!PACKAGE_JSON_KEYS.has(key)) {
      errors.push(
        `${path}: "${key}" is not an allowed field (allowed: ${[...PACKAGE_JSON_KEYS].join(", ")}); ` +
          "the distributable tree ships no dependencies, binaries, or install hooks",
      );
    }
  }
  if (manifest.private !== true) errors.push(`${path}: "private" must be true`);

  const scripts = manifest.scripts === undefined ? {} : manifest.scripts;
  if (scripts === null || typeof scripts !== "object" || Array.isArray(scripts)) {
    errors.push(`${path}: "scripts" must be an object`);
  } else {
    for (const [name, command] of Object.entries(scripts)) {
      if (name !== "test") {
        errors.push(`${path}: script "${name}" is not allowed; only "test" is`);
      } else if (command !== PACKAGE_TEST_SCRIPT) {
        errors.push(`${path}: scripts.test must be exactly "${PACKAGE_TEST_SCRIPT}"`);
      }
    }
  }
  return errors;
}

export function auditText(path, text, policy) {
  const errors = [];
  const hosts = new Set();
  const allowed = new Set(Object.keys(policy.allowedHosts || {}));
  const reserved = new Set(Object.keys(policy.reservedTestHosts || {}));

  if (path === "package.json") errors.push(...auditPackageJson(path, text));

  const isMutationTest = path === "scripts/security-surface.test.mjs";
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bghp_[A-Za-z0-9]{30,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  ];
  if (!isMutationTest) {
    for (const pattern of secretPatterns) {
      if (pattern.test(text)) errors.push(`${path}: matches forbidden secret pattern ${pattern}`);
    }
    if (/\b(?:curl|wget)\b[^\n|]{0,500}\|\s*(?:ba)?sh\b/i.test(text)) {
      errors.push(`${path}: contains pipe-to-shell download pattern`);
    }
  }

  for (const raw of text.match(URL_PATTERN) || []) {
    let host;
    try {
      host = new URL(raw.replace(/[.,;:]+$/, "")).hostname.toLowerCase();
    } catch {
      errors.push(`${path}: malformed URL ${raw}`);
      continue;
    }
    hosts.add(host);
    if (allowed.has(host)) continue;
    if (
      reserved.has(host) &&
      (path === "security/external-source-domains.json" ||
        /^scripts\/.*test.*\.mjs$/.test(path))
    ) {
      continue;
    }
    errors.push(`${path}: unexpected URL hostname ${host}`);
  }

  return { errors, hosts };
}
