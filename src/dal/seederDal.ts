/**
 * Seed Data Access Layer (DAL)
 * Consolidates all database operations for seeding
 * Extracts complexity from universalSeeder.ts
 * Centralizes user, comic, and chapter creation/update logic
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
import type {
    ChapterMetadata,
    ChapterPayload,
    ComicEntities,
    ComicPayload,
    ProcessingResult,
} from "@/dto";
import { logger as baseLogger } from "@/lib/logger";
import { and, eq } from "drizzle-orm";
import type { Logger } from "pino";

/**
 * Seed Data Access Layer - Handles all seed-related database operations
 */
export class SeederDal {
  private logger: Logger;

  constructor() {
    this.logger = baseLogger.child({ context: "SeederDal" });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // USER OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Find user by email or create if not exists
   * @param email
   * @param name
   */
  async findOrCreateUser(email: string, name: string): Promise<string> {
    const existing = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existing) {
      return existing.id;
    }

    const [newUser] = await db
      .insert(user)
      .values({
        email,
        name,
        emailVerified: new Date(),
      })
      .returning();

    return newUser!.id;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // AUTHOR OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Find author by name or create if not exists
   * @param authorName
   */
  async findOrCreateAuthor(authorName: string): Promise<number> {
    const sanitizedName = this.sanitizeName(authorName);

    const existing = await db.query.author.findFirst({
      where: eq(author.name, sanitizedName),
    });

    if (existing) {
      return existing.id;
    }

    const [newAuthor] = await db
      .insert(author)
      .values({
        name: sanitizedName,
        bio: null,
      })
      .returning();

    return newAuthor!.id;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ARTIST OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Find artist by name or create if not exists
   * @param artistName
   */
  async findOrCreateArtist(artistName: string): Promise<number> {
    const sanitizedName = this.sanitizeName(artistName);

    const existing = await db.query.artist.findFirst({
      where: eq(artist.name, sanitizedName),
    });

    if (existing) {
      return existing.id;
    }

    const [newArtist] = await db
      .insert(artist)
      .values({
        name: sanitizedName,
        bio: null,
      })
      .returning();

    return newArtist!.id;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TYPE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Find type by name or create if not exists
   * @param typeName
   */
  async findOrCreateType(typeName: string): Promise<number> {
    const sanitizedName = this.sanitizeName(typeName);

    const existing = await db.query.type.findFirst({
      where: eq(comicType.name, sanitizedName),
    });

    if (existing) {
      return existing.id;
    }

    const [newType] = await db
      .insert(comicType)
      .values({
        name: sanitizedName,
        description: null,
      })
      .returning();

    return newType!.id;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GENRE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Find genre by name or create if not exists
   * @param genreName
   */
  async findOrCreateGenre(genreName: string): Promise<number> {
    const sanitizedName = this.sanitizeName(genreName);

    const existing = await db.query.genre.findFirst({
      where: eq(genre.name, sanitizedName),
    });

    if (existing) {
      return existing.id;
    }

    // Generate slug from sanitized name
    const slug = sanitizedName
      .toLowerCase()
      .replaceAll(/[^\s\w-]/g, "")
      .replaceAll(/\s+/g, "-")
      .replaceAll(/-+/g, "-")
      .trim();

    const [newGenre] = await db
      .insert(genre)
      .values({
        name: sanitizedName,
        slug,
        description: null,
      })
      .returning();

    return newGenre!.id;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COMIC OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Check if comic exists by slug or title
   * @param slug
   * @param title
   */
  async findExistingComic(
    slug: string,
    title: string
  ): Promise<{ id: number; exists: boolean } | null> {
    const existing = await db.query.comic.findFirst({
      where: (table, { eq, or }) => or(eq(table.slug, slug), eq(table.title, title)),
    });

    return existing ? { id: existing.id, exists: true } : null;
  }

  /**
   * Create or update comic with relationships
   * @param payload
   * @param entities
   * @param imageUrls
   */
  async upsertComic(
    payload: ComicPayload,
    entities: ComicEntities,
    imageUrls: string[] = []
  ): Promise<ProcessingResult> {
    try {
      const existing = await this.findExistingComic(payload.slug, payload.title);

      let comicId: number;

      if (existing) {
        await db
          .update(comic)
          .set({
            ...payload,
            updatedAt: new Date(),
          })
          .where(eq(comic.id, existing.id));
        comicId = existing.id;
        this.logger.info(`✓ Updated comic: ${payload.title}`);
      } else {
        const [newComic] = await db.insert(comic).values(payload).returning();
        comicId = newComic!.id;
        this.logger.info(`✓ Created comic: ${payload.title}`);
      }

      // Handle images
      await this.saveComicImages(comicId, imageUrls);

      // Handle genres
      await this.updateComicGenres(comicId, entities.genreIds);

      return { success: true, id: comicId, created: !existing };
    } catch (error) {
      const message = this.extractErrorMessage(error, "Failed to process comic");
      return { success: false, error: message };
    }
  }

  /**
   * Save comic images to database
   * @param comicId
   * @param imageUrls
   */
  private async saveComicImages(comicId: number, imageUrls: string[]): Promise<void> {
    if (imageUrls.length === 0) return;

    await db.delete(comicImage).where(eq(comicImage.comicId, comicId));
    const records = imageUrls.map((url, index) => ({
      comicId,
      imageUrl: url,
      imageOrder: index + 1,
    }));
    await db.insert(comicImage).values(records);
    this.logger.info(`   ✓ Saved ${records.length} comic images`);
  }

  /**
   * Update comic genre associations
   * @param comicId
   * @param genreIds
   */
  private async updateComicGenres(comicId: number, genreIds: number[]): Promise<void> {
    await db.delete(comicToGenre).where(eq(comicToGenre.comicId, comicId));
    for (const genreId of genreIds) {
      await db.insert(comicToGenre).values({ comicId, genreId }).onConflictDoNothing();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CHAPTER OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Check if chapter exists for a comic
   * @param comicId
   * @param slug
   */
  async findExistingChapter(
    comicId: number,
    slug: string
  ): Promise<{ id: number; exists: boolean } | null> {
    const existing = await db.query.chapter.findFirst({
      where: and(eq(chapter.comicId, comicId), eq(chapter.slug, slug)),
    });

    return existing ? { id: existing.id, exists: true } : null;
  }

  /**
   * Create or update chapter with images
   * @param metadata
   * @param payload
   * @param imageUrls
   */
  async upsertChapter(
    metadata: ChapterMetadata,
    payload: ChapterPayload,
    imageUrls: string[] = []
  ): Promise<ProcessingResult> {
    try {
      const existing = await this.findExistingChapter(payload.comicId, metadata.chapterSlug);

      let chapterId: number;

      if (existing) {
        await db.update(chapter).set(payload).where(eq(chapter.id, existing.id));
        chapterId = existing.id;
        this.logger.info(`✓ Updated chapter: ${metadata.chapterTitle}`);
      } else {
        const [newChapter] = await db.insert(chapter).values(payload).returning();
        chapterId = newChapter!.id;
        this.logger.info(`✓ Created chapter: ${metadata.chapterTitle}`);
      }

      // Handle images
      await this.saveChapterImages(chapterId, imageUrls);

      return { success: true, id: chapterId, created: !existing };
    } catch (error) {
      const message = this.extractErrorMessage(error, "Failed to process chapter");
      return { success: false, error: message };
    }
  }

  /**
   * Save chapter images to database
   * @param chapterId
   * @param imageUrls
   */
  private async saveChapterImages(chapterId: number, imageUrls: string[]): Promise<void> {
    if (imageUrls.length === 0) return;

    await db.delete(chapterImage).where(eq(chapterImage.chapterId, chapterId));
    const records = imageUrls.map((url, index) => ({
      chapterId,
      imageUrl: url,
      pageNumber: index + 1,
    }));
    await db.insert(chapterImage).values(records);
    this.logger.info(`   ✓ Saved ${records.length} chapter images`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Sanitize names (handle unknown/default values)
   * @param name
   */
  private sanitizeName(name: string): string {
    if (!name || name === "_" || name === "Unknown") {
      return "Unknown";
    }
    return name.trim();
  }

  /**
   * Extract error message from database error
   * @param error
   * @param defaultMessage
   */
  private extractErrorMessage(error: any, defaultMessage: string): string {
    if (error?.code === "23505") {
      return "Duplicate entry (unique constraint violation). Skipping.";
    }
    if (error?.constraint) {
      return `${defaultMessage}: Constraint violation - ${error.constraint}`;
    }
    if (error?.message) {
      return `${defaultMessage}: ${error.message}`;
    }
    return defaultMessage;
  }
}

/**
 * Singleton instance
 */
let instance: SeederDal | null = null;

/**
 * Get or create seeder DAL instance
 */
export function getSeederDal(): SeederDal {
  if (!instance) {
    instance = new SeederDal();
  }
  return instance;
}
