/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED PRODUCTION SEED RUNNER v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Comprehensive Zod validation for all data sources
 * - Smart image downloading with deduplication (avoid downloading twice)
 * - onConflictDoUpdate for all entities (idempotent seeding)
 * - Progress tracking with detailed logs
 * - Batch processing with configurable concurrency
 * - Proper error handling and recovery
 * - CUSTOM_PASSWORD support for users
 * - Fallback images for missing assets
 *
 * Data Sources:
 * - users.json
 * - comics.json, comicsdata1.json, comicsdata2.json
 * - chapters.json, chaptersdata1.json, chaptersdata2.json
 */

import { db } from "@/database/db";
import {
  artist,
  author,
  chapter,
  chapterImage,
  comic,
  comicImage,
  comicToGenre,
  type as comicType,
  genre,
  user,
} from "@/database/schema";
import { env } from "@/lib/env";
import { imageService } from "@/services/imageService";
import { hashPassword } from "auth";
import { eq } from "drizzle-orm";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import pLimit from "p-limit";
import * as path from "path";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  BATCH_SIZE: 50,
  CONCURRENCY: 5, // Reduced from 10 to avoid connection pool exhaustion
  IMAGE_CONCURRENCY: 2, // Reduced from 3
  PLACEHOLDER_COMIC: "/placeholder-comic.jpg",
  PLACEHOLDER_USER: "/shadcn.jpg",
  PUBLIC_DIR: path.join(process.cwd(), "public"),
  COMICS_COVERS_DIR: path.join(process.cwd(), "public", "comics", "covers"),
  CHAPTERS_DIR: path.join(process.cwd(), "public", "comics", "chapters"),
  CUSTOM_PASSWORD: env.CUSTOM_PASSWORD || "DefaultPassword123!",
  MAX_RETRIES: 3, // Number of retry attempts
  RETRY_DELAY: 1000, // Delay between retries in ms
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract file extension from URL
 * @param url
 */
function getFileExtension(url: string): string {
  try {
    const urlObject = new URL(url);
    const pathname = urlObject.pathname;
    const match = pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
    return match ? match[0] : ".jpg"; // Default to .jpg
  } catch {
    return ".jpg";
  }
}

/**
 * Retry function with exponential backoff
 * @param fn
 * @param retries
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = CONFIG.MAX_RETRIES
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = CONFIG.RETRY_DELAY * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries reached");
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE TRACKING (avoid downloading same image twice)
// ═══════════════════════════════════════════════════════════════════════════

const downloadedImages = new Map<string, string>();
const imageCache = new Map<string, string>();

/**
 * Load persisted image cache from disk
 */
async function loadImageCache() {
  const cachePath = path.join(CONFIG.PUBLIC_DIR, ".seed-image-cache.json");
  try {
    if (existsSync(cachePath)) {
      const data = await readFile(cachePath, "utf-8");
      const cached = JSON.parse(data);
      Object.entries(cached).forEach(([url, localPath]) => {
        imageCache.set(url, localPath as string);
      });
      console.log(`✓ Loaded ${imageCache.size} cached image mappings`);
    }
  } catch (error) {
    console.warn("⚠️  Could not load image cache:", error);
  }
}

/**
 * Persist image cache to disk
 */
async function saveImageCache() {
  const cachePath = path.join(CONFIG.PUBLIC_DIR, ".seed-image-cache.json");
  try {
    const cacheObject = Object.fromEntries(imageCache.entries());
    await writeFile(cachePath, JSON.stringify(cacheObject, null, 2));
    console.log(`✓ Saved ${imageCache.size} image mappings to cache`);
  } catch (error) {
    console.warn("⚠️  Could not save image cache:", error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const UserSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().optional(),
  image: z.string().nullable().optional(),
  role: z.enum(["user", "admin", "moderator"]).default("user"),
  emailVerified: z.coerce.date().nullable().optional(),
  status: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  lastActivityDate: z.coerce.date().nullable().optional(),
});

const ComicSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(512),
  description: z.string().min(1).max(5000),
  coverImage: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        path: z.string().optional(),
        checksum: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .optional(),
  image_urls: z.array(z.string().url()).optional(),
  rating: z.coerce.number().max(10.0).default(0),
  status: z
    .enum(["Ongoing", "Completed", "Hiatus", "Dropped", "Coming Soon", "Season End"])
    .default("Ongoing"),
  serialization: z.string().optional(),
  url: z.string().url().optional(),
  type: z
    .union([z.object({ name: z.string() }), z.string()])
    .transform((v) => (typeof v === "string" ? { name: v } : v))
    .optional(),
  author: z
    .union([z.object({ name: z.string() }), z.string()])
    .transform((v) => (typeof v === "string" ? { name: v } : v))
    .optional(),
  artist: z
    .union([z.object({ name: z.string() }), z.string()])
    .transform((v) => (typeof v === "string" ? { name: v } : v))
    .optional(),
  genres: z
    .array(
      z
        .union([z.object({ name: z.string() }), z.string()])
        .transform((v) => (typeof v === "string" ? { name: v } : v))
    )
    .default([]),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
  category: z.string().optional(),
  numchapters: z.number().optional(),
  spider: z.string().optional(),
  views: z.number().optional(),
});

const ChapterSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  chapterNumber: z.coerce.number().optional(),
  releaseDate: z.coerce.date().optional(),
  url: z.string().url().optional(),
  slug: z.string().optional(),
  views: z.number().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        path: z.string().optional(),
        checksum: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .optional(),
  image_urls: z.array(z.string().url()).optional(),
  comic: z
    .object({
      title: z.string().min(1),
      slug: z.string().min(1),
    })
    .optional(),
  comicSlug: z.string().optional(),
  comictitle: z.string().optional(),
  comicslug: z.string().optional(),
  chaptername: z.string().optional(),
  chaptertitle: z.string().optional(),
  chapterslug: z.string().optional(),
  updatedAt: z.string().optional(),
  updated_at: z.string().optional(),
  content: z.string().optional(),
  spider: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE PROCESSING - FILESYSTEM-BASED WITH DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Process image URL - download to local filesystem only if not already downloaded
 * Returns the local path with original file extension preserved
 * @param imageUrl
 * @param destinationPath
 * @param fallbackImage
 */
async function processImage(
  imageUrl: string,
  destinationPath: string,
  fallbackImage: string
): Promise<string> {
  // Check if already processed in this session
  if (downloadedImages.has(imageUrl)) {
    return downloadedImages.get(imageUrl)!;
  }

  // Check cache from previous runs
  if (imageCache.has(imageUrl)) {
    const cachedPath = imageCache.get(imageUrl)!;
    // Verify file still exists
    if (existsSync(path.join(CONFIG.PUBLIC_DIR, cachedPath))) {
      downloadedImages.set(imageUrl, cachedPath);
      return cachedPath;
    }
  }

  // Get original file extension
  const extension = getFileExtension(imageUrl);
  // Update destination path with correct extension
  const pathWithExtension = destinationPath.replace(/\.[^.]+$/, extension);

  // Ensure destination directory exists
  const destDir = path.dirname(path.join(CONFIG.PUBLIC_DIR, pathWithExtension));
  await mkdir(destDir, { recursive: true });

  // Check if file already exists in filesystem
  const fullPath = path.join(CONFIG.PUBLIC_DIR, pathWithExtension);
  if (existsSync(fullPath)) {
    const relativePath = pathWithExtension.startsWith("/")
      ? pathWithExtension
      : `/${pathWithExtension}`;
    downloadedImages.set(imageUrl, relativePath);
    imageCache.set(imageUrl, relativePath);
    return relativePath;
  }

  // Download using imageService
  try {
    const result = await imageService.downloadImage(imageUrl, path.dirname(pathWithExtension));
    if (result.success && result.localPath) {
      downloadedImages.set(imageUrl, result.localPath);
      imageCache.set(imageUrl, result.localPath);
      return result.localPath;
    }
  } catch (error) {
    console.warn(`⚠️  Failed to download ${imageUrl}:`, error);
  }

  // Fallback to placeholder
  downloadedImages.set(imageUrl, fallbackImage);
  imageCache.set(imageUrl, fallbackImage);
  return fallbackImage;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEEDERS
// ═══════════════════════════════════════════════════════════════════════════

async function seedUsers(data: unknown[]) {
  console.log(`\n🔹 Seeding ${data.length} users...`);
  const limit = pLimit(CONFIG.CONCURRENCY);

  let processed = 0;
  let created = 0;
  let updated = 0;

  const tasks = data.map((item) =>
    limit(async () => {
      try {
        const validated = UserSchema.parse(item);

        // Process user image
        let userImage = validated.image || CONFIG.PLACEHOLDER_USER;
        if (userImage && userImage.startsWith("http")) {
          const imagePath = `users/${validated.email.replace("@", "-at-")}.jpg`;
          userImage = await processImage(userImage, imagePath, CONFIG.PLACEHOLDER_USER);
        }

        // Hash password
        const hashedPassword = validated.password
          ? await hashPassword(validated.password)
          : await hashPassword(CONFIG.CUSTOM_PASSWORD);

        const result = await db
          .insert(user)
          .values({
            ...validated,
            image: userImage,
            password: hashedPassword,
          })
          .onConflictDoUpdate({
            target: user.email,
            set: {
              name: validated.name,
              image: userImage,
              role: validated.role,
              updatedAt: new Date(),
            },
          })
          .returning({ id: user.id });

        if (result.length > 0) created++;
        else updated++;
        processed++;

        if (processed % 10 === 0) {
          console.log(`  Progress: ${processed}/${data.length} users`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to seed user:`, error);
      }
    })
  );

  await Promise.all(tasks);
  console.log(`✅ Users: ${created} created, ${updated} updated`);
}

async function seedComics(data: unknown[]) {
  console.log(`\n🔹 Seeding ${data.length} comics...`);
  const limit = pLimit(CONFIG.CONCURRENCY);

  let processed = 0;
  let created = 0;
  const updated = 0;

  const tasks = data.map((item) =>
    limit(async () => {
      try {
        const validated = ComicSchema.parse(item);

        // Process cover image
        let coverImagePath = validated.coverImage || CONFIG.PLACEHOLDER_COMIC;
        if (coverImagePath && coverImagePath.startsWith("http")) {
          const extension = getFileExtension(coverImagePath);
          const imagePath = `comics/covers/${validated.slug}/cover${extension}`;
          coverImagePath = await processImage(coverImagePath, imagePath, CONFIG.PLACEHOLDER_COMIC);
        }

        // Upsert Type
        let typeId: number | null = null;
        if (validated.type?.name) {
          const [typeRecord] = await db
            .insert(comicType)
            .values({ name: validated.type.name })
            .onConflictDoUpdate({
              target: comicType.name,
              set: { name: validated.type.name },
            })
            .returning({ id: comicType.id });
          typeId = typeRecord!.id;
        }

        // Upsert Author - check if exists first
        let authorId: number | null = null;
        if (validated.author?.name) {
          // Try to find existing author
          const [existingAuthor] = await db
            .select({ id: author.id })
            .from(author)
            .where(eq(author.name, validated.author.name))
            .limit(1);

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            const [authorRecord] = await db
              .insert(author)
              .values({ name: validated.author.name })
              .returning({ id: author.id });
            authorId = authorRecord!.id;
          }
        }

        // Upsert Artist - check if exists first
        let artistId: number | null = null;
        if (validated.artist?.name) {
          // Try to find existing artist
          const [existingArtist] = await db
            .select({ id: artist.id })
            .from(artist)
            .where(eq(artist.name, validated.artist.name))
            .limit(1);

          if (existingArtist) {
            artistId = existingArtist.id;
          } else {
            const [artistRecord] = await db
              .insert(artist)
              .values({ name: validated.artist.name })
              .returning({ id: artist.id });
            artistId = artistRecord!.id;
          }
        }

        // Upsert Comic with retry logic
        const [comicRecord] = await retryWithBackoff(async () =>
          db
            .insert(comic)
            .values({
              title: validated.title,
              slug: validated.slug,
              description: validated.description,
              coverImage: coverImagePath,
              rating: validated.rating ? validated.rating.toString() : "0",
              status: validated.status,
              publicationDate: new Date(),
              url: validated.url || null,
              serialization: validated.serialization || null,
              typeId,
              authorId,
              artistId,
            })
            .onConflictDoUpdate({
              target: comic.slug,
              set: {
                description: validated.description,
                coverImage: coverImagePath,
                rating: validated.rating ? validated.rating.toString() : "0",
                status: validated.status,
                url: validated.url || null,
                serialization: validated.serialization || null,
                updatedAt: new Date(),
              },
            })
            .returning({ id: comic.id })
        );

        // Process genres
        if (validated.genres.length > 0) {
          for (const genreData of validated.genres) {
            const [genreRecord] = await db
              .insert(genre)
              .values({
                name: genreData.name,
              })
              .onConflictDoUpdate({
                target: genre.name,
                set: { name: genreData.name },
              })
              .returning({ id: genre.id });

            await db
              .insert(comicToGenre)
              .values({
                comicId: comicRecord!.id,
                genreId: genreRecord!.id,
              })
              .onConflictDoNothing();
          }
        }

        // Process comic images
        const imageUrls = validated.images?.map((img) => img.url) || validated.image_urls || [];
        if (imageUrls.length > 0) {
          const imageLimit = pLimit(CONFIG.IMAGE_CONCURRENCY);
          const imagePromises = imageUrls.slice(0, 20).map((imageUrl, index) =>
            imageLimit(async () => {
              const extension = getFileExtension(imageUrl);
              const imagePath = `comics/covers/${validated.slug}/image-${index + 1}${extension}`;
              const localPath = await processImage(imageUrl, imagePath, CONFIG.PLACEHOLDER_COMIC);

              await db
                .insert(comicImage)
                .values({
                  comicId: comicRecord!.id,
                  imageUrl: localPath,
                  imageOrder: index,
                })
                .onConflictDoNothing();
            })
          );
          await Promise.all(imagePromises);
        }

        created++;
        processed++;

        if (processed % 5 === 0) {
          console.log(`  Progress: ${processed}/${data.length} comics`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to seed comic:`, error);
      }
    })
  );

  await Promise.all(tasks);
  console.log(`✅ Comics: ${created} created, ${updated} updated`);
}

async function seedChapters(data: unknown[]) {
  console.log(`\n🔹 Seeding ${data.length} chapters...`);
  const limit = pLimit(CONFIG.CONCURRENCY);

  let processed = 0;
  let created = 0;

  const tasks = data.map((item) =>
    limit(async () => {
      try {
        const validated = ChapterSchema.parse(item);

        // Determine comic slug
        const comicSlug =
          validated.comic?.slug ||
          validated.comicSlug ||
          validated.comicslug ||
          validated.comic?.title?.toLowerCase().replaceAll(/\s+/g, "-");

        if (!comicSlug) {
          return;
        }

        // Find comic
        const [comicRecord] = await db
          .select()
          .from(comic)
          .where(eq(comic.slug, comicSlug))
          .limit(1);

        if (!comicRecord) {
          return;
        }

        // Determine chapter number
        let chapterNumber = validated.chapterNumber || 0;
        if (!chapterNumber) {
          const name = validated.name || validated.chaptername || validated.title || "";
          const match = name.match(/chapter\s+(\d+\.?\d*)/i);
          if (match) chapterNumber = Number.parseFloat(match[1]!);
        }

        // Skip if chapter number is invalid
        if (!chapterNumber || chapterNumber === 0) {
          return;
        }

        // Create chapter slug
        const chapterSlug = validated.slug || validated.chapterslug || `chapter-${chapterNumber}`;

        // Upsert chapter with better error handling and retry
        try {
          const [chapterRecord] = await retryWithBackoff(async () =>
            db
              .insert(chapter)
              .values({
                comicId: comicRecord.id,
                slug: chapterSlug,
                title:
                  validated.title ||
                  validated.chaptertitle ||
                  validated.name ||
                  `Chapter ${chapterNumber}`,
                chapterNumber: chapterNumber,
                releaseDate: validated.releaseDate || new Date(),
                views: validated.views || 0,
                url: validated.url || null,
                content: validated.content || null,
              })
              .onConflictDoUpdate({
                target: [chapter.comicId, chapter.chapterNumber],
                set: {
                  title:
                    validated.title ||
                    validated.chaptertitle ||
                    validated.name ||
                    `Chapter ${chapterNumber}`,
                  url: validated.url || null,
                  content: validated.content || null,
                  updatedAt: new Date(),
                },
              })
              .returning({ id: chapter.id })
          );

          // Process chapter images
          const imageUrls = validated.images?.map((img) => img.url) || validated.image_urls || [];
          if (imageUrls.length > 0) {
            const imageLimit = pLimit(CONFIG.IMAGE_CONCURRENCY);
            const imagePromises = imageUrls.map((imageUrl, index) =>
              imageLimit(async () => {
                const extension = getFileExtension(imageUrl);
                const imagePath = `comics/chapters/${comicSlug}/${chapterSlug}/page-${index + 1}${extension}`;
                const localPath = await processImage(imageUrl, imagePath, CONFIG.PLACEHOLDER_COMIC);

                await db
                  .insert(chapterImage)
                  .values({
                    chapterId: chapterRecord!.id,
                    imageUrl: localPath,
                    pageNumber: index,
                  })
                  .onConflictDoNothing();
              })
            );
            await Promise.all(imagePromises);
          }

          created++;
          processed++;

          if (processed % 10 === 0) {
            console.log(`  Progress: ${processed}/${data.length} chapters`);
          }
        } catch (dbError: unknown) {
          // Extract the actual database error from Drizzle
          const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
          const cause = (dbError as { cause?: unknown }).cause;

          console.error(
            `  ❌ Chapter insert error for #${chapterNumber} (comic:${comicRecord.id}):`,
            {
              message: errorMessage,
              cause: cause,
              slug: chapterSlug,
            }
          );
        }
      } catch (error) {
        if (!(error instanceof z.ZodError)) {
          console.error(`  ❌ Failed to seed chapter:`, error);
        }
      }
    })
  );

  await Promise.all(tasks);
  console.log(`✅ Chapters: ${created} created`);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN RUNNER
// ═══════════════════════════════════════════════════════════════════════════

async function loadJSON(filePath: string): Promise<unknown[]> {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️  Could not load ${filePath}:`, error);
    return [];
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  ENHANCED PRODUCTION SEED RUNNER v2.0");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const startTime = Date.now();

  // Load image cache
  await loadImageCache();

  // Ensure directories exist
  await mkdir(CONFIG.COMICS_COVERS_DIR, { recursive: true });
  await mkdir(CONFIG.CHAPTERS_DIR, { recursive: true });

  try {
    // Seed Users
    const usersData = await loadJSON("users.json");
    if (usersData.length > 0) {
      await seedUsers(usersData);
    }

    // Seed Comics
    const comicsData = [
      ...(await loadJSON("comics.json")),
      ...(await loadJSON("comicsdata1.json")),
      ...(await loadJSON("comicsdata2.json")),
    ];
    if (comicsData.length > 0) {
      await seedComics(comicsData);
    }

    // Seed Chapters
    const chaptersData = [
      ...(await loadJSON("chapters.json")),
      ...(await loadJSON("chaptersdata1.json")),
      ...(await loadJSON("chaptersdata2.json")),
    ];
    if (chaptersData.length > 0) {
      await seedChapters(chaptersData);
    }

    // Save image cache
    await saveImageCache();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Seed completed successfully in ${duration}s`);
    console.log(`📊 Total images processed: ${downloadedImages.size}`);
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
