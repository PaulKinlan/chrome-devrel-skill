import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, openSync, closeSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

export const DEFAULT_RETROSPECTIVE_PATH =
  "retrospectives/runs/2026-07-19-v140-v150";
export const DEFAULT_RETROSPECTIVE_REF =
  "7f629c258278e74c601bf0f3f4e1a45cb4b0a805";

/**
 * Resolve a retrospective run from an explicit/local directory or materialize
 * the pinned archived Git tree into a temporary directory. The commit hash,
 * rather than the movable tag name, is the verification boundary.
 */
export function resolveRetrospectiveRoot({
  cwd = process.cwd(),
  root,
  ref = DEFAULT_RETROSPECTIVE_REF,
  archivePath = DEFAULT_RETROSPECTIVE_PATH,
} = {}) {
  if (root) {
    const explicit = resolve(cwd, root);
    if (!existsSync(explicit)) {
      throw new Error(`retrospective root does not exist: ${explicit}`);
    }
    return { root: explicit, source: `directory:${explicit}`, cleanup() {} };
  }

  const local = resolve(cwd, archivePath);
  if (existsSync(local)) {
    return { root: local, source: `directory:${local}`, cleanup() {} };
  }

  const temporary = mkdtempSync(join(tmpdir(), "chrome-devrel-retrospective-"));
  const tarPath = join(temporary, "archive.tar");
  const tarFd = openSync(tarPath, "w", 0o600);
  try {
    const result = execFileSync(
      "git",
      ["archive", "--format=tar", ref, archivePath],
      { cwd, stdio: ["ignore", tarFd, "pipe"] },
    );
    void result;
  } finally {
    closeSync(tarFd);
  }
  execFileSync("tar", ["-xf", tarPath, "-C", temporary], { cwd });
  rmSync(tarPath, { force: true });

  const materialized = join(temporary, archivePath);
  if (!existsSync(materialized)) {
    rmSync(temporary, { recursive: true, force: true });
    throw new Error(`archive path ${archivePath} was not found at ${ref}`);
  }

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    rmSync(temporary, { recursive: true, force: true });
  };
  process.once("exit", cleanup);
  return { root: materialized, source: `git:${ref}:${archivePath}`, cleanup };
}
