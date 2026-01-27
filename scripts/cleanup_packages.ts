#!/usr/bin/env tsx
import { execSync } from "child_process";
import depcheck from "depcheck";

async function main() {
  console.log("Running depcheck to identify unused packages...");
  const result = await depcheck(process.cwd(), {
    // basic detectors
    detectors: [depcheck.detector.requireCallExpression, depcheck.detector.importDeclaration],
    specials: [depcheck.special.bin],
  });

  const unused: string[] = (result.dependencies || []).concat(result.devDependencies || []);
  if (unused.length === 0) {
    console.log("No unused packages found.");
    return;
  }
  console.log("Unused packages:");
  for (const p of unused) console.log('-', p);

  // Confirm via env var NO_PROMPT or CI
  const noPrompt = process.env['NO_PROMPT'] === '1' || process.env['CI'] === '1';
  if (!noPrompt) {
    console.log("Re-run with NO_PROMPT=1 to automatically remove these packages");
    return;
  }

  for (const pkg of unused) {
    try {
      console.log("Removing", pkg);
      execSync(`pnpm remove ${pkg}`, { stdio: "inherit" });
    } catch (err: any) {
      console.warn("Failed to remove", pkg, err?.message ?? err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
