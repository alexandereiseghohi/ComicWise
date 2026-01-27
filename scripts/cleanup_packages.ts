#!/usr/bin/env tsx
import { execSync } from "child_process";
import fs from "fs";
import { sync as globSync } from "glob";
import path from "path";

function readPkgJson(): {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  const p = path.join(process.cwd(), "package.json");
  const raw = fs.readFileSync(p, "utf-8");
  const parsed = JSON.parse(raw);
  return { dependencies: parsed.dependencies || {}, devDependencies: parsed.devDependencies || {} };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scanFilesForUsage(files: string[], pkg: string) {
  const reSimple = new RegExp(
    `from\\s+['\"]${escapeRegex(pkg)}['\"]|require\\(\\s*['\"]${escapeRegex(pkg)}['\"]\\s*\\)`,
    "m"
  );
  const rePkgToken = new RegExp(`\\b${escapeRegex(pkg)}\\b`);
  for (const f of files) {
    try {
      const txt = fs.readFileSync(f, "utf-8");
      if (reSimple.test(txt)) return true;
      if (rePkgToken.test(txt)) return true;
      // also check for usage like 'pkg/' imports
      if (txt.includes(pkg + "/")) return true;
    } catch (e) {
      // ignore unreadable files
    }
  }
  return false;
}

function gatherFiles() {
  // scan src and scripts directories and specific config files and package.json
  const patterns = [
    "src/**/*.{ts,tsx,js,jsx,mjs,cjs,cts,mts}",
    "scripts/**/*.{ts,tsx,js,jsx,mjs,cjs}",
  ];
  const extras = ["package.json", "eslint.config.ts", ".prettierrc.ts", "postcss.config.mjs"];
  const files = new Set<string>();
  for (const pat of patterns) {
    const found = globSync(pat, { cwd: process.cwd(), absolute: true });
    for (const f of found) files.add(f);
  }
  for (const e of extras) {
    const p = path.join(process.cwd(), e);
    if (fs.existsSync(p)) files.add(p);
  }
  // always include package.json as we may inspect scripts
  files.add(path.join(process.cwd(), "package.json"));
  return Array.from(files);
}

async function main() {
  console.log("Scanning project files to identify unused packages (dry-run)...");
  const pkg = readPkgJson();
  const deps = Object.keys(pkg.dependencies || {});
  const devs = Object.keys(pkg.devDependencies || {});
  const all = deps.concat(devs);

  if (all.length === 0) {
    console.log("No dependencies found in package.json");
    return;
  }

  const files = gatherFiles();
  console.log(`Scanning ${files.length} files for package usage...`);

  const unusedAll: string[] = [];
  for (const d of all) {
    const used = scanFilesForUsage(files, d);
    if (!used) unusedAll.push(d);
  }

  // Exclude TypeScript typings packages (e.g., @types/* or packages ending with -types)
  function isTypePackage(name: string) {
    return /^@types\//i.test(name) || /-types$/i.test(name) || /^types-/i.test(name);
  }

  const unused = unusedAll.filter((n) => !isTypePackage(n));

  if (unused.length === 0) {
    console.log("No unused packages found in the scanned paths (excluding type packages).");
    if (unusedAll.length > 0) {
      console.log(
        "Note: The following packages appear unused but are type packages and were skipped:"
      );
      for (const p of unusedAll.filter(isTypePackage)) console.log("-", p);
    }
    return;
  }

  console.log(
    "Unused packages (based on scanning src, scripts, package.json and configs) — type packages excluded:"
  );
  for (const p of unused) console.log("-", p);

  const noPrompt =
    process.env["NO_PROMPT"] === "1" ||
    process.env["CI"] === "1" ||
    process.argv.includes("--apply");
  if (!noPrompt) {
    console.log(
      "Re-run with NO_PROMPT=1 or --apply to automatically remove these packages (will run pnpm remove)."
    );
    return;
  }

  console.log("Removing unused packages via pnpm remove...");
  for (const p of unused) {
    try {
      console.log(`pnpm remove ${p}`);
      execSync(`pnpm remove ${p}`, { stdio: "inherit" });
    } catch (err: any) {
      console.warn("Failed to remove", p, err?.message ?? err);
    }
  }
  console.log("Removal complete. You may want to run 'pnpm install' and re-run tests/type-check.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
