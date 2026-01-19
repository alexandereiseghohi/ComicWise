/**
 * Enhanced Comic Seeder
 * Handles comic creation with associated metadata (authors, artists, genres, types, images)
 * Implements comprehensive upsert logic with image management
 */

import { db } from "@/database/db";
import { artist, author, comic, comicToGenre, genre, type } from "@/database/schema";
import { loadComics } from "@/database/seed/dataLoaderEnhanced";
import { getImageManager } from "@/database/seed/imageManager";
import { logger } from "@/database/seed/logger";
import type { ComicSeedData } from "@/database/seed/schemas";
import { eq } from "drizzle-orm";

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

interface CachedMetadata {
  types: Map<string, number>;
  authors: Map<string, number>;
  artists: Map<string, number>;
  genres: Map<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMIC SEEDER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Seed comics with all associated metadata and images
 * @param pattern
 */
export async function seedComicsFromFiles(
  pattern: string | string[] = "comics*.json"
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
    logger.info("Loading comic data from files...");
    const loadResult = await loadComics(pattern);
    stats.total = loadResult.valid;

    if (stats.total === 0) {
      logger.warn("No valid comics found in data files");
      return stats;
    }

    logger.info(`Processing ${stats.total} comics...`);

    // Initialize caches for metadata
    const cache = await initializeMetadataCache();
    const imageManager = await getImageManager();

    // Process each comic
    for (const comicData of loadResult.data) {
      try {
        const result = await upsertComic(comicData, cache, imageManager);
        if (result.created) {
          stats.created++;
        } else if (result.updated) {
          stats.updated++;
        } else {
          stats.skipped++;
        }
      } catch (error) {
        stats.errors++;
        logger.error(`Error processing comic ${comicData.title}: ${error}`);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(
      `Comic seeding complete: ${stats.created} created, ${stats.updated} updated (${elapsed}s)`
    );

    if (stats.errors > 0) {
      logger.warn(`Comic seeding had ${stats.errors} errors`);
    }
  } catch (error) {
    logger.error(`Fatal error in comic seeding: ${error}`);
  }

  return stats;
}

/**
 * Initialize metadata caches to avoid repeated database lookups
 */
async function initializeMetadataCache(): Promise<CachedMetadata> {
  const cache: CachedMetadata = {
    types: new Map(),
    authors: new Map(),
    artists: new Map(),
    genres: new Map(),
  };

  try {
    // Pre-load all existing metadata
    const types = await db.query.type.findMany();
    const authors = await db.query.author.findMany();
    const artists = await db.query.artist.findMany();
    const genres = await db.query.genre.findMany();

    types.forEach((t) => cache.types.set(t.name, t.id));
    authors.forEach((a) => cache.authors.set(a.name, a.id));
    artists.forEach((a) => cache.artists.set(a.name, a.id));
    genres.forEach((g) => cache.genres.set(g.name, g.id));

    logger.debug(
      `Initialized caches: ${types.length} types, ${authors.length} authors, ${artists.length} artists, ${genres.length} genres`
    );
  } catch (error) {
    logger.warn(`Failed to initialize metadata cache: ${error}`);
  }

  return cache;
}

/**
 * Get or create metadata with caching
 * @param name
 * @param table
 * @param cache
 */
async function getOrCreateMetadata(
  name: string,
  table: "type" | "author" | "artist" | "genre",
  cache: CachedMetadata
): Promise<number | null> {
  if (!name || name === "_") return null;

  // Get the correct cache map
  let cacheMap: Map<string, number>;
  switch (table) {
    case "type":
      cacheMap = cache.types;
      break;
    case "author":
      cacheMap = cache.authors;
      break;
    case "artist":
      cacheMap = cache.artists;
      break;
    case "genre":
      cacheMap = cache.genres;
      break;
    default:
      return null;
  }

  // Check cache
  if (cacheMap.has(name)) {
    return cacheMap.get(name)!;
  }

  try {
    let existing;
    let created;

    // Check database
    switch (table) {
      case "type":
        existing = await db.query.type.findFirst({ where: eq(type.name, name) });
        if (!existing) {
          const result = await db.insert(type).values({ name }).returning();
          created = result[0];
        }

        break;

      case "author":
        existing = await db.query.author.findFirst({ where: eq(author.name, name) });
        if (!existing) {
          const result = await db.insert(author).values({ name }).returning();
          created = result[0];
        }

        break;

      case "artist":
        existing = await db.query.artist.findFirst({ where: eq(artist.name, name) });
        if (!existing) {
          const result = await db.insert(artist).values({ name }).returning();
          created = result[0];
        }

        break;

      case "genre":
        existing = await db.query.genre.findFirst({ where: eq(genre.name, name) });
        if (!existing) {
          const result = await db.insert(genre).values({ name }).returning();
          created = result[0];
        }

        break;

      // No default
    }

    const id = (existing || created)?.id;
    if (id) {
      cacheMap.set(name, id);
      logger.debug(`${table}: ${name} (${id})`);
    }
    return id || null;
  } catch (error) {
    logger.warn(`Failed to get/create ${table} '${name}': ${error}`);
    return null;
  }
}

/**
 * Upsert comic with all metadata and images
 * @param data
 * @param cache
 * @param imageManager
 */
async function upsertComic(
  data: ComicSeedData,
  cache: CachedMetadata,
  imageManager: Awaited<ReturnType<typeof getImageManager>>
): Promise<{ created: boolean; updated: boolean }> {
  // Check if comic exists
  const existing = await db.query.comic.findFirst({
    where: eq(comic.slug, data.slug),
  });

  // Download cover image
  let coverImageUrl = data.coverImage || (data.images?.[0]?.url ?? null);
  if (coverImageUrl) {
    try {
      const result = await imageManager.downloadImage(coverImageUrl);
      if (result.success && result.local) {
        coverImageUrl = result.local;
      }
    } catch (error) {
      logger.warn(`Failed to download comic cover: ${error}`);
    }
  }

  // Get/create metadata
  const typeId = data.type ? await getOrCreateMetadata(data.type.name, "type", cache) : null;
  const authorId = data.author
    ? await getOrCreateMetadata(data.author.name, "author", cache)
    : null;
  const artistId = data.artist
    ? await getOrCreateMetadata(data.artist.name, "artist", cache)
    : null;

  if (existing) {
    // Update existing comic
    try {
      await db
        .update(comic)
        .set({
          description: data.description,
          coverImage: coverImageUrl || existing.coverImage,
          rating: data.rating ? String(Number.parseFloat(String(data.rating))) : undefined,
          status: (data.status as any) || "Ongoing",
          authorId: authorId ?? undefined,
          artistId: artistId ?? undefined,
          typeId: typeId ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(comic.id, existing.id));

      // Update genres
      await updateComicGenres(existing.id, data.genres || [], cache);

      logger.debug(`Updated comic: ${data.title}`);
      return { created: false, updated: true };
    } catch (error) {
      logger.warn(`Failed to update comic ${data.title}: ${error}`);
      return { created: false, updated: false };
    }
  } else {
    // Create new comic
    const publicationDate = new Date();
    if (!coverImageUrl) {
      logger.warn(`No cover image for comic: ${data.title}`);
      return { created: false, updated: false };
    }

    try {
      const result = await db
        .insert(comic)
        .values({
          title: data.title,
          slug: data.slug,
          description: data.description,
          coverImage: coverImageUrl,
          publicationDate,
          rating: data.rating ? String(Number.parseFloat(String(data.rating))) : undefined,
          status: (data.status as any) || "Ongoing",
          authorId: authorId ?? undefined,
          artistId: artistId ?? undefined,
          typeId: typeId ?? undefined,
        })
        .returning();

      if (result[0]) {
        // Add genres
        await updateComicGenres(result[0].id, data.genres || [], cache);

        logger.debug(`Created comic: ${data.title}`);
        return { created: true, updated: false };
      }
    } catch (error) {
      logger.warn(`Failed to create comic ${data.title}: ${error}`);
      return { created: false, updated: false };
    }
  }

  return { created: false, updated: false };
}

/**
 * Update comic-genre relationships
 * @param comicId
 * @param genres
 * @param cache
 */
async function updateComicGenres(
  comicId: number,
  genres: Array<{ name: string }>,
  cache: CachedMetadata
): Promise<void> {
  try {
    // Remove old associations
    await db.delete(comicToGenre).where(eq(comicToGenre.comicId, comicId));

    // Add new associations
    for (const g of genres) {
      const genreId = await getOrCreateMetadata(g.name, "genre", cache);
      if (genreId) {
        await db.insert(comicToGenre).values({ comicId, genreId }).onConflictDoNothing();
      }
    }
  } catch (error) {
    logger.warn(`Failed to update comic genres: ${error}`);
  }
}

/**
 * Clear all comics (for testing)
 */
export async function clearComics(): Promise<void> {
  try {
    logger.info("Clearing all comics...");
    await db.delete(comic);
    logger.success("All comics cleared");
  } catch (error) {
    logger.error(`Failed to clear comics: ${error}`);
  }
}
