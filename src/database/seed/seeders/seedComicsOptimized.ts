/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable typescript-eslint/no-non-null-assertion */
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
import type { InferSelectModel } from "drizzle-orm";
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

type ComicStatus = "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Season End" | "Coming Soon";

interface ComicData {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  rating?: string | number;
  status?: string;
  type?: { name: string };
  author?: { name: string };
  artist?: { name: string };
  genres?: Array<{ name: string }>;
  images?: Array<{ url: string }>;
}

interface MetadataCache {
  types: Map<string, number>;
  authors: Map<string, number>;
  artists: Map<string, number>;
  genres: Map<string, number>;
}

type TypeEntity = InferSelectModel<typeof type>;
type AuthorEntity = InferSelectModel<typeof author>;
type ArtistEntity = InferSelectModel<typeof artist>;
type GenreEntity = InferSelectModel<typeof genre>;

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

    logger.debug(`Loaded ${loadResult.data.length} valid comics from data files`);

    if (loadResult.data.length === 0) {
      logger.warn("No valid comics found");
      return stats;
    }

    logger.info(`Processing ${loadResult.data.length} comics...`);

    // Process each comic
    for (const comicData of loadResult.data) {
      try {
        // Filter out undefined images and map to match ComicData type
        const sanitizedImages =
          comicData.images
            ?.filter((img): img is { url: string } => img?.url !== undefined)
            .map((img) => ({ url: img!.url })) ?? undefined;

        const sanitizedComicData: ComicData = {
          ...comicData,
          images: sanitizedImages,
        };

        const result = await upsertComic(sanitizedComicData, cache, options);
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
    const [typeEntities, authorEntities, artistEntities, genreEntities] = await Promise.all([
      db.query.type.findMany(),
      db.query.author.findMany(),
      db.query.artist.findMany(),
      db.query.genre.findMany(),
    ]);

    for (const t of typeEntities) {
      cache.types.set(t.name, t.id);
    }
    for (const a of authorEntities) {
      cache.authors.set(a.name, a.id);
    }
    for (const a of artistEntities) {
      cache.artists.set(a.name, a.id);
    }
    for (const g of genreEntities) {
      cache.genres.set(g.name, g.id);
    }

    logger.debug(
      `Initialized caches: ${typeEntities.length} types, ${authorEntities.length} authors, ${artistEntities.length} artists, ${genreEntities.length} genres`
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
    const cachedId = cacheMap.get(name);
    return cachedId ?? null;
  }

  try {
    let result: TypeEntity | AuthorEntity | ArtistEntity | GenreEntity | undefined;

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
// HELPER: VALIDATE COMIC STATUS
// ═══════════════════════════════════════════════════════════════════════════

function validateComicStatus(status: string | undefined): ComicStatus {
  const validStatuses: ComicStatus[] = [
    "Ongoing",
    "Hiatus",
    "Completed",
    "Dropped",
    "Season End",
    "Coming Soon",
  ];
  if (status && validStatuses.includes(status as ComicStatus)) {
    return status as ComicStatus;
  }
  return "Ongoing";
}

// ═══════════════════════════════════════════════════════════════════════════
// UPSERT COMIC
// ═══════════════════════════════════════════════════════════════════════════

async function upsertComic(
  data: ComicData,
  cache: MetadataCache,
  options: SeedOptions
): Promise<{ created: boolean; updated: boolean }> {
  try {
    const existing = await db.query.comic.findFirst({
      where: eq(comic.slug, data.slug),
    });

    // Download cover image to /public/comics/covers/
    let coverImageUrl: string = data.coverImage ?? data.images?.[0]?.url ?? FALLBACK_COMIC_IMAGE;

    if (coverImageUrl && coverImageUrl !== FALLBACK_COMIC_IMAGE) {
      const imageResult = await downloadImage(coverImageUrl, "comic");
      // downloadImage returns the local path string directly, or fallback on error
      coverImageUrl =
        typeof imageResult === "string" && imageResult ? imageResult : FALLBACK_COMIC_IMAGE;
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
            rating:
              data.rating !== undefined
                ? String(Number.parseFloat(String(data.rating)))
                : existing.rating,
            status: validateComicStatus(data.status),
            authorId: authorId ?? existing.authorId,
            artistId: artistId ?? existing.artistId,
            typeId: typeId ?? existing.typeId,
            updatedAt: new Date(),
          })
          .where(eq(comic.id, existing.id));

        // Update genres
        await updateComicGenres(existing.id, data.genres ?? [], cache);

        // Update comic images
        await updateComicImages(existing.id, data.images ?? []);
      }

      if (options.verbose) {
        logger.debug(`Updated comic: ${data.title}`);
      }
      return { created: false, updated: true };
    } else {
      // Create new comic
      if (!options.dryRun) {
        const result = await db
          .insert(comic)
          .values({
            title: data.title,
            slug: data.slug,
            description: data.description ?? "",
            coverImage: coverImageUrl,
            publicationDate: new Date(),
            rating:
              data.rating !== undefined ? String(Number.parseFloat(String(data.rating))) : "0",
            status: validateComicStatus(data.status),
            authorId: authorId ?? undefined,
            artistId: artistId ?? undefined,
            typeId: typeId ?? undefined,
          })
          .returning();

        if (result[0]) {
          // Add genres
          await updateComicGenres(result[0].id, data.genres ?? [], cache);

          // Add comic images
          await updateComicImages(result[0].id, data.images ?? []);
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
    const downloadResults = await downloadImages(urls, "comic");

    // Remove old images
    await db.delete(comicImage).where(eq(comicImage.comicId, comicId));

    // Add new images
    let order = 1;
    for (const localPath of downloadResults) {
      // downloadImages returns array of strings (local paths)
      // Skip if download failed (empty string or fallback)
      if (localPath && localPath !== FALLBACK_COMIC_IMAGE) {
        await db
          .insert(comicImage)
          .values({
            comicId,
            imageUrl: localPath,
            imageOrder: order++,
          })
          .onConflictDoNothing();
      }
    }
  } catch (error) {
    logger.warn(`Failed to update comic images: ${error}`);
  }
}
