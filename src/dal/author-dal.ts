/**
 * Author Data Access Layer
 * Handles all database operations for authors
 */

import type { ListOptions } from "@/dal/base-dal";
import { BaseDal } from "@/dal/base-dal";
import { db } from "@/database/db";
import { author } from "@/database/schema";
import type { Author } from "@/types/database";
import { desc, eq, like } from "drizzle-orm";

// @ts-expect-error - TypeScript limitation: static methods cannot properly override generic static methods
class AuthorDal extends BaseDal<Author, typeof author.$inferInsert> {
  private static instance: AuthorDal;

  private constructor() {
    super("AuthorDal");
  }

  static override getInstance(): AuthorDal {
    return BaseDal.getInstance("authorDal", () => new AuthorDal());
  }

  async create(data: typeof author.$inferInsert): Promise<Author | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.insert(author).values(data).returning()),
      "Creating author",
      { data }
    );
  }

  async findById(id: number): Promise<Author | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(author).where(eq(author.id, id))),
      "Finding author by ID",
      { id }
    );
  }

  async findByName(name: string): Promise<Author | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(author).where(eq(author.name, name))),
      "Finding author by name",
      { name }
    );
  }

  async update(id: number, data: Partial<typeof author.$inferInsert>): Promise<Author | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(await db.update(author).set(data).where(eq(author.id, id)).returning()),
      "Updating author",
      { id, data }
    );
  }

  async delete(id: number): Promise<Author | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.delete(author).where(eq(author.id, id)).returning()),
      "Deleting author",
      { id }
    );
  }

  async list(options: ListOptions = {}): Promise<Author[]> {
    const { limit = 50, offset = 0, search } = options;

    return this.executeWithLogging(
      async () => {
        let query = db.select().from(author);

        if (search) {
          query = query.where(like(author.name, `%${search}%`));
        }

        return await query.orderBy(desc(author.createdAt)).limit(limit).offset(offset);
      },
      "Listing authors",
      { limit, offset, search }
    );
  }
}

export const authorDal = AuthorDal.getInstance();
