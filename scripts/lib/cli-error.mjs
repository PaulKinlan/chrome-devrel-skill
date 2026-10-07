// cli-error.mjs — one readable line for an expected CLI failure.
//
// Agents run these CLIs and read the output, so a stack trace for "packet.json is not
// valid JSON" is noise. Programmer errors (TypeError, ReferenceError, RangeError) still
// get their stack, because there the stack is the only useful part of the report.

export function formatCliError(tool, error) {
  const internal =
    error instanceof TypeError || error instanceof ReferenceError || error instanceof RangeError;
  if (internal) return `${tool}: internal error\n${error.stack}`;
  return `${tool}: ${error instanceof Error ? error.message : String(error)}`;
}

export function reportCliError(tool, error) {
  console.error(formatCliError(tool, error));
  process.exit(1);
}
