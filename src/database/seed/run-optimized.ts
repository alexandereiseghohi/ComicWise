/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPTIMIZED SEED ORCHESTRATION - Main seeding coordinator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Handles:
 * - Sequential/parallel seeding coordination
 * - Transaction management
 * - Comprehensive error handling
 * - Detailed progress reporting
 * - Dry-run capability
 */

import { db } from "@/database/db";
import { loadAllData } from "@/database/seed/data-loader-optimized";
import { getImageHandler, getImageStats } from "@/database/seed/image-handler-optimized";
import { logger } from "@/database/seed/logger-optimized";
import { seedChapters, seedComics, seedUsers } from "@/database/seed/seeders-optimized";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

interface SeedOptions {
  dryRun?: boolean;
  verbose?: boolean;
  usersOnly?: boolean;
  comicsOnly?: boolean;
  chaptersOnly?: boolean;
}

interface SeedStats {
  users: { created: number; updated: number; skipped: number; errors: number };
  comics: { created: number; updated: number; skipped: number; errors: number };
  chapters: { created: number; updated: number; skipped: number; errors: number };
  images?: {
    total: number;
    downloaded: number;
    cached: number;
    failed: number;
  };
  totalTime?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN SEEDING FUNCTION
// ─────────────────────────────────────────────────────────────────────────

export async function runSeed(options: SeedOptions = {}): Promise<SeedStats> {
  const startTime = Date.now();
  logger.setVerbose(options.verbose ?? false);

  const stats: SeedStats = {
    users: { created: 0, updated: 0, skipped: 0, errors: 0 },
    comics: { created: 0, updated: 0, skipped: 0, errors: 0 },
    chapters: { created: 0, updated: 0, skipped: 0, errors: 0 },
  };

  try {
    // ─────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────

    logger.header("🌱 Optimized Database Seeding System v2.0");

    if (options.dryRun) {
      logger.warn("⚠️  DRY RUN MODE - No data will be persisted to database");
    }

    // Test database connection
    logger.section("System Initialization");
    logger.info("Testing database connection...");

    try {
      await db.execute(sql`SELECT 1`);
      logger.success("Database connection established");
    } catch (error) {
      logger.error(
        "Database connection failed. Ensure DATABASE_URL is set correctly.",
        error as Error
      );
      throw error;
    }

    // Initialize image handler
    logger.info("Initializing image handler...");
    const imageHandler = await getImageHandler();
    logger.success("Image handler ready");

    // ─────────────────────────────────────────────────────────────────────
    // DATA LOADING
    // ─────────────────────────────────────────────────────────────────────

    logger.section("Loading Seed Data");
    const { users: userData, comics: comicData, chapters: chapterData } = await loadAllData();

    // Report validation results
    if (userData.invalid > 0) {
      logger.warn(`⚠️  User validation: ${userData.invalid} invalid records skipped`);
    }
    if (comicData.invalid > 0) {
      logger.warn(`⚠️  Comic validation: ${comicData.invalid} invalid records skipped`);
    }
    if (chapterData.invalid > 0) {
      logger.warn(`⚠️  Chapter validation: ${chapterData.invalid} invalid records skipped`);
    }

    // ─────────────────────────────────────────────────────────────────────
    // SEEDING EXECUTION
    // ─────────────────────────────────────────────────────────────────────

    // USERS
    if (!options.comicsOnly && !options.chaptersOnly) {
      logger.section("Seeding Users");
      const userStats = await seedUsers(userData.data, {
        dryRun: options.dryRun,
        verbose: options.verbose,
      });
      stats.users = userStats;
      logger.success(
        `Users: ${userStats.created} created, ${userStats.updated} updated, ${userStats.errors} errors`,
        { component: "UserSeeder", stats: userStats }
      );
    }

    // COMICS
    if (!options.usersOnly && !options.chaptersOnly) {
      logger.section("Seeding Comics");
      const comicStats = await seedComics(comicData.data, {
        dryRun: options.dryRun,
        verbose: options.verbose,
        imageHandler,
      });
      stats.comics = comicStats;
      logger.success(
        `Comics: ${comicStats.created} created, ${comicStats.updated} updated, ${comicStats.errors} errors`,
        { component: "ComicSeeder", stats: comicStats }
      );
    }

    // CHAPTERS
    if (!options.usersOnly && !options.comicsOnly) {
      logger.section("Seeding Chapters");
      const chapterStats = await seedChapters(chapterData.data, {
        dryRun: options.dryRun,
        verbose: options.verbose,
        imageHandler,
      });
      stats.chapters = chapterStats;
      logger.success(
        `Chapters: ${chapterStats.created} created, ${chapterStats.updated} updated, ${chapterStats.errors} errors`,
        { component: "ChapterSeeder", stats: chapterStats }
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // IMAGE STATISTICS
    // ─────────────────────────────────────────────────────────────────────

    const imageStats = await getImageStats();
    stats.images = {
      total: imageStats.total,
      downloaded: imageStats.downloaded,
      cached: imageStats.cached,
      failed: imageStats.failed,
    };

    // ─────────────────────────────────────────────────────────────────────
    // SUMMARY REPORTING
    // ─────────────────────────────────────────────────────────────────────

    logger.section("Summary");

    logger.subsection("Database Operations");
    logger.metric("Users", `${stats.users.created} created, ${stats.users.updated} updated`);
    logger.metric("Comics", `${stats.comics.created} created, ${stats.comics.updated} updated`);
    logger.metric(
      "Chapters",
      `${stats.chapters.created} created, ${stats.chapters.updated} updated`
    );

    if (stats.images) {
      logger.subsection("Image Management");
      logger.metric("Session cached", stats.images.cached);
      logger.metric("Downloaded", stats.images.downloaded);
      logger.metric("Total unique", stats.images.total);

      if (stats.images.failed > 0) {
        logger.warn(`${stats.images.failed} images failed to download`);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    stats.totalTime = `${elapsed}s`;
    logger.metric("Total time", `${elapsed}s`);

    logger.success("✨ Seeding completed successfully");
    logger.footer();

    return stats;
  } catch (error) {
    logger.error("Seeding failed", error as Error);
    logger.footer();
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// CLI ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────

async function main() {
  const args = new Set(process.argv.slice(2));

  const options: SeedOptions = {
    dryRun: args.has("--dry-run"),
    verbose: args.has("--verbose"),
    usersOnly: args.has("--users"),
    comicsOnly: args.has("--comics"),
    chaptersOnly: args.has("--chapters"),
  };

  try {
    await runSeed(options);
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run if called directly with proper ES module detection
const isMainModule =
  process.argv[1]?.endsWith("run-optimized.ts") || process.argv[1]?.endsWith("run-optimized.js");

if (isMainModule) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default runSeed;
