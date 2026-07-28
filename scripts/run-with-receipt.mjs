#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve, relative } from "node:path";

const args = process.argv.slice(2);
const separator = args.indexOf("--");
const optionArgs = separator === -1 ? args : args.slice(0, separator);
const command = separator === -1 ? [] : args.slice(separator + 1);
const value = (name) => {
  const index = optionArgs.indexOf(name);
  return index === -1 ? undefined : optionArgs[index + 1];
};
const root = resolve(value("--root") || ".");
const id = value("--id");
const subjectSpecs = optionArgs.flatMap((arg, index) => arg === "--subject" ? [optionArgs[index + 1]] : []).filter(Boolean).map((entry) => {
  const split = entry.indexOf("=");
  return split > 0 ? { id: entry.slice(0, split), path: entry.slice(split + 1) } : null;
});
if (!id || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{1,127}$/.test(id) || command.length === 0 || subjectSpecs.length === 0 || subjectSpecs.some((item) => !item)) {
  console.error("Usage: node scripts/run-with-receipt.mjs --root <run-dir> --id <receipt-id> --subject <artifact-id>=<path-relative-to-run> [--subject ...] -- <command> [args...]");
  process.exit(2);
}
const cwd = resolve(value("--cwd") || process.cwd());
const receiptDir = resolve(root, "receipts");
mkdirSync(receiptDir, { recursive: true });
const stdoutPath = resolve(receiptDir, `${id}.stdout`);
const stderrPath = resolve(receiptDir, `${id}.stderr`);
const receiptPath = resolve(receiptDir, `${id}.receipt.json`);
const rootReal = realpathSync(root);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const subjectsBefore = subjectSpecs.map((subject) => {
  const full = resolve(root, subject.path);
  const real = realpathSync(full);
  if (!real.startsWith(`${rootReal}/`)) throw new Error(`subject escapes run root: ${subject.path}`);
  return { ...subject, full, sha256Before: digest(readFileSync(real)) };
});
const startedAt = new Date().toISOString();
const result = spawnSync(command[0], command.slice(1), {
  cwd,
  encoding: null,
  shell: false,
  maxBuffer: 64 * 1024 * 1024,
});
const endedAt = new Date().toISOString();
const stdout = result.stdout || Buffer.alloc(0);
const stderr = result.stderr || Buffer.from(result.error?.stack || result.error?.message || "");
writeFileSync(stdoutPath, stdout, { mode: 0o600 });
writeFileSync(stderrPath, stderr, { mode: 0o600 });
const subjects = subjectsBefore.map(({ id: subjectId, path, full, sha256Before }) => ({ id: subjectId, path, sha256Before, sha256After: digest(readFileSync(full)) }));
const stdoutId = `${id}-stdout`;
const stderrId = `${id}-stderr`;
const fragment = {
  receipt: {
    id,
    producer: "command-wrapper",
    argv: command,
    cwd,
    startedAt,
    endedAt,
    exitCode: Number.isInteger(result.status) ? result.status : 1,
    stdoutArtifactId: stdoutId,
    stderrArtifactId: stderrId,
    subjectArtifactIds: [...new Set(subjects.map((subject) => subject.id))],
    subjects,
  },
  artifacts: [
    {
      id: stdoutId,
      path: relative(root, stdoutPath),
      type: "command-stdout",
      mime: "text/plain",
      bytes: stdout.length,
      sha256: digest(stdout),
      createdAt: endedAt,
      producer: "command-wrapper",
    },
    {
      id: stderrId,
      path: relative(root, stderrPath),
      type: "command-stderr",
      mime: "text/plain",
      bytes: stderr.length,
      sha256: digest(stderr),
      createdAt: endedAt,
      producer: "command-wrapper",
    },
  ],
};
writeFileSync(receiptPath, `${JSON.stringify(fragment, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(stdout);
process.stderr.write(stderr);
console.error(`\nReceipt: ${receiptPath}`);
process.exit(fragment.receipt.exitCode);
