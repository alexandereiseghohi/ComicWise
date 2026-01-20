import { and, eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { bookmark } from "@/database/schema";

/**
 *
 * param userId
 * param comicId
 * param chapterId
 * @param userId
 * @param comicId
 * @param chapterId
 * @param status
 */
export async function addBookmark(
  userId: string,
  comicId: number,
  chapterId?: number,
  status?: string
): Promise<typeof bookmark.$inferSelect | undefined> {
  const [newBookmark] = await database
    .insert(bookmark)
    .values({
      userId,
      comicId,
      lastReadChapterId: chapterId,
      status: status || "Reading",
    })
    .onConflictDoUpdate({
      target: [bookmark.userId, bookmark.comicId],
      set: {
        lastReadChapterId: chapterId,
        status: status || "Reading",
        updatedAt: new Date(),
      },
    })
    .returning();

  return newBookmark;
}

/**
 *
 * param userId
 * param comicId
 * @param userId
 * @param comicId
 */
export async function removeBookmark(
  userId: string,
  comicId: number
): Promise<typeof bookmark.$inferSelect | undefined> {
  const [deleted] = await database
    .delete(bookmark)
    .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
    .returning();

  return deleted;
}

/**
 *
 * param userId
 * param comicId
 * param chapterId
 * @param userId
 * @param comicId
 * @param chapterId
 */
export async function updateReadingProgress(
  userId: string,
  comicId: number,
  chapterId: number
): Promise<typeof bookmark.$inferSelect | undefined> {
  const [updated] = await database
    .update(bookmark)
    .set({
      lastReadChapterId: chapterId,
      updatedAt: new Date(),
    })
    .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
    .returning();

  return updated;
}

/**
 *
 * param userId
 * param comicId
 * param notes
 * @param userId
 * @param comicId
 * @param notes
 */
export async function updateBookmarkNotes(
  userId: string,
  comicId: number,
  notes: string
): Promise<typeof bookmark.$inferSelect | undefined> {
  const [updated] = await database
    .update(bookmark)
    .set({
      notes,
      updatedAt: new Date(),
    })
    .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
    .returning();

  return updated;
}

/**
 * Update bookmark status (Reading, PlanToRead, Completed, Dropped, OnHold)
 * @param userId - User ID
 * @param comicId - Comic ID
 * @param status - New bookmark status
 */
export async function updateBookmarkStatus(
  userId: string,
  comicId: number,
  status: string
): Promise<typeof bookmark.$inferSelect | undefined> {
  const [updated] = await database
    .update(bookmark)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
    .returning();

  return updated;
}
