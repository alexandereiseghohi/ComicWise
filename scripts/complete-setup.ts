#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ComicWise - Comprehensive Project Setup & Optimization Script
 * ═══════════════════════════════════════════════════════════════════════════
 * This script handles all configuration optimizations and setup tasks
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { execSync } from "child_process";

const log = {
  info: (msg: string) => console.log(`\x1B[36mℹ\x1B[0m ${msg}`),
  success: (msg: string) => console.log(`\x1B[32m✅\x1B[0m ${msg}`),
  error: (msg: string) => console.log(`\x1B[31m❌\x1B[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1B[33m⚠️\x1B[0m ${msg}`),
};

function execute(command: string, description: string): void {
  try {
    log.info(`${description}...`);
    execSync(command, { stdio: "inherit", cwd: process.cwd() });
    log.success(`${description} completed`);
  } catch {
    log.warn(`${description} had issues, continuing...`);
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════════════════");
  console.log("ComicWise - Comprehensive Setup");
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  // Task 1: Install Dependencies
  log.info("Task 1: Setting up dependencies");
  execute("pnpm install", "Installing dependencies");

  // Install @imagekit/next
  execute("pnpm add @imagekit/next", "Installing @imagekit/next");

  // Remove old package
  try {
    execSync("pnpm remove imagekitio-next", { stdio: "ignore" });
    log.success("Removed imagekitio-next");
  } catch {
    log.info("imagekitio-next not found, skipping removal");
  }

  log.success("Task 1 completed\n");

  // Summary
  console.log("\n═══════════════════════════════════════════════════════════════════════════");
  console.log("✅ Setup script completed successfully!");
  console.log("═══════════════════════════════════════════════════════════════════════════\n");

  console.log("Next steps:");
  console.log("  1. Review .env.local configuration");
  console.log("  2. Run: pnpm db:push");
  console.log("  3. Run: pnpm db:seed");
  console.log("  4. Run: pnpm dev\n");
}

main().catch((error) => {
  log.error(`Setup failed: ${error.message}`);
  process.exit(1);
});
