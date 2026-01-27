#!/usr/bin/env node
/**
 * replace-any.ts
 * - Scans project files under `src/` and `scripts/` for explicit `: any` and ` as any`
 * - By default runs in dry-run mode and reports counts
 * - Pass --apply to perform in-place replacement to `unknown`
 */
import fs from "fs";
import path from "path";

const root = process.cwd();
const targets = ["src", "scripts"];
const apply = process.argv.includes("--apply");

function walk(dir: string, files: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".git", "dist", "build"].includes(e.name)) continue;
      walk(full, files);
    } else if (e.isFile()) {
      if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name)) files.push(full);
    }
  }
  return files;
}

let totalMatches = 0;
const changedFiles: string[] = [];

for (const t of targets) {
  const dir = path.join(root, t);
  if (!fs.existsSync(dir)) continue;
  const files = walk(dir);
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const regex1 = /(:\s*)any(\s*[),;>\]])/g; // : any, capturing trailing punctuation
    const regex2 = /(\s)as\s+any(\b)/g;
    const matches1 = (src.match(regex1) || []).length;
    const matches2 = (src.match(regex2) || []).length;
    const matches = matches1 + matches2;
    if (matches === 0) continue;
    totalMatches += matches;
    if (apply) {
      let out = src.replaceAll(regex1, "$1unknown$2");
      out = out.replaceAll(regex2, "$1as unknown$2");
      if (out !== src) {
        fs.writeFileSync(f, out, "utf8");
        changedFiles.push(f);
      }
    } else {
      console.log(`DRY-RUN: ${matches} matches in ${f}`);
    }
  }
}

console.log(`\nTotal matches found: ${totalMatches}`);
if (apply) {
  console.log(`Files modified: ${changedFiles.length}`);
  for (const cf of changedFiles) console.log(`  - ${cf}`);
} else {
  console.log("Dry-run complete. Re-run with --apply to modify files.");
}
