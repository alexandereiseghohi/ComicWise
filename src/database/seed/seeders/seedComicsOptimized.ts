/**
 * 🌱 Optimized Comic Seeder v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 * Handles comic creation with metadata and genre management
 * Images saved to: /public/comics/covers/
 * Fallback: /placeholder-comic.jpg
 */

import { db } from "@/database/db";
import { artist, author, comic, comicImage, comicToGenre, genre, type } from "@/database/schema";
import { loadComics } from "@/database/seed/dataLoaderOptimized";
import { downloadImage, downloadImages } from "@/database/seed/imageHandlerOptimized";
import { logger } from "@/database/seed/logger";
import { FALLBACK_COMIC_IMAGE } from "@/database/seed/utils/imagePathConfig";
import { eq } from "drizzle-orm";

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

interface MetadataCache {
  types: Map<string, number>;
  authors: Map<string, number>;
  artists: Map<string, number>;
  genres: Map<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEED COMICS
// ═══════════════════════════════════════════════════════════════════════════

export async function seedComics(options: SeedOptions = {}): Promise<SeedStats> {
  const startTime = Date.now();
  const stats: SeedStats = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    logger.debug("Initializing metadata cache...");
    const cache = await initializeMetadataCache();

    logger.debug("Loading comic data from files...");
    const loadResult = await loadComics(["comics.json", "comicsdata1.json", "comicsdata2.json"]);

    if (!loadResult || !Array.isArray(loadResult.data)) {
      logger.warn("Invalid load result for comics");
      return stats;
    }

    logger.debug(`Loaded ${loadResult.valid} valid comics, ${loadResult.invalid} invalid`);

    if (loadResult.invalid > 0) {
      logger.warn(`⚠ Comic validation errors: ${loadResult.invalid}`);
    }

    if (loadResult.data.length === 0) {
      logger.warn("No valid comics found");
      return stats;
    }

    logger.info(`Processing ${loadResult.data.length} comics...`);

    // Process each comic
    for (const comicData of loadResult.data) {
      try {
        const result = await upsertComic(comicData, cache, options);
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
    logger.debug(
      `Comic seeding complete: ${stats.created} created, ${stats.updated} updated (${elapsed}s)`
    );

    if (stats.errors > 0) {
      logger.warn(`⚠ Comic seeding had ${stats.errors} errors`);
    }
  } catch (error) {
    logger.error(`Fatal error in comic seeding: ${error}`);
    stats.errors++;
  }

  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════
// METADATA CACHE
// ═══════════════════════════════════════════════════════════════════════════

async function initializeMetadataCache(): Promise<MetadataCache> {
  const cache: MetadataCache = {
    types: new Map(),
    authors: new Map(),
    artists: new Map(),
    genres: new Map(),
  };

  try {
    const [types, authors, artists, genres] = await Promise.all([
      db.query.type.findMany(),
      db.query.author.findMany(),
      db.query.artist.findMany(),
      db.query.genre.findMany(),
    ]);

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

// ═══════════════════════════════════════════════════════════════════════════
// GET OR CREATE METADATA
// ═══════════════════════════════════════════════════════════════════════════

async function getOrCreateMetadata(
  name: string | undefined,
  table: "type" | "author" | "artist" | "genre",
  cache: MetadataCache
): Promise<number | null> {
  if (!name || name === "_") return null;

  const cacheMap =
    table === "type"
      ? cache.types
      : table === "author"
        ? cache.authors
        : table === "artist"
          ? cache.artists
          : cache.genres;

  if (cacheMap.has(name)) {
    return cacheMap.get(name)!;
  }

  try {
    let result;

    switch (table) {
      case "type": {
        const existing = await db.query.type.findFirst({ where: eq(type.name, name) });
        if (!existing) {
          const created = await db.insert(type).values({ name }).returning();
          result = created[0];
        } else {
          result = existing;
        }

        break;
      }
      case "author": {
        const existing = await db.query.author.findFirst({ where: eq(author.name, name) });
        if (!existing) {
          const created = await db.insert(author).values({ name }).returning();
          result = created[0];
        } else {
          result = existing;
        }

        break;
      }
      case "artist": {
        const existing = await db.query.artist.findFirst({ where: eq(artist.name, name) });
        if (!existing) {
          const created = await db.insert(artist).values({ name }).returning();
          result = created[0];
        } else {
          result = existing;
        }

        break;
      }
      default: {
        const existing = await db.query.genre.findFirst({ where: eq(genre.name, name) });
        if (!existing) {
          const created = await db.insert(genre).values({ name }).returning();
          result = created[0];
        } else {
          result = existing;
        }
      }
    }

    if (result?.id) {
      cacheMap.set(name, result.id);
      return result.id;
    }

    return null;
  } catch (error) {
    logger.warn(`Failed to get/create ${table} '${name}': ${error}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UPSERT COMIC
// ═══════════════════════════════════════════════════════════════════════════

async function upsertComic(
  data: any,
  cache: MetadataCache,
  options: SeedOptions
): Promise<{ created: boolean; updated: boolean }> {
  try {
    const existing = await db.query.comic.findFirst({
      where: eq(comic.slug, data.slug),
    });

    // Download cover image to /public/comics/covers/
    let coverImageUrl = data.coverImage;
    if (!coverImageUrl && data.images && data.images.length > 0) {
      coverImageUrl = data.images[0].url;
    }

    if (coverImageUrl) {
      const imageResult = await downloadImage(coverImageUrl, "comics/covers");
      if (imageResult.success && imageResult.local) {
        coverImageUrl = imageResult.local;
      } else {
        // Use fallback if download fails
        coverImageUrl = FALLBACK_COMIC_IMAGE;
      }
    } else {
      // No cover image provided, use fallback
      coverImageUrl = FALLBACK_COMIC_IMAGE;
    }

    // Get/create metadata
    const typeId = await getOrCreateMetadata(data.type?.name, "type", cache);
    const authorId = await getOrCreateMetadata(data.author?.name, "author", cache);
    const artistId = await getOrCreateMetadata(data.artist?.name, "artist", cache);

    if (existing) {
      // Update existing comic
      if (!options.dryRun) {
        await db
          .update(comic)
          .set({
            description: data.description,
            coverImage: coverImageUrl || existing.coverImage,
            rating: data.rating ? String(Number.parseFloat(String(data.rating))) : existing.rating,
            status: data.status || "Ongoing",
            authorId: authorId ?? existing.authorId,
            artistId: artistId ?? existing.artistId,
            typeId: typeId ?? existing.typeId,
            updatedAt: new Date(),
          })
          .where(eq(comic.id, existing.id));

        // Update genres
        await updateComicGenres(existing.id, data.genres || [], cache);

        // Update comic images
        await updateComicImages(existing.id, data.images || []);
      }

      if (options.verbose) {
        logger.debug(`Updated comic: ${data.title}`);
      }
      return { created: false, updated: true };
    } else {
      // Create new comic
      if (!coverImageUrl) {
        logger.warn(`No cover image for comic: ${data.title}`);
        return { created: false, updated: false };
      }

      if (!options.dryRun) {
        const result = await db
          .insert(comic)
          .values({
            title: data.title,
            slug: data.slug,
            description: data.description,
            coverImage: coverImageUrl,
            publicationDate: new Date(),
            rating: data.rating ? String(Number.parseFloat(String(data.rating))) : "0",
            status: data.status || "Ongoing",
            authorId: authorId ?? undefined,
            artistId: artistId ?? undefined,
            typeId: typeId ?? undefined,
          })
          .returning();

        if (result[0]) {
          // Add genres
          await updateComicGenres(result[0].id, data.genres || [], cache);

          // Add comic images
          await updateComicImages(result[0].id, data.images || []);
        }
      }

      if (options.verbose) {
        logger.debug(`Created comic: ${data.title}`);
      }
      return { created: true, updated: false };
    }
  } catch (error) {
    logger.error(`Failed to upsert comic: ${error}`);
    return { created: false, updated: false };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UPDATE COMIC GENRES
// ═══════════════════════════════════════════════════════════════════════════

async function updateComicGenres(
  comicId: number,
  genres: Array<{ name: string }>,
  cache: MetadataCache
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

// ═══════════════════════════════════════════════════════════════════════════
// UPDATE COMIC IMAGES
// ═══════════════════════════════════════════════════════════════════════════

async function updateComicImages(comicId: number, images: Array<{ url: string }>): Promise<void> {
  try {
    if (images.length === 0) return;

    // Download images in parallel
    const urls = images.map((img) => img.url);
    const downloadResults = await downloadImages(urls, 3);

    // Remove old images
    await db.delete(comicImage).where(eq(comicImage.comicId, comicId));

    // Add new images
    let order = 1;
    for (const result of downloadResults) {
      if (result.success && result.local) {
        await db
          .insert(comicImage)
          .values({
            comicId,
            imageUrl: result.local,
            imageOrder: order++,
          })
          .onConflictDoNothing();
      }
    }
  } catch (error) {
    logger.warn(`Failed to update comic images: ${error}`);
  }
}
