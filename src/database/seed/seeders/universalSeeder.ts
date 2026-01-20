/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Universal Seeder - Dynamic JSON Data Import System
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Handles multiple JSON data sources:
 * - users.json
 * - comics.json, comicsdata1.json, comicsdata2.json
 * - chapters.json, chaptersdata1.json, chaptersdata2.json
 *
 * Features:
 * - Dynamic data loading from multiple files
 * - Image downloading and uploading to ImageKit
 * - Upsert logic (create or update existing records)
 * - Zod validation
 * - Progress tracking
 * - Error handling and recovery
 */

import { db } from "@/database";
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
import { logger } from "@/database/seed/logger";
import {
  cacheImage,
  clearCache,
  getCachedByHash,
  getCachedUrl,
  getCacheStats,
  getImageHash,
} from "@/database/seed/utils/imageCache";
import { imageService } from "@/services/imageService";
import { hashPassword } from "auth";
import { and, eq } from "drizzle-orm";
import fs from "fs/promises";
import { glob } from "glob";
import path from "path";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Discover JSON files matching a pattern
 * @param pattern
 */
async function discoverJSONFiles(pattern: string): Promise<string[]> {
  try {
    const files = await glob(pattern, { cwd: process.cwd() });
    return files.sort(); // Sort alphabetically for consistent processing
  } catch (error) {
    logger.error(`Failed to discover files matching ${pattern}: ${error}`);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const UserSchema = z
  .object({
    id: z.string().uuid().optional(),
    email: z.string().email(),
    name: z.string(),
    password: z.string().optional(),
    role: z.enum(["user", "admin", "moderator"]).default("user"),
    image: z.string().nullable().optional(),
    emailVerified: z.coerce.date().nullable().optional(),
    status: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    lastActivityDate: z.coerce.date().nullable().optional(),
  })
  .strict();

const ComicSchema = z
  .object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    coverImage: z.string().optional(),
    status: z
      .enum(["Ongoing", "Completed", "Hiatus", "Dropped", "Season End", "Coming Soon"])
      .default("Ongoing"),
    rating: z.coerce.number().max(10.0).default(0),
    serialization: z.string().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
    url: z.string().url().optional(),
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
    numchapters: z.number().optional(),
    image_urls: z.array(z.string().url()).optional(),
    type: z.object({ name: z.string() }).strict().optional(),
    category: z.string().optional(),
    author: z.object({ name: z.string() }).strict().optional().or(z.string()).optional(),
    artist: z.object({ name: z.string() }).strict().optional().or(z.string()).optional(),
    genres: z
      .array(z.object({ name: z.string() }).strict().optional().or(z.string()).optional())
      .default([]),
    spider: z.string().optional(),
  })
  .strict();

const ChapterSchema = z
  .object({
    // Format 1: chapters.json (nested comic object)
    name: z.string().optional(), // "Chapter 273"
    title: z.string().optional(), // "91. Divine Relic (1)"
    url: z.string().url().optional(),
    slug: z.string().optional(),
    chapterNumber: z.coerce.number().optional(),
    releaseDate: z.coerce.date().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
    views: z.number().optional(),
    comic: z
      .object({
        title: z.string(),
        slug: z.string(),
      })
      .strict()
      .optional(),
    comicSlug: z.string().optional(),
    content: z.string().optional(),
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

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE DOWNLOAD & UPLOAD HELPERS - Optimized with Pre-Upload Deduplication
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Download and process image with optimized deduplication
 * Checks hash BEFORE uploading to avoid unnecessary uploads
 * @param imageUrl
 * @param folder
 * @param fileName
 * @param p0
 * @param _fileName
 */
async function downloadAndUploadImage(
  imageUrl: string,
  folder: string,

  _fileName: string
): Promise<string | null> {
  try {
    // OPTIMIZATION 1: Check URL cache first - exact URL match (most efficient)
    const cachedUrl = getCachedUrl(imageUrl);
    if (cachedUrl) {
      logger.info(`✓ Cache hit (URL): ${imageUrl.slice(0, 80)}...`);
      return cachedUrl;
    }

    // OPTIMIZATION 2: Download once and calculate hash BEFORE uploading
    // This prevents uploading duplicate images
    let imageBuffer: Buffer;
    let imageHash: string;

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        logger.warn(`Failed to fetch image: ${response.status} ${response.statusText}`);
        return imageUrl; // Fallback to original URL
      }

      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      imageHash = getImageHash(imageBuffer);

      // OPTIMIZATION 3: Check if we already have this image content by hash
      const cachedByHash = getCachedByHash(imageHash);
      if (cachedByHash) {
        logger.info(`✓ Cache hit (Hash): Duplicate content detected, reusing existing upload`);
        logger.info(`  Original: ${imageUrl.slice(0, 60)}...`);
        logger.info(`  Cached:   ${cachedByHash.slice(0, 60)}...`);
        cacheImage(imageUrl, cachedByHash, imageHash);
        return cachedByHash;
      }
    } catch (fetchError) {
      logger.error(`Error fetching image for hash check: ${fetchError}`);
      return imageUrl; // Fallback to original URL
    }

    // OPTIMIZATION 4: Only upload if we don't have this content already
    const result = await imageService.downloadImage(imageUrl, `comicwise/${folder}`);

    if (!result.success || !result.localPath) {
      logger.warn(`Image service failed: ${result.error ?? "Unknown error"}`);
      return imageUrl; // Fallback to original URL
    }

    const uploadedUrl = result.localPath;

    // Cache both URL and hash for future lookups
    cacheImage(imageUrl, uploadedUrl, imageHash);

    logger.success(`✓ Image uploaded: ${uploadedUrl.slice(0, 80)}...`);
    return uploadedUrl;
  } catch (error) {
    logger.error(`Error processing image ${imageUrl.slice(0, 60)}...: ${error}`);
    return imageUrl; // Fallback to original URL
  }
}

/**
 * Batch download and upload images with concurrency control
 * Prevents overwhelming the server with simultaneous requests
 * @param imageUrls
 * @param folder
 * @param concurrency
 */
async function downloadAndUploadImages(
  imageUrls: string[],
  folder: string,
  concurrency: number = 3
): Promise<(string | null)[]> {
  const results: (string | null)[] = [];
  const queue = [...imageUrls];

  logger.info(`📦 Batch downloading ${imageUrls.length} images (concurrency: ${concurrency})`);

  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    const batchPromises = batch.map((url, index) =>
      downloadAndUploadImage(url, folder, `image-${Date.now()}-${index}.webp`)
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (queue.length > 0) {
      logger.info(`   Progress: ${results.length}/${imageUrls.length} images processed`);
      // Small delay between batches to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  logger.success(
    `✅ Batch complete: ${results.filter(Boolean).length}/${imageUrls.length} successful`
  );
  return results;
}

/**
 * Normalize and validate comic data before processing
 * Reduces cognitive complexity by extracting data transformation logic
 * @param comicData
 */
export function normalizeComicData(comicData: Record<string, unknown>): Record<string, unknown> {
  const normalizedData = { ...comicData };

  // Normalize status field
  if (normalizedData["status"] && typeof normalizedData["status"] === "string") {
    const validStatuses = ["Ongoing", "Completed", "Hiatus", "Dropped", "Coming Soon"];
    if (!validStatuses.includes(normalizedData["status"])) {
      logger.warn(
        `Invalid status "${normalizedData["status"]}" for ${comicData["title"] ?? comicData["slug"]}, defaulting to "Ongoing"`
      );
      normalizedData["status"] = "Ongoing";
    }
  }

  // Clamp rating to [0, 10.00]
  if (normalizedData["rating"] !== undefined) {
    let ratingNumber = Number.parseFloat(String(normalizedData["rating"]));
    if (isNaN(ratingNumber) || ratingNumber < 0) ratingNumber = 0;
    if (ratingNumber > 10.0) {
      logger.warn(
        `Rating ${normalizedData["rating"]} exceeds max for ${comicData["title"] ?? comicData["slug"]}, clamping to 10.00`
      );
      ratingNumber = 10.0;
    }
    normalizedData["rating"] = ratingNumber;
  }

  return normalizedData;
}

/**
 * Extract cover image URL from comic data
 * Reduces cognitive complexity by isolating image extraction logic
 * @param validatedComic
 */
export function extractCoverImageUrl<T>(validatedComic: T): string | null {
  if (validatedComic.coverImage) return validatedComic.coverImage;
  if (validatedComic.images?.length > 0) return validatedComic.images[0]?.url;
  if (validatedComic.image_urls?.length > 0) return validatedComic.image_urls[0];
  return null;
}

/**
 * Extract all unique comic image URLs from various sources
 * Reduces cognitive complexity by consolidating image URL collection
 * @param validatedComic
 */
export function extractComicImageUrls<T>(validatedComic: T): string[] {
  const comicImageUrls: string[] = [];

  if (Array.isArray(validatedComic.images)) {
    for (const img of validatedComic.images) {
      if (img?.url && !comicImageUrls.includes(img.url)) {
        comicImageUrls.push(img.url);
      }
    }
  }

  if (Array.isArray(validatedComic.image_urls)) {
    for (const url of validatedComic.image_urls) {
      if (url && !comicImageUrls.includes(url)) {
        comicImageUrls.push(url);
      }
    }
  }

  return comicImageUrls;
}

/**
 * Extract author name from various data formats
 * Reduces cognitive complexity by handling different author formats
 * @param validatedComic
 */
export function extractAuthorName<T>(validatedComic: T): string {
  if (typeof validatedComic.author === "string") return validatedComic.author;
  if (validatedComic.author?.name) return validatedComic.author.name;
  return "Unknown Author";
}

/**
 * Extract artist name from various data formats
 * @param validatedComic
 */
export function extractArtistName<T>(validatedComic: T): string {
  if (typeof validatedComic.artist === "string") return validatedComic.artist;
  if (validatedComic.artist?.name) return validatedComic.artist.name;
  return "Unknown Artist";
}

/**
 * Process and create/update a single comic
 * Extracted to reduce cognitive complexity in seedComicsFromJSON
 * @param validatedComic
 * @param normalizedData
 * @param uploadedCoverImage
 * @param processedComicImageUrls
 * @param authorId
 * @param artistId
 * @param typeId
 * @param genreIds
 */
export async function processComicRecord(
  validatedComic: any,
  normalizedData: Record<string, unknown>,
  uploadedCoverImage: string | null,
  processedComicImageUrls: string[],
  authorId: number,
  artistId: number,
  typeId: number,
  genreIds: number[]
): Promise<{ success: boolean; comicId?: number; error?: string }> {
  try {
    const comicPayload = {
      title: validatedComic.title,
      slug: validatedComic.slug,
      description: validatedComic.description,
      coverImage: uploadedCoverImage ?? "",
      status: validatedComic.status,
      rating: validatedComic.rating ? validatedComic.rating.toString() : "0",
      authorId,
      artistId,
      typeId,
      publicationDate: new Date(),
    };

    // Check if comic exists
    const existingComic = await db.query.comic.findFirst({
      where: (table, { eq, or }) =>
        or(eq(table.slug, validatedComic.slug), eq(table.title, validatedComic.title)),
    });

    let comicId: number;

    if (existingComic) {
      await db
        .update(comic)
        .set({
          ...comicPayload,
          updatedAt: new Date(),
        })
        .where(eq(comic.id, existingComic.id));
      comicId = existingComic.id;
      logger.success(`✓ Updated comic: ${validatedComic.title}`);
    } else {
      const [newComic] = await db.insert(comic).values(comicPayload).returning();
      comicId = newComic!.id;
      logger.success(`✓ Created comic: ${validatedComic.title}`);
    }

    // Save comic images
    if (processedComicImageUrls.length > 0) {
      await db.delete(comicImage).where(eq(comicImage.comicId, comicId));
      const comicImageRecords = processedComicImageUrls.map((imageUrl, index) => ({
        comicId,
        imageUrl,
        imageOrder: index + 1,
      }));
      await db.insert(comicImage).values(comicImageRecords);
      logger.info(`   ✓ Saved ${comicImageRecords.length} images to comicImage table`);
    }

    // Update comic-genre relationships
    await db.delete(comicToGenre).where(eq(comicToGenre.comicId, comicId));
    for (const genreId of genreIds) {
      await db.insert(comicToGenre).values({ comicId, genreId }).onConflictDoNothing();
    }

    return { success: true, comicId };
  } catch (error) {
    let errorDetails = `Failed to process comic: ${error}`;
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      errorDetails = `Duplicate entry (unique constraint violation). Skipping.`;
    }
    return { success: false, error: errorDetails };
  }
}

/**
 * Extract and normalize chapter metadata from various formats
 * Reduces cognitive complexity in seedChaptersFromJSON
 * @param validatedChapter
 */
function extractChapterMetadata(validatedChapter: z.infer<typeof ChapterSchema>): {
  chapterName: string;
  chapterTitle: string;
  chapterNumber: number;
  chapterSlug: string;
  comicSlug: string;
  imageUrls: string[];
} {
  const chapterName = validatedChapter.chaptername ?? validatedChapter.name ?? "";
  const chapterTitle = validatedChapter.title ?? validatedChapter.chaptername ?? chapterName;
  const chapterNumber = chapterName.match(/chapter\s+(\d+)/i)?.[1]
    ? Number.parseInt(chapterName.match(/chapter\s+(\d+)/i)?.[1] ?? "")
    : (validatedChapter.chapterNumber ?? 0);
  const chapterSlug =
    validatedChapter.chapterslug ??
    validatedChapter.slug ??
    `${chapterName}`
      .toLowerCase()
      .replaceAll(/[^\da-z]+/g, "-")
      .replaceAll(/^-+|-+$/g, "");
  const comicSlug =
    validatedChapter.comicslug ?? validatedChapter.comic?.slug ?? validatedChapter.comicSlug ?? "";

  const imageUrls =
    validatedChapter.image_urls ?? validatedChapter.images?.map((img) => img.url) ?? [];

  return { chapterName, chapterTitle, chapterNumber, chapterSlug, comicSlug, imageUrls };
}

/**
 * Process and create/update a single chapter with images
 * Extracted to reduce cognitive complexity in seedChaptersFromJSON
 * @param validatedChapter
 * @param metadata
 * @param comicRecord
 * @param processedImageUrls
 */
async function processChapterRecord(
  validatedChapter: any,
  metadata: ReturnType<typeof extractChapterMetadata>,
  comicRecord: any,
  processedImageUrls: string[]
): Promise<{ success: boolean; chapterId?: number; error?: string }> {
  try {
    const chapterPayload = {
      title: metadata.chapterTitle,
      slug: metadata.chapterSlug,
      chapterNumber: metadata.chapterNumber,
      releaseDate: validatedChapter.releaseDate ?? new Date(),
      views: validatedChapter.views ?? 0,
      comicId: comicRecord.id,
    };

    // Check if chapter exists
    const existingChapter = await db.query.chapter.findFirst({
      where: and(eq(chapter.comicId, comicRecord.id), eq(chapter.slug, metadata.chapterSlug)),
    });

    let chapterId: number;

    if (existingChapter) {
      await db.update(chapter).set(chapterPayload).where(eq(chapter.id, existingChapter.id));
      chapterId = existingChapter.id;
      logger.success(`✓ Updated chapter: ${metadata.chapterTitle} (${metadata.chapterNumber})`);
    } else {
      const [newChapter] = await db.insert(chapter).values(chapterPayload).returning();
      chapterId = newChapter!.id;
      logger.success(`✓ Created chapter: ${metadata.chapterTitle} (${metadata.chapterNumber})`);
    }

    // Save chapter images
    if (processedImageUrls.length > 0) {
      await db.delete(chapterImage).where(eq(chapterImage.chapterId, chapterId));
      const chapterImageRecords = processedImageUrls.map((imageUrl, index) => ({
        chapterId,
        imageUrl,
        pageNumber: index + 1,
      }));
      await db.insert(chapterImage).values(chapterImageRecords);
      logger.info(`   ✓ Saved ${chapterImageRecords.length} images to database`);
    }

    return { success: true, chapterId };
  } catch (error) {
    let errorDetails = `Failed to process chapter.`;
    if (error && typeof error === "object") {
      if ("code" in error) errorDetails += ` Code: ${error.code}.`;
      if ("constraint" in error) errorDetails += ` Constraint: ${error.constraint}.`;
      if ("detail" in error) errorDetails += ` Detail: ${error.detail}.`;
    }
    return { success: false, error: errorDetails };
  }
}

async function findOrCreateAuthor(authorName: string): Promise<number> {
  if (!authorName || authorName === "_") {
    authorName = "Unknown Author";
  }

  const existing = await db.query.author.findFirst({
    where: eq(author.name, authorName),
  });

  if (existing) {
    return existing.id;
  }

  const [newAuthor] = await db
    .insert(author)
    .values({
      name: authorName,
      bio: null,
    })
    .returning();

  return newAuthor!.id;
}

async function findOrCreateArtist(artistName: string): Promise<number> {
  if (!artistName || artistName === "_") {
    artistName = "Unknown Artist";
  }

  const existing = await db.query.artist.findFirst({
    where: eq(artist.name, artistName),
  });

  if (existing) {
    return existing.id;
  }

  const [newArtist] = await db
    .insert(artist)
    .values({
      name: artistName,
      bio: null,
    })
    .returning();

  return newArtist!.id;
}

async function findOrCreateType(typeName: string): Promise<number> {
  if (!typeName || typeName === "_") {
    typeName = "Unknown Type";
  }

  const existing = await db.query.type.findFirst({
    where: eq(comicType.name, typeName),
  });

  if (existing) {
    return existing.id;
  }

  const [newType] = await db
    .insert(comicType)
    .values({
      name: typeName,
      description: null,
    })
    .returning();

  return newType!.id;
}

async function findOrCreateGenre(genreName: string): Promise<number> {
  if (!genreName || genreName === "_") {
    genreName = "Unknown Genre";
  }

  const existing = await db.query.genre.findFirst({
    where: eq(genre.name, genreName),
  });

  if (existing) {
    return existing.id;
  }

  const [newGenre] = await db
    .insert(genre)
    .values({
      name: genreName,
      description: null,
    })
    .returning();

  return newGenre!.id;
}

/**
 * Process cover image for a comic - Helper function to reduce complexity
 * @param validatedComic - The validated comic data
 * @returns The uploaded cover image URL or the original URL
 */
async function processCoverImage<T>(validatedComic: T): Promise<string | null> {
  const coverImageUrl = extractCoverImageUrl(validatedComic);
  if (!coverImageUrl) return null;

  const isExternalUrl = coverImageUrl.startsWith("http://") || coverImageUrl.startsWith("https://");
  if (!isExternalUrl) return coverImageUrl;

  const uploaded = await downloadAndUploadImage(
    coverImageUrl,
    "covers",
    `${validatedComic.slug}.webp`
  );
  return uploaded || coverImageUrl;
}

/**
 * Process all comic images - Helper function to reduce complexity
 * @param validatedComic - The validated comic data
 * @returns Array of processed image URLs
 */
async function processComicImages<T>(validatedComic: T): Promise<string[]> {
  const comicImageUrls = extractComicImageUrls(validatedComic);
  if (comicImageUrls.length === 0) return [];

  logger.info(
    `   📸 Processing ${comicImageUrls.length} images for comic: ${validatedComic.title}`
  );

  const uploadedImages = await downloadAndUploadImages(
    comicImageUrls,
    `comics/${validatedComic.slug}`,
    5
  );

  const processedUrls = uploadedImages.filter((url): url is string => url !== null);
  logger.info(`   ✓ Processed ${processedUrls.length}/${comicImageUrls.length} comic images`);

  return processedUrls;
}

/**
 * Get or create comic related entities (author, artist, type, genres) - Extracted to reduce complexity
 * @param validatedComic - The validated comic data
 * @returns Object containing IDs for author, artist, type, and genres
 */
async function getOrCreateComicEntities<T>(validatedComic: T): Promise<{
  authorId: number;
  artistId: number;
  typeId: number;
  genreIds: number[];
} | null> {
  const authorId = await findOrCreateAuthor(extractAuthorName(validatedComic));
  if (!authorId) {
    logger.error(`Comic '${validatedComic.title}': Author not found or could not be created.`);
    return null;
  }

  const artistId = await findOrCreateArtist(extractArtistName(validatedComic));
  if (!artistId) {
    logger.error(`Comic '${validatedComic.title}': Artist not found or could not be created.`);
    return null;
  }

  const typeName = validatedComic.type?.name ?? validatedComic.category ?? "Unknown Type";
  const typeId = await findOrCreateType(typeName);
  if (!typeId) {
    logger.error(`Comic '${validatedComic.title}': Type not found or could not be created.`);
    return null;
  }

  const genreIds: number[] = [];
  for (const genre of validatedComic.genres ?? []) {
    if (!genre) continue;
    const genreName = typeof genre === "string" ? genre : genre.name;
    const genreId = await findOrCreateGenre(genreName);
    if (!genreId) {
      logger.error(`Comic '${validatedComic.title}': Genre not found or could not be created.`);
      continue;
    }
    genreIds.push(genreId);
  }

  return { authorId, artistId, typeId, genreIds };
}

/**
 * Process a single comic from JSON data - Extracted to reduce complexity
 * @param comicData - The raw comic data from JSON
 * @returns Processing result with statistics
 */
async function processSingleComic(comicData: Record<string, unknown>): Promise<{
  success: boolean;
  created?: boolean;
}> {
  const normalizedData = normalizeComicData(comicData);
  const validatedComic = ComicSchema.parse(normalizedData);

  const uploadedCoverImage = await processCoverImage(validatedComic);
  const processedComicImageUrls = await processComicImages(validatedComic);

  const entities = await getOrCreateComicEntities(validatedComic);
  if (!entities) return { success: false };

  const result = await processComicRecord(
    validatedComic,
    normalizedData,
    uploadedCoverImage,
    processedComicImageUrls,
    entities.authorId,
    entities.artistId,
    entities.typeId,
    entities.genreIds
  );

  if (!result.success) {
    logger.error(`${result.error}`);
    return { success: false };
  }

  const existingComic = await db.query.comic.findFirst({
    where: (table, { eq, or }) =>
      or(eq(table.slug, validatedComic.slug), eq(table.title, validatedComic.title)),
  });

  return { success: true, created: !existingComic };
}

// ═══════════════════════════════════════════════════════════════════════════
// SEED USERS
// ═══════════════════════════════════════════════════════════════════════════

export async function seedUsersFromJSON(jsonFiles: string[] = ["users.json"]): Promise<void> {
  logger.info("🌱 Seeding users from JSON files...");

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;

  for (const jsonFile of jsonFiles) {
    try {
      const filePath = path.join(process.cwd(), jsonFile);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const rawData = JSON.parse(fileContent);
      const usersData = Array.isArray(rawData)
        ? (rawData as Record<string, unknown>[])
        : [rawData as Record<string, unknown>];

      logger.info(`Processing ${usersData.length} users from ${jsonFile}`);

      for (const userData of usersData) {
        try {
          const validatedUser = UserSchema.parse(userData);

          // Check if user exists
          const existingUser = await db.query.user.findFirst({
            where: eq(user.email, validatedUser.email),
          });

          const userPayload = {
            email: validatedUser.email,
            name: validatedUser.name,
            role: validatedUser.role,
            image: validatedUser.image ?? null,
            emailVerified: validatedUser.emailVerified ?? new Date(),
            password: validatedUser.password
              ? await hashPassword(validatedUser.password)
              : await hashPassword("Password123!"),
          };

          if (existingUser) {
            // Update existing user
            await db
              .update(user)
              .set({
                ...userPayload,
                updatedAt: new Date(),
              })
              .where(eq(user.id, existingUser.id));
            totalUpdated++;
            logger.success(`✓ Updated user: ${validatedUser.email}`);
          } else {
            // Create new user
            await db.insert(user).values(userPayload);
            totalCreated++;
            logger.success(`✓ Created user: ${validatedUser.email}`);
          }

          totalProcessed++;
        } catch (error) {
          logger.error(`Failed to process user: ${error}`);
        }
      }
    } catch (error) {
      logger.error(`Failed to read ${jsonFile}: ${error}`);
    }
  }

  logger.success(
    `✅ Users seeding complete: ${totalProcessed} processed, ${totalCreated} created, ${totalUpdated} updated`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SEED COMICS
// ═══════════════════════════════════════════════════════════════════════════

export async function seedComicsFromJSON(pattern: string = "comics*.json"): Promise<void> {
  logger.info("🌱 Seeding comics from JSON files...");

  // Discover all matching files
  const jsonFiles = await discoverJSONFiles(pattern);
  if (jsonFiles.length === 0) {
    logger.warn(`No files found matching pattern: ${pattern}`);
    return;
  }

  logger.info(`📁 Discovered ${jsonFiles.length} file(s): ${jsonFiles.join(", ")}`);

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  const fileResults: Record<
    string,
    { processed: number; created: number; updated: number; errors: number }
  > = {};

  for (const jsonFile of jsonFiles) {
    const fileStats = { processed: 0, created: 0, updated: 0, errors: 0 };

    try {
      const filePath = path.join(process.cwd(), jsonFile);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const rawData = JSON.parse(fileContent);
      const comicsData = Array.isArray(rawData)
        ? (rawData as Record<string, unknown>[])
        : [rawData as Record<string, unknown>];

      logger.info(`📖 Processing ${comicsData.length} comic(s) from ${jsonFile}`);

      for (const comicData of comicsData) {
        try {
          // Normalize comic data
          const normalizedData = normalizeComicData(comicData);
          const validatedComic = ComicSchema.parse(normalizedData);

          // Process cover image
          const coverImageUrl = extractCoverImageUrl(validatedComic);
          let uploadedCoverImage = coverImageUrl;
          if (
            coverImageUrl &&
            (coverImageUrl.startsWith("http://") || coverImageUrl.startsWith("https://"))
          ) {
            const uploaded = await downloadAndUploadImage(
              coverImageUrl,
              "covers",
              `${validatedComic.slug}.webp`
            );
            if (uploaded) uploadedCoverImage = uploaded;
          }

          // Process all comic images
          const comicImageUrls = extractComicImageUrls(validatedComic);
          let processedComicImageUrls: string[] = [];
          if (comicImageUrls.length > 0) {
            logger.info(
              `   📸 Processing ${comicImageUrls.length} images for comic: ${validatedComic.title}`
            );
            const uploadedComicImages = await downloadAndUploadImages(
              comicImageUrls,
              `comics/${validatedComic.slug}`,
              5
            );
            processedComicImageUrls = uploadedComicImages.filter(
              (url): url is string => url !== null
            );
            logger.info(
              `   ✓ Processed ${processedComicImageUrls.length}/${comicImageUrls.length} comic images`
            );
          }

          // Get or create author, artist, type, and genres
          const authorId = await findOrCreateAuthor(extractAuthorName(validatedComic));
          if (!authorId) {
            logger.error(
              `Comic '${validatedComic.title}': Author not found or could not be created.`
            );
            totalErrors++;
            fileStats.errors++;
            continue;
          }

          const artistId = await findOrCreateArtist(extractArtistName(validatedComic));
          if (!artistId) {
            logger.error(
              `Comic '${validatedComic.title}': Artist not found or could not be created.`
            );
            totalErrors++;
            fileStats.errors++;
            continue;
          }

          const typeName = validatedComic.type?.name ?? validatedComic.category ?? "Unknown Type";
          const typeId = await findOrCreateType(typeName);
          if (!typeId) {
            logger.error(
              `Comic '${validatedComic.title}': Type not found or could not be created.`
            );
            totalErrors++;
            fileStats.errors++;
            continue;
          }

          const genreIds: number[] = [];
          for (const genre of validatedComic.genres ?? []) {
            if (!genre) continue;
            const genreName = typeof genre === "string" ? genre : genre.name;
            const genreId = await findOrCreateGenre(genreName);
            if (!genreId) {
              logger.error(
                `Comic '${validatedComic.title}': Genre not found or could not be created.`
              );
              continue;
            }
            genreIds.push(genreId);
          }

          // Process and create/update comic
          const result = await processComicRecord(
            validatedComic,
            normalizedData,
            uploadedCoverImage,
            processedComicImageUrls,
            authorId,
            artistId,
            typeId,
            genreIds
          );

          if (result.success) {
            // Determine if created or updated
            const existingComic = await db.query.comic.findFirst({
              where: (table, { eq, or }) =>
                or(eq(table.slug, validatedComic.slug), eq(table.title, validatedComic.title)),
            });
            if (existingComic) {
              totalUpdated++;
              fileStats.updated++;
            } else {
              totalCreated++;
              fileStats.created++;
            }
            totalProcessed++;
            fileStats.processed++;
          } else {
            totalErrors++;
            fileStats.errors++;
            logger.error(`${result.error}`);
          }
        } catch (error) {
          totalErrors++;
          fileStats.errors++;
          logger.error(
            `Comic '${comicData["title"] ?? comicData["slug"]}': Failed to process comic: ${error}`
          );
        }
      }

      fileResults[jsonFile] = fileStats;
      logger.info(
        `✓ ${jsonFile}: ${fileStats.processed} processed, ${fileStats.created} created, ${fileStats.updated} updated, ${fileStats.errors} errors`
      );
    } catch (error) {
      totalErrors++;
      logger.error(`Failed to read ${jsonFile}: ${error}`);
      fileResults[jsonFile] = { processed: 0, created: 0, updated: 0, errors: 1 };
    }
  }

  logger.success(
    `✅ Comics seeding complete: ${totalProcessed} processed, ${totalCreated} created, ${totalUpdated} updated, ${totalErrors} errors`
  );

  if (Object.keys(fileResults).length > 0) {
    logger.info("\n📊 Detailed File Results:");
    for (const [file, stats] of Object.entries(fileResults)) {
      logger.info(
        `   ${file}: ${stats.processed} processed, ${stats.created} created, ${stats.updated} updated, ${stats.errors} errors`
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEED CHAPTERS
// ═══════════════════════════════════════════════════════════════════════════

export async function seedChaptersFromJSON(pattern: string = "chapters*.json"): Promise<void> {
  logger.info("🌱 Seeding chapters from JSON files...");

  const jsonFiles = await discoverJSONFiles(pattern);
  if (jsonFiles.length === 0) {
    logger.warn(`No files found matching pattern: ${pattern}`);
    return;
  }

  logger.info(`📁 Discovered ${jsonFiles.length} file(s): ${jsonFiles.join(", ")}`);

  const results = {
    totalProcessed: 0,
    totalCreated: 0,
    totalUpdated: 0,
    totalErrors: 0,
    totalSkipped: 0,
    fileResults: {} as Record<
      string,
      { processed: number; created: number; updated: number; errors: number; skipped: number }
    >,
  };

  for (const jsonFile of jsonFiles) {
    await processSingleChapterFile(jsonFile, results);
  }

  logChaptersSeedingResults(results);
}

/**
 * Process chapter images - Helper function to reduce complexity
 * @param metadata
 */
async function processChapterImages(
  metadata: ReturnType<typeof extractChapterMetadata>
): Promise<string[]> {
  if (metadata.imageUrls.length === 0) return [];

  logger.info(
    `   📸 Processing ${metadata.imageUrls.length} images for chapter: ${metadata.chapterTitle}`
  );

  const uploadedImages = await downloadAndUploadImages(
    metadata.imageUrls,
    `chapters/${metadata.comicSlug}/${metadata.chapterSlug}`,
    5
  );

  const processedUrls = uploadedImages.filter((url): url is string => url !== null);
  logger.info(`   ✓ Processed ${processedUrls.length}/${metadata.imageUrls.length} chapter images`);

  return processedUrls;
}

/**
 * Process a single chapter from JSON data - Extracted to reduce complexity
 * @param chapterData
 * @param results
 */
async function processSingleChapter(
  chapterData: Record<string, unknown>,
  results: any
): Promise<void> {
  const validatedChapter = ChapterSchema.parse(chapterData);
  const metadata = extractChapterMetadata(validatedChapter);

  if (!metadata.comicSlug) {
    logger.warn(`⚠ Missing comic slug for chapter: ${metadata.chapterTitle}`);
    results.totalSkipped++;
    return;
  }

  const comicRecord = await db.query.comic.findFirst({
    where: eq(comic.slug, metadata.comicSlug),
  });

  if (!comicRecord) {
    logger.warn(
      `⚠ Comic not found for chapter: ${metadata.chapterTitle} (comic: ${metadata.comicSlug})`
    );
    results.totalSkipped++;
    return;
  }

  const processedImageUrls = await processChapterImages(metadata);

  const result = await processChapterRecord(
    validatedChapter,
    metadata,
    comicRecord,
    processedImageUrls
  );

  if (!result.success) {
    logger.error(`${result.error}`);
    results.totalErrors++;
    return;
  }

  const existingChapter = await db.query.chapter.findFirst({
    where: and(eq(chapter.comicId, comicRecord.id), eq(chapter.slug, metadata.chapterSlug)),
  });

  results.totalProcessed++;
  if (existingChapter) {
    results.totalUpdated++;
  } else {
    results.totalCreated++;
  }
}

/**
 * Process a single JSON file for chapters - Extracted to reduce complexity
 * @param jsonFile
 * @param results
 */
async function processSingleChapterFile(jsonFile: string, results: any): Promise<void> {
  const fileStats = { processed: 0, created: 0, updated: 0, errors: 0, skipped: 0 };

  try {
    const filePath = path.join(process.cwd(), jsonFile);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const rawData = JSON.parse(fileContent);
    const chaptersData = Array.isArray(rawData)
      ? (rawData as Record<string, unknown>[])
      : [rawData as Record<string, unknown>];

    logger.info(`📖 Processing ${chaptersData.length} chapter(s) from ${jsonFile}`);

    for (const chapterData of chaptersData) {
      try {
        const beforeProcessing = results.totalProcessed;
        await processSingleChapter(chapterData, results);

        if (results.totalProcessed > beforeProcessing) {
          fileStats.processed++;
          if (results.totalCreated > (results.fileResults[jsonFile]?.created ?? 0)) {
            fileStats.created++;
          } else if (results.totalUpdated > (results.fileResults[jsonFile]?.updated ?? 0)) {
            fileStats.updated++;
          }
        } else if (results.totalSkipped > (results.fileResults[jsonFile]?.skipped ?? 0)) {
          fileStats.skipped++;
        } else {
          fileStats.errors++;
        }
      } catch (error) {
        results.totalErrors++;
        fileStats.errors++;
        logger.error(`Failed to process chapter: ${error}`);
      }
    }

    results.fileResults[jsonFile] = fileStats;
    logger.info(
      `✓ ${jsonFile}: ${fileStats.processed} processed, ${fileStats.created} created, ${fileStats.updated} updated, ${fileStats.skipped} skipped, ${fileStats.errors} errors`
    );
  } catch (error) {
    results.totalErrors++;
    logger.error(`Failed to read ${jsonFile}: ${error}`);
    results.fileResults[jsonFile] = { processed: 0, created: 0, updated: 0, errors: 1, skipped: 0 };
  }
}

/**
 * Log chapters seeding results - Extracted to reduce complexity
 * @param results
 */
function logChaptersSeedingResults<T>(results: T): void {
  logger.success(
    `✅ Chapters seeding complete: ${results.totalProcessed} processed, ${results.totalCreated} created, ${results.totalUpdated} updated, ${results.totalSkipped} skipped, ${results.totalErrors} errors`
  );

  if (Object.keys(results.fileResults).length > 0) {
    logger.info("\n📊 Detailed File Results:");
    for (const [file, stats] of Object.entries(results.fileResults)) {
      logger.info(
        `   ${file}: ${(stats as any).processed} processed, ${(stats as any).created} created, ${(stats as any).updated} updated, ${(stats as any).skipped} skipped, ${(stats as any).errors} errors`
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE CACHE STATISTICS & VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

function logImageCacheStats() {
  const stats = getCacheStats();

  logger.info(`\n${"═".repeat(80)}`);
  logger.info(`📊 IMAGE PROCESSING STATISTICS`);
  logger.info(`${"═".repeat(80)}`);
  logger.info(`\n🎯 Cache Performance:`);
  logger.info(`   • Unique URLs cached:        ${stats.urlCacheSize}`);
  logger.info(`   • Unique images (by hash):   ${stats.hashCacheSize}`);
  logger.info(`   • Cache hits:                ${stats.cacheHits}`);
  logger.info(`   • Cache misses:              ${stats.cacheMisses}`);
  logger.info(`   • Hit rate:                  ${stats.hitRate.toFixed(2)}%`);

  const duplicates = stats.urlCacheSize - stats.hashCacheSize;
  if (duplicates > 0) {
    const savingsPercent = ((duplicates / stats.urlCacheSize) * 100).toFixed(2);
    logger.info(`\n💰 Deduplication Savings:`);
    logger.info(`   • Duplicate images avoided:  ${duplicates}`);
    logger.info(`   • Storage savings:           ${savingsPercent}%`);
    logger.info(`   • Upload requests saved:     ${duplicates} fewer uploads`);
  }

  if (stats.cacheHits + stats.cacheMisses > 0) {
    const efficiency = stats.cacheHits > stats.cacheMisses ? "🟢 Excellent" : "🟡 Good";
    logger.info(`\n📈 Overall Efficiency:         ${efficiency}`);
  }

  logger.info(`${"═".repeat(80)}\n`);
}

/**
 * Validate that all images are using imageService
 * This checks the cache to ensure images were properly processed
 */
function validateImageProcessing(): { valid: boolean; issues: string[] } {
  const stats = getCacheStats();
  const issues: string[] = [];

  // Check if any images were processed
  if (stats.urlCacheSize === 0) {
    issues.push("⚠️  No images were processed during seeding");
  }

  // Check cache efficiency
  if (stats.cacheHits + stats.cacheMisses > 0) {
    const hitRate = (stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100;
    if (hitRate < 10) {
      issues.push(
        `⚠️  Low cache hit rate (${hitRate.toFixed(2)}%) - possible deduplication issues`
      );
    }
  }

  // Check for hash deduplication
  const duplicates = stats.urlCacheSize - stats.hashCacheSize;
  if (stats.urlCacheSize > 0 && duplicates === 0) {
    issues.push("ℹ️  No duplicate images detected (all images are unique)");
  }

  return {
    valid: issues.length === 0 ? true : issues.every((i) => i.startsWith("ℹ️")),
    issues,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN UNIVERSAL SEEDER - Enhanced with Validation
// ═══════════════════════════════════════════════════════════════════════════

export async function seedAllFromJSON(): Promise<void> {
  const startTime = Date.now();

  logger.info("🚀 Starting universal JSON seeding...");
  logger.info("═".repeat(80));

  // Clear image cache for fresh start
  clearCache();
  logger.info("🧹 Image cache cleared");

  try {
    // Seed users
    logger.info("\n" + "═".repeat(80));
    logger.info("👥 PHASE 1: USERS");
    logger.info("═".repeat(80));
    await seedUsersFromJSON(["users.json"]);

    // Seed comics (discover all comics*.json files)
    logger.info("\n" + "═".repeat(80));
    logger.info("📚 PHASE 2: COMICS");
    logger.info("═".repeat(80));
    await seedComicsFromJSON("comics*.json");

    // Seed chapters (discover all chapters*.json files)
    logger.info("\n" + "═".repeat(80));
    logger.info("📖 PHASE 3: CHAPTERS");
    logger.info("═".repeat(80));
    await seedChaptersFromJSON("chapters*.json");

    // Log cache statistics
    logger.info("\n" + "═".repeat(80));
    logImageCacheStats();

    // Validate image processing
    logger.info("═".repeat(80));
    logger.info("🔍 VALIDATION");
    logger.info("═".repeat(80));
    const validation = validateImageProcessing();

    if (validation.issues.length > 0) {
      logger.info("\n📋 Validation Results:");
      for (const issue of validation.issues) {
        logger.info(`   ${issue}`);
      }
    }

    if (validation.valid) {
      logger.success("\n✅ All validations passed!");
    } else {
      logger.warn("\n⚠️  Some validation issues detected (see above)");
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info("═".repeat(80));
    logger.success(`✅ All JSON seeding complete in ${duration}s!`);
    logger.info("═".repeat(80));
  } catch (error) {
    logger.error(`\n❌ Seeding failed: ${error}`);
    throw error;
  }
}
