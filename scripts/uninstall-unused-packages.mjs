#!/usr/bin/env node
import depcheck from "depcheck";
import { spawnSync } from "node:child_process";

async function runDepcheck() {
  console.log("🔎 Running depcheck to find unused dependencies...");

  const options = {
    skipMissing: true,
    ignoreDirs: ["dist", "build", "node_modules", ".next"],
    detectors: [depcheck.detector.imports, depcheck.detector.require],
    parsers: {
      ts: depcheck.parser.typescript,
      tsx: depcheck.parser.typescript,
      js: depcheck.parser.es6,
      jsx: depcheck.parser.es6,
    },
  };

  const result = await new Promise((resolve) => depcheck(process.cwd(), options, resolve));

  return result;
}

async function main() {
  const result = await runDepcheck();

  const unusedDeps = Object.keys(result.dependencies || {});
  const unusedDev = Object.keys(result.devDependencies || {});

  if (unusedDeps.length === 0 && unusedDev.length === 0) {
    console.log("✅ No unused packages detected.");
    process.exit(0);
  }

  console.log("Found unused dependencies:");
  unusedDeps.forEach((d) => console.log(`  - ${d}`));
  if (unusedDev.length > 0) {
    console.log("Found unused devDependencies:");
    unusedDev.forEach((d) => console.log(`  - ${d}`));
  }

  if (process.argv.includes("--no-dry-run") || process.argv.includes("--remove")) {
    const pkgs = [...unusedDeps, ...unusedDev];
    if (pkgs.length === 0) return;
    console.log(`\n🗑️  Removing: ${pkgs.join(", ")}`);
    const cmd = "pnpm";
    const args = ["remove", ...pkgs];
    const res = spawnSync(cmd, args, { stdio: "inherit" });
    process.exit(res.status ?? 1);
  } else {
    console.log("\nDry run mode: to remove detected packages run with --no-dry-run or --remove");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Failed to run depcheck:", err);
  process.exit(1);
});
