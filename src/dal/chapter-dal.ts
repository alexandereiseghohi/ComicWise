/**
 * Chapter Data Access Layer
 * Handles all database operations for chapters
 */

import type { ListOptions } from "@/dal/base-dal";
import { BaseDal } from "@/dal/base-dal";
import { db } from "@/database/db";
import { chapter } from "@/database/schema";
import type { Chapter } from "@/types/database";
import { and, asc, desc, eq } from "drizzle-orm";

// @ts-expect-error - TypeScript limitation: static methods cannot properly override generic static methods
export class ChapterDal extends BaseDal<Chapter, typeof chapter.$inferInsert> {
  private static instance: ChapterDal;

  private constructor() {
    super("ChapterDal");
  }

  static override getInstance(): ChapterDal {
    return BaseDal.getInstance("chapterDal", () => new ChapterDal());
  }

  override async create(data: typeof chapter.$inferInsert): Promise<Chapter | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.insert(chapter).values(data).returning()),
      "Creating chapter",
      { data }
    );
  }

  override async findById(id: number): Promise<Chapter | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(chapter).where(eq(chapter.id, id))),
      "Finding chapter by ID",
      { id }
    );
  }

  override async update(
    id: number,
    data: Partial<typeof chapter.$inferInsert>
  ): Promise<Chapter | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(await db.update(chapter).set(data).where(eq(chapter.id, id)).returning()),
      "Updating chapter",
      { id, data }
    );
  }

  override async delete(id: number): Promise<Chapter | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.delete(chapter).where(eq(chapter.id, id)).returning()),
      "Deleting chapter",
      { id }
    );
  }

  override async list(options?: ListOptions): Promise<Chapter[]> {
    const { limit = 20, offset = 0 } = options ?? {};
    return this.executeWithLogging(
      async () =>
        await db
          .select()
          .from(chapter)
          .orderBy(desc(chapter.createdAt))
          .limit(limit)
          .offset(offset),
      "Listing chapters",
      { limit, offset }
    );
  }

  async findByComicId(comicId: number, order: "asc" | "desc" = "asc"): Promise<Chapter[]> {
    const orderFunction = order === "asc" ? asc : desc;
    return this.executeWithLogging(
      async () =>
        await db
          .select()
          .from(chapter)
          .where(eq(chapter.comicId, comicId))
          .orderBy(orderFunction(chapter.chapterNumber)),
      "Finding chapters by comic ID",
      { comicId, order }
    );
  }

  async findBySlug(comicId: number, slug: string): Promise<Chapter | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(
          await db
            .select()
            .from(chapter)
            .where(and(eq(chapter.comicId, comicId), eq(chapter.slug, slug)))
        ),
      "Finding chapter by slug",
      { comicId, slug }
    );
  }

  async getNextChapter(comicId: number, currentNumber: number): Promise<Chapter | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(
          await db
            .select()
            .from(chapter)
            .where(and(eq(chapter.comicId, comicId), eq(chapter.chapterNumber, currentNumber + 1)))
        ),
      "Getting next chapter",
      { comicId, currentNumber }
    );
  }

  async getPreviousChapter(comicId: number, currentNumber: number): Promise<Chapter | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(
          await db
            .select()
            .from(chapter)
            .where(and(eq(chapter.comicId, comicId), eq(chapter.chapterNumber, currentNumber - 1)))
        ),
      "Getting previous chapter",
      { comicId, currentNumber }
    );
  }
}

export const chapterDal = ChapterDal.getInstance();
