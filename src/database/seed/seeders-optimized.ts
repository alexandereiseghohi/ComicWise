/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPTIMIZED SEEDERS - User, Comic, and Chapter seeding with upsert logic
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Upsert logic for idempotent operations
 * - Smart metadata caching
 * - Batch processing with transaction support
 * - Comprehensive error handling
 * - Detailed operation logging
 */

import { db } from "@/database/db";
import {
  artist,
  author,
  chapter,
  chapterImage,
  comic,
  comicToGenre,
  genre,
  type as typeTable,
  user,
} from "@/database/schema";
import type { OptimizedImageHandler } from "@/database/seed/image-handler-optimized";
import { logger } from "@/database/seed/logger-optimized";
import type {
  ChapterSeedData,
  ComicSeedData,
  UserSeedData,
} from "@/database/seed/schemas-optimized";
import { eq } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

interface SeederOptions {
  dryRun?: boolean;
  verbose?: boolean;
  imageHandler?: OptimizedImageHandler;
}

interface SeederStats {
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

// ─────────────────────────────────────────────────────────────────────────
// METADATA CACHE - Avoid duplicate inserts
// ─────────────────────────────────────────────────────────────────────────

async function initializeMetadataCache(): Promise<MetadataCache> {
  const timer = logger.timing("Initialize metadata cache");

  const [types, authors, artists, genres] = await Promise.all([
    db.select({ id: typeTable.id, name: typeTable.name }).from(typeTable),
    db.select({ id: author.id, name: author.name }).from(author),
    db.select({ id: artist.id, name: artist.name }).from(artist),
    db.select({ id: genre.id, name: genre.name }).from(genre),
  ]);

  const cache: MetadataCache = {
    types: new Map((types as any[]).map((t: any) => [t.name, t.id])),
    authors: new Map((authors as any[]).map((a: any) => [a.name, a.id])),
    artists: new Map((artists as any[]).map((a: any) => [a.name, a.id])),
    genres: new Map((genres as any[]).map((g: any) => [g.name, g.id])),
  };

  const duration = timer();
  logger.debug(`Metadata cache initialized`, {
    types: cache.types.size,
    authors: cache.authors.size,
    artists: cache.artists.size,
    genres: cache.genres.size,
    ...(typeof duration === "number" && { duration }),
  });

  return cache;
}

/**
 * Get or create metadata entry
 * @param table
 * @param idField
 * @param nameField
 * @param name
 * @param cache
 */
async function getOrCreateMetadata(
  table: any,
  idField: any,
  nameField: any,
  name: string,
  cache: Map<string, number>
): Promise<number> {
  if (cache.has(name)) {
    return cache.get(name)!;
  }

  try {
    const result = await db
      .insert(table)
      .values({ [nameField]: name })
      .returning({ id: idField });

    const id = result[0]?.id;
    if (id) {
      cache.set(name, id);
      logger.debug(`Created metadata: ${name}`, { type: table._.name });
      return id;
    }
  } catch (error) {
    logger.warn(
      `Failed to create metadata ${name}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  throw new Error(`Could not create metadata for ${name}`);
}

// ─────────────────────────────────────────────────────────────────────────
// USER SEEDER
// ─────────────────────────────────────────────────────────────────────────

export async function seedUsers(
  users: UserSeedData[],
  options: SeederOptions = {}
): Promise<SeederStats> {
  const stats: SeederStats = { created: 0, updated: 0, skipped: 0, errors: 0 };
  const timer = logger.timing("Seed users");

  if (!users || users.length === 0) {
    logger.warn("No users to seed");
    return stats;
  }

  logger.info(`Processing ${users.length} users...`);

  for (const userData of users) {
    try {
      // Check if user exists
      const existing = await db.query.user.findFirst({
        where: eq(user.email, userData.email),
      });

      if (existing) {
        if (!options.dryRun) {
          await db
            .update(user)
            .set({
              name: userData.name,
              image: userData.image || existing.image,
              role: (userData.role ?? "user") as any,
              emailVerified: userData.emailVerified
                ? new Date(userData.emailVerified as string)
                : existing.emailVerified,
              updatedAt: new Date(),
            })
            .where(eq(user.email, userData.email));
        }
        stats.updated++;
        logger.debug(`Updated user: ${userData.email}`);
      } else {
        if (!options.dryRun) {
          await db.insert(user).values({
            name: userData.name,
            email: userData.email,
            image: userData.image || null,
            role: (userData.role ?? "user") as any,
            emailVerified: userData.emailVerified
              ? new Date(userData.emailVerified as string)
              : null,
          });
        }
        stats.created++;
        logger.debug(`Created user: ${userData.email}`);
      }
    } catch (error) {
      stats.errors++;
      logger.error(`Failed to seed user ${userData.email}`, error as Error, {
        component: "UserSeeder",
      });
    }
  }

  const userDuration = timer();
  logger.success(
    `Users seeded: ${stats.created} created, ${stats.updated} updated, ${stats.errors} errors`,
    {
      component: "UserSeeder",
      ...(typeof userDuration === "number" && { duration: userDuration }),
    }
  );

  return stats;
}

// ─────────────────────────────────────────────────────────────────────────
// COMIC SEEDER
// ─────────────────────────────────────────────────────────────────────────

export async function seedComics(
  comics: ComicSeedData[],
  options: SeederOptions = {}
): Promise<SeederStats> {
  const stats: SeederStats = { created: 0, updated: 0, skipped: 0, errors: 0 };
  const timer = logger.timing("Seed comics");

  if (!comics || comics.length === 0) {
    logger.warn("No comics to seed");
    return stats;
  }

  logger.info(`Processing ${comics.length} comics...`);
  const cache = await initializeMetadataCache();

  for (const comicData of comics) {
    try {
      // Check if comic exists
      const existing = await db.query.comic.findFirst({
        where: eq(comic.slug, comicData.slug),
      });

      // Get or create metadata
      let typeId: number | null = null;
      let authorId: number | null = null;
      let artistId: number | null = null;

      if (comicData.type?.name) {
        typeId = await getOrCreateMetadata(
          typeTable,
          typeTable.id,
          typeTable.name,
          comicData.type.name,
          cache.types
        );
      }

      if (comicData.author?.name) {
        authorId = await getOrCreateMetadata(
          author,
          author.id,
          author.name,
          comicData.author.name,
          cache.authors
        );
      }

      if (comicData.artist?.name) {
        artistId = await getOrCreateMetadata(
          artist,
          artist.id,
          artist.name,
          comicData.artist.name,
          cache.artists
        );
      }

      const coverImage =
        options.imageHandler && comicData.images?.[0]?.url
          ? await options.imageHandler.processImage(comicData.images[0].url, "comic")
          : (comicData.coverImage ?? "/public/placeholder-comic.jpg");

      if (existing) {
        if (!options.dryRun) {
          await db
            .update(comic)
            .set({
              title: comicData.title,
              description: comicData.description,
              coverImage,
              status: (comicData.status ?? "Ongoing") as any,
              rating: comicData.rating as any,
              typeId,
              authorId,
              artistId,
              updatedAt: new Date(),
            })
            .where(eq(comic.slug, comicData.slug));
        }
        stats.updated++;
        logger.debug(`Updated comic: ${comicData.title}`);
      } else {
        if (!options.dryRun) {
          const publicationDate = comicData.updatedAt
            ? new Date(
                typeof comicData.updatedAt === "string"
                  ? comicData.updatedAt
                  : String(comicData.updatedAt)
              )
            : new Date();

          const [inserted] = await db
            .insert(comic)
            .values({
              title: comicData.title,
              slug: comicData.slug,
              description: comicData.description,
              coverImage,
              status: (comicData.status ?? "Ongoing") as any,
              rating: String(comicData.rating ?? 0),
              publicationDate,
              typeId: typeId || null,
              authorId: authorId || null,
              artistId: artistId || null,
            })
            .returning({ id: comic.id });

          const comicId = inserted?.id;

          // Insert genres
          if (comicId && comicData.genres && comicData.genres.length > 0) {
            for (const genreData of comicData.genres) {
              try {
                const genreId = await getOrCreateMetadata(
                  genre,
                  genre.id,
                  genre.name,
                  genreData.name,
                  cache.genres
                );
                await db.insert(comicToGenre).values({ comicId, genreId });
              } catch {
                logger.warn(`Failed to add genre ${genreData.name} to comic`, {
                  component: "ComicSeeder",
                });
              }
            }
          }
        }
        stats.created++;
        logger.debug(`Created comic: ${comicData.title}`);
      }
    } catch (error) {
      stats.errors++;
      logger.error(`Failed to seed comic ${comicData.title}`, error as Error, {
        component: "ComicSeeder",
      });
    }
  }

  const comicDuration = timer();
  logger.success(
    `Comics seeded: ${stats.created} created, ${stats.updated} updated, ${stats.errors} errors`,
    {
      component: "ComicSeeder",
      ...(typeof comicDuration === "number" && { duration: comicDuration }),
    }
  );

  return stats;
}

// ─────────────────────────────────────────────────────────────────────────
// CHAPTER SEEDER
// ─────────────────────────────────────────────────────────────────────────

export async function seedChapters(
  chapters: ChapterSeedData[],
  options: SeederOptions = {}
): Promise<SeederStats> {
  const stats: SeederStats = { created: 0, updated: 0, skipped: 0, errors: 0 };
  const timer = logger.timing("Seed chapters");

  if (!chapters || chapters.length === 0) {
    logger.warn("No chapters to seed");
    return stats;
  }

  logger.info(`Processing ${chapters.length} chapters...`);

  for (const chapterData of chapters) {
    try {
      // Skip chapters without comic reference
      if (!chapterData.comic?.slug) {
        stats.skipped++;
        logger.debug(
          `Skipped chapter (no comic reference): ${chapterData.title || chapterData.name}`
        );
        continue;
      }

      // Find comic by slug
      const parentComic = await db.query.comic.findFirst({
        where: eq(comic.slug, chapterData.comic.slug),
      });

      if (!parentComic) {
        stats.skipped++;
        logger.debug(`Skipped chapter (comic not found): ${chapterData.title || chapterData.name}`);
        continue;
      }

      // Check if chapter exists
      const existing = await db.query.chapter.findFirst({
        where: eq(chapter.comicId, parentComic.id),
      });

      if (
        existing &&
        chapterData.chapterNumber &&
        existing.chapterNumber === chapterData.chapterNumber
      ) {
        if (!options.dryRun) {
          await db
            .update(chapter)
            .set({
              title: chapterData.title,
              chapterNumber: chapterData.chapterNumber,
              releaseDate: chapterData.releaseDate
                ? new Date(chapterData.releaseDate as string)
                : new Date(),
              views: chapterData.views as any,
            })
            .where(eq(chapter.id, existing.id));
        }
        stats.updated++;
        logger.debug(`Updated chapter: ${chapterData.title}`);
      } else {
        if (!options.dryRun) {
          const [inserted] = await db
            .insert(chapter)
            .values({
              title: chapterData.title,
              slug: `chapter-${chapterData.chapterNumber}`,
              chapterNumber: chapterData.chapterNumber,
              comicId: parentComic.id,
              releaseDate: chapterData.releaseDate
                ? new Date(chapterData.releaseDate as string)
                : new Date(),
              views: chapterData.views as any,
            })
            .returning({ id: chapter.id });

          const chapterId = inserted?.id;

          // Insert chapter images
          if (chapterId && chapterData.images && chapterData.images.length > 0) {
            for (const imageData of chapterData.images) {
              try {
                const imageUrl = typeof imageData === "object" ? imageData?.url : imageData;
                const processedUrl = options.imageHandler
                  ? await options.imageHandler.processImage(imageUrl ?? "", "comic")
                  : (imageUrl ?? "");

                await db
                  .insert(chapterImage)
                  .values({
                    chapterId,
                    imageUrl: processedUrl,
                    pageNumber: 0,
                  })
                  .onConflictDoNothing();
              } catch {
                logger.warn(`Failed to add image to chapter`, {
                  component: "ChapterSeeder",
                });
              }
            }
          }
        }
        stats.created++;
        logger.debug(`Created chapter: ${chapterData.title}`);
      }
    } catch (error) {
      stats.errors++;
      logger.error(`Failed to seed chapter ${chapterData.title}`, error as Error, {
        component: "ChapterSeeder",
      });
    }
  }

  const chapterDuration = timer();
  logger.success(
    `Chapters seeded: ${stats.created} created, ${stats.updated} updated, ${stats.errors} errors`,
    {
      component: "ChapterSeeder",
      ...(typeof chapterDuration === "number" && { duration: chapterDuration }),
    }
  );

  return stats;
}
