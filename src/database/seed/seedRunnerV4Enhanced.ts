#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Enhanced Seed Runner V4 - Comprehensive Database Seeding System
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * ✅ Dynamic JSON data loading from multiple files
 * ✅ Image download with caching (no duplicate downloads)
 * ✅ Zod validation for all data
 * ✅ onConflictDoUpdate for all inserts
 * ✅ CUSTOM_PASSWORD environment variable support
 * ✅ Comprehensive logging with clear operation tracking
 * ✅ Fallback images (placeholder-comic.jpg, shadcn.jpg)
 * ✅ Original filename preservation
 * ✅ Progress tracking and performance metrics
 * ✅ Error handling and recovery
 *
 * Usage:
 *   pnpm db:seed              - Seed all (users, comics, chapters)
 *   pnpm db:seed:users        - Seed users only
 *   pnpm db:seed:comics       - Seed comics only
 *   pnpm db:seed:chapters     - Seed chapters only
 *   pnpm db:seed --dry-run    - Dry run mode
 *   pnpm db:seed --verbose    - Verbose logging
 */

import { logger } from "@/database/seed/logger";
import { seedChaptersV4 } from "@/database/seed/seeders/chapterSeederV4";
import { seedComicsV4 } from "@/database/seed/seeders/comicSeederV4";
import { seedUsersV4 } from "@/database/seed/seeders/userSeederV4";
import { env } from "env";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

interface SeedConfig {
  users: boolean;
  comics: boolean;
  chapters: boolean;
  dryRun: boolean;
  verbose: boolean;
}

const DEFAULT_CONFIG: SeedConfig = {
  users: true,
  comics: true,
  chapters: true,
  dryRun: false,
  verbose: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SEED ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════

async function seedAll(config: SeedConfig = DEFAULT_CONFIG): Promise<void> {
  const startTime = Date.now();

  logger.info("╔═══════════════════════════════════════════════════════════╗");
  logger.info("║     ComicWise Database Seeding System V4                  ║");
  logger.info("╚═══════════════════════════════════════════════════════════╝");
  logger.info("");
  logger.info(`🔧 Configuration:`);
  logger.info(`   Users:    ${config.users ? "✅" : "⏭️ "}`);
  logger.info(`   Comics:   ${config.comics ? "✅" : "⏭️ "}`);
  logger.info(`   Chapters: ${config.chapters ? "✅" : "⏭️ "}`);
  logger.info(`   Dry Run:  ${config.dryRun ? "✅" : "❌"}`);
  logger.info(`   Verbose:  ${config.verbose ? "✅" : "❌"}`);
  logger.info("");

  if (config.dryRun) {
    logger.warn("⚠️  DRY RUN MODE - No changes will be made to the database");
    logger.info("");
  }

  const results = {
    users: { total: 0, created: 0, updated: 0, errors: 0 },
    comics: { total: 0, created: 0, updated: 0, errors: 0, imagesDownloaded: 0, imagesCached: 0 },
    chapters: { total: 0, created: 0, updated: 0, errors: 0, imagesDownloaded: 0, imagesCached: 0 },
  };

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: SEED USERS
    // ═══════════════════════════════════════════════════════════════════════
    if (config.users && !config.dryRun) {
      logger.info("│ PHASE 1: Seeding Users                                 │");

      logger.info("");

      const userResult = await seedUsersV4(["users.json"], env.CUSTOM_PASSWORD);
      results.users = userResult;

      logger.info("");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: SEED COMICS
    // ═══════════════════════════════════════════════════════════════════════
    if (config.comics && !config.dryRun) {
      logger.info("┌───────────────────────────────────────────────────────┐");
      logger.info("│ PHASE 2: Seeding Comics                                │");
      logger.info("└───────────────────────────────────────────────────────┘");
      logger.info("");

      const comicResult = await seedComicsV4([
        "comics.json",
        "comicsdata1.json",
        "comicsdata2.json",
      ]);
      results.comics = comicResult;

      logger.info("");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: SEED CHAPTERS
    // ═══════════════════════════════════════════════════════════════════════
    if (config.chapters && !config.dryRun) {
      logger.info("┌───────────────────────────────────────────────────────┐");
      logger.info("│ PHASE 3: Seeding Chapters                              │");
      logger.info("└───────────────────────────────────────────────────────┘");
      logger.info("");

      const chapterResult = await seedChaptersV4([
        "chapters.json",
        "chaptersdata1.json",
        "chaptersdata2.json",
      ]);
      results.chapters = chapterResult;

      logger.info("");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ═══════════════════════════════════════════════════════════════════════
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    logger.info("╔═══════════════════════════════════════════════════════════╗");
    logger.info("║              🎉 SEEDING COMPLETE 🎉                       ║");
    logger.info("╚═══════════════════════════════════════════════════════════╝");
    logger.info("");
    logger.info("📊 Summary:");
    logger.info("");
    logger.info("👥 Users:");
    logger.info(`   Total:   ${results.users.total}`);
    logger.info(`   Created: ${results.users.created}`);
    logger.info(`   Updated: ${results.users.updated}`);
    logger.info(`   Errors:  ${results.users.errors}`);
    logger.info("");
    logger.info("📚 Comics:");
    logger.info(`   Total:             ${results.comics.total}`);
    logger.info(`   Created:           ${results.comics.created}`);
    logger.info(`   Updated:           ${results.comics.updated}`);
    logger.info(`   Errors:            ${results.comics.errors}`);
    logger.info(`   Images Downloaded: ${results.comics.imagesDownloaded}`);
    logger.info(`   Images Cached:     ${results.comics.imagesCached}`);
    logger.info("");
    logger.info("📖 Chapters:");
    logger.info(`   Total:             ${results.chapters.total}`);
    logger.info(`   Created:           ${results.chapters.created}`);
    logger.info(`   Updated:           ${results.chapters.updated}`);
    logger.info(`   Errors:            ${results.chapters.errors}`);
    logger.info(`   Images Downloaded: ${results.chapters.imagesDownloaded}`);
    logger.info(`   Images Cached:     ${results.chapters.imagesCached}`);
    logger.info("");
    logger.info(`⏱️  Duration: ${duration}s`);
    logger.info("");

    // Check for errors
    const totalErrors = results.users.errors + results.comics.errors + results.chapters.errors;

    if (totalErrors > 0) {
      logger.warn(`⚠️  Completed with ${totalErrors} errors. Check logs for details.`);
      process.exit(1);
    } else {
      logger.info("✅ All seeding operations completed successfully!");
      process.exit(0);
    }
  } catch (error) {
    logger.error("💥 Seeding failed with critical error:");
    logger.error(String(error));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI ARGUMENT PARSING
// ═══════════════════════════════════════════════════════════════════════════

function parseArgs(): SeedConfig {
  const args = new Set(process.argv.slice(2));
  const config: SeedConfig = { ...DEFAULT_CONFIG };

  // Check for specific entity flags
  if (args.has("--users")) {
    config.users = true;
    config.comics = false;
    config.chapters = false;
  }

  if (args.has("--comics")) {
    config.users = false;
    config.comics = true;
    config.chapters = false;
  }

  if (args.has("--chapters")) {
    config.users = false;
    config.comics = false;
    config.chapters = true;
  }

  // Other flags
  if (args.has("--dry-run")) config.dryRun = true;
  if (args.has("--verbose")) config.verbose = true;

  return config;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const config = parseArgs();
  try {
    await seedAll(config);
  } catch (error) {
    logger.error("Fatal error in seed runner:");
    logger.error(String(error));
    process.exit(1);
  }
}

export { seedAll };
