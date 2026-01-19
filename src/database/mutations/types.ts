import { eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { type } from "@/database/schema";

/**
 *
 * param data
 * param data.name
 * param data.description
 * @param data
 * @param data.name
 * @param data.description
 */
export async function createType(data: {
  name: string;
  description?: string | null;
}): Promise<typeof type.$inferSelect | undefined> {
  const [newType] = await database
    .insert(type)
    .values({
      name: data.name,
      description: data.description || null,
      createdAt: new Date(),
    })
    .returning();
  return newType;
}

/**
 *
 * param typeId
 * param data
 * param data.name
 * param data.description
 * @param typeId
 * @param data
 * @param data.name
 * @param data.description
 */
export async function updateType(
  typeId: number,
  data: {
    name?: string;
    description?: string | null;
  }
): Promise<typeof type.$inferSelect | undefined> {
  const cleanData: Partial<typeof type.$inferInsert> = {};
  if (data.name !== undefined) cleanData.name = data.name;
  if (data.description !== undefined) cleanData.description = data.description || null;

  const [updatedType] = await database
    .update(type)
    .set(cleanData)
    .where(eq(type.id, typeId))
    .returning();
  return updatedType;
}

/**
 *
 * param typeId
 * @param typeId
 */
export async function deleteType(typeId: number): Promise<typeof type.$inferSelect | undefined> {
  const [deletedType] = await database.delete(type).where(eq(type.id, typeId)).returning();
  return deletedType;
}
