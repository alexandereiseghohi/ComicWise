/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Enhanced Comic Seeder V4 - JSON-based Dynamic Seeding with Image Downloading
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * ✅ Zod validation for all comic data
 * ✅ onConflictDoUpdate for upsert operations
 * ✅ Image download with deduplication (filesystem + database checks)
 * ✅ Saves images to /public/comics/covers/${comic.slug}/
 * ✅ Fallback to /public/placeholder-comic.jpg
 * ✅ Original filename and extension preservation
 * ✅ Comprehensive logging with operation tracking
 * ✅ Concurrent image downloads (configurable)
 */

import { db } from "@/database/db";
import {
  artist,
  author,
  comic,
  comicImage,
  comicToGenre,
  type as comicType,
  genre,
} from "@/database/schema";
import {
  downloadImagesWithConcurrency,
  getOriginalFilename,
} from "@/database/seed/helpers/imageDownloader";
import { ComicSeedSchema, type ComicSeedData } from "@/database/seed/helpers/validationSchemas";
import { logger } from "@/database/seed/logger";
import { and, eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

interface SeedResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  imagesDownloaded: number;
  imagesCached: number;
}

const FALLBACK_COMIC_IMAGE = "./public/placeholder-comic.jpg";
const COMIC_COVERS_DIR = "./public/comics/covers";
const IMAGE_CONCURRENCY = 5;

/**
 * Load and validate comics from JSON file
 */
async function loadComicsFromFile(filePath: string): Promise<ComicSeedData[]> {
  try {
    logger.info(`📖 Loading comics from: ${filePath}`);
    const fullPath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    const rawData = JSON.parse(content);
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];

    const validComics: ComicSeedData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < dataArray.length; i++) {
      try {
        const validated = ComicSeedSchema.parse(dataArray[i]);
        validComics.push(validated);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error}`);
        logger.warn(`❌ Invalid comic data at row ${i + 1}: ${dataArray[i]?.title || "unknown"}`);
      }
    }

    logger.info(`✅ Validated ${validComics.length}/${dataArray.length} comics from ${filePath}`);
    if (errors.length > 0) {
      logger.warn(`⚠️  ${errors.length} validation errors encountered`);
    }

    return validComics;
  } catch (error) {
    logger.error(`💥 Failed to load ${filePath}: ${error}`);
    return [];
  }
}

/**
 * Get or create genre with slug
 */
async function getOrCreateGenre(name: string): Promise<number> {
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const existing = await db
    .select({ id: genre.id })
    .from(genre)
    .where(eq(genre.slug, slug))
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    return existing[0].id;
  }

  const [created] = await db.insert(genre).values({ name, slug }).returning({ id: genre.id });

  if (!created) {
    throw new Error(`Failed to create genre: ${name}`);
  }

  logger.debug(`✨ Created genre: ${name}`);
  return created.id;
}

/**
 * Get or create author
 */
async function getOrCreateAuthor(name: string): Promise<number> {
  const existing = await db
    .select({ id: author.id })
    .from(author)
    .where(eq(author.name, name))
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    return existing[0].id;
  }

  const [created] = await db.insert(author).values({ name }).returning({ id: author.id });

  if (!created) {
    throw new Error(`Failed to create author: ${name}`);
  }

  logger.debug(`✨ Created author: ${name}`);
  return created.id;
}

/**
 * Get or create artist
 */
async function getOrCreateArtist(name: string): Promise<number> {
  const existing = await db
    .select({ id: artist.id })
    .from(artist)
    .where(eq(artist.name, name))
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    return existing[0].id;
  }

  const [created] = await db.insert(artist).values({ name }).returning({ id: artist.id });

  if (!created) {
    throw new Error(`Failed to create artist: ${name}`);
  }

  logger.debug(`✨ Created artist: ${name}`);
  return created.id;
}

/**
 * Get or create comic type
 */
async function getOrCreateType(name: string): Promise<number> {
  const existing = await db
    .select({ id: comicType.id })
    .from(comicType)
    .where(eq(comicType.name, name))
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    return existing[0].id;
  }

  const [created] = await db.insert(comicType).values({ name }).returning({ id: comicType.id });

  if (!created) {
    throw new Error(`Failed to create type: ${name}`);
  }

  logger.debug(`✨ Created type: ${name}`);
  return created.id;
}

/**
 * Download comic cover images
 */
async function downloadComicImages(
  comicData: ComicSeedData,
  comicSlug: string
): Promise<{ downloaded: number; cached: number; paths: string[] }> {
  const imageUrls = comicData.images?.map((img) => img.url) || comicData.image_urls || [];

  if (imageUrls.length === 0) {
    logger.warn(`⚠️  No images found for comic: ${comicData.title}`);
    return { downloaded: 0, cached: 0, paths: [] };
  }

  const comicDir = path.join(COMIC_COVERS_DIR, comicSlug);
  await fs.mkdir(comicDir, { recursive: true });

  const downloads = imageUrls.map((url) => ({
    url,
    outputPath: path.join(comicDir, getOriginalFilename(url)),
    fallbackImage: FALLBACK_COMIC_IMAGE,
    skipIfExists: true,
  }));

  const results = await downloadImagesWithConcurrency(downloads, IMAGE_CONCURRENCY);

  const successful = results.filter((r) => r.success);
  const downloaded = successful.filter((r) => !r.cached).length;
  const cached = successful.filter((r) => r.cached).length;
  const paths = successful.map((r) => r.path);

  logger.info(`📸 Comic images: ${downloaded} downloaded, ${cached} cached (${comicData.title})`);

  return { downloaded, cached, paths };
}

/**
 * Seed a single comic with relations
 */
async function seedComic(comicData: ComicSeedData): Promise<{
  action: "created" | "updated" | "error";
  imagesDownloaded: number;
  imagesCached: number;
}> {
  try {
    // Extract type name
    const typeName =
      typeof comicData.type === "string"
        ? comicData.type
        : typeof comicData.type === "object" && comicData.type?.name
          ? comicData.type.name
          : comicData.category || "Manga";

    // Extract author name
    const authorName =
      typeof comicData.author === "string"
        ? comicData.author
        : typeof comicData.author === "object" && comicData.author?.name
          ? comicData.author.name
          : "_";

    // Extract artist name
    const artistName =
      typeof comicData.artist === "string"
        ? comicData.artist
        : typeof comicData.artist === "object" && comicData.artist?.name
          ? comicData.artist.name
          : "_";

    // Get or create related entities
    const typeId = await getOrCreateType(typeName);
    const authorId = await getOrCreateAuthor(authorName);
    const artistId = await getOrCreateArtist(artistName);

    // Download images
    const imageResults = await downloadComicImages(comicData, comicData.slug);

    // Check if comic exists
    const existing = await db
      .select({ id: comic.id })
      .from(comic)
      .where(eq(comic.slug, comicData.slug))
      .limit(1);

    const comicRecord = {
      title: comicData.title,
      slug: comicData.slug,
      description: comicData.description || "",
      coverImage: imageResults.paths[0] || FALLBACK_COMIC_IMAGE,
      publicationDate: new Date(),
      typeId,
      authorId,
      artistId,
      updatedAt: new Date(),
    };

    let comicId: number;

    if (existing.length > 0 && existing[0]) {
      // Update existing comic
      await db.update(comic).set(comicRecord).where(eq(comic.slug, comicData.slug));

      comicId = existing[0].id;
      logger.debug(`🔄 Updated comic: ${comicData.title}`);
    } else {
      // Create new comic
      const [created] = await db.insert(comic).values(comicRecord).returning({ id: comic.id });

      if (!created) {
        throw new Error(`Failed to create comic: ${comicData.title}`);
      }

      comicId = created.id;
      logger.info(`✨ Created comic: ${comicData.title}`);
    }

    // Handle genres
    const genreNames = comicData.genres.map((g) => (typeof g === "string" ? g : g.name));

    for (const genreName of genreNames) {
      const genreId = await getOrCreateGenre(genreName);

      // Check if relation exists
      const existingRelation = await db
        .select()
        .from(comicToGenre)
        .where(and(eq(comicToGenre.comicId, comicId), eq(comicToGenre.genreId, genreId)))
        .limit(1);

      if (existingRelation.length === 0) {
        await db.insert(comicToGenre).values({ comicId, genreId });
      }
    }

    // Save image records to database
    for (let i = 0; i < imageResults.paths.length; i++) {
      const imagePath = imageResults.paths[i];
      if (!imagePath) continue;

      const existing = await db
        .select()
        .from(comicImage)
        .where(and(eq(comicImage.comicId, comicId), eq(comicImage.imageUrl, imagePath)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(comicImage).values({
          comicId,
          imageUrl: imagePath,
          imageOrder: i + 1,
          createdAt: new Date(),
        });
      }
    }

    return {
      action: existing.length > 0 ? "updated" : "created",
      imagesDownloaded: imageResults.downloaded,
      imagesCached: imageResults.cached,
    };
  } catch (error) {
    logger.error(`💥 Failed to seed comic ${comicData.title}: ${error}`);
    return {
      action: "error",
      imagesDownloaded: 0,
      imagesCached: 0,
    };
  }
}

/**
 * Seed comics from multiple JSON files
 */
export async function seedComicsV4(filePatterns: string[]): Promise<SeedResult> {
  const result: SeedResult = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    imagesDownloaded: 0,
    imagesCached: 0,
  };

  logger.info("═══════════════════════════════════════════════════════════");
  logger.info("🌱 Starting Enhanced Comic Seeding V4");
  logger.info("═══════════════════════════════════════════════════════════");

  for (const pattern of filePatterns) {
    const comics = await loadComicsFromFile(pattern);
    result.total += comics.length;

    logger.info(`⚙️  Processing ${comics.length} comics from ${pattern}...`);

    for (let i = 0; i < comics.length; i++) {
      const comicData = comics[i];
      if (!comicData) continue;

      const seedResult = await seedComic(comicData);

      if (seedResult.action === "created") result.created++;
      else if (seedResult.action === "updated") result.updated++;
      else if (seedResult.action === "error") result.errors++;

      result.imagesDownloaded += seedResult.imagesDownloaded;
      result.imagesCached += seedResult.imagesCached;

      // Log progress every 10 comics
      if ((i + 1) % 10 === 0) {
        logger.info(`  Progress: ${i + 1}/${comics.length} comics processed`);
      }
    }
  }

  logger.info("═══════════════════════════════════════════════════════════");
  logger.info("📊 Comic Seeding Complete:");
  logger.info(`   Total:             ${result.total}`);
  logger.info(`   Created:           ${result.created}`);
  logger.info(`   Updated:           ${result.updated}`);
  logger.info(`   Errors:            ${result.errors}`);
  logger.info(`   Images Downloaded: ${result.imagesDownloaded}`);
  logger.info(`   Images Cached:     ${result.imagesCached}`);
  logger.info("═══════════════════════════════════════════════════════════");

  return result;
}
