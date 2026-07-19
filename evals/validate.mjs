import { readFile } from "node:fs/promises";

const here = new URL("./", import.meta.url);
const casesDoc = JSON.parse(await readFile(new URL("cases.json", here), "utf8"));
const rubric = JSON.parse(await readFile(new URL("rubric.json", here), "utf8"));
const errors = [];
const ids = new Set();
const dimensions = new Set(rubric.dimensions?.map((item) => item.id));

if (!Number.isInteger(casesDoc.version)) errors.push("cases.version must be an integer");
if (!Array.isArray(casesDoc.cases) || casesDoc.cases.length === 0) errors.push("cases must be a non-empty array");
if (!Number.isInteger(rubric.version)) errors.push("rubric.version must be an integer");
if (!Array.isArray(rubric.dimensions) || rubric.dimensions.length === 0) errors.push("rubric.dimensions must be a non-empty array");
if (!Array.isArray(rubric.criticalFailures) || rubric.criticalFailures.length === 0) errors.push("rubric.criticalFailures must be a non-empty array");

for (const [index, testCase] of (casesDoc.cases || []).entries()) {
  const label = `cases[${index}]`;
  for (const field of ["id", "title", "prompt", "mode"]) {
    if (typeof testCase[field] !== "string" || !testCase[field].trim()) errors.push(`${label}.${field} must be a non-empty string`);
  }
  if (ids.has(testCase.id)) errors.push(`duplicate case id: ${testCase.id}`);
  ids.add(testCase.id);
  for (const field of ["expected", "forbidden", "focus"]) {
    if (!Array.isArray(testCase[field]) || testCase[field].length === 0) errors.push(`${label}.${field} must be a non-empty array`);
  }
  for (const dimension of testCase.focus || []) {
    if (!dimensions.has(dimension)) errors.push(`${label}.focus references unknown rubric dimension: ${dimension}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${casesDoc.cases.length} cases across ${rubric.dimensions.length} rubric dimensions.`);
}
