#!/usr/bin/env tsx
import { readdir, rm, stat } from "fs/promises";
import { join } from "path";

async function removeEmptyDirs(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      await removeEmptyDirs(full);
      const inner = await readdir(full);
      if (inner.length === 0) {
        await rm(full, { recursive: true, force: true });
        console.log(`Removed empty dir: ${full}`);
      }
    }
  }
}

async function removeBackups(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = join(dir, ent.name);
    if (ent.isFile() && ent.name.endsWith("~")) {
      await rm(full);
      console.log(`Removed backup file: ${full}`);
    }
    if (ent.isDirectory() && ent.name.toLowerCase().includes("backup")) {
      // don't delete backup folder unless --force
      if (process.argv.includes("--force")) {
        await rm(full, { recursive: true, force: true });
        console.log(`Removed backup folder: ${full}`);
      } else {
        console.log(`Found backup folder (use --force to remove): ${full}`);
      }
    }
  }
}

async function main() {
  const root = process.cwd();
  console.log(`Scanning ${root} for empty folders and backup files...`);
  await removeEmptyDirs(root);
  await removeBackups(root);
  console.log("Cleanup files complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
