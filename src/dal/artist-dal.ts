/**
 * Artist Data Access Layer
 * Handles all database operations for artists
 */

import type { ListOptions } from "@/dal/base-dal";
import { BaseDal } from "@/dal/base-dal";
import { db } from "@/database/db";
import { artist } from "@/database/schema";
import type { Artist } from "@/types/database";
import { desc, eq, like } from "drizzle-orm";

// @ts-expect-error - TypeScript limitation: static methods cannot properly override generic static methods
class ArtistDal extends BaseDal<Artist, typeof artist.$inferInsert> {
  private static instance: ArtistDal;

  private constructor() {
    super("ArtistDal");
  }

  static override getInstance(): ArtistDal {
    return BaseDal.getInstance("artistDal", () => new ArtistDal());
  }

  async create(data: typeof artist.$inferInsert): Promise<Artist | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.insert(artist).values(data).returning()),
      "Creating artist",
      { data }
    );
  }

  async findById(id: number): Promise<Artist | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(artist).where(eq(artist.id, id))),
      "Finding artist by ID",
      { id }
    );
  }

  async findByName(name: string): Promise<Artist | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(artist).where(eq(artist.name, name))),
      "Finding artist by name",
      { name }
    );
  }

  async update(id: number, data: Partial<typeof artist.$inferInsert>): Promise<Artist | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(await db.update(artist).set(data).where(eq(artist.id, id)).returning()),
      "Updating artist",
      { id, data }
    );
  }

  async delete(id: number): Promise<Artist | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.delete(artist).where(eq(artist.id, id)).returning()),
      "Deleting artist",
      { id }
    );
  }

  async list(options: ListOptions = {}): Promise<Artist[]> {
    const { limit = 50, offset = 0, search } = options;

    return this.executeWithLogging(
      async () => {
        let query = db.select().from(artist);

        if (search) {
          query = query.where(like(artist.name, `%${search}%`));
        }

        return await query.orderBy(desc(artist.createdAt)).limit(limit).offset(offset);
      },
      "Listing artists",
      { limit, offset, search }
    );
  }
}

export const artistDal = ArtistDal.getInstance();
