/**
 * Genre Data Access Layer
 * Handles all database operations for genres
 */

import type { ListOptions } from "@/dal/base-dal";
import { BaseDal } from "@/dal/base-dal";
import { db } from "@/database/db";
import { genre } from "@/database/schema";
import type { Genre } from "@/types/database";
import { asc, eq } from "drizzle-orm";

// @ts-expect-error - TypeScript limitation: static methods cannot properly override generic static methods
class GenreDal extends BaseDal<Genre, typeof genre.$inferInsert> {
  private static instance: GenreDal;

  private constructor() {
    super("GenreDal");
  }

  static override getInstance(): GenreDal {
    return BaseDal.getInstance("genreDal", () => new GenreDal());
  }

  async create(data: typeof genre.$inferInsert): Promise<Genre | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.insert(genre).values(data).returning()),
      "Creating genre",
      { data }
    );
  }

  async findById(id: number): Promise<Genre | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(genre).where(eq(genre.id, id))),
      "Finding genre by ID",
      { id }
    );
  }

  async findBySlug(slug: string): Promise<Genre | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(genre).where(eq(genre.name, slug))),
      "Finding genre by slug",
      { slug }
    );
  }

  async update(id: number, data: Partial<typeof genre.$inferInsert>): Promise<Genre | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(await db.update(genre).set(data).where(eq(genre.id, id)).returning()),
      "Updating genre",
      { id, data }
    );
  }

  async delete(id: number): Promise<Genre | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.delete(genre).where(eq(genre.id, id)).returning()),
      "Deleting genre",
      { id }
    );
  }

  async list(options: ListOptions = {}): Promise<Genre[]> {
    return this.executeWithLogging(
      async () => await db.select().from(genre).orderBy(asc(genre.name)),
      "Listing genres",
      {}
    );
  }
}

export const genreDal = GenreDal.getInstance();
