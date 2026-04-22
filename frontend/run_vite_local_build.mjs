import { syncBuiltinESMExports } from "node:module";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const childProcess = require("node:child_process");
const originalExec = childProcess.exec;

childProcess.exec = function patchedExec(command, ...rest) {
  if (typeof command === "string" && command.trim().toLowerCase() === "net use") {
    const maybeCallback = rest.find((value) => typeof value === "function");
    queueMicrotask(() => {
      if (maybeCallback) {
        maybeCallback(null, "", "");
      }
    });

    return {
      pid: 0,
      kill() {
        return true;
      },
      on() {
        return this;
      },
      once() {
        return this;
      },
      stdout: null,
      stderr: null,
    };
  }

  return originalExec.call(this, command, ...rest);
};

syncBuiltinESMExports();
process.env.ALLOW_LOCAL_API_URL = "1";
process.env.VITE_API_URL = process.env.VITE_API_URL || "http://127.0.0.1:8000";
process.argv = [process.argv[0], "vite", "build", "--configLoader", "runner"];

await import("./node_modules/vite/bin/vite.js");
