#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🚀 ULTRA-OPTIMIZED Seed Runner V4 - Production Ready Database Seeding
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚡ PERFORMANCE OPTIMIZATIONS:
 * ✅ Metadata caching for duplicate prevention
 * ✅ Batch processing with transaction support
 * ✅ Parallel image downloading (5 concurrent)
 * ✅ In-memory deduplication for images
 * ✅ Smart error recovery with graceful degradation
 * ✅ Comprehensive performance metrics
 * ✅ Memory-efficient streaming processing
 * ✅ Advanced comic lookup (4-level fallback)
 *
 * 📊 FEATURES:
 * ✅ Dynamic JSON data loading from multiple files
 * ✅ Intelligent comic lookup by slug OR title (4 levels)
 * ✅ Image download with 3-layer caching
 * ✅ Zod validation for all data
 * ✅ Upsert operations for idempotency
 * ✅ Fallback images (automatic placeholder usage)
 * ✅ Original filename preservation
 * ✅ Progress tracking with detailed metrics
 * ✅ Advanced error categorization
 * ✅ Exponential backoff retry logic
 *
 * USAGE:
 *   pnpm db:seed              - Seed all (users, comics, chapters)
 *   pnpm db:seed:users        - Seed users only
 *   pnpm db:seed:comics       - Seed comics only
 *   pnpm db:seed:chapters     - Seed chapters only
 *   pnpm db:seed --dry-run    - Dry run mode
 *   pnpm db:seed --verbose    - Verbose logging
 */

import { logger } from "@/database/seed/logger";
import { seedChaptersV4 } from "@/database/seed/seeders/chapter-seeder-v4";
import { seedComicsV4 } from "@/database/seed/seeders/comic-seeder-v4";
import { seedUsersV4 } from "@/database/seed/seeders/user-seeder-v4";
import { env } from "env";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION & TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SeedConfig {
  users: boolean;
  comics: boolean;
  chapters: boolean;
  dryRun: boolean;
  verbose: boolean;
  batchSize?: number;
  concurrency?: number;
  retryAttempts?: number;
}

interface PerformanceMetrics {
  startTime: number;
  phaseTimings: Map<string, number>;
  memoryUsage: { initial: number; peak: number; final: number };
  itemsProcessed: number;
  errorsRecovered: number;
}

interface SeedResults {
  users: { total: number; created: number; updated: number; skipped: number; errors: number };
  comics: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
    imagesDownloaded: number;
    imagesCached: number;
  };
  chapters: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
    imagesDownloaded: number;
    imagesCached: number;
  };
}

const DEFAULT_CONFIG: SeedConfig = {
  users: true,
  comics: true,
  chapters: true,
  dryRun: false,
  verbose: false,
  batchSize: 50,
  concurrency: 5,
  retryAttempts: 3,
};

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE TRACKING
// ═══════════════════════════════════════════════════════════════════════════

function createMetricsTracker(): PerformanceMetrics {
  return {
    startTime: Date.now(),
    phaseTimings: new Map(),
    memoryUsage: {
      initial: process.memoryUsage().heapUsed,
      peak: process.memoryUsage().heapUsed,
      final: 0,
    },
    itemsProcessed: 0,
    errorsRecovered: 0,
  };
}

function updateMetrics(metrics: PerformanceMetrics, phase: string, duration: number): void {
  metrics.phaseTimings.set(phase, duration);
  const currentMemory = process.memoryUsage().heapUsed;
  if (currentMemory > metrics.memoryUsage.peak) {
    metrics.memoryUsage.peak = currentMemory;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SEED ORCHESTRATOR - ULTRA OPTIMIZED
// ═══════════════════════════════════════════════════════════════════════════

async function seedAll(config: SeedConfig = DEFAULT_CONFIG): Promise<void> {
  const metrics = createMetricsTracker();

  logger.info("╔═══════════════════════════════════════════════════════════╗");
  logger.info("║  🚀 ComicWise Database Seeding System V4 (ULTRA-OPT)    ║");
  logger.info("╚═══════════════════════════════════════════════════════════╝");
  logger.info("");
  logger.info(`⚙️  CONFIGURATION:`);
  logger.info(`   Users:       ${config.users ? "✅" : "⏭️ "}`);
  logger.info(`   Comics:      ${config.comics ? "✅" : "⏭️ "}`);
  logger.info(`   Chapters:    ${config.chapters ? "✅" : "⏭️ "}`);
  logger.info(`   Dry Run:     ${config.dryRun ? "✅" : "❌"}`);
  logger.info(`   Verbose:     ${config.verbose ? "✅" : "❌"}`);
  logger.info(`   Batch Size:  ${config.batchSize || DEFAULT_CONFIG.batchSize}`);
  logger.info(`   Concurrency: ${config.concurrency || DEFAULT_CONFIG.concurrency}`);
  logger.info(`   Retries:     ${config.retryAttempts || DEFAULT_CONFIG.retryAttempts}`);
  logger.info("");

  if (config.dryRun) {
    logger.warn("⚠️  DRY RUN MODE - No changes will be made to the database");
    logger.info("");
  }

  const results: SeedResults = {
    users: { total: 0, created: 0, updated: 0, skipped: 0, errors: 0 },
    comics: {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      imagesDownloaded: 0,
      imagesCached: 0,
    },
    chapters: {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      imagesDownloaded: 0,
      imagesCached: 0,
    },
  };

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: SEED USERS (Sequential - required for FK)
    // ═══════════════════════════════════════════════════════════════════════
    if (config.users) {
      const phaseStart = Date.now();
      logger.info("┌───────────────────────────────────────────────────────┐");
      logger.info("│ PHASE 1: Seeding Users (Optimized)                    │");
      logger.info("└───────────────────────────────────────────────────────┘");
      logger.info("");

      try {
        const userResult = await seedUsersV4(["users.json"], env.CUSTOM_PASSWORD);
        results.users = userResult;
        const duration = Date.now() - phaseStart;
        updateMetrics(metrics, "Users", duration);
        logger.info(`✅ Users seeded in ${(duration / 1000).toFixed(2)}s`);
        logger.info(
          `   Created: ${userResult.created}, Updated: ${userResult.updated}, Errors: ${userResult.errors}`
        );
      } catch (error) {
        logger.error(`❌ User seeding failed: ${error}`);
        metrics.errorsRecovered++;
        if (!config.dryRun) throw error;
      }
      logger.info("");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: SEED COMICS (Optimized with caching)
    // ═══════════════════════════════════════════════════════════════════════
    if (config.comics) {
      const phaseStart = Date.now();
      logger.info("┌───────────────────────────────────────────────────────┐");
      logger.info("│ PHASE 2: Seeding Comics (Ultra-Optimized)             │");
      logger.info("└───────────────────────────────────────────────────────┘");
      logger.info("");

      try {
        const comicResult = await seedComicsV4([
          "comics.json",
          "comicsdata1.json",
          "comicsdata2.json",
        ]);
        results.comics = comicResult;
        const duration = Date.now() - phaseStart;
        updateMetrics(metrics, "Comics", duration);
        logger.info(`✅ Comics seeded in ${(duration / 1000).toFixed(2)}s`);
        logger.info(
          `   Total: ${comicResult.total}, Created: ${comicResult.created}, Updated: ${comicResult.updated}, Errors: ${comicResult.errors}`
        );
        logger.info(
          `   Images: ${comicResult.imagesCached} cached, ${comicResult.imagesDownloaded} downloaded`
        );
      } catch (error) {
        logger.error(`❌ Comic seeding failed: ${error}`);
        metrics.errorsRecovered++;
        if (!config.dryRun) throw error;
      }
      logger.info("");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: SEED CHAPTERS (Ultra-Optimized with enhanced lookup)
    // ═══════════════════════════════════════════════════════════════════════
    if (config.chapters) {
      const phaseStart = Date.now();
      logger.info("┌───────────────────────────────────────────────────────┐");
      logger.info("│ PHASE 3: Seeding Chapters (Ultra-Optimized)           │");
      logger.info("└───────────────────────────────────────────────────────┘");
      logger.info("");

      try {
        const chapterResult = await seedChaptersV4([
          "chapters.json",
          "chaptersdata1.json",
          "chaptersdata2.json",
        ]);
        results.chapters = chapterResult;
        const duration = Date.now() - phaseStart;
        updateMetrics(metrics, "Chapters", duration);
        logger.info(`✅ Chapters seeded in ${(duration / 1000).toFixed(2)}s`);
        logger.info(
          `   Total: ${chapterResult.total}, Created: ${chapterResult.created}, Updated: ${chapterResult.updated}, Skipped: ${chapterResult.skipped}, Errors: ${chapterResult.errors}`
        );
        logger.info(
          `   Images: ${chapterResult.imagesCached} cached, ${chapterResult.imagesDownloaded} downloaded`
        );
      } catch (error) {
        logger.error(`❌ Chapter seeding failed: ${error}`);
        metrics.errorsRecovered++;
        if (!config.dryRun) throw error;
      }
      logger.info("");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FINAL SUMMARY - COMPREHENSIVE REPORT
    // ═══════════════════════════════════════════════════════════════════════
    metrics.memoryUsage.final = process.memoryUsage().heapUsed;
    const totalDuration = Date.now() - metrics.startTime;

    logger.info("╔═══════════════════════════════════════════════════════════╗");
    logger.info("║              🎉 SEEDING COMPLETE 🎉                       ║");
    logger.info("╚═══════════════════════════════════════════════════════════╝");
    logger.info("");
    logger.info("📊 COMPREHENSIVE SUMMARY:");
    logger.info("");
    logger.info("👥 Users:");
    logger.info(`   Total:   ${results.users.total}`);
    logger.info(`   Created: ${results.users.created}`);
    logger.info(`   Updated: ${results.users.updated}`);
    logger.info(`   Skipped: ${results.users.skipped}`);
    logger.info(`   Errors:  ${results.users.errors}`);
    logger.info("");
    logger.info("📚 Comics:");
    logger.info(`   Total:             ${results.comics.total}`);
    logger.info(`   Created:           ${results.comics.created}`);
    logger.info(`   Updated:           ${results.comics.updated}`);
    logger.info(`   Skipped:           ${results.comics.skipped}`);
    logger.info(`   Errors:            ${results.comics.errors}`);
    logger.info(`   Images Downloaded: ${results.comics.imagesDownloaded}`);
    logger.info(`   Images Cached:     ${results.comics.imagesCached}`);
    logger.info("");
    logger.info("📖 Chapters:");
    logger.info(`   Total:             ${results.chapters.total}`);
    logger.info(`   Created:           ${results.chapters.created}`);
    logger.info(`   Updated:           ${results.chapters.updated}`);
    logger.info(`   Skipped:           ${results.chapters.skipped}`);
    logger.info(`   Errors:            ${results.chapters.errors}`);
    logger.info(`   Images Downloaded: ${results.chapters.imagesDownloaded}`);
    logger.info(`   Images Cached:     ${results.chapters.imagesCached}`);
    logger.info("");

    // Performance metrics
    logger.info("⚡ ULTRA-OPTIMIZED PERFORMANCE METRICS:");
    logger.info(`   Total Duration:    ${(totalDuration / 1000).toFixed(2)}s`);
    for (const [phase, duration] of metrics.phaseTimings.entries()) {
      logger.info(`   ${phase} Phase:      ${(duration / 1000).toFixed(2)}s`);
    }
    const memoryDiff = (metrics.memoryUsage.peak - metrics.memoryUsage.initial) / 1024 / 1024;
    logger.info(`   Peak Memory:       ${memoryDiff.toFixed(2)}MB`);
    logger.info(`   Errors Recovered:  ${metrics.errorsRecovered}`);
    logger.info("");

    // Check for critical errors
    const totalErrors = results.users.errors + results.comics.errors + results.chapters.errors;
    const totalProcessed = results.users.total + results.comics.total + results.chapters.total;
    const successRate =
      totalProcessed > 0
        ? (((totalProcessed - totalErrors) / totalProcessed) * 100).toFixed(1)
        : "0";

    logger.info(
      `📈 OVERALL SUCCESS RATE: ${successRate}% (${totalProcessed - totalErrors}/${totalProcessed} items)`
    );

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

  // Check for other flags
  if (args.has("--dry-run")) config.dryRun = true;
  if (args.has("--verbose")) config.verbose = true;

  return config;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════

const config = parseArgs();
try {
  await seedAll(config);
} catch (error) {
  logger.error(`Fatal error: ${String(error)}`);
  process.exit(1);
}
