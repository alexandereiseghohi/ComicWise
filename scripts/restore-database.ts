/**
 * Database Restore Script
 * Restores PostgreSQL database from a backup file
 *
 * Usage:
 *   pnpm db:restore <backup-file>
 *   pnpm db:restore backups/latest.sql
 *   pnpm db:restore backups/comicwise-backup-2026-01-20.sql
 *
 * ⚠️  WARNING: This will overwrite the current database!
 */

import { env } from "@/lib/env";
import { exec } from "child_process";
import { promises as fs } from "fs";
import * as readline from "readline";
import { promisify } from "util";

const execAsync = promisify(exec);

const args = process.argv.slice(2);
const backupFile = args[0];

/**
 * Prompt user for confirmation
 * @param question
 */
async function promptConfirmation(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

/**
 * Verify backup file exists
 * @param filepath
 */
async function verifyBackupFile(filepath: string): Promise<void> {
  try {
    await fs.access(filepath);
    const stats = await fs.stat(filepath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`\n📦 Backup file found:`);
    console.log(`   File: ${filepath}`);
    console.log(`   Size: ${sizeInMB} MB`);
    console.log(`   Modified: ${stats.mtime.toLocaleString()}\n`);
  } catch {
    console.error(`❌ Backup file not found: ${filepath}`);
    console.log(`\n💡 Available backups in ./backups directory:`);

    try {
      const files = await fs.readdir("./backups");
      const sqlFiles = files.filter((f) => f.endsWith(".sql") || f.endsWith(".sql.gz"));

      if (sqlFiles.length === 0) {
        console.log("   (No backup files found)");
      } else {
        sqlFiles.forEach((file) => console.log(`   - ${file}`));
      }
    } catch {
      console.log("   (Could not read backups directory)");
    }

    process.exit(1);
  }
}

/**
 * Create a safety backup before restoration
 */
async function createSafetyBackup(): Promise<string> {
  console.log("🔒 Creating safety backup of current database...\n");

  const timestamp = new Date().toISOString().replaceAll(/[.:]/g, "-");
  const filename = `pre-restore-safety-${timestamp}.sql`;
  const filepath = `./backups/${filename}`;

  try {
    const command = `pg_dump "${env.DATABASE_URL}" --format=plain --no-owner --no-acl --file="${filepath}"`;
    await execAsync(command);

    console.log(`✅ Safety backup created: ${filename}\n`);
    return filepath;
  } catch (error) {
    console.error("❌ Failed to create safety backup:", error);
    throw error;
  }
}

/**
 * Drop and recreate database schema
 */
async function resetSchema(): Promise<void> {
  console.log("🗑️  Dropping existing schema...\n");

  try {
    const command = `psql "${env.DATABASE_URL}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;"`;
    await execAsync(command);

    console.log("✅ Schema reset complete\n");
  } catch (error) {
    console.error("❌ Failed to reset schema:", error);
    throw error;
  }
}

/**
 * Restore database from backup file
 * @param filepath
 */
async function restoreDatabase(filepath: string): Promise<void> {
  console.log("📥 Restoring database from backup...\n");

  try {
    // Handle compressed files
    let restoreCommand: string;

    restoreCommand = filepath.endsWith(".gz")
      ? `gunzip -c "${filepath}" | psql "${env.DATABASE_URL}"`
      : `psql "${env.DATABASE_URL}" < "${filepath}"`;

    const { stderr } = await execAsync(restoreCommand);

    // psql outputs warnings to stderr even on success
    if (stderr && !stderr.includes("NOTICE") && !stderr.includes("SET")) {
      console.warn("⚠️  Restoration warnings:", stderr);
    }

    console.log("✅ Database restored successfully!\n");
  } catch (error) {
    console.error("❌ Failed to restore database:", error);
    throw error;
  }
}

/**
 * Verify restoration
 */
async function verifyRestoration(): Promise<void> {
  console.log("🔍 Verifying restoration...\n");

  try {
    // Check key tables exist and have data
    const queries = [
      'SELECT COUNT(*) as users FROM "user"',
      "SELECT COUNT(*) as comics FROM comic",
      "SELECT COUNT(*) as chapters FROM chapter",
    ];

    for (const query of queries) {
      const { stdout } = await execAsync(`psql "${env.DATABASE_URL}" -t -c "${query}"`);
      console.log(`   ${query}: ${stdout.trim()}`);
    }

    console.log("\n✅ Verification complete\n");
  } catch (error) {
    console.warn("⚠️  Verification failed (database might still be valid):", error);
  }
}

/**
 * Run database migrations
 */
async function runMigrations(): Promise<void> {
  console.log("🔄 Running database migrations...\n");

  try {
    // Run Drizzle push to ensure schema is up-to-date
    const { stdout } = await execAsync("pnpm db:push");
    console.log(stdout);

    console.log("✅ Migrations complete\n");
  } catch (error) {
    console.warn("⚠️  Migrations failed. You may need to run them manually:", error);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     ComicWise Database Restoration Tool       ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  // Check if backup file argument provided
  if (!backupFile) {
    console.error("❌ Error: Backup file not specified\n");
    console.log("Usage: pnpm db:restore <backup-file>");
    console.log("\nExample:");
    console.log("  pnpm db:restore backups/latest.sql");
    console.log("  pnpm db:restore backups/comicwise-backup-2026-01-20.sql\n");
    process.exit(1);
  }

  // Verify backup file exists
  await verifyBackupFile(backupFile);

  // Display warnings
  console.log("⚠️  WARNING: This operation will:");
  console.log("   1. Create a safety backup of the current database");
  console.log("   2. Drop all existing data and schema");
  console.log("   3. Restore from the specified backup");
  console.log("   4. Run database migrations\n");

  // Confirm with user
  const confirm1 = await promptConfirmation("Do you want to proceed? Type 'yes' to continue: ");

  if (confirm1 !== "yes") {
    console.log("\n❌ Restoration cancelled by user\n");
    process.exit(0);
  }

  const confirm2 = await promptConfirmation(
    "Are you absolutely sure? This cannot be undone! Type 'RESTORE' to confirm: "
  );

  if (confirm2 !== "restore") {
    console.log("\n❌ Restoration cancelled by user\n");
    process.exit(0);
  }

  console.log("\n");

  try {
    // Step 1: Create safety backup
    const safetyBackup = await createSafetyBackup();

    // Step 2: Reset schema
    await resetSchema();

    // Step 3: Restore from backup
    await restoreDatabase(backupFile);

    // Step 4: Verify restoration
    await verifyRestoration();

    // Step 5: Run migrations
    await runMigrations();

    // Success!
    console.log("╔════════════════════════════════════════════════╗");
    console.log("║         ✨ Restoration Successful! ✨          ║");
    console.log("╚════════════════════════════════════════════════╝\n");

    console.log("📋 Summary:");
    console.log(`   Restored from: ${backupFile}`);
    console.log(`   Safety backup: ${safetyBackup}`);
    console.log(
      `   Database: ${env.DATABASE_URL?.split("@")[1]?.split("?")[0] || env.NEON_DATABASE_URL?.split("@")[1]?.split("?")[0] || "connected"}\n`
    );

    console.log("📋 Next steps:");
    console.log("   1. Test application: pnpm dev");
    console.log("   2. Verify data integrity");
    console.log("   3. Check application logs\n");
  } catch (error) {
    console.error("\n❌ Restoration failed:", error);
    console.log("\n🔧 Recovery options:");
    console.log("   1. Check the safety backup created before restoration");
    console.log("   2. Verify database connection string");
    console.log("   3. Check backup file integrity");
    console.log("   4. Contact database administrator\n");
    process.exit(1);
  }
}

main();
