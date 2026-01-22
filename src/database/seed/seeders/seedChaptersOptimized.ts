/**
 * 🌱 Optimized Chapter Seeder v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 * Handles chapter creation with image management
 * Images saved to: /public/comics/chapters/${comic.slug}/${chapter.slug}/
 * Fallback: /shadcn.jpg
 */

import { db } from "@/database/db";
import { chapter, chapterImage, comic } from "@/database/schema";
import { loadChapters } from "@/database/seed/dataLoaderOptimized";
import { downloadImages } from "@/database/seed/imageHandlerOptimized";
import { logger } from "@/database/seed/logger";
import { FALLBACK_CHAPTER_IMAGE } from "@/database/seed/utils/imagePathConfig";
import { and, eq } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SeedOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

interface SeedStats {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEED CHAPTERS
// ═══════════════════════════════════════════════════════════════════════════

export async function seedChapters(options: SeedOptions = {}): Promise<SeedStats> {
  const startTime = Date.now();
  const stats: SeedStats = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    logger.debug("Loading chapter data from files...");
    const loadResult = await loadChapters([
      "chapters.json",
      "chaptersdata1.json",
      "chaptersdata2.json",
    ]);

    if (!loadResult || !Array.isArray(loadResult.data)) {
      logger.warn("Invalid load result for chapters");
      return stats;
    }

    logger.debug(`Loaded ${loadResult.valid} valid chapters, ${loadResult.invalid} invalid`);

    if (loadResult.invalid > 0) {
      logger.warn(`⚠ Chapter validation errors: ${loadResult.invalid}`);
    }

    if (loadResult.data.length === 0) {
      logger.warn("No valid chapters found");
      return stats;
    }

    logger.info(`Processing ${loadResult.data.length} chapters...`);

    // Process each chapter
    for (const chapterData of loadResult.data) {
      try {
        // Skip chapters with missing comic data
        if (!chapterData.comic) {
          logger.warn(`Skipping chapter "${chapterData.title}": missing comic data`);
          stats.skipped++;
          continue;
        }

        // TypeScript now knows comic is defined due to the check above
        const result = await upsertChapter(
          {
            ...chapterData,
            comic: chapterData.comic, // This is now guaranteed to be defined
            images: chapterData.images?.filter(
              (img): img is { url: string } =>
                img !== undefined && typeof img === "object" && "url" in img
            ) as Array<{ url: string }> | undefined,
          },
          options
        );
        if (result.created) {
          stats.created++;
        } else if (result.updated) {
          stats.updated++;
        } else {
          stats.skipped++;
        }
      } catch (error) {
        stats.errors++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error processing chapter ${chapterData.title}: ${errorMessage}`);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.debug(
      `Chapter seeding complete: ${stats.created} created, ${stats.updated} updated (${elapsed}s)`
    );

    if (stats.errors > 0) {
      logger.warn(`⚠ Chapter seeding had ${stats.errors} errors`);
    }
  } catch (error) {
    logger.error(`Fatal error in chapter seeding: ${error}`);
    stats.errors++;
  }

  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════
// UPSERT CHAPTER
// ═══════════════════════════════════════════════════════════════════════════

async function upsertChapter(
  data: {
    title: string;
    comic: { slug: string; title: string };
    chapterNumber: string | number;
    releaseDate?: string | Date;
    views?: string | number;
    images?: Array<{ url: string }>;
  },
  options: SeedOptions
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
    const slug = data.title
      .toLowerCase()
      .replaceAll(/[^\s\w-]/g, "")
      .replaceAll(/\s+/g, "-")
      .slice(0, 255);

    // Parse chapter number
    const chapterNumber =
      typeof data.chapterNumber === "string"
        ? Number.parseFloat(data.chapterNumber)
        : data.chapterNumber;

    // Parse dates
    const releaseDate = data.releaseDate ? new Date(data.releaseDate) : new Date();
    const views = typeof data.views === "string" ? Number.parseInt(data.views) : data.views || 0;

    // Check if chapter exists
    const existing = await db.query.chapter.findFirst({
      where: and(eq(chapter.comicId, comicRecord.id), eq(chapter.chapterNumber, chapterNumber)),
    });

    if (existing) {
      // Update existing chapter
      if (!options.dryRun) {
        await db
          .update(chapter)
          .set({
            title: data.title,
            slug,
            releaseDate,
            views,
          })
          .where(eq(chapter.id, existing.id));

        // Update chapter images
        await updateChapterImages(existing.id, comicRecord.slug, slug, data.images || []);
      }

      if (options.verbose) {
        logger.debug(`Updated chapter: ${data.title}`);
      }
      return { created: false, updated: true };
    } else {
      // Create new chapter
      if (!options.dryRun) {
        const result = await db
          .insert(chapter)
          .values({
            slug,
            title: data.title,
            chapterNumber,
            comicId: comicRecord.id,
            releaseDate,
            views,
          })
          .returning();

        if (result[0]) {
          // Add chapter images
          await updateChapterImages(result[0].id, comicRecord.slug, slug, data.images || []);
        }
      }

      if (options.verbose) {
        logger.debug(`Created chapter: ${data.title}`);
      }
      return { created: true, updated: false };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to upsert chapter: ${errorMessage}`);
    return { created: false, updated: false };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UPDATE CHAPTER IMAGES
// ═══════════════════════════════════════════════════════════════════════════

async function updateChapterImages(
  chapterId: number,
  comicSlug: string,
  chapterSlug: string,
  imageUrls: Array<{ url: string }>
): Promise<void> {
  try {
    if (imageUrls.length === 0) {
      return;
    }

    // Extract URLs
    const urls = imageUrls.map((img) => img.url);

    // Download images to /public/comics/chapters/${comic.slug}/${chapterSlug}/
    const downloadResults = await downloadImages(urls);

    // Remove old images
    await db.delete(chapterImage).where(eq(chapterImage.chapterId, chapterId));

    // Add new images
    let pageNumber = 1;
    for (const result of downloadResults) {
      // downloadImages returns an array of local paths (strings)
      // Use the result directly as it's already the local path or empty string
      const imageUrl = result || FALLBACK_CHAPTER_IMAGE;
      await db
        .insert(chapterImage)
        .values({
          chapterId,
          imageUrl,
          pageNumber,
        })
        .onConflictDoNothing();

      pageNumber++;
    }

    const successCount = downloadResults.filter((r) => r && r !== FALLBACK_CHAPTER_IMAGE).length;
    logger.debug(`Added ${successCount}/${imageUrls.length} images to chapter ${chapterSlug}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(`Failed to update chapter images: ${errorMessage}`);
  }
}
