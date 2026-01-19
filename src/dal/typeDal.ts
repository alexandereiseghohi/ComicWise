/**
 * Type Data Access Layer
 * Handles all database operations for types
 */

import type { ListOptions } from "@/dal/baseDal";
import { BaseDal } from "@/dal/baseDal";
import { db } from "@/database/db";
import { type as typeTable } from "@/database/schema";
import type { Type } from "@/types/database";
import { asc, eq } from "drizzle-orm";

// @ts-expect-error - TypeScript limitation: static methods cannot properly override generic static methods
class TypeDal extends BaseDal<Type, typeof typeTable.$inferInsert> {
  private static instance: TypeDal;

  private constructor() {
    super("TypeDal");
  }

  static override getInstance(): TypeDal {
    return BaseDal.getInstance("typeDal", () => new TypeDal());
  }

  async create(data: typeof typeTable.$inferInsert): Promise<Type | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.insert(typeTable).values(data).returning()),
      "Creating type",
      { data }
    );
  }

  async findById(id: number): Promise<Type | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(typeTable).where(eq(typeTable.id, id))),
      "Finding type by ID",
      { id }
    );
  }

  async findByName(name: string): Promise<Type | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(await db.select().from(typeTable).where(eq(typeTable.name, name))),
      "Finding type by name",
      { name }
    );
  }

  async update(
    id: number,
    data: Partial<typeof typeTable.$inferInsert>
  ): Promise<Type | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(
          await db.update(typeTable).set(data).where(eq(typeTable.id, id)).returning()
        ),
      "Updating type",
      { id, data }
    );
  }

  async delete(id: number): Promise<Type | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(await db.delete(typeTable).where(eq(typeTable.id, id)).returning()),
      "Deleting type",
      { id }
    );
  }

  async list(options: ListOptions = {}): Promise<Type[]> {
    return this.executeWithLogging(
      async () => await db.select().from(typeTable).orderBy(asc(typeTable.name)),
      "Listing types",
      {}
    );
  }
}

export const typeDal = TypeDal.getInstance();
