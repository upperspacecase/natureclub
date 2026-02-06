#!/usr/bin/env node

const { execSync, spawn } = require("child_process");
const path = require("path");

function findRunningDevServers(cwd) {
  const marker = `${cwd}/node_modules/.bin/next dev`;
  let output = "";

  try {
    output = execSync("ps -axo pid=,command=", { encoding: "utf8" });
  } catch {
    return [];
  }

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(.*)$/);
      if (!match) return null;
      return { pid: Number(match[1]), command: match[2] };
    })
    .filter(Boolean)
    .filter((proc) => proc.command.includes(marker));
}

const cwd = process.cwd();
const running = findRunningDevServers(cwd);

if (running.length > 0) {
  console.error("");
  console.error("Another Next.js dev server is already running for this repo.");
  console.error("Stop it first to avoid .next build corruption and ENOENT crashes.");
  console.error("");
  console.error("Running process(es):");
  for (const proc of running) {
    console.error(`- pid ${proc.pid}: ${proc.command}`);
  }
  console.error("");
  process.exit(1);
}

const args = ["dev", ...process.argv.slice(2)];
const nextBin = path.join(
  cwd,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);
const child = spawn(process.execPath, [nextBin, ...args], { stdio: "inherit" });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
