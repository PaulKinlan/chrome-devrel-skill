import { realpath } from "node:fs/promises";
import { resolve, sep } from "node:path";

export async function parseTrustedDocumentationCommand(receipt, {
  runRoot,
  trustedDocumentationValidatorPath,
  trustedNodePath = process.execPath,
}) {
  if (!receipt?.argv || receipt.argv.length < 2) return { ok: false, reason: "argv too short" };
  let nodeReal, scriptReal, trustedNodeReal, trustedScriptReal, cwdReal, rootReal;
  try {
    [nodeReal, scriptReal, trustedNodeReal, trustedScriptReal, cwdReal, rootReal] = await Promise.all([
      realpath(receipt.argv[0]),
      realpath(resolve(receipt.cwd, receipt.argv[1])),
      realpath(trustedNodePath),
      realpath(trustedDocumentationValidatorPath),
      realpath(receipt.cwd),
      realpath(runRoot),
    ]);
  } catch (error) {
    return { ok: false, reason: `realpath failed: ${error.message}` };
  }
  if (nodeReal !== trustedNodeReal || scriptReal !== trustedScriptReal) return { ok: false, reason: "Node or validator realpath is not trusted" };
  if (cwdReal !== rootReal && !cwdReal.startsWith(`${rootReal}${sep}`)) return { ok: false, reason: "cwd escapes run root" };
  const parsed = { examples: [], unknown: [], root: null, contract: null, guide: null };
  const seenSingleton = new Set();
  for (let i = 2; i < receipt.argv.length; i += 2) {
    const key = receipt.argv[i], value = receipt.argv[i + 1];
    if (!value || !["--root", "--contract", "--example", "--guide"].includes(key)) { parsed.unknown.push(key || "missing"); continue; }
    if (key === "--example") parsed.examples.push(value);
    else {
      if (seenSingleton.has(key)) parsed.unknown.push(`duplicate:${key}`);
      seenSingleton.add(key);
      parsed[key.slice(2)] = value;
    }
  }
  if (parsed.unknown.length) return { ok: false, reason: `unknown/duplicate args: ${parsed.unknown.join(", ")}`, parsed };
  if (resolve(parsed.root || "") !== resolve(runRoot)) return { ok: false, reason: "--root does not match run root", parsed };
  if (!parsed.contract || (parsed.examples.length === 0 && !parsed.guide)) return { ok: false, reason: "contract plus example/guide required", parsed };
  return { ok: true, parsed, nodeReal, scriptReal, cwdReal, rootReal };
}

export function minimalReplayEnvironment() {
  return {
    PATH: process.env.PATH || "/usr/bin:/bin",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
  };
}
