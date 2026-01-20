/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ULTRA-OPTIMIZED SEED ORCHESTRATION - Production-Ready Edition
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Parallel batch processing with configurable concurrency
 * - Smart image caching (filesystem-based deduplication)
 * - Comprehensive Zod validation
 * - onConflictDoUpdate for idempotent seeding
 * - Real-time progress reporting
 * - Graceful error recovery
 *
 * Based on the battle-tested run-optimized.ts with enhanced performance
 */

import { db } from "@/database/db";
import { chapter, chapterImage, comic, comicToGenre, genre, user } from "@/database/schema";
import { imageService } from "@/services/imageService";
import { eq, sql } from "drizzle-orm";
import { existsSync } from "fs";
import { mkdir, readFile } from "fs/promises";
import pLimit from "p-limit";
import * as path from "path";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  BATCH_SIZE: 50,
  CONCURRENCY: 10,
  IMAGE_CONCURRENCY: 5,
  PLACEHOLDER_COMIC: "/placeholder-comic.jpg",
  PLACEHOLDER_USER: "/shadcn.jpg",
  PUBLIC_DIR: path.join(process.cwd(), "public"),
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SHARED SCHEMAS (from working version)
// ═══════════════════════════════════════════════════════════════════════════

const urlOrString = z.string().url().or(z.string().min(1));
const dateString = z.union([z.string().datetime(), z.string(), z.date()]).optional();
const numericString = z.union([z.string(), z.number()]).transform((value) => {
  if (typeof value === "string") {
    const number_ = Number.parseFloat(value);
    return isNaN(number_) ? 0 : number_;
  }
  return value;
});

const imageObject = z
  .object({ url: z.string().min(1) })
  .passthrough()
  .optional();
const imageArray = z
  .array(imageObject)
  .or(z.array(z.string()).transform((urls) => urls.map((url) => ({ url }))))
  .optional()
  .default([]);

const metadataNameSchema = z.object({ name: z.string().min(1).max(255) }).passthrough();
const flexibleMetadata = z
  .union([z.string().transform((name) => ({ name })), metadataNameSchema])
  .optional();

const flexibleGenresArray = z
  .array(z.union([z.string().transform((name) => ({ name })), metadataNameSchema]))
  .optional()
  .default([]);

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATED SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const UserSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    image: urlOrString.optional(),
    role: z.enum(["user", "admin", "moderator"]).default("user"),
    emailVerified: dateString,
    createdAt: dateString,
    updatedAt: dateString,
  })
  .passthrough();

const ComicSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(512),
    description: z.string().min(1).max(5000),
    coverImage: urlOrString.optional(),
    images: imageArray,
    rating: numericString.optional(),
    status: z
      .enum(["Ongoing", "Completed", "Hiatus", "Dropped", "Coming Soon", "Season End"])
      .default("Ongoing"),
    serialization: z.string().optional(),
    url: urlOrString.optional(),
    type: flexibleMetadata,
    author: flexibleMetadata,
    artist: flexibleMetadata,
    genres: flexibleGenresArray,
    views: numericString.optional(),
    updatedAt: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough()
  .transform((data) => ({
    ...data,
    images: data.images || [],
    genres: data.genres || [],
  }));

const ChapterSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(255).optional(),
    name: z.string().min(1).max(255).optional(),
    chapterNumber: numericString.optional(),
    releaseDate: dateString,
    url: urlOrString.optional(),
    views: numericString.optional(),
    images: imageArray.optional(),
    comic: z
      .object({
        title: z.string().min(1),
        slug: z.string().min(1),
      })
      .optional(),
    updatedAt: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough()
  .transform((data) => {
    let chapterNumber = data.chapterNumber || 0;
    if (!chapterNumber && data.name) {
      const match = data.name.match(/chapter\s+(\d+\.?\d*)/i);
      if (match) chapterNumber = Number.parseFloat(match[1]!);
    }
    if (!chapterNumber && data.title) {
      const match = data.title.match(/chapter\s+(\d+\.?\d*)/i);
      if (match) chapterNumber = Number.parseFloat(match[1]!);
    }

    const title = data.title || data.name || `Chapter ${chapterNumber}`;

    // Generate unique slug using comic slug + chapter title/number
    const comicSlug = data.comic?.slug || "unknown";
    const chapterPart = title
      .toLowerCase()
      .replaceAll(/[^\da-z]+/g, "-")
      .replaceAll(/^-|-$/g, "");
    const slug = `${comicSlug}-${chapterPart}`;

    return {
      ...data,
      title,
      slug,
      chapterNumber,
      images: data.images || [],
    };
  });

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ValidatedUser = z.infer<typeof UserSchema>;
type ValidatedComic = z.infer<typeof ComicSchema>;
type ValidatedChapter = z.infer<typeof ChapterSchema>;

interface SeedStats {
  users: { created: number; updated: number; errors: number; skipped: number };
  comics: { created: number; updated: number; errors: number; skipped: number };
  chapters: { created: number; updated: number; errors: number; skipped: number };
  images: { total: number; downloaded: number; cached: number; failed: number };
  duration: number;
}

interface SeedOptions {
  dryRun?: boolean;
  verbose?: boolean;
  usersOnly?: boolean;
  comicsOnly?: boolean;
  chaptersOnly?: boolean;
  skipImages?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

class Logger {
  private verbose = false;
  private startTime = Date.now();

  setVerbose(value: boolean) {
    this.verbose = value;
  }

  info(message: string) {
    console.log(`ℹ️  ${message}`);
  }

  success(message: string) {
    console.log(`✅ ${message}`);
  }

  warn(message: string) {
    console.warn(`⚠️  ${message}`);
  }

  error(message: string, error?: Error) {
    console.error(`❌ ${message}`, error?.message || "");
  }

  debug(message: string) {
    if (this.verbose) {
      console.log(`[DEBUG] ${message}`);
    }
  }

  progress(current: number, total: number, label: string) {
    if (current % 10 === 0 || current === total) {
      const percent = ((current / total) * 100).toFixed(1);
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`⏳ ${label}: ${current}/${total} (${percent}%) - ${elapsed}s`);
    }
  }
}

const logger = new Logger();

// ═══════════════════════════════════════════════════════════════════════════
// DATA LOADING
// ═══════════════════════════════════════════════════════════════════════════

async function loadJsonFile<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T[]> {
  try {
    const fullPath = path.join(process.cwd(), filePath);

    if (!existsSync(fullPath)) {
      logger.debug(`File not found: ${filePath}`);
      return [];
    }

    const fileContent = await readFile(fullPath, "utf-8");
    const rawData = JSON.parse(fileContent);
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];

    const validated: T[] = [];
    for (const item of dataArray) {
      try {
        validated.push(schema.parse(item));
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.debug(`Validation error in ${filePath}: ${error.issues[0]?.message}`);
        }
      }
    }

    logger.success(`Loaded ${validated.length} items from ${filePath}`);
    return validated;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to load ${filePath}`, new Error(errorMessage));
    return [];
  }
}

async function loadAllData() {
  logger.info("📦 Loading all data files...");

  const [users, comics1, comics2, comics3, chapters1, chapters2, chapters3] = await Promise.all([
    loadJsonFile("users.json", UserSchema),
    loadJsonFile("comics.json", ComicSchema),
    loadJsonFile("comicsdata1.json", ComicSchema),
    loadJsonFile("comicsdata2.json", ComicSchema),
    loadJsonFile("chapters.json", ChapterSchema),
    loadJsonFile("chaptersdata1.json", ChapterSchema),
    loadJsonFile("chaptersdata2.json", ChapterSchema),
  ]);

  const allComics = [...comics1, ...comics2, ...comics3];
  const allChapters = [...chapters1, ...chapters2, ...chapters3];

  const uniqueComics = [...new Map(allComics.map((c) => [c.slug, c])).values()];
  const uniqueChapters = [...new Map(allChapters.map((c) => [c.slug, c])).values()];

  logger.success(
    `📊 Data loaded: ${users.length} users, ${uniqueComics.length} comics, ${uniqueChapters.length} chapters`
  );

  return { users, comics: uniqueComics, chapters: uniqueChapters };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE HANDLING
// ═══════════════════════════════════════════════════════════════════════════

async function ensureImageExists(
  url: string | null | undefined,
  localPath: string,
  fallback: string
): Promise<string> {
  if (!url) return fallback;

  try {
    const fullPath = path.join(CONFIG.PUBLIC_DIR, localPath);
    if (existsSync(fullPath)) {
      logger.debug(`📸 Cache hit: ${localPath}`);
      return localPath;
    }

    await mkdir(path.dirname(fullPath), { recursive: true });
    const result = await imageService.downloadImage(url, path.dirname(localPath));

    if (result.success && result.localPath) {
      return result.localPath;
    }

    return fallback;
  } catch {
    logger.debug(`Image download failed: ${url}`);
    return fallback;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEEDING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function seedUsers(users: ValidatedUser[], stats: SeedStats): Promise<void> {
  logger.info(`👥 Seeding ${users.length} users...`);

  for (const userData of users) {
    try {
      const imagePath = userData.image || CONFIG.PLACEHOLDER_USER;

      await db
        .insert(user)
        .values({
          name: userData.name,
          email: userData.email,
          image: imagePath,
          role: userData.role === "admin" ? "admin" : "user",
        })
        .onConflictDoUpdate({
          target: user.email,
          set: {
            name: userData.name,
            image: imagePath,
            role: userData.role === "admin" ? "admin" : "user",
          },
        });

      stats.users.updated++;
      logger.debug(`Updated user: ${userData.email}`);
    } catch (error) {
      stats.users.errors++;
      const err = error as any;
      const message = err.message || err.toString?.() || "Unknown error";
      logger.error(`Failed to seed user: ${userData.email} - ${message}`, err);
      if (err.cause) {
        console.error("Cause:", err.cause);
      }
    }
  }

  logger.success(`Users seeded: ${stats.users.updated} updated, ${stats.users.errors} errors`);
}

async function seedComics(
  comics: ValidatedComic[],
  stats: SeedStats,
  skipImages: boolean
): Promise<void> {
  logger.info(`📚 Seeding ${comics.length} comics...`);

  for (let i = 0; i < comics.length; i += CONFIG.BATCH_SIZE) {
    const batch = comics.slice(i, i + CONFIG.BATCH_SIZE);

    await Promise.all(
      batch.map(async (comicData) => {
        try {
          const coverImageUrl =
            comicData.coverImage ||
            (comicData.images && comicData.images.length > 0 ? comicData.images[0]?.url : null);

          let coverImage: string = CONFIG.PLACEHOLDER_COMIC;
          if (!skipImages && coverImageUrl) {
            coverImage = await ensureImageExists(
              coverImageUrl,
              `/comics/covers/${comicData.slug}.jpg`,
              CONFIG.PLACEHOLDER_COMIC
            );
          }

          const rating =
            typeof comicData.rating === "string"
              ? Number.parseFloat(comicData.rating)
              : comicData.rating;

          try {
            // Check if title conflicts with existing entry (for different slug)
            let finalTitle = comicData.title;
            try {
              const existing = await db
                .select({ id: comic.id, slug: comic.slug })
                .from(comic)
                .where(eq(comic.title, finalTitle))
                .limit(1);

              if (existing.length > 0 && existing[0]!.slug !== comicData.slug) {
                // Title exists for a different comic, append slug to make it unique
                finalTitle = `${comicData.title} (${comicData.slug.split("-").pop()})`;
                logger.debug(`Title conflict resolved: ${comicData.title} -> ${finalTitle}`);
              }
            } catch {
              // Ignore check errors, will be caught by insert
            }

            const [result] = await db
              .insert(comic)
              .values({
                title: finalTitle,
                slug: comicData.slug,
                description: comicData.description || "No description available",
                coverImage,
                status: comicData.status as "Ongoing" | "Completed" | "Hiatus",
                rating: rating ? rating.toString() : "0",
                views: comicData.views || 0,
                publicationDate: new Date(),
              })
              .onConflictDoUpdate({
                target: comic.slug,
                set: {
                  title: finalTitle,
                  description: comicData.description || "No description available",
                  coverImage,
                  status: comicData.status as "Ongoing" | "Completed" | "Hiatus",
                  rating: rating ? rating.toString() : "0",
                },
              })
              .returning();

            if (result && comicData.genres && comicData.genres.length > 0) {
              for (const genreData of comicData.genres) {
                const genreName = typeof genreData === "string" ? genreData : genreData.name;
                const genreSlug = genreName.toLowerCase().replaceAll(/[^\da-z]+/g, "-");

                try {
                  const [genreResult] = await db
                    .insert(genre)
                    .values({ name: genreName })
                    .onConflictDoUpdate({
                      target: genre.name,
                      set: { name: genreName },
                    })
                    .returning();

                  if (genreResult && result.id) {
                    await db
                      .insert(comicToGenre)
                      .values({
                        comicId: result.id,
                        genreId: genreResult.id,
                      })
                      .onConflictDoNothing();
                  }
                } catch {
                  logger.debug(`Failed to link genre ${genreName} to ${comicData.slug}`);
                }
              }
            }

            stats.comics.updated++;
          } catch (insertError) {
            // Log the actual database error
            const dbError = insertError as any;
            console.error(`\n════ Comic Insert Error ════`);
            console.error(`Comic: ${comicData.title} (${comicData.slug})`);
            console.error(`Error:`, dbError);
            if (dbError.cause) console.error(`Cause:`, dbError.cause);
            if (dbError.code) console.error(`Code: ${dbError.code}`);
            if (dbError.detail) console.error(`Detail: ${dbError.detail}`);
            if (dbError.constraint) console.error(`Constraint: ${dbError.constraint}`);
            console.error(`═══════════════════════════\n`);
            throw insertError;
          }
        } catch (error) {
          stats.comics.errors++;
          const err = error as any;

          // Extract the actual PostgreSQL error if available
          let errorMessage = err.message || "Unknown error";
          if (err.cause?.message) {
            errorMessage = err.cause.message;
          }
          if (err.detail) {
            errorMessage += ` - Detail: ${err.detail}`;
          }

          logger.error(`Failed to seed comic: ${comicData.slug} - ${errorMessage}`, err);
        }
      })
    );

    logger.progress(Math.min(i + CONFIG.BATCH_SIZE, comics.length), comics.length, "Comics");
  }

  logger.success(`Comics seeded: ${stats.comics.updated} updated, ${stats.comics.errors} errors`);
}

async function seedChapters(
  chapters: ValidatedChapter[],
  comicsMap: Map<string, number>,
  stats: SeedStats,
  skipImages: boolean
): Promise<void> {
  logger.info(`📖 Seeding ${chapters.length} chapters...`);

  for (let i = 0; i < chapters.length; i += CONFIG.BATCH_SIZE) {
    const batch = chapters.slice(i, i + CONFIG.BATCH_SIZE);

    await Promise.all(
      batch.map(async (chapterData) => {
        try {
          const comicSlug = chapterData.comic?.slug;
          if (!comicSlug) {
            stats.chapters.skipped++;
            return;
          }

          const comicId = comicsMap.get(comicSlug);
          if (!comicId) {
            stats.chapters.skipped++;
            return;
          }

          const [result] = await db
            .insert(chapter)
            .values({
              slug: chapterData.slug,
              title: chapterData.title || `Chapter ${chapterData.chapterNumber}`,
              chapterNumber: chapterData.chapterNumber || 0,
              releaseDate: new Date(),
              comicId,
              views: chapterData.views || 0,
            })
            .returning();

          if (result && !skipImages && chapterData.images && chapterData.images.length > 0) {
            const imageLimit = pLimit(CONFIG.IMAGE_CONCURRENCY);

            await Promise.all(
              chapterData.images.map((imageData, imageIndex) =>
                imageLimit(async () => {
                  try {
                    const imageUrl = typeof imageData === "string" ? imageData : imageData!.url;
                    const imagePath = await ensureImageExists(
                      imageUrl,
                      `/comics/chapters/${comicSlug}/${chapterData.slug}/${imageIndex}.jpg`,
                      CONFIG.PLACEHOLDER_COMIC
                    );

                    await db
                      .insert(chapterImage)
                      .values({
                        chapterId: result.id,
                        imageUrl: imagePath,
                        pageNumber: imageIndex + 1,
                      })
                      .onConflictDoNothing();

                    stats.images.downloaded++;
                  } catch {
                    stats.images.failed++;
                  }
                })
              )
            );
          }

          stats.chapters.updated++;
        } catch (error) {
          stats.chapters.errors++;
          logger.error(`Failed to seed chapter: ${chapterData.slug}`, error as Error);
        }
      })
    );

    logger.progress(Math.min(i + CONFIG.BATCH_SIZE, chapters.length), chapters.length, "Chapters");
  }

  logger.success(
    `Chapters seeded: ${stats.chapters.updated} updated, ${stats.chapters.errors} errors`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════

export async function runUltraOptimizedSeed(options: SeedOptions = {}): Promise<SeedStats> {
  const startTime = Date.now();
  logger.setVerbose(options.verbose || false);

  const stats: SeedStats = {
    users: { created: 0, updated: 0, errors: 0, skipped: 0 },
    comics: { created: 0, updated: 0, errors: 0, skipped: 0 },
    chapters: { created: 0, updated: 0, errors: 0, skipped: 0 },
    images: { total: 0, downloaded: 0, cached: 0, failed: 0 },
    duration: 0,
  };

  try {
    logger.info("🚀 Starting Ultra-Optimized Database Seeding...");

    if (options.dryRun) {
      logger.warn("DRY RUN MODE - No data will be persisted");
      return stats;
    }

    await db.execute(sql`SELECT 1`);
    logger.success("Database connection established");

    const { users, comics, chapters } = await loadAllData();

    const existingComics = await db.select({ id: comic.id, slug: comic.slug }).from(comic);
    const comicsMap = new Map(existingComics.map((c) => [c.slug, c.id]));

    if (!options.comicsOnly && !options.chaptersOnly) {
      await seedUsers(users, stats);
    }

    if (!options.usersOnly && !options.chaptersOnly) {
      await seedComics(comics, stats, options.skipImages || false);
      const newComics = await db.select({ id: comic.id, slug: comic.slug }).from(comic);
      newComics.forEach((c) => comicsMap.set(c.slug, c.id));
    }

    if (!options.usersOnly && !options.comicsOnly) {
      await seedChapters(chapters, comicsMap, stats, options.skipImages || false);
    }

    stats.duration = Date.now() - startTime;

    logger.info("\n═══════════════════════════════════════════════════════");
    logger.success("✨ Seeding Completed Successfully!");
    logger.info("═══════════════════════════════════════════════════════");
    logger.info(`📊 Summary:`);
    logger.info(`  👥 Users: ${stats.users.updated} updated, ${stats.users.errors} errors`);
    logger.info(`  📚 Comics: ${stats.comics.updated} updated, ${stats.comics.errors} errors`);
    logger.info(
      `  📖 Chapters: ${stats.chapters.updated} updated, ${stats.chapters.errors} errors`
    );
    logger.info(`  📸 Images: ${stats.images.downloaded} processed, ${stats.images.failed} failed`);
    logger.info(`  ⏱️  Duration: ${(stats.duration / 1000).toFixed(2)}s`);
    logger.info("═══════════════════════════════════════════════════════\n");

    return stats;
  } catch (error) {
    logger.error("Fatal error during seeding", error as Error);
    throw error;
  }
}

// CLI execution
runUltraOptimizedSeed({
  verbose: process.argv.includes("--verbose"),
  dryRun: process.argv.includes("--dry-run"),
  skipImages: process.argv.includes("--skip-images"),
  usersOnly: process.argv.includes("--users"),
  comicsOnly: process.argv.includes("--comics"),
  chaptersOnly: process.argv.includes("--chapters"),
})
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
