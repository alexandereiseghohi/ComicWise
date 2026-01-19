#!/usr/bin/env tsx

/**
 * Bulk Upload Script - Upload local files to configured image providers
 *
 * Uploads all images from public directory to:
 * - ImageKit
 * - Cloudinary
 * - AWS S3
 *
 * Usage:
 *   pnpm upload:bulk                     Upload to all providers
 *   pnpm upload:bulk --provider=imagekit  Upload to specific provider
 *   pnpm upload:bulk --dry-run            Preview without uploading
 *   pnpm upload:bulk --path=public/comics  Upload specific directory
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { basename, extname, join, relative } from "path";
import { env } from "../appConfig";

// Import providers
import { CloudinaryProvider } from "@/services/upload/providers/cloudinary";
import { ImageKitProvider } from "@/services/upload/providers/imagekit";

interface UploadOptions {
  provider?: "imagekit" | "cloudinary" | "aws" | "all";
  dryRun?: boolean;
  path?: string;
  verbose?: boolean;
}

interface UploadResult {
  file: string;
  provider: string;
  success: boolean;
  url?: string;
  error?: string;
  size: number;
}

class BulkUploader {
  private results: UploadResult[] = [];
  private providers: Map<string, any> = new Map();

  // Supported image extensions
  private readonly imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"];

  constructor(private options: UploadOptions) {}

  /**
   * Initialize upload providers based on environment configuration
   */
  async initializeProviders(): Promise<void> {
    console.log("\n🔧 Initializing providers...\n");

    // ImageKit
    if (this.shouldUseProvider("imagekit")) {
      if (env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT) {
        this.providers.set("imagekit", new ImageKitProvider());
        console.log("✅ ImageKit initialized");
      } else {
        console.warn("⚠️  ImageKit credentials missing - skipping");
      }
    }

    // Cloudinary
    if (this.shouldUseProvider("cloudinary")) {
      if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
        this.providers.set("cloudinary", new CloudinaryProvider());
        console.log("✅ Cloudinary initialized");
      } else {
        console.warn("⚠️  Cloudinary credentials missing - skipping");
      }
    }

    // AWS S3
    if (this.shouldUseProvider("aws")) {
      if (
        env.AWS_REGION &&
        env.AWS_ACCESS_KEY_ID &&
        env.AWS_SECRET_ACCESS_KEY &&
        env.AWS_S3_BUCKET_NAME
      ) {
        // Dynamically import AWS provider if available
        try {
          const { S3Provider } = await import("@/services/upload/providers/s3");
          this.providers.set(
            "aws",
            new S3Provider({
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
              region: env.AWS_REGION,
              bucket: env.AWS_S3_BUCKET_NAME,
            })
          );
          console.log("✅ AWS S3 initialized");
        } catch {
          console.warn("⚠️  AWS S3 provider not found - skipping");
        }
      } else {
        console.warn("⚠️  AWS credentials missing - skipping");
      }
    }

    if (this.providers.size === 0) {
      throw new Error("No providers configured. Set up credentials in .env.local");
    }

    console.log(`\n📦 ${this.providers.size} provider(s) ready\n`);
  }

  /**
   * Check if provider should be used based on options
   * @param provider
   */
  private shouldUseProvider(provider: string): boolean {
    if (!this.options.provider || this.options.provider === "all") {
      return true;
    }
    return this.options.provider === provider;
  }

  /**
   * Scan directory for image files
   * @param dir
   * @param baseDir
   */
  private scanDirectory(dir: string, baseDir: string = dir): string[] {
    const files: string[] = [];

    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Recursively scan subdirectories
          files.push(...this.scanDirectory(fullPath, baseDir));
        } else if (stat.isFile()) {
          // Check if it's an image
          const ext = extname(entry).toLowerCase();
          if (this.imageExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error);
    }

    return files;
  }

  /**
   * Upload single file to all configured providers
   * @param filePath
   * @param baseDir
   */
  private async uploadFile(filePath: string, baseDir: string): Promise<void> {
    const relativePath = relative(baseDir, filePath);
    const fileName = basename(filePath);
    const ext = extname(fileName);
    const fileBuffer = readFileSync(filePath);
    const fileSize = fileBuffer.length;

    // Extract folder structure for organization
    const folderPath = relative(baseDir, join(filePath, ".."));

    console.log(`\n📤 Uploading: ${relativePath} (${(fileSize / 1024).toFixed(2)} KB)`);

    if (this.options.dryRun) {
      console.log("   [DRY RUN] Would upload to:", [...this.providers.keys()].join(", "));
      return;
    }

    // Upload to each provider
    for (const [providerName, provider] of this.providers) {
      try {
        console.log(`   → ${providerName}...`);

        const result = await provider.upload(fileBuffer, {
          folder: folderPath || "uploads",
          filename: fileName.replace(ext, ""), // Remove extension, provider adds it
          tags: ["bulk-upload", "public-assets"],
        });

        if (result.success) {
          console.log(`   ✅ ${providerName}: ${result.url}`);
          this.results.push({
            file: relativePath,
            provider: providerName,
            success: true,
            url: result.url,
            size: fileSize,
          });
        } else {
          console.log(`   ❌ ${providerName}: ${result.error}`);
          this.results.push({
            file: relativePath,
            provider: providerName,
            success: false,
            error: result.error,
            size: fileSize,
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`   ❌ ${providerName}: ${errorMsg}`);
        this.results.push({
          file: relativePath,
          provider: providerName,
          success: false,
          error: errorMsg,
          size: fileSize,
        });
      }

      // Small delay between providers to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  /**
   * Main upload process
   */
  async run(): Promise<void> {
    const startTime = Date.now();

    console.log("════════════════════════════════════════════════════════════");
    console.log("  📦 Bulk Image Upload Tool");
    console.log("════════════════════════════════════════════════════════════");

    // Initialize providers
    await this.initializeProviders();

    // Determine upload path
    const uploadPath = this.options.path || "public";
    const fullPath = join(process.cwd(), uploadPath);

    console.log(`📂 Scanning: ${uploadPath}\n`);

    // Scan for images
    const files = this.scanDirectory(fullPath, fullPath);

    if (files.length === 0) {
      console.log("⚠️  No image files found");
      return;
    }

    console.log(`📊 Found ${files.length} image file(s)\n`);

    if (this.options.dryRun) {
      console.log("🔍 DRY RUN MODE - No files will be uploaded\n");
    }

    // Upload files
    for (let i = 0; i < files.length; i++) {
      console.log(`\n[${i + 1}/${files.length}]`);
      await this.uploadFile(files[i]!, fullPath);

      // Small delay between files
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Print summary
    this.printSummary(startTime);
  }

  /**
   * Print upload summary
   * @param startTime
   */
  private printSummary(startTime: number): void {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n════════════════════════════════════════════════════════════");
    console.log("  📊 Upload Summary");
    console.log("════════════════════════════════════════════════════════════\n");

    // Group results by provider
    const byProvider = new Map<string, { success: number; failed: number; bytes: number }>();

    for (const result of this.results) {
      if (!byProvider.has(result.provider)) {
        byProvider.set(result.provider, { success: 0, failed: 0, bytes: 0 });
      }

      const stats = byProvider.get(result.provider)!;
      if (result.success) {
        stats.success++;
        stats.bytes += result.size;
      } else {
        stats.failed++;
      }
    }

    // Print per-provider stats
    for (const [provider, stats] of byProvider) {
      const totalSize = (stats.bytes / 1024 / 1024).toFixed(2);
      console.log(`${provider.toUpperCase()}:`);
      console.log(`  ✅ Success: ${stats.success}`);
      console.log(`  ❌ Failed:  ${stats.failed}`);
      console.log(`  📦 Size:    ${totalSize} MB`);
      console.log();
    }

    // Overall stats
    const totalSuccess = this.results.filter((r) => r.success).length;
    const totalFailed = this.results.filter((r) => !r.success).length;
    const totalBytes = this.results.reduce((sum, r) => sum + r.size, 0);
    const totalSize = (totalBytes / 1024 / 1024).toFixed(2);

    console.log("TOTAL:");
    console.log(`  ✅ Success: ${totalSuccess}`);
    console.log(`  ❌ Failed:  ${totalFailed}`);
    console.log(`  📦 Size:    ${totalSize} MB`);
    console.log(`  ⏱️  Time:    ${elapsed}s`);

    console.log("\n════════════════════════════════════════════════════════════");

    // Print failed uploads if any
    const failed = this.results.filter((r) => !r.success);
    if (failed.length > 0) {
      console.log("\n❌ Failed Uploads:\n");
      for (const result of failed) {
        console.log(`  ${result.file} (${result.provider}): ${result.error}`);
      }
      console.log();
    }
  }
}

/**
 * Parse CLI arguments
 */
function parseArgs(): UploadOptions {
  const args = process.argv.slice(2);
  const options: UploadOptions = {};

  for (const arg of args) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--verbose") {
      options.verbose = true;
    } else if (arg.startsWith("--provider=")) {
      const provider = arg.split("=")[1] as any;
      if (["imagekit", "cloudinary", "aws", "all"].includes(provider)) {
        options.provider = provider;
      } else {
        console.error(`Invalid provider: ${provider}`);
        process.exit(1);
      }
    } else if (arg.startsWith("--path=")) {
      options.path = arg.split("=")[1];
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Bulk Image Upload Tool

Upload local images from public directory to configured cloud providers.

Usage:
  pnpm upload:bulk [options]

Options:
  --provider=<name>    Upload to specific provider (imagekit, cloudinary, aws, all)
                       Default: all

  --path=<directory>   Upload from specific directory
                       Default: public

  --dry-run           Preview uploads without actually uploading

  --verbose           Show detailed output

  --help, -h          Show this help message

Examples:
   Upload all public images to all providers
  pnpm upload:bulk

   Upload only to ImageKit
  pnpm upload:bulk --provider=imagekit

   Upload specific directory
  pnpm upload:bulk --path=public/comics

   Dry run to preview
  pnpm upload:bulk --dry-run

Environment Variables Required:
  ImageKit:
    - IMAGEKIT_PUBLIC_KEY
    - IMAGEKIT_PRIVATE_KEY
    - IMAGEKIT_URL_ENDPOINT

  Cloudinary:
    - CLOUDINARY_CLOUD_NAME
    - CLOUDINARY_API_KEY
    - CLOUDINARY_API_SECRET

  AWS S3:
    - AWS_REGION
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
    - AWS_S3_BUCKET_NAME

Set these in .env.local before running.
`);
}

/**
 * Main entry point
 */
async function main() {
  try {
    const options = parseArgs();
    const uploader = new BulkUploader(options);
    await uploader.run();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]!.replaceAll("\\", "/")}`) {
  main();
}

export { BulkUploader };
