#!/usr/bin/env tsx
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const ROOT = path.resolve(process.cwd());

async function* walk(dir: string): AsyncGenerator<string, void, unknown> {
  for await (const d of await fs.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else yield entry;
  }
}

function hashBuf(buf: Buffer) {
  return crypto.createHash("sha1").update(buf).digest("hex");
}

async function main() {
  console.log("Scanning workspace for candidate files...");

  const files: string[] = [];
  for await (const f of walk(ROOT)) {
    // ignore node_modules and .git and .next etc
    if (/node_modules|\.git|\.next|dist|out|coverage|build/i.test(f)) continue;
    files.push(f);
  }

  const byHash: Record<string, string[] | undefined> = {};
  const backups: string[] = [];
  const emptyFiles: string[] = [];
  const newlyCreatedBackups: string[] = [];

  for (const f of files) {
    const name = path.basename(f);
    if (name.startsWith(".") && name !== ".env" && name !== ".env.local") continue; // skip dotfiles except env
    if (f.endsWith(".lock")) continue;
    // skip binary large files
    try {
      const stat = await fs.stat(f);
      if (!stat.isFile()) continue;
      if (stat.size === 0) {
        emptyFiles.push(f);
        continue;
      }
      const buf = await fs.readFile(f);
      const h = hashBuf(buf);
      byHash[h] ??= [];
      byHash[h].push(f);

      if (/\.backup|\.bak|~$|\.old|\.orig/i.test(f) || /\.backup/i.test(name)) {
        backups.push(f);
      }
      // detect trivial blank content (whitespace only)
      if (buf.toString().trim().length === 0) {
        emptyFiles.push(f);
      }
      // detect newly created backup files (by name containing 'new' and 'backup')
      if (/new.*backup|backup.*new/i.test(f)) newlyCreatedBackups.push(f);
    } catch (err) {
      // ignore
    }
  }

  // collect duplicates (same hash)
  const duplicates: string[][] = [];
  for (const h of Object.keys(byHash)) {
    const arr = byHash[h] ?? [];
    if (arr.length > 1) duplicates.push(arr);
  }

  // Report findings
  console.log(`Found ${duplicates.length} groups of duplicate files`);
  console.log(`Found ${backups.length} backup-like files`);
  console.log(`Found ${emptyFiles.length} empty/blank files`);

  // Strategy: delete files that are backups or empty. For duplicates, keep the earliest modified file and delete the others.

  const toDelete = new Set<string>();

  for (const b of backups) toDelete.add(b);
  for (const e of emptyFiles) toDelete.add(e);

  for (const group of duplicates) {
    // sort by mtime ascending (keep oldest)
    const stats = await Promise.all(group.map(async (f) => ({ f, s: await fs.stat(f) })));
    stats.sort((a, b) => a.s.mtimeMs - b.s.mtimeMs);
    const [, ...rest] = stats;
    for (const r of rest) toDelete.add(r.f);
  }

  // Prioritize newly created files: if a file path contains 'new' or created within last 7 days, prefer deleting it
  const now = Date.now();
  for (const f of Array.from(toDelete)) {
    try {
      const s = await fs.stat(f);
      const ageDays = (now - s.mtimeMs) / (1000 * 60 * 60 * 24);
      if (ageDays <= 7 && /new|temp|tmp/i.test(path.basename(f))) {
        // keep (do not delete recent new files)
        toDelete.delete(f);
      }
    } catch (e) {}
  }

  if (toDelete.size === 0) {
    console.log("No files to remove.");
    return;
  }

  console.log("Files to delete:");
  for (const f of toDelete) console.log(" -", path.relative(ROOT, f));

  // Confirm by env var NO_PROMPT
  const noPrompt = process.env["NO_PROMPT"] === "1" || process.env["CI"] === "1";
  if (!noPrompt) {
    console.log("\nTo delete these files, re-run with NO_PROMPT=1");
    return;
  }

  for (const f of toDelete) {
    try {
      await fs.unlink(f);
      console.log("Deleted", path.relative(ROOT, f));
    } catch (err: any) {
      console.warn("Failed to delete", f, err?.message ?? err);
    }
  }

  // remove empty directories
  async function removeEmptyDirs(dir: string) {
    try {
      const stat = await fs.stat(dir);
      if (!stat.isDirectory()) return;
    } catch (e) {
      return;
    }
    const entries = await fs.readdir(dir);
    if (entries.length === 0) {
      // avoid removing root
      if (dir === ROOT) return;
      try {
        await fs.rmdir(dir);
        console.log("Removed empty dir", path.relative(ROOT, dir));
      } catch (e) {}
      return;
    }
    for (const e of entries) await removeEmptyDirs(path.join(dir, e));
  }

  await removeEmptyDirs(ROOT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
