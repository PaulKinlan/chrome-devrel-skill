// is-main.mjs — reliable "was this file the one Node was asked to run?" check.
//
// The common guard `import.meta.url === `file://${process.argv[1]}`` silently
// evaluates to false (so the CLI does nothing and exits 0) when the script is
// reached through a symlinked skill mount, or from a directory whose name
// import.meta.url percent-encodes (spaces, non-ASCII). Comparing real paths
// handles both.

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * @param {string} metaUrl  The caller's `import.meta.url`.
 * @param {string | undefined} [argv1]  Entry script path; defaults to `process.argv[1]`.
 * @returns {boolean} True only when `metaUrl` is the entry script itself.
 */
export function isMainModule(metaUrl, argv1 = process.argv[1]) {
  if (!argv1) return false;
  try {
    return realpathSync(argv1) === realpathSync(fileURLToPath(metaUrl));
  } catch {
    return false;
  }
}
