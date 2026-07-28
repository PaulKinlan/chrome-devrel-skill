#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { stripSourceComments } from "./lib/launch-acceptance.mjs";

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const values = (name) => args.flatMap((arg, index) => arg === name ? [args[index + 1]] : []).filter(Boolean);
const root = resolve(value("--root") || ".");
const contractPath = value("--contract");
const examples = values("--example");
const guidePath = value("--guide");
if (!contractPath || (examples.length === 0 && !guidePath)) {
  console.error("Usage: node scripts/validate-documentation-example.mjs --root <run> --contract <relative-contract.json> [--example <relative.html>...] [--guide <relative.md>]");
  process.exit(2);
}
const contract = JSON.parse(await readFile(resolve(root, contractPath), "utf8"));
const tokens = [...new Set((contract.contracts || []).flatMap((item) => item.surfaceTokens || []))];
const patterns = [...new Set((contract.contracts || []).flatMap((item) => item.examplePatterns || []))];
const errors = [];
for (const path of examples) {
  const text = await readFile(resolve(root, path), "utf8");
  const executableText = stripSourceComments(text);
  if (Buffer.byteLength(text) < 200) errors.push(`${path}: too thin`);
  if (!/<\!doctype html>/i.test(text) || !/<script[\s>]/i.test(text) || !/<(?:button|form|input|select)[\s>]/i.test(text) || !/<(?:output|pre|div)[^>]*(?:status|aria-live)/i.test(text)) errors.push(`${path}: missing complete runnable HTML/control/status structure`);
  if (/\b(?:TODO|FIXME|REPLACE_ME|PLACEHOLDER|YOUR_API_KEY)\b|<your-[^>]+>/i.test(text)) errors.push(`${path}: placeholder remains`);
  for (const token of tokens) if (!executableText.includes(token)) errors.push(`${path}: missing executable contract surface token ${token}`);
  for (const pattern of patterns) {
    try { if (!new RegExp(pattern).test(executableText)) errors.push(`${path}: missing contract execution pattern ${pattern}`); }
    catch { errors.push(`${contractPath}: invalid contract execution pattern ${pattern}`); }
  }
}
if (guidePath) {
  const text = await readFile(resolve(root, guidePath), "utf8");
  const required = ["overview", "feature detection", "fallback", "api", "errors", "permissions", "lifecycle", "server", "deployment", "compatibility", "accessibility", "privacy", "performance", "troubleshooting", "realistic integration"];
  if (Buffer.byteLength(text) < 500) errors.push(`${guidePath}: too thin`);
  for (const term of required) if (!text.toLowerCase().includes(term)) errors.push(`${guidePath}: missing ${term}`);
  const guideCode = stripSourceComments(text);
  for (const token of tokens) if (!guideCode.includes(token)) errors.push(`${guidePath}: missing contract surface ${token}`);
  for (const pattern of patterns) {
    try { if (!new RegExp(pattern).test(guideCode)) errors.push(`${guidePath}: missing contract execution pattern ${pattern}`); }
    catch { errors.push(`${contractPath}: invalid contract execution pattern ${pattern}`); }
  }
}
if (errors.length) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}
console.log(`Documentation validation passed: ${examples.length} example(s)${guidePath ? " + guide" : ""}, ${tokens.length} contract token(s)`);
