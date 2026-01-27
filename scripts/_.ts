#!/usr/bin/env tsx
import { exec as _exec } from "child_process";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";

const exec = promisify(_exec);

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes("--dry-run") || !process.argv.includes("--force");
const VERBOSE = process.argv.includes("--verbose");

function log(...args: unknown[]) {
  console.log(...args);
}

function v(...args: unknown[]) {
  if (VERBOSE) console.log(...args);
}

async function runCmd(cmd: string) {
  log(`> ${cmd}`);
  if (DRY_RUN) return { stdout: "(dry-run)", stderr: "" } as any;
  try {
    const r = await exec(cmd, { cwd: ROOT, maxBuffer: 20 * 1024 * 1024 });
    v(r.stdout);
    return r;
  } catch (error: any) {
    console.error(`Command failed: ${cmd}`, error.stderr ?? error.message ?? error);
    throw error;
  }
}

async function findFiles(dir: string, pattern: RegExp, results: string[] = []) {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry);
    try {
      const st = await fs.stat(full);
      if (st.isDirectory()) {
        // skip node_modules and .next
        if (entry === "node_modules" || entry === ".next" || entry === "dist" || entry === "out")
          continue;
        await findFiles(full, pattern, results);
      } else if (pattern.test(entry) || pattern.test(full)) {
        results.push(full);
      }
    } catch {
      // ignore
    }
  }

  return results;
}

async function removeBackupFiles() {
  log("\n🔍 Searching for .backup files...");
  const files = await findFiles(ROOT, /\.backup$/i);
  if (files.length === 0) {
    log("No .backup files found.");
    return;
  }
  log(`Found ${files.length} .backup files`);
  for (const f of files) {
    log(`  - ${f}`);
    if (!DRY_RUN) await fs.rm(f).catch(() => undefined);
  }
}

async function removeEmptyDirs() {
  log("\n🧹 Removing empty folders (dry-run unless --force)...");
  const dirs: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir).catch(() => []);
    if (entries.length === 0) {
      dirs.push(dir);
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e);
      const st = await fs.stat(full).catch(() => null);
      if (!st) continue;
      if (st.isDirectory()) await walk(full);
    }
    // re-check after children processed
    const after = await fs.readdir(dir).catch(() => []);
    if (after.length === 0) {
      dirs.push(dir);
    }
    return;
  }

  await walk(ROOT);
  // filter to project subfolders only
  const filtered = dirs.filter(
    (d) => d !== ROOT && !d.includes("node_modules") && !d.includes(".git")
  );
  if (filtered.length === 0) {
    log("No empty directories found.");
    return;
  }
  for (const d of filtered) {
    log(`  - ${d}`);
    if (!DRY_RUN) await fs.rmdir(d).catch(() => undefined);
  }
}

async function findDuplicateZodSchemas() {
  log("\n🔎 Scanning for duplicate Zod schemas...");
  const tsFiles = await findFiles(path.join(ROOT, "src"), /\.ts$|\.tsx$/i);
  const schemaMap = new Map<string, string[]>();

  for (const f of tsFiles) {
    const content = await fs.readFile(f, "utf-8");
    if (!content.includes("z.") && !content.includes("zod")) continue;
    // naive: compute hash of file content trimmed to z.object() blocks
    const matches = [...content.matchAll(/z\.object\([\S\s]*?\)\s*[\n,;]/g)];
    if (matches.length === 0) continue;
    for (const m of matches) {
      const block = m[0].replaceAll(/\s+/g, " ").trim();
      const hash = crypto.createHash("sha1").update(block).digest("hex");
      const key = `${hash}`;
      const arr = schemaMap.get(key) ?? [];
      arr.push(`${f}`);
      schemaMap.set(key, arr);
    }
  }

  const duplicates: string[][] = [];
  for (const [h, files] of schemaMap.entries()) {
    if (files.length > 1) duplicates.push(files);
  }

  if (duplicates.length === 0) {
    log("No duplicate zod schema blocks detected.");
    return;
  }

  log(`Found ${duplicates.length} groups of duplicate zod schema blocks:`);
  for (const group of duplicates) {
    log("Group:");
    for (const f of group) log(`  - ${f}`);
    // In aggressive mode we could delete or refactor, but for safety just report and (optionally) remove exact duplicate files if --force --prune-files
  }
}

async function removeDuplicateFilesByName() {
  log("\n🗂️  Looking for files with duplicate basenames...");
  const allFiles = await findFiles(ROOT, /\.[jt]s$|\.tsx$|\.jsx$|\.md$|\.json$/i);
  const byName = new Map<string, string[]>();
  for (const f of allFiles) {
    const base = path.basename(f);
    const arr = byName.get(base) ?? [];
    arr.push(f);
    byName.set(base, arr);
  }
  const duplicates = [...byName.entries()].filter(([, arr]) => arr.length > 1);
  if (duplicates.length === 0) {
    log("No duplicate filenames found.");
    return;
  }
  for (const [name, files] of duplicates) {
    log(`Duplicate filename: ${name}`);
    for (const f of files) log(`  - ${f}`);
  }
  // don't auto-delete; just log
}

async function main() {
  log("Project maintenance script (scripts/_.ts)");
  log(
    DRY_RUN
      ? "Mode: DRY-RUN (use --force to apply changes)"
      : "Mode: LIVE (changes will be applied)"
  );

  // 1) run existing cleanup script
  await runCmd(`pnpm tsx scripts/cleanup.ts${DRY_RUN ? " --dry-run" : ""}`).catch(() => {});

  // 2) run cleanup-duplicates (dry-run)
  await runCmd(
    `pnpm tsx scripts/cleanup-duplicates.ts${DRY_RUN ? " --dry-run" : " --no-dry-run"}`
  ).catch(() => {});

  // 3) run uninstall-unused-packages in dry-run unless forced
  await runCmd(
    `pnpm tsx scripts/uninstall-unused-packages.ts${DRY_RUN ? " --dry-run" : " --verbose"}`
  ).catch(() => {});

  // 4) remove .backup files
  await removeBackupFiles();

  // 5) remove empty dirs
  await removeEmptyDirs();

  // 6) find duplicate zod schemas
  await findDuplicateZodSchemas();

  // 7) report duplicate filenames
  await removeDuplicateFilesByName();

  log("\n✅ Maintenance run complete.");
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
