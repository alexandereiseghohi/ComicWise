import { eq, sql } from "drizzle-orm";

import { db as database } from "@/database/db";
import { chapter, comic, comicToGenre } from "@/database/schema";

interface CreateComicData {
  title: string;
  description: string;
  coverImage: string;
  status?: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
  publicationDate: Date;
  authorId?: number;
  artistId?: number;
  typeId?: number;
  genreIds?: number[];
  slug?: string;
}

/**
 *
 * param data
 * @param data
 */
export async function createComic(data: CreateComicData): Promise<typeof comic.$inferSelect> {
  const { genreIds, ...comicData } = data;
  const { slug: providedSlug, title } = comicData as { slug?: string; title: string };
  const slugModule = await import("@/lib/utils");
  const slugify = slugModule.slugify;
  const slug = providedSlug ?? slugify(title);

  const [newComic] = await database
    .insert(comic)
    .values({
      ...comicData,
      slug,
      status: comicData.status ?? "Ongoing",
      rating: "0",
      views: 0,
    })
    .returning();

  if (!newComic) {
    throw new Error("Failed to create comic");
  }

  if (genreIds && genreIds.length > 0) {
    await database.insert(comicToGenre).values(
      genreIds.map((genreId) => ({
        comicId: newComic.id,
        genreId,
      }))
    );
  }

  return newComic;
}

interface UpdateComicData {
  title?: string;
  description?: string;
  coverImage?: string;
  status?: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
  publicationDate?: Date;
  authorId?: number;
  artistId?: number;
  typeId?: number;
  genreIds?: number[];
}

/**
 *
 * param comicId
 * param data
 * @param comicId
 * @param data
 */
export async function updateComic(
  comicId: number,
  data: UpdateComicData
): Promise<typeof comic.$inferSelect | undefined> {
  const { genreIds, ...updateData } = data;

  const [updatedComic] = await database
    .update(comic)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(comic.id, comicId))
    .returning();

  if (genreIds !== undefined) {
    await database.delete(comicToGenre).where(eq(comicToGenre.comicId, comicId));

    if (genreIds.length > 0) {
      await database.insert(comicToGenre).values(
        genreIds.map((genreId) => ({
          comicId,
          genreId,
        }))
      );
    }
  }

  return updatedComic;
}

/**
 *
 * param comicId
 * @param comicId
 */
export async function deleteComic(comicId: number): Promise<typeof comic.$inferSelect | undefined> {
  await database.delete(chapter).where(eq(chapter.comicId, comicId));

  await database.delete(comicToGenre).where(eq(comicToGenre.comicId, comicId));

  const [deletedComic] = await database.delete(comic).where(eq(comic.id, comicId)).returning();

  return deletedComic;
}

/**
 *
 * param comicId
 * @param comicId
 */
export async function incrementViews(
  comicId: number
): Promise<typeof comic.$inferSelect | undefined> {
  const [updated] = await database
    .update(comic)
    .set({
      views: sql`${comic.views} + 1`,
    })
    .where(eq(comic.id, comicId))
    .returning();

  return updated;
}

/**
 *
 * param comicId
 * param newRating
 * @param comicId
 * @param newRating
 */
export async function updateComicRating(
  comicId: number,
  newRating: number
): Promise<typeof comic.$inferSelect | undefined> {
  const [updated] = await database
    .update(comic)
    .set({
      rating: newRating.toFixed(2),
    })
    .where(eq(comic.id, comicId))
    .returning();

  return updated;
}
