// PostToolUse hook: after Claude edits a .ts/.tsx file, lint that file and typecheck the project.
// Exit code 2 feeds the errors back to Claude so it fixes them before moving on.
import { execSync } from "node:child_process";

let input = "";
for await (const chunk of process.stdin) input += chunk;

const filePath = JSON.parse(input.replace(/^﻿/, ""))?.tool_input?.file_path ?? "";
if (!/[\\/]src[\\/].*\.tsx?$/.test(filePath)) process.exit(0);

const run = (cmd) => {
  try {
    execSync(cmd, { stdio: "pipe", encoding: "utf8" });
    return "";
  } catch (error) {
    return `$ ${cmd}\n${error.stdout ?? ""}${error.stderr ?? ""}`;
  }
};

const errors = [run(`npx eslint "${filePath}"`), run("npx tsc -b")].filter(Boolean);
if (errors.length > 0) {
  process.stderr.write(errors.join("\n"));
  process.exit(2);
}
