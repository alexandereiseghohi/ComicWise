import { eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { genre } from "@/database/schema";

/**
 *
 * param data
 * param data.name
 * param data.description
 * @param data
 * @param data.name
 * @param data.description
 */
export async function createGenre(data: {
  name: string;
  description?: string | null;
}): Promise<typeof genre.$inferSelect | undefined> {
  const slug = data.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();

  const [newGenre] = await database
    .insert(genre)
    .values({
      name: data.name,
      slug,
      description: data.description || null,
      createdAt: new Date(),
    })
    .returning();
  return newGenre;
}

/**
 *
 * param genreId
 * param data
 * param data.name
 * param data.description
 * @param genreId
 * @param data
 * @param data.name
 * @param data.description
 */
export async function updateGenre(
  genreId: number,
  data: {
    name?: string;
    description?: string | null;
  }
): Promise<typeof genre.$inferSelect | undefined> {
  const cleanData: Partial<typeof genre.$inferInsert> = {};
  if (data.name !== undefined) cleanData.name = data.name;
  if (data.description !== undefined) cleanData.description = data.description || null;

  const [updatedGenre] = await database
    .update(genre)
    .set(cleanData)
    .where(eq(genre.id, genreId))
    .returning();
  return updatedGenre;
}

/**
 *
 * param genreId
 * @param genreId
 */
export async function deleteGenre(genreId: number): Promise<typeof genre.$inferSelect | undefined> {
  const [deletedGenre] = await database.delete(genre).where(eq(genre.id, genreId)).returning();
  return deletedGenre;
}
