/**
 * Comic Data Access Layer
 * Handles all database operations for comics
 */

import type { ListOptions } from "@/dal/baseDal";
import { BaseDal } from "@/dal/baseDal";
import { db } from "@/database/db";
import { comic, comicToGenre } from "@/database/schema";
import type { Comic, ComicStatus } from "@/types/database";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, like, sql } from "drizzle-orm";

interface ComicListOptions extends ListOptions {
  status?: string;
  type?: string;
  orderBy?: "latest" | "popular" | "rating";
}

// @ts-expect-error - TypeScript limitation: static methods cannot properly override generic static methods
class ComicDal extends BaseDal<Comic, typeof comic.$inferInsert> {
  private static instance: ComicDal;

  private constructor() {
    super("ComicDal");
  }

  static override getInstance(): ComicDal {
    return BaseDal.getInstance("comicDal", () => new ComicDal());
  }

  override async create(data: typeof comic.$inferInsert): Promise<Comic | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.insert(comic).values(data).returning()),
      "Creating comic",
      { data }
    );
  }

  async findById(id: number): Promise<Comic | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(comic).where(eq(comic.id, id))),
      "Finding comic by ID",
      { id }
    );
  }

  async findBySlug(slug: string): Promise<Comic | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(comic).where(eq(comic.slug, slug))),
      "Finding comic by slug",
      { slug }
    );
  }

  async update(id: number, data: Partial<typeof comic.$inferInsert>): Promise<Comic | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(await db.update(comic).set(data).where(eq(comic.id, id)).returning()),
      "Updating comic",
      { id, data }
    );
  }

  async delete(id: number): Promise<Comic | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.delete(comic).where(eq(comic.id, id)).returning()),
      "Deleting comic",
      { id }
    );
  }

  async list(options: ComicListOptions = {}): Promise<Comic[]> {
    const { limit = 20, offset = 0, status, type, search, orderBy = "latest" } = options;

    return this.executeWithLogging(
      async () => {
        const conditions: SQL[] = [];

        if (status) {
          conditions.push(eq(comic.status, status as ComicStatus));
        }

        if (type) {
          conditions.push(eq(comic.typeId, Number(type)));
        }

        if (search) {
          conditions.push(like(comic.title, `%${search}%`));
        }

        let query = db.select().from(comic);

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as typeof query;
        }

        switch (orderBy) {
          case "popular":
            query = query.orderBy(desc(comic.views)) as typeof query;
            break;
          case "rating":
            query = query.orderBy(desc(comic.rating)) as typeof query;
            break;
          case "latest":
          default:
            query = query.orderBy(desc(comic.createdAt)) as typeof query;
            break;
        }

        return await query.limit(limit).offset(offset);
      },
      "Listing comics",
      { limit, offset, status, type, search, orderBy }
    );
  }

  async assignGenres(comicId: number, genreIds: number[]): Promise<void> {
    return this.executeWithLogging(
      async () => {
        // Delete existing associations
        await db.delete(comicToGenre).where(eq(comicToGenre.comicId, comicId));

        // Insert new associations
        if (genreIds.length > 0) {
          await db.insert(comicToGenre).values(genreIds.map((genreId) => ({ comicId, genreId })));
        }
      },
      "Assigning genres to comic",
      { comicId, genreCount: genreIds.length }
    );
  }

  async incrementViews(id: number): Promise<void> {
    return this.executeWithLogging(
      async () => {
        await db
          .update(comic)
          .set({ views: sql`${comic.views} + 1` })
          .where(eq(comic.id, id));
      },
      "Incrementing comic views",
      { id }
    );
  }
}

export const comicDal = ComicDal.getInstance();
