#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateLaunchAcceptance } from "./lib/launch-acceptance.mjs";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const manifestPath = resolve(value("--manifest", "launch-acceptance.json"));
const root = resolve(value("--root", dirname(manifestPath)));
const output = value("--output");
const online = args.includes("--online");
const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const run = JSON.parse(await readFile(manifestPath, "utf8"));
const schema = JSON.parse(await readFile(resolve(repoRoot, "schemas/launch-acceptance.schema.json"), "utf8"));
const semanticSourcePolicy = JSON.parse(await readFile(resolve(repoRoot, "config/semantic-fact-sources.json"), "utf8"));
const result = await validateLaunchAcceptance(run, { root, online, schema, semanticSourcePolicy, attestationKey: process.env.CHROME_DEVREL_ATTESTATION_KEY, trustedDocumentationValidatorPath: resolve(repoRoot, "scripts/validate-documentation-example.mjs") });
const text = `${JSON.stringify(result, null, 2)}\n`;
if (output) await writeFile(resolve(output), text);
process.stdout.write(text);
if (result.computedOutcome !== "succeeded") process.exit(1);
