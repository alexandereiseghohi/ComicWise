/**
 * Database Backup Script
 * Creates a PostgreSQL backup and optionally uploads to cloud storage
 *
 * Usage:
 *   pnpm db:backup              # Create local backup
 *   pnpm db:backup --upload     # Create backup and upload to S3
 *   pnpm db:backup --compress   # Create compressed backup
 */

import { env } from "@/lib/env";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), "backups");
const args = new Set(process.argv.slice(2));
const shouldUpload = args.has("--upload");
const shouldCompress = args.has("--compress");

interface BackupResult {
  filepath: string;
  filename: string;
  size: number;
  timestamp: string;
}

/**
 * Create database backup
 */
async function backupDatabase(): Promise<BackupResult> {
  console.log("🔄 Starting database backup...\n");

  // Ensure backup directory exists
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replaceAll(/[.:]/g, "-");
  const filename = `comicwise-backup-${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    // Create backup using pg_dump
    console.log(`📦 Creating backup: ${filename}`);
    const command = `pg_dump "${env.DATABASE_URL}" --format=plain --no-owner --no-acl --file="${filepath}"`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes("NOTICE")) {
      console.warn("⚠️  Backup warnings:", stderr);
    }

    // Get file size
    const stats = await fs.stat(filepath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup created successfully!`);
    console.log(`   File: ${filename}`);
    console.log(`   Size: ${sizeInMB} MB`);
    console.log(`   Path: ${filepath}\n`);

    const result: BackupResult = {
      filepath,
      filename,
      size: stats.size,
      timestamp,
    };

    // Compress if requested
    if (shouldCompress) {
      await compressBackup(filepath);
    }

    return result;
  } catch (error) {
    console.error("❌ Backup failed:", error);
    throw error;
  }
}

/**
 * Compress backup file using gzip
 * @param filepath
 */
async function compressBackup(filepath: string): Promise<string> {
  console.log("🗜️  Compressing backup...");

  const compressedPath = `${filepath}.gz`;
  const command = `gzip -c "${filepath}" > "${compressedPath}"`;

  await execAsync(command);

  // Get compressed size
  const stats = await fs.stat(compressedPath);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

  // Remove uncompressed file
  await fs.unlink(filepath);

  console.log(`✅ Compressed to ${sizeInMB} MB\n`);

  return compressedPath;
}

/**
 * Upload backup to AWS S3
 * @param filepath
 */
async function uploadToS3(filepath: string): Promise<void> {
  console.log("☁️  Uploading to S3...");

  // Check if AWS credentials are configured
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_S3_BUCKET_NAME) {
    console.warn("⚠️  AWS credentials not configured. Skipping upload.");
    return;
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const s3Key = `backups/${year}/${month}/${day}/${path.basename(filepath)}`;

  try {
    // Upload using AWS CLI (ensure aws-cli is installed)
    const command = `aws s3 cp "${filepath}" s3://${env.AWS_S3_BUCKET_NAME}/${s3Key} --sse AES256`;

    await execAsync(command);

    console.log(`✅ Uploaded to S3: ${s3Key}\n`);
  } catch (error) {
    console.error("❌ S3 upload failed:", error);
    console.log("💡 Tip: Ensure AWS CLI is installed and configured\n");
  }
}

/**
 * Clean up old backups (keep last 30 days)
 */
async function cleanupOldBackups(): Promise<void> {
  console.log("🧹 Cleaning up old backups...");

  const files = await fs.readdir(BACKUP_DIR);
  const now = Date.now();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

  let deletedCount = 0;

  for (const file of files) {
    const filepath = path.join(BACKUP_DIR, file);
    const stats = await fs.stat(filepath);
    const age = now - stats.mtimeMs;

    if (age > thirtyDaysInMs) {
      await fs.unlink(filepath);
      deletedCount++;
      console.log(`   Deleted: ${file}`);
    }
  }

  if (deletedCount === 0) {
    console.log("   No old backups to delete");
  } else {
    console.log(`✅ Deleted ${deletedCount} old backup(s)\n`);
  }
}

/**
 * Create a "latest" symlink for easy access
 * @param filepath
 */
async function createLatestSymlink(filepath: string): Promise<void> {
  const latestPath = path.join(BACKUP_DIR, "latest.sql");

  try {
    // Remove existing symlink
    await fs.unlink(latestPath).catch(() => {});

    // Create new symlink (relative path for portability)
    const relativePath = path.basename(filepath);
    await fs.symlink(relativePath, latestPath);

    console.log(`🔗 Created symlink: latest.sql -> ${path.basename(filepath)}\n`);
  } catch {
    // Symlinks might not work on all systems, just log warning
    console.warn("⚠️  Could not create symlink (not critical)");
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await backupDatabase();

    let finalPath = result.filepath;

    // Compress if requested
    if (shouldCompress) {
      finalPath = await compressBackup(result.filepath);
    }

    // Upload if requested
    if (shouldUpload) {
      await uploadToS3(finalPath);
    }

    // Create latest symlink
    await createLatestSymlink(result.filepath);

    // Cleanup old backups
    await cleanupOldBackups();

    console.log("✨ Backup process completed successfully!\n");

    // Print instructions
    console.log("📋 Next steps:");
    console.log(`   Restore: pnpm db:restore ${result.filename}`);
    console.log(`   Verify: psql $DATABASE_URL < backups/${result.filename}`);
  } catch (error) {
    console.error("\n❌ Backup process failed:", error);
    process.exit(1);
  }
}

main();
