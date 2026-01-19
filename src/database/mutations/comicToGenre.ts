import { and, eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { comicToGenre } from "@/database/schema";

/**
 *
 * param comicId
 * param genreId
 * @param comicId
 * @param genreId
 */
export async function addGenreToComic(
  comicId: number,
  genreId: number
): Promise<typeof comicToGenre.$inferSelect | undefined> {
  const [newRelation] = await database
    .insert(comicToGenre)
    .values({
      comicId,
      genreId,
    })
    .returning();
  return newRelation;
}

/**
 *
 * param comicId
 * param genreIds
 * @param comicId
 * @param genreIds
 */
export async function addGenresToComic(
  comicId: number,
  genreIds: number[]
): Promise<(typeof comicToGenre.$inferSelect)[]> {
  const relations = await database
    .insert(comicToGenre)
    .values(genreIds.map((genreId) => ({ comicId, genreId })))
    .returning();
  return relations;
}

/**
 *
 * param comicId
 * param genreId
 * @param comicId
 * @param genreId
 */
export async function removeGenreFromComic(
  comicId: number,
  genreId: number
): Promise<typeof comicToGenre.$inferSelect | undefined> {
  const [deletedRelation] = await database
    .delete(comicToGenre)
    .where(and(eq(comicToGenre.comicId, comicId), eq(comicToGenre.genreId, genreId)))
    .returning();
  return deletedRelation;
}

/**
 *
 * param comicId
 * @param comicId
 */
export async function removeAllGenresFromComic(
  comicId: number
): Promise<(typeof comicToGenre.$inferSelect)[]> {
  const deletedRelations = await database
    .delete(comicToGenre)
    .where(eq(comicToGenre.comicId, comicId))
    .returning();
  return deletedRelations;
}

/**
 *
 * param comicId
 * param genreIds
 * @param comicId
 * @param genreIds
 */
export async function updateComicGenres(
  comicId: number,
  genreIds: number[]
): Promise<(typeof comicToGenre.$inferSelect)[]> {
  // Remove existing genres
  await database.delete(comicToGenre).where(eq(comicToGenre.comicId, comicId));

  // Add new genres
  if (genreIds.length > 0) {
    return await addGenresToComic(comicId, genreIds);
  }
  return [];
}
