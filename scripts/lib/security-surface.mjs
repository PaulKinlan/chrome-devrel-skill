export const URL_PATTERN = /https?:\/\/[^\s<>"'`)\]}]+/gi;

export function auditText(path, text, policy) {
  const errors = [];
  const hosts = new Set();
  const allowed = new Set(Object.keys(policy.allowedHosts || {}));
  const reserved = new Set(Object.keys(policy.reservedTestHosts || {}));

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
