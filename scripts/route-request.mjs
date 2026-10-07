#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isMainModule } from "./lib/is-main.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

export async function loadRouting() {
  return JSON.parse(
    await readFile(resolve(root, "config/request-routing.json"), "utf8"),
  );
}

export function routeRequest(text, config, options = {}) {
  const rules = [...config.rules].sort((a, b) => b.priority - a.priority);
  const isPlanOnly = (config.planOnlyPatterns || []).some((pattern) =>
    new RegExp(pattern, "i").test(text)
  );
  const matched = rules.filter((rule) =>
    rule.patterns.some((pattern) => new RegExp(pattern, "i").test(text))
  );
  if (matched.length > 0) {
    const primary = matched[0];
    const mode = isPlanOnly && primary.mode === "execute" ? "plan" : primary.mode;
    if (options.mergeMatches) {
      const mergedModules = [...new Set(matched.flatMap((rule) => rule.modules))];
      return {
        id: primary.id,
        matchedIds: matched.map((rule) => rule.id),
        mode,
        modules: mergedModules,
      };
    }
    return {
      id: primary.id,
      mode,
      modules: [...primary.modules],
    };
  }
  return { ...config.fallback, modules: [...config.fallback.modules] };
}

if (isMainModule(import.meta.url)) {
  const rawArgs = process.argv.slice(2);
  const mergeMatches = rawArgs.includes("--merge");
  const text = rawArgs.filter((arg) => arg !== "--merge").join(" ");
  if (!text) {
    console.error("Usage: node scripts/route-request.mjs [--merge] <request text>");
    process.exit(2);
  }
  console.log(
    JSON.stringify(routeRequest(text, await loadRouting(), { mergeMatches }), null, 2),
  );
}

