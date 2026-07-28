#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

export async function loadRouting() {
  return JSON.parse(
    await readFile(resolve(root, "config/request-routing.json"), "utf8"),
  );
}

export function routeRequest(text, config) {
  const rules = [...config.rules].sort((a, b) => b.priority - a.priority);
  for (const rule of rules) {
    if (rule.patterns.some((pattern) => new RegExp(pattern, "i").test(text))) {
      return {
        id: rule.id,
        mode: rule.mode,
        modules: [...rule.modules],
      };
    }
  }
  return { ...config.fallback, modules: [...config.fallback.modules] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const text = process.argv.slice(2).join(" ");
  if (!text) {
    console.error("Usage: node scripts/route-request.mjs <request text>");
    process.exit(2);
  }
  console.log(JSON.stringify(routeRequest(text, await loadRouting()), null, 2));
}
