import { chmodSync, rmSync } from "node:fs";
import { createServer } from "node:net";

export async function receiveLateKey(socketPath, { timeoutMs = 300_000 } = {}) {
  rmSync(socketPath, { force: true });
  return await new Promise((resolve, reject) => {
    let settled = false;
    let timer;
    const finish = (error, key) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      server.close(() => rmSync(socketPath, { force: true }));
      error ? reject(error) : resolve(key);
    };
    const server = createServer((socket) => {
      let input = "";
      socket.setEncoding("utf8");
      socket.on("data", (chunk) => { input += chunk; if (input.length > 8192) socket.destroy(new Error("key payload too large")); });
      socket.on("error", (error) => finish(error));
      socket.on("end", () => {
        const key = input.replace(/[\r\n]+$/, "");
        if (key.length < 32) finish(new Error("attestation key must be at least 32 characters"));
        else finish(null, key);
      });
    });
    server.on("error", (error) => finish(error));
    server.listen(socketPath, () => {
      chmodSync(socketPath, 0o600);
      process.stderr.write(`REPLAY_COMPLETE_KEY_SOCKET=${socketPath}\n`);
    });
    timer = setTimeout(() => finish(new Error("timed out waiting for parent key sender")), timeoutMs);
  });
}
