/**
 * Enhanced Comic Seeder
 *
 * Simplified comic seeding with:
 * - Schema validation
 * - Genre/Author/Artist extraction and linking
 * - Zod-based parsing
 * - Uses ComicDal and related DALs
 */

import { artistDal, authorDal, comicDal, genreDal } from "@/dal";
import type { comic } from "@/database/schema";
import { logger } from "@/database/seed/logger";
import { extractImageUrls, imageCacheManager } from "@/database/seed/utils/imageSeederHelper";
import {
  deduplicateByField,
  extractUniqueEntities,
  logProgress,
  safeParseInt,
  safeParseString,
  validateData,
} from "@/database/seed/utils/seederHelpers";
import type { ComicSeedData } from "@/lib/validations/comicSchema";
import { ComicSeedSchema } from "@/lib/validations/comicSchema";
import type { Author, Comic } from "@/types";
import fs from "fs/promises";
import path from "path";

/**
 * Helper: Pre-seed and cache authors
 * Creates authors if they don't exist and returns a cache map
 * @param comicsData
 */
async function preSeedAuthors(comicsData: ComicSeedData[]): Promise<Map<string, number>> {
  const authorsMap = extractUniqueEntities(
    comicsData.filter((c) => c.author !== undefined) as Array<
      ComicSeedData & { author: NonNullable<ComicSeedData["author"]> }
    >,
    "author",
    "name"
  );
  const authorCache = new Map<string, number>();

  for (const [name, author] of authorsMap) {
    if (typeof name === "string") {
      try {
        const authorName = safeParseString(author.name ?? name);
        const existing = await authorDal.findByName(authorName);

        if (!existing) {
          const created = await authorDal.create({ name: authorName } as Author);
          if (created?.id) {
            authorCache.set(authorName, created.id);
          }
        } else {
          authorCache.set(authorName, existing.id);
        }
      } catch (error) {
        logger.debug(`Error seeding author ${name}: ${error}`);
      }
    }
  }

  return authorCache;
}

/**
 * Helper: Pre-seed and cache artists
 * Creates artists if they don't exist and returns a cache map
 * @param comicsData
 */
async function preSeedArtists(comicsData: ComicSeedData[]): Promise<Map<string, number>> {
  const artistsMap = extractUniqueEntities(
    comicsData.filter((c) => c.artist !== undefined) as Array<
      ComicSeedData & { artist: NonNullable<ComicSeedData["artist"]> }
    >,
    "artist",
    "name"
  );
  const artistCache = new Map<string, number>();

  for (const [name] of artistsMap) {
    if (typeof name === "string") {
      try {
        const artistName = safeParseString(name);
        const existing = await artistDal.findByName(artistName);

        if (!existing) {
          const created = await artistDal.create({ name: artistName } as Author);
          if (created?.id) {
            artistCache.set(artistName, created.id);
          }
        } else {
          artistCache.set(artistName, existing.id);
        }
      } catch (error) {
        logger.debug(`Error seeding artist ${name}: ${error}`);
      }
    }
  }

  return artistCache;
}

/**
 * Helper: Pre-seed and cache genres
 * Creates genres if they don't exist and returns a cache map
 * @param comicsData
 */
async function preSeedGenres(comicsData: ComicSeedData[]): Promise<Map<string, number>> {
  const genresMap = extractUniqueEntities(
    comicsData.filter((c) => c.genres !== undefined && c.genres.length > 0) as Array<
      ComicSeedData & { genres: NonNullable<ComicSeedData["genres"]> }
    >,
    "genres",
    "name"
  );
  const genreCache = new Map<string, number>();

  for (const [name] of genresMap) {
    if (typeof name === "string") {
      try {
        const genreName = safeParseString(name);
        const existing = await genreDal.findBySlug(genreName);

        if (!existing) {
          const created = await genreDal.create({ name: genreName });
          if (created?.id) {
            genreCache.set(genreName, created.id);
          }
        } else {
          genreCache.set(genreName, existing.id);
        }
      } catch (error) {
        logger.debug(`Error seeding genre ${name}: ${error}`);
      }
    }
  }

  return genreCache;
}

/**
 * Helper: Link genres to comic
 * DRY function to avoid duplicating genre linking logic
 * @param comicId
 * @param genreItems
 * @param genreCache
 */
async function linkGenresToComic(
  comicId: number,
  genreItems: (string | { name?: string } | undefined)[],
  genreCache: Map<string, number>
): Promise<number> {
  const genreIds: number[] = [];

  for (const genreItem of genreItems) {
    const genreName = safeParseString(typeof genreItem === "string" ? genreItem : genreItem?.name);
    if (genreName) {
      const genreId = genreCache.get(genreName);
      if (genreId) {
        genreIds.push(genreId);
      }
    }
  }

  if (genreIds.length > 0) {
    await comicDal.assignGenres(comicId, genreIds);
    return genreIds.length;
  }

  return 0;
}

/**
 * Helper: Extract author ID from comic data
 * DRY function to handle both string and object formats
 * @param author
 * @param authorCache
 */
function extractAuthorId(
  author: string | { name?: string } | undefined,
  authorCache: Map<string, number>
): number | undefined {
  const authorName = safeParseString(typeof author === "string" ? author : author?.name);
  return authorName ? authorCache.get(authorName) : undefined;
}

/**
 * Helper: Extract artist ID from comic data
 * DRY function to handle both string and object formats
 * @param artist
 * @param artistCache
 */
function extractArtistId(
  artist: string | { name?: string } | undefined,
  artistCache: Map<string, number>
): number | undefined {
  const artistName = safeParseString(typeof artist === "string" ? artist : artist?.name);
  return artistName ? artistCache.get(artistName) : undefined;
}

/**
 * Seed comics from JSON files
 * Handles authors, artists, genres, and types
 * @param pattern
 */
export async function seedComicsFromFiles(pattern: string = "comics*.json"): Promise<{
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}> {
  logger.info("🌱 Starting comic seeding...");

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Discover matching files
  const globPattern = pattern.includes("/") ? pattern : `${pattern}`;
  const filePath = path.join(process.cwd(), globPattern.replace("*.json", "*.json"));
  const baseDir = path.dirname(filePath);
  const fileGlob = path.basename(filePath);

  try {
    const files = await fs.readdir(baseDir).catch(() => []);
    const matchingFiles = files
      .filter((f) => f.match(new RegExp(`^${fileGlob.replace("*.json", ".*\\.json$")}`)))
      .sort();

    if (matchingFiles.length === 0) {
      logger.warn(`No files matching pattern: ${pattern}`);
      return { total: 0, created: 0, updated: 0, skipped: 0, errors: 0 };
    }

    for (const fileName of matchingFiles) {
      try {
        const fullPath = path.join(baseDir, fileName);
        const fileContent = await fs.readFile(fullPath, "utf-8");
        const rawData = JSON.parse(fileContent);
        const comicsData = Array.isArray(rawData) ? rawData : [rawData];

        logger.info(`Processing ${comicsData.length} comics from ${fileName}`);

        // Deduplicate by slug
        const dedupedComics = deduplicateByField(comicsData, "slug");
        const removed = comicsData.length - dedupedComics.length;
        if (removed > 0) {
          logger.info(`Removed ${removed} duplicate comics (by slug)`);
        }

        // Pre-seed authors, artists, and genres (creates if missing)
        const authorCache = await preSeedAuthors(dedupedComics);
        const artistCache = await preSeedArtists(dedupedComics);
        const genreCache = await preSeedGenres(dedupedComics);

        // Process comics
        for (const comicData of dedupedComics) {
          try {
            const validation = await validateData(
              comicData,
              ComicSeedSchema,
              `comic: ${comicData.slug}`
            );

            if (!validation.valid) {
              totalErrors++;
              totalSkipped++;
              continue;
            }

            const validatedComic = validation.data;
            const existingComic = await comicDal.findBySlug(validatedComic.slug);

            if (!existingComic) {
              // Extract entity IDs using DRY helpers
              const authorId = extractAuthorId(validatedComic.author, authorCache);
              const artistId = extractArtistId(validatedComic.artist, artistCache);

              // Extract and cache images (prevents re-downloading)
              const imageUrls = extractImageUrls(validatedComic);
              const downloadedImages = await imageCacheManager.getOrDownloadImages(
                imageUrls,
                `Comic ${validatedComic.slug}`
              );

              // Use downloaded cover image if available, fallback to original
              const finalCoverImage = validatedComic.coverImage
                ? downloadedImages.get(validatedComic.coverImage) || validatedComic.coverImage
                : undefined;

              // Create comic via DAL
              const created = await comicDal.create({
                title: validatedComic.title,
                slug: validatedComic.slug,
                description: validatedComic.description || "",
                coverImage: finalCoverImage,
                status: validatedComic.status,
                rating: validatedComic.rating.toString(),
                authorId,
                artistId,
                typeId: safeParseInt(
                  typeof validatedComic.type === "string"
                    ? validatedComic.type
                    : validatedComic.type?.name,
                  "typeId"
                ),
              } as Comic);

              if (created?.id) {
                // Link genres using DRY helper
                if (validatedComic.genres && validatedComic.genres.length > 0) {
                  await linkGenresToComic(created.id, validatedComic.genres, genreCache);
                }
                totalCreated++;
                logger.debug(`Created comic: ${validatedComic.slug}`);
              }
            } else {
              // Extract and cache images for update
              const imageUrls = extractImageUrls(validatedComic);
              const downloadedImages = await imageCacheManager.getOrDownloadImages(
                imageUrls,
                `Comic ${validatedComic.slug}`
              );

              // Update existing comic with new data
              const updateData: Partial<typeof comic.$inferInsert> = {
                title: validatedComic.title,
                description: validatedComic.description || "",
                status: validatedComic.status,
                rating: validatedComic.rating.toString(),
                updatedAt: new Date(),
              };

              if (validatedComic.coverImage) {
                updateData.coverImage =
                  downloadedImages.get(validatedComic.coverImage) ?? validatedComic.coverImage;
              }

              await comicDal.update(existingComic.id, updateData);

              // Update genres if provided using DRY helper
              if (validatedComic.genres && validatedComic.genres.length > 0) {
                await linkGenresToComic(existingComic.id, validatedComic.genres, genreCache);
              }

              totalUpdated++;
              logger.debug(`Updated comic: ${validatedComic.slug}`);
            }

            totalProcessed++;

            if (totalProcessed % 50 === 0) {
              logProgress(
                "Comics",
                {
                  processed: totalProcessed,
                  created: totalCreated,
                  updated: totalUpdated,
                  skipped: totalSkipped,
                  errors: totalErrors,
                },
                dedupedComics.length
              );
            }
          } catch (error) {
            totalErrors++;
            logger.error(
              `Error processing comic ${comicData.slug}: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }

        logger.success(`Completed ${fileName}: ${totalCreated} created, ${totalUpdated} updated`);
      } catch (error) {
        logger.error(
          `Failed to seed from ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        totalErrors++;
      }
    }
  } catch (error) {
    logger.error(
      `Failed to read comics directory: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    totalErrors++;
  }

  const result = {
    total: totalProcessed,
    created: totalCreated,
    updated: totalUpdated,
    skipped: totalSkipped,
    errors: totalErrors,
  };
  logger.success(`Comic seeding complete: ${JSON.stringify(result)}`);
  imageCacheManager.logStats();
  return result;
}
