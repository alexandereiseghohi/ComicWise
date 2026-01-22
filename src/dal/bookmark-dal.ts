/**
 * Bookmark Data Access Layer
 * Handles all database operations for bookmarks
 */

import type { ListOptions } from "@/dal/base-dal";
import { BaseDal } from "@/dal/base-dal";
import { db } from "@/database/db";
import { bookmark } from "@/database/schema";
import type { Bookmark } from "@/types/database";
import { and, desc, eq } from "drizzle-orm";

// @ts-expect-error - TypeScript limitation: static methods cannot properly override generic static methods
export class BookmarkDal extends BaseDal<Bookmark, typeof bookmark.$inferInsert> {
  private static instance: BookmarkDal;

  private constructor() {
    super("BookmarkDal");
  }

  static override getInstance(): BookmarkDal {
    return BaseDal.getInstance("bookmarkDal", () => new BookmarkDal());
  }

  override async create(data: typeof bookmark.$inferInsert): Promise<Bookmark | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.insert(bookmark).values(data).returning()),
      "Creating bookmark",
      { userId: data.userId, comicId: data.comicId }
    );
  }

  override async update(
    id: string | number,
    data: Partial<typeof bookmark.$inferInsert>
  ): Promise<Bookmark | undefined> {
    // For bookmarks with composite key, use updateByUserAndComic instead
    // This method is kept for BaseDal compatibility
    return undefined;
  }

  override async delete(id: string | number): Promise<Bookmark | undefined> {
    // For bookmarks with composite key, use deleteByUserAndComic instead
    // This method is kept for BaseDal compatibility
    return undefined;
  }

  override async findById(id: string | number): Promise<Bookmark | undefined> {
    // For bookmarks with composite key, use findByUserAndComic instead
    // This method is kept for BaseDal compatibility
    return undefined;
  }

  override async list(options?: ListOptions): Promise<Bookmark[]> {
    const { limit = 50, offset = 0 } = options ?? {};
    return this.executeWithLogging(
      async () =>
        await db
          .select()
          .from(bookmark)
          .orderBy(desc(bookmark.createdAt))
          .limit(limit)
          .offset(offset),
      "Listing bookmarks",
      { limit, offset }
    );
  }

  async findByUserAndComic(userId: string, comicId: number): Promise<Bookmark | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(
          await db
            .select()
            .from(bookmark)
            .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
        ),
      "Finding bookmark by user and comic",
      { userId, comicId }
    );
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<Bookmark[]> {
    return this.executeWithLogging(
      async () =>
        await db
          .select()
          .from(bookmark)
          .where(eq(bookmark.userId, userId))
          .orderBy(desc(bookmark.createdAt))
          .limit(limit)
          .offset(offset),
      "Finding bookmarks by user ID",
      { userId, limit, offset }
    );
  }

  async updateByUserAndComic(
    userId: string,
    comicId: number,
    data: Partial<typeof bookmark.$inferInsert>
  ): Promise<Bookmark | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(
          await db
            .update(bookmark)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
            .returning()
        ),
      "Updating bookmark by user and comic",
      { userId, comicId }
    );
  }

  async deleteByUserAndComic(userId: string, comicId: number): Promise<Bookmark | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(
          await db
            .delete(bookmark)
            .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
            .returning()
        ),
      "Deleting bookmark by user and comic",
      { userId, comicId }
    );
  }
}

export const bookmarkDal = BookmarkDal.getInstance();
