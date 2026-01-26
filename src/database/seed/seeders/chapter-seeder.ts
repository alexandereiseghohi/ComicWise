/**
 * Enhanced Chapter Seeder
 *
 * Simplified chapter seeding with:
 * - Schema validation
 * - Image downloading and caching
 * - Upsert logic (insert or update)
 * - Uses ChapterDal for consistency
 * - Zod-based parsing
 */

import { chapterDal } from "@/dal/chapter-dal";
import { db } from "@/database/db";
import { chapter } from "@/database/schema";
import { logger } from "@/database/seed/logger";
import { extractImageUrls, imageCacheManager } from "@/database/seed/utils/image-seeder-helper";
import { logProgress, validateData } from "@/database/seed/utils/seeder-helpers";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

/**
 * Chapter validation schema - flexible to handle multiple formats
 */
const ChapterSchema = z
  .object({
    id: z.number().optional(),
    comicId: z.number(),
    chapterNumber: z.coerce.number().min(0),
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.string().optional(),
    views: z.coerce.number().default(0),
    status: z.enum(["Draft", "Published", "Archived"]).default("Published"),
    // Image support
    pages: z.array(z.string().url()).optional(),
    coverImage: z.string().url().optional(),
    createdAt: z.coerce.date().optional(),
    publishedAt: z.coerce.date().optional(),
    // Format 1: chapters.json (nested comic object)
    name: z.string().optional(), // "Chapter 273" - optional since transformed

    url: z.string().url().optional(),
    releaseDate: z.coerce.date().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
    comic: z
      .object({
        title: z.string(),
        slug: z.string(),
      })
      .strict()
      .optional(),
    comicSlug: z.string().optional(),
    images: z
      .array(
        z
          .object({
            url: z.string().url(),
            path: z.string().optional(),
            checksum: z.string().optional(),
            status: z.string().optional(),
          })
          .strict()
      )
      .optional(),

    // Format 2: chaptersdata*.json (direct properties)
    comictitle: z.string().optional(),
    comicslug: z.string().optional(),
    chaptername: z.string().optional(),
    chaptertitle: z.string().optional(),
    chapterslug: z.string().optional(),
    image_urls: z.array(z.string().url()).optional(),
    spider: z.string().optional(),
  })
  .strict();

export type ChapterSeedData = z.infer<typeof ChapterSchema>;

/**
 * Transform raw chapter data to required fields
 * Extracts comicId from comic.slug, chapterNumber from name, generates slug
 * @param rawChapter
 * @param comicCache
 * @returns Transformed chapter data or null if missing required fields
 */
function transformChapterData(
  rawChapter: any,
  comicCache: Map<string, number>
): Partial<ChapterSeedData> | null {
  try {
    // Extract comic slug (try multiple field names)
    const comicSlug = rawChapter.comic?.slug || rawChapter.comicSlug || rawChapter.comicslug;
    if (!comicSlug) {
      return null; // Skip chapters without comic slug
    }

    // Look up comicId from cache
    const comicId = comicCache.get(comicSlug);
    if (!comicId) {
      return null; // Skip if comic not found
    }

    // Extract chapter number from name (e.g., "Chapter 273" -> 273)
    const chapterName = (rawChapter.name || rawChapter.chaptername) ?? "";
    const chapterMatch = chapterName.match(/\d+/);
    const chapterNumber = chapterMatch ? Number.parseInt(chapterMatch[0]) : Number.NaN;

    if (isNaN(chapterNumber)) {
      return null; // Skip chapters without valid chapter number
    }

    // Extract title
    const title =
      (rawChapter.title || rawChapter.chaptertitle || chapterName) ?? `Chapter ${chapterNumber}`;

    // Generate slug if not provided
    const slug =
      (rawChapter.slug || rawChapter.chapterslug) ??
      `${comicSlug}-chapter-${chapterNumber}`.toLowerCase().replaceAll(/\s+/g, "-");

    return {
      comicId,
      chapterNumber,
      title,
      slug,
      content: rawChapter.content,
      views: rawChapter.views ?? 0,
      status: rawChapter.status ?? "Published",
      createdAt: rawChapter.createdAt,
      publishedAt: rawChapter.publishedAt,
      releaseDate: rawChapter.releaseDate,
      images: rawChapter.images,
      image_urls: rawChapter.image_urls,
    };
  } catch (error) {
    logger.debug(`Error transforming chapter data: ${error}`);
    return null;
  }
}

/**
 * Build a cache of comic slugs to IDs for efficient lookup
 * @returns Map of slug -> comicId
 */
async function buildComicCache(): Promise<Map<string, number>> {
  const comicCache = new Map<string, number>();

  try {
    // Get all comics from database
    const comics = await db.query.comic.findMany({
      columns: { id: true, slug: true },
    });

    for (const comic of comics) {
      comicCache.set(comic.slug, comic.id);
    }

    logger.debug(`Built comic cache with ${comics.length} comics`);
  } catch (error) {
    logger.debug(`Error building comic cache: ${error}`);
  }

  return comicCache;
}

/**
 * Seed chapters from JSON files
 * Handles image downloads and caching
 * @param jsonFiles
 */
export async function seedChaptersFromFiles(
  jsonFiles: string[] = ["chapters.json", "chapters*.json"]
): Promise<{
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}> {
  logger.info("🌱 Starting chapter seeding...");

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Build comic cache once for all files
  const comicCache = await buildComicCache();

  for (const jsonFile of jsonFiles) {
    try {
      const filePath = path.join(process.cwd(), jsonFile);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const rawData = JSON.parse(fileContent);
      const chaptersData = Array.isArray(rawData) ? rawData : [rawData];

      logger.info(`Processing ${chaptersData.length} chapters from ${jsonFile}`);

      // Transform raw data before deduplication
      const transformedChapters = chaptersData
        .map((ch) => transformChapterData(ch, comicCache))
        .filter((ch): ch is Partial<ChapterSeedData> => ch !== null);

      if (transformedChapters.length === 0) {
        logger.warn(`No valid chapters found in ${jsonFile}`);
        continue;
      }

      // Deduplicate by comicId + chapterNumber
      const dedupedChapters = transformedChapters.filter((ch, index, array) => {
        return (
          array.findIndex(
            (c) => c.comicId === ch.comicId && c.chapterNumber === ch.chapterNumber
          ) === index
        );
      });

      const removed = chaptersData.length - dedupedChapters.length;
      if (removed > 0) {
        logger.info(`Removed ${removed} duplicate chapters`);
      }

      for (const chapterData of dedupedChapters) {
        try {
          // Validate chapter data
          const validation = await validateData(
            chapterData,
            ChapterSchema,
            `chapter: ${chapterData.comicId}-${chapterData.chapterNumber}`
          );

          if (!validation.valid) {
            totalErrors++;
            totalSkipped++;
            continue;
          }

          const validatedChapter = validation.data;

          // Extract and cache images
          const imageUrls = extractImageUrls(validatedChapter);
          const downloadedImages = await imageCacheManager.getOrDownloadImages(
            imageUrls,
            `Chapter ${validatedChapter.comicId}-${validatedChapter.chapterNumber}`
          );

          // Check if chapter exists
          const existing = await db.query.chapter.findFirst({
            where: eq(chapter.slug, validatedChapter.slug),
          });

          if (!existing) {
            // Create new chapter
            await chapterDal.create({
              comicId: validatedChapter.comicId,
              chapterNumber: validatedChapter.chapterNumber,
              title: validatedChapter.title,
              slug: validatedChapter.slug,
              content: validatedChapter.content || null,
              views: validatedChapter.views,
              status: validatedChapter.status,
              createdAt: validatedChapter.createdAt,
              updatedAt: validatedChapter.updatedAt,
            } as any);

            totalCreated++;
            logger.debug(`Created chapter: ${validatedChapter.slug}`);
          } else {
            // Update existing chapter
            await chapterDal.update(existing.id, {
              title: validatedChapter.title,
              content: validatedChapter.content || null,
              status: validatedChapter.status,
              updatedAt: new Date(),
            } as any);

            totalUpdated++;
            logger.debug(`Updated chapter: ${validatedChapter.slug}`);
          }

          totalProcessed++;

          // Log progress every 50 items
          if (totalProcessed % 50 === 0) {
            logProgress(
              "Chapters",
              {
                processed: totalProcessed,
                created: totalCreated,
                updated: totalUpdated,
                skipped: totalSkipped,
                errors: totalErrors,
              },
              dedupedChapters.length
            );
          }
        } catch (error) {
          totalErrors++;
          logger.error(
            `Error processing chapter ${chapterData.comicId}-${chapterData.chapterNumber}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      logger.success(
        `Completed ${jsonFile}: ${totalCreated} created, ${totalUpdated} updated, ${totalSkipped} skipped`
      );
    } catch (error) {
      logger.error(
        `Failed to seed from ${jsonFile}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      totalErrors++;
    }
  }

  const result = {
    total: totalProcessed,
    created: totalCreated,
    updated: totalUpdated,
    skipped: totalSkipped,
    errors: totalErrors,
  };

  logger.success(`Chapter seeding complete: ${JSON.stringify(result)}`);
  imageCacheManager.logStats();

  return result;
}

/**
 * Seed a single chapter (useful for manual operations)
 * @param chapterData
 */
export async function seedSingleChapter(chapterData: Partial<ChapterSeedData>): Promise<boolean> {
  try {
    const validation = await validateData(
      chapterData,
      ChapterSchema,
      `single chapter: ${chapterData.comicId}-${chapterData.chapterNumber}`
    );

    if (!validation.valid) {
      return false;
    }

    const validatedChapter = validation.data;

    // Extract and cache images
    const imageUrls = extractImageUrls(validatedChapter);
    await imageCacheManager.getOrDownloadImages(
      imageUrls,
      `Chapter ${validatedChapter.comicId}-${validatedChapter.chapterNumber}`
    );

    const existing = await db.query.chapter.findFirst({
      where: eq(chapter.slug, validatedChapter.slug),
    });

    if (!existing) {
      await chapterDal.create(validatedChapter as any);
      logger.success(`Created single chapter: ${validatedChapter.slug}`);
    } else {
      logger.info(`Chapter already exists: ${validatedChapter.slug}`);
    }

    return true;
  } catch (error) {
    logger.error(
      `Failed to seed single chapter: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return false;
  }
}
