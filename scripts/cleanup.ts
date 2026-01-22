/**
 * Cleanup Script - Unused Files and Dependencies
 *
 * Removes temporary files, old backups, and unused dependencies.
 */

import { readdir, rm, stat } from "fs/promises";
import { join } from "path";

interface CleanupStats {
  filesRemoved: number;
  bytesFreed: number;
  errors: string[];
}

const stats: CleanupStats = {
  filesRemoved: 0,
  bytesFreed: 0,
  errors: [],
};

/**
 * Remove old database backups (older than 30 days)
 */
async function cleanupOldBackups() {
  console.log("\n📦 Cleaning up old database backups...");

  const backupDir = join(process.cwd(), "backups");
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  try {
    const files = await readdir(backupDir);

    for (const file of files) {
      if (!file.endsWith(".sql") && !file.endsWith(".sql.gz")) {
        continue;
      }

      const filePath = join(backupDir, file);
      const fileStat = await stat(filePath);

      if (fileStat.mtimeMs < thirtyDaysAgo) {
        const size = fileStat.size;
        await rm(filePath);

        stats.filesRemoved++;
        stats.bytesFreed += size;

        console.log(`  ✓ Removed ${file} (${(size / 1024 / 1024).toFixed(2)} MB)`);
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      stats.errors.push(`Backup cleanup failed: ${error}`);
      console.error(`  ✗ Error: ${error}`);
    }
  }
}

/**
 * Remove Next.js build artifacts
 */
async function cleanupBuildArtifacts() {
  console.log("\n🏗️  Cleaning up build artifacts...");

  const directories = [".next", ".turbo", "out", ".vercel"];

  for (const dir of directories) {
    const dirPath = join(process.cwd(), dir);

    try {
      const dirStat = await stat(dirPath);
      const size = await getDirSize(dirPath);

      await rm(dirPath, { recursive: true, force: true });

      stats.filesRemoved++;
      stats.bytesFreed += size;

      console.log(`  ✓ Removed ${dir}/ (${(size / 1024 / 1024).toFixed(2)} MB)`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        stats.errors.push(`Failed to remove ${dir}: ${error}`);
        console.error(`  ✗ Error removing ${dir}: ${error}`);
      }
    }
  }
}

/**
 * Remove temporary files
 */
async function cleanupTempFiles() {
  console.log("\n🗑️  Cleaning up temporary files...");

  const patterns = ["*.log", "*.tmp", ".DS_Store", "Thumbs.db", "*.swp", "*.swo", "*~"];

  for (const pattern of patterns) {
    await removeFilesByPattern(process.cwd(), pattern);
  }
}

/**
 * Remove node_modules (optional, requires confirmation)
 */
async function cleanupNodeModules() {
  if (!process.argv.includes("--deep")) {
    return;
  }

  console.log("\n📦 Cleaning up node_modules...");

  const nodeModulesPath = join(process.cwd(), "node_modules");

  try {
    const size = await getDirSize(nodeModulesPath);
    await rm(nodeModulesPath, { recursive: true, force: true });

    stats.filesRemoved++;
    stats.bytesFreed += size;

    console.log(`  ✓ Removed node_modules/ (${(size / 1024 / 1024).toFixed(2)} MB)`);
    console.log("  ℹ️  Run 'pnpm install' to reinstall dependencies");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      stats.errors.push(`Failed to remove node_modules: ${error}`);
      console.error(`  ✗ Error: ${error}`);
    }
  }
}

/**
 * Remove uploaded files in development
 */
async function cleanupUploads() {
  if (process.env.NODE_ENV === "production") {
    console.log("\n⚠️  Skipping upload cleanup in production");
    return;
  }

  console.log("\n📁 Cleaning up local uploads...");

  const uploadDir = join(process.cwd(), "public", "uploads");

  try {
    const size = await getDirSize(uploadDir);

    // Remove all files but keep directory structure
    const subdirs = ["avatars", "comics", "chapters"];

    for (const subdir of subdirs) {
      const subdirPath = join(uploadDir, subdir);

      try {
        await rm(subdirPath, { recursive: true, force: true });
        await import("fs/promises").then((fs) => fs.mkdir(subdirPath, { recursive: true }));

        console.log(`  ✓ Cleared ${subdir}/`);
      } catch (error) {
        stats.errors.push(`Failed to clear ${subdir}: ${error}`);
      }
    }

    stats.bytesFreed += size;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      stats.errors.push(`Upload cleanup failed: ${error}`);
      console.error(`  ✗ Error: ${error}`);
    }
  }
}

/**
 * Helper: Get directory size
 * @param dirPath
 */
async function getDirSize(dirPath: string): Promise<number> {
  let size = 0;

  try {
    const files = await readdir(dirPath);

    for (const file of files) {
      const filePath = join(dirPath, file);
      const fileStat = await stat(filePath);

      size += fileStat.isDirectory() ? (await getDirSize(filePath)) : fileStat.size;
    }
  } catch {
    // Ignore errors
  }

  return size;
}

/**
 * Helper: Remove files matching pattern
 * @param dirPath
 * @param pattern
 */
async function removeFilesByPattern(dirPath: string, pattern: string) {
  try {
    const files = await readdir(dirPath);
    const regex = new RegExp(pattern.replaceAll('*', ".*"));

    for (const file of files) {
      const filePath = join(dirPath, file);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        await removeFilesByPattern(filePath, pattern);
      } else if (regex.test(file)) {
        const size = fileStat.size;
        await rm(filePath);

        stats.filesRemoved++;
        stats.bytesFreed += size;

        console.log(`  ✓ Removed ${file}`);
      }
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Print cleanup summary
 */
function printSummary() {
  console.log("\n" + "=".repeat(50));
  console.log("📊 Cleanup Summary");
  console.log("=".repeat(50));
  console.log(`Files removed: ${stats.filesRemoved}`);
  console.log(`Space freed: ${(stats.bytesFreed / 1024 / 1024).toFixed(2)} MB`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach((error) => console.log(`  - ${error}`));
  }

  console.log("=".repeat(50));
}

/**
 * Main cleanup function
 */
async function cleanup() {
  console.log("🧹 Starting cleanup...");
  console.log("Current directory:", process.cwd());

  if (process.argv.includes("--help")) {
    console.log("\nUsage: pnpm run cleanup [options]");
    console.log("\nOptions:");
    console.log("  --deep      Also remove node_modules");
    console.log("  --backups   Only clean old backups");
    console.log("  --build     Only clean build artifacts");
    console.log("  --uploads   Only clean local uploads");
    console.log("  --help      Show this help message");
    return;
  }

  const backupsOnly = process.argv.includes("--backups");
  const buildOnly = process.argv.includes("--build");
  const uploadsOnly = process.argv.includes("--uploads");

  if (backupsOnly) {
    await cleanupOldBackups();
  } else if (buildOnly) {
    await cleanupBuildArtifacts();
  } else if (uploadsOnly) {
    await cleanupUploads();
  } else {
    // Full cleanup
    await cleanupBuildArtifacts();
    await cleanupTempFiles();
    await cleanupOldBackups();
    await cleanupUploads();
    await cleanupNodeModules();
  }

  printSummary();

  console.log("\n✨ Cleanup complete!");
}

// Run cleanup
cleanup().catch((error) => {
  console.error("Fatal error during cleanup:", error);
  process.exit(1);
});
