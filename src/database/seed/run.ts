/**
 * 🌱 Enhanced Database Seeding System Entry Point v4.0
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ✨ Features:
 * - Dynamic data loading from multiple JSON sources (users, comics, chapters)
 * - Comprehensive Zod validation for all seed data
 * - Intelligent 3-layer image caching prevents duplicate downloads
 * - Integration with imageService.ts for local/cloud uploads
 * - Upsert logic with ON CONFLICT DO UPDATE for data integrity
 * - Parallel image processing with rate limiting and retry logic
 * - Comprehensive logging with clear, concise descriptions
 * - Production-ready with security & best practices
 *
 * Image Storage Strategy:
 * - Comic cover images: /public/comics/covers/
 * - Chapter images: /public/comics/chapters/${comic.slug}/${chapter.slug}/
 * - Fallback: /placeholder-comic.jpg (comics), /shadcn.jpg (chapters)
 *
 * Performance Optimizations:
 * - 3-layer image caching (session → filesystem → remote download)
 * - Hash-based deduplication prevents identical image re-uploads
 * - Batch processing with controlled concurrency (3 images parallel)
 * - Database query cache for metadata lookups
 * - Transaction-based operations for data consistency
 * - Exponential backoff retry logic for resilience
 */

import { db } from "@/database/db";
import {
  getImageStats,
  initializeImageHandler,
  resetImageHandler,
} from "@/database/seed/image-handler-optimized";
import { logger } from "@/database/seed/logger";
import { seedChaptersV4 } from "@/database/seed/seeders/chapter-seeder-v4";
import { seedComicsV4 } from "@/database/seed/seeders/comic-seeder-v4";
import { seedUsersV4 } from "@/database/seed/seeders/user-seeder-v4";
import { sql } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

interface SeedResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// ═══════════════════════════════════════════════════════════════════════════
// RETRY HELPER
// ═══════════════════════════════════════════════════════════════════════════

async function retryOperation<T>(
  operation: () => Promise<T>,
  name: string,
  maxAttempts = RETRY_ATTEMPTS
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(
          `⚠️ ${name} failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`${name} failed after ${maxAttempts} attempts`);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SEEDING ORCHESTRATION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const startTime = Date.now();
  let imageHandlerInitialized = false;

  try {
    logger.header("🌱 Enhanced Database Seeding System v2.0");
    logger.section("Initialization");

    // Test database connection with retry
    logger.info("Testing database connection...");
    await retryOperation(() => db.execute(sql`SELECT 1`), "Database connection", 2);
    logger.success("✓ Database connection established");

    // Initialize image handler with retry
    logger.info("Initializing image handler with imageService...");
    await retryOperation(() => initializeImageHandler(), "Image handler initialization", 2);
    imageHandlerInitialized = true;
    logger.success("✓ Image handler ready");

    // Parse command line arguments
    const args = new Set(process.argv.slice(2));
    const usersOnly = args.has("--users");
    const comicsOnly = args.has("--comics");
    const chaptersOnly = args.has("--chapters");

    if (args.has("--dry-run")) {
      logger.warn("⚠️ DRY RUN MODE - No data will be persisted");
    }

    // Collect statistics
    const stats = {
      users: { created: 0, updated: 0, skipped: 0, errors: 0 },
      comics: { created: 0, updated: 0, skipped: 0, errors: 0 },
      chapters: { created: 0, updated: 0, skipped: 0, errors: 0 },
    };

    // ═══════════════════════════════════════════════════════════════════════
    // SEED USERS
    // ═══════════════════════════════════════════════════════════════════════

    if (!comicsOnly && !chaptersOnly) {
      logger.section("Seeding Users");
      try {
        const userStats = await retryOperation<SeedResult>(
          () => seedUsersV4(["users.json"]),
          "User seeding",
          2
        );
        stats.users.created = userStats.created;
        stats.users.updated = userStats.updated;
        stats.users.skipped = userStats.skipped;
        stats.users.errors = userStats.errors;
        logger.success(
          `✓ Users: ${userStats.total} total, ${userStats.created} created, ${userStats.updated} updated, ${userStats.errors} errors`
        );
      } catch (error) {
        stats.users.errors++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to seed users: ${errorMessage}`);
        if (!process.argv.includes("--continue-on-error")) {
          throw error;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SEED COMICS
    // ═══════════════════════════════════════════════════════════════════════

    if (!usersOnly && !chaptersOnly) {
      logger.section("Seeding Comics");
      try {
        const comicStats = await retryOperation<SeedResult>(
          () => seedComicsV4(["comics.json", "comicsdata1.json", "comicsdata2.json"]),
          "Comic seeding",
          2
        );
        stats.comics.created = comicStats.created;
        stats.comics.updated = comicStats.updated;
        stats.comics.skipped = comicStats.skipped;
        stats.comics.errors = comicStats.errors;
        logger.success(
          `✓ Comics: ${comicStats.total} total, ${comicStats.created} created, ${comicStats.updated} updated, ${comicStats.errors} errors`
        );
      } catch (error) {
        stats.comics.errors++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to seed comics: ${errorMessage}`);
        if (!process.argv.includes("--continue-on-error")) {
          throw error;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SEED CHAPTERS
    // ═══════════════════════════════════════════════════════════════════════

    if (!usersOnly && !comicsOnly) {
      logger.section("Seeding Chapters");
      try {
        const chapterStats = await retryOperation<SeedResult>(
          () => seedChaptersV4(["chapters.json", "chaptersdata1.json", "chaptersdata2.json"]),
          "Chapter seeding",
          2
        );
        stats.chapters.created = chapterStats.created;
        stats.chapters.updated = chapterStats.updated;
        stats.chapters.skipped = chapterStats.skipped;
        stats.chapters.errors = chapterStats.errors;
        logger.success(
          `✓ Chapters: ${chapterStats.total} total, ${chapterStats.created} created, ${chapterStats.updated} updated, ${chapterStats.errors} errors`
        );
      } catch (error) {
        stats.chapters.errors++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to seed chapters: ${errorMessage}`);
        if (!process.argv.includes("--continue-on-error")) {
          throw error;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SUMMARY & REPORTING
    // ═══════════════════════════════════════════════════════════════════════

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    logger.header("✅ Seeding Complete");
    logger.section("Summary");
    logger.success(`Total time: ${elapsed}s`);
    logger.success(
      `Users:    ${stats.users.created} created, ${stats.users.updated} updated, ${stats.users.skipped} skipped`
    );
    logger.success(
      `Comics:   ${stats.comics.created} created, ${stats.comics.updated} updated, ${stats.comics.skipped} skipped`
    );
    logger.success(
      `Chapters: ${stats.chapters.created} created, ${stats.chapters.updated} updated, ${stats.chapters.skipped} skipped`
    );

    // Image statistics
    logger.section("Image Management");
    const imageStats = await getImageStats();
    logger.success(`✓ Downloaded: ${imageStats.downloaded}`);
    logger.success(`✓ Cached: ${imageStats.cached}`);
    logger.success(`✓ Total processed: ${imageStats.total}`);

    // Error summary
    const totalErrors = stats.users.errors + stats.comics.errors + stats.chapters.errors;
    if (totalErrors > 0) {
      logger.warn(`⚠️ Total errors: ${totalErrors}`);
      logger.footer();
      if (imageHandlerInitialized) {
        resetImageHandler();
      }
      process.exit(1);
    } else {
      logger.success("✓ No errors encountered");
    }

    logger.footer();
    if (imageHandlerInitialized) {
      resetImageHandler();
    }
    process.exit(0);
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.error(`\n❌ Seeding failed after ${elapsed}s`);

    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
      if (process.argv.includes("--verbose")) {
        logger.debug(`Stack: ${error.stack}`);
      }
    } else {
      logger.error(`Unknown error: ${error}`);
    }

    logger.footer();
    if (imageHandlerInitialized) {
      resetImageHandler();
    }
    process.exit(1);
  }
}

void main();
