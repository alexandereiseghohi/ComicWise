/**
 * Enhanced Chapter Seeder
 * Handles chapter creation with image management and comic association
 * Implements comprehensive upsert logic with batch image processing
 */

import { db } from "@/database/db";
import { chapter, chapterImage, comic } from "@/database/schema";
import { loadChapters } from "@/database/seed/dataLoaderEnhanced";
import { getImageManager } from "@/database/seed/imageManager";
import { logger } from "@/database/seed/logger";
import type { ChapterSeedData } from "@/database/seed/schemas";
import { and, eq } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface SeedStats {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAPTER SEEDER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Seed chapters from JSON files with all images
 * @param patterns
 */
export async function seedChaptersFromFiles(
  patterns: string[] = ["chapters*.json"]
): Promise<SeedStats> {
  const startTime = Date.now();
  const stats: SeedStats = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    logger.info("Loading chapter data from files...");
    const loadResult = await loadChapters(patterns);
    stats.total = loadResult.valid;

    if (stats.total === 0) {
      logger.warn("No valid chapters found in data files");
      return stats;
    }

    logger.info(`Processing ${stats.total} chapters...`);

    const imageManager = await getImageManager();

    // Process each chapter
    for (const chapterData of loadResult.data) {
      try {
        const result = await upsertChapter(chapterData, imageManager);
        if (result.created) {
          stats.created++;
        } else if (result.updated) {
          stats.updated++;
        } else {
          stats.skipped++;
        }
      } catch (error) {
        stats.errors++;
        logger.error(`Error processing chapter ${chapterData.title}: ${error}`);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(
      `Chapter seeding complete: ${stats.created} created, ${stats.updated} updated (${elapsed}s)`
    );

    if (stats.errors > 0) {
      logger.warn(`Chapter seeding had ${stats.errors} errors`);
    }
  } catch (error) {
    logger.error(`Fatal error in chapter seeding: ${error}`);
  }

  return stats;
}

/**
 * Upsert chapter with associated images
 * @param data
 * @param imageManager
 */
async function upsertChapter(
  data: ChapterSeedData,
  imageManager: Awaited<ReturnType<typeof getImageManager>>
): Promise<{ created: boolean; updated: boolean }> {
  try {
    // Find associated comic
    const comicRecord = await db.query.comic.findFirst({
      where: eq(comic.slug, data.comic.slug),
    });

    if (!comicRecord) {
      logger.warn(`Comic not found for chapter: ${data.comic.title}`);
      return { created: false, updated: false };
    }

    // Generate slug from title
    const slug = data.title.toLowerCase().replaceAll(/\s+/g, "-").slice(0, 255);

    // Parse dates
    const releaseDate = data.releaseDate ? new Date(data.releaseDate) : new Date();

    // Check if chapter exists by comicId and chapterNumber
    const existing = await db.query.chapter.findFirst({
      where: and(
        eq(chapter.comicId, comicRecord.id),
        eq(chapter.chapterNumber, data.chapterNumber)
      ),
    });

    if (existing) {
      // Update existing chapter
      await db
        .update(chapter)
        .set({
          title: data.title,
          releaseDate,
          views: data.views,
        })
        .where(eq(chapter.id, existing.id));

      // Update chapter images
      await updateChapterImages(existing.id, data.images || [], imageManager);

      logger.debug(`Updated chapter: ${data.title}`);
      return { created: false, updated: true };
    } else {
      // Create new chapter
      const result = await db
        .insert(chapter)
        .values({
          slug,
          title: data.title,
          chapterNumber: data.chapterNumber,
          comicId: comicRecord.id,
          releaseDate,
          views: data.views || 0,
        })
        .returning();

      if (result[0]) {
        // Add chapter images
        await updateChapterImages(result[0].id, data.images || [], imageManager);

        logger.debug(`Created chapter: ${data.title}`);
        return { created: true, updated: false };
      }
    }

    return { created: false, updated: false };
  } catch (error) {
    logger.error(`Failed to upsert chapter: ${error}`);
    return { created: false, updated: false };
  }
}

/**
 * Update chapter images with deduplication and parallel downloads
 * @param chapterId
 * @param imageUrls
 * @param imageManager
 */
async function updateChapterImages(
  chapterId: number,
  imageUrls: Array<{ url: string }>,
  imageManager: Awaited<ReturnType<typeof getImageManager>>
): Promise<void> {
  try {
    if (imageUrls.length === 0) {
      return;
    }

    // Extract URLs
    const urls = imageUrls.map((img) => img.url);

    // Remove old images
    await db.delete(chapterImage).where(eq(chapterImage.chapterId, chapterId));

    // Download images in parallel with rate limiting
    const downloadedImages = await imageManager.downloadImages(urls, 3);

    // Save image records
    let pageNumber = 1;
    for (const result of downloadedImages) {
      if (result.success && result.local) {
        await db
          .insert(chapterImage)
          .values({
            chapterId,
            imageUrl: result.local,
            pageNumber,
          })
          .onConflictDoNothing();

        pageNumber++;
      }
    }

    logger.debug(`Added ${downloadedImages.filter((r) => r.success).length} images to chapter`);
  } catch (error) {
    logger.warn(`Failed to update chapter images: ${error}`);
  }
}

/**
 * Clear all chapters (for testing)
 */
export async function clearChapters(): Promise<void> {
  try {
    logger.info("Clearing all chapters...");
    await db.delete(chapter);
    logger.success("All chapters cleared");
  } catch (error) {
    logger.error(`Failed to clear chapters: ${error}`);
  }
}
