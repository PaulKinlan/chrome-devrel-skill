// read-json-file.mjs — read and parse a JSON file, naming the file when it is corrupt.
//
// JSON.parse alone says "Expected property name or '}' in JSON at position 1", which is
// useless when a command reads several files. Missing files keep their native ENOENT
// error, which already names the path.

import { readFile } from "node:fs/promises";

export async function readJsonFile(path) {
  const text = await readFile(path, "utf8");
  try {
    // Some Windows editors and PowerShell write a UTF-8 byte-order mark, which JSON.parse rejects.
    return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  } catch (error) {
    throw new Error(`${path} is not valid JSON: ${error.message}`);
  }
}
