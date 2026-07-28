#!/usr/bin/env node
import { createConnection } from "node:net";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const index = args.indexOf("--socket");
const socketPath = index === -1 ? null : resolve(args[index + 1]);
const key = process.env.CHROME_DEVREL_ATTESTATION_KEY;
if (!socketPath || !key || key.length < 32) {
  console.error("Set CHROME_DEVREL_ATTESTATION_KEY in this sender-only process and pass --socket <ready signer socket>.");
  process.exit(2);
}
await new Promise((resolvePromise, reject) => {
  const socket = createConnection(socketPath, () => socket.end(`${key}\n`));
  socket.on("close", resolvePromise);
  socket.on("error", reject);
});
console.log("Parent attestation key delivered after receipt replay; key was not written.");
