"use server";

import { db } from "@/database/db";
import { chapter, comic, readingProgress } from "@/database/schema";
import { cacheKeys, cacheService, cacheTTL } from "@/services/cache-service";
import { and, desc, eq, lt, sql } from "drizzle-orm";

export interface ReadingProgressData {
  userId: string;
  chapterId: number;
  comicId: number;
  pageNumber: number;
  scrollPosition: number;
  totalPages: number;
}

export interface ReadingHistory {
  id: number;
  chapterId: number;
  comicId: number;
  comicTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  pageNumber: number;
  progressPercent: number;
  lastReadAt: Date;
  completedAt: Date | null;
}

export interface ReadingStats {
  totalComics: number;
  totalChapters: number;
  completedChapters: number;
  totalPages: number;
  pagesRead: number;
}

/**
 *
 */
export class ReadingProgressService {
  /**
   * Save reading progress for a chapter
   * param data
   * @param data
   */
  async saveProgress(data: ReadingProgressData): Promise<void> {
    try {
      const progressPercent = Math.round((data.pageNumber / data.totalPages) * 100);
      const completedAt = progressPercent >= 95 ? new Date() : null;

      // Check if progress exists
      const existing = await db
        .select()
        .from(readingProgress)
        .where(
          and(
            eq(readingProgress.userId, data.userId),
            eq(readingProgress.chapterId, data.chapterId)
          )
        )
        .limit(1);

      await (existing.length > 0 && existing[0]
        ? db
            .update(readingProgress)
            .set({
              pageNumber: data.pageNumber,
              scrollPosition: data.scrollPosition,
              totalPages: data.totalPages,
              progressPercent,
              completedAt: completedAt || existing[0].completedAt,
              lastReadAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(readingProgress.id, existing[0].id))
        : db.insert(readingProgress).values({
            userId: data.userId,
            chapterId: data.chapterId,
            comicId: data.comicId,
            pageNumber: data.pageNumber,
            scrollPosition: data.scrollPosition,
            totalPages: data.totalPages,
            progressPercent,
            completedAt,
            lastReadAt: new Date(),
          }));

      await cacheService.delete(cacheKeys.userReadingProgress(data.userId, data.comicId));
      await cacheService.delete(cacheKeys.userReadingHistory(data.userId));
    } catch (error) {
      console.error("Failed to save reading progress:", error);
      throw error;
    }
  }

  /**
   * Get reading progress for a chapter
   * param userId
   * param chapterId
   * @param userId
   * @param chapterId
   */
  async getProgress(userId: string, chapterId: number) {
    try {
      const progress = await db
        .select()
        .from(readingProgress)
        .where(and(eq(readingProgress.userId, userId), eq(readingProgress.chapterId, chapterId)))
        .limit(1);

      return progress[0] || null;
    } catch (error) {
      console.error("Failed to get reading progress:", error);
      return null;
    }
  }

  /**
   * Get reading progress for a comic
   * param userId
   * param comicId
   * @param userId
   * @param comicId
   */
  async getComicProgress(userId: string, comicId: number) {
    try {
      return await cacheService.getOrSet(
        cacheKeys.userReadingProgress(userId, comicId),
        async () => {
          const progress = await db
            .select()
            .from(readingProgress)
            .where(and(eq(readingProgress.userId, userId), eq(readingProgress.comicId, comicId)))
            .orderBy(desc(readingProgress.lastReadAt))
            .limit(1);

          return progress[0] || null;
        },
        { ttl: cacheTTL.SHORT }
      );
    } catch (error) {
      console.error("Failed to get comic progress:", error);
      return null;
    }
  }

  /**
   * Get reading history for user
   * param userId
   * param limit
   * @param userId
   * @param limit
   */
  async getHistory(userId: string, limit = 20): Promise<ReadingHistory[]> {
    try {
      return await cacheService.getOrSet(
        cacheKeys.userReadingHistory(userId),
        async () => {
          const history = await db
            .select({
              id: readingProgress.id,
              chapterId: readingProgress.chapterId,
              comicId: readingProgress.comicId,
              pageNumber: readingProgress.pageNumber,
              progressPercent: readingProgress.progressPercent,
              lastReadAt: readingProgress.lastReadAt,
              completedAt: readingProgress.completedAt,
              comicTitle: comic.title,
              chapterTitle: chapter.title,
              chapterNumber: chapter.chapterNumber,
            })
            .from(readingProgress)
            .leftJoin(comic, eq(readingProgress.comicId, comic.id))
            .leftJoin(chapter, eq(readingProgress.chapterId, chapter.id))
            .where(eq(readingProgress.userId, userId))
            .orderBy(desc(readingProgress.lastReadAt))
            .limit(limit);

          return history.map((item: any) => ({
            id: item.id,
            chapterId: item.chapterId,
            comicId: item.comicId,
            comicTitle: item.comicTitle ?? "Unknown",
            chapterTitle: item.chapterTitle ?? "Unknown",
            chapterNumber: item.chapterNumber ?? 0,
            pageNumber: item.pageNumber,
            progressPercent: item.progressPercent,
            lastReadAt: item.lastReadAt,
            completedAt: item.completedAt,
          }));
        },
        { ttl: cacheTTL.SHORT }
      );
    } catch (error) {
      console.error("Failed to get reading history:", error);
      return [];
    }
  }

  /**
   * Get continue reading list
   * param userId
   * param limit
   * @param userId
   * @param limit
   */
  async getContinueReading(userId: string, limit = 10) {
    try {
      return await db
        .select({
          id: readingProgress.id,
          chapterId: readingProgress.chapterId,
          comicId: readingProgress.comicId,
          pageNumber: readingProgress.pageNumber,
          progressPercent: readingProgress.progressPercent,
          lastReadAt: readingProgress.lastReadAt,
          comicTitle: comic.title,
          chapterTitle: chapter.title,
          chapterNumber: chapter.chapterNumber,
        })
        .from(readingProgress)
        .leftJoin(comic, eq(readingProgress.comicId, comic.id))
        .leftJoin(chapter, eq(readingProgress.chapterId, chapter.id))
        .where(and(eq(readingProgress.userId, userId), lt(readingProgress.progressPercent, 100)))
        .orderBy(desc(readingProgress.lastReadAt))
        .limit(limit);
    } catch (error) {
      console.error("Failed to get continue reading:", error);
      return [];
    }
  }

  /**
   * Get completed chapters
   * param userId
   * param limit
   * @param userId
   * @param limit
   */
  async getCompletedChapters(userId: string, limit = 20) {
    try {
      return await db
        .select()
        .from(readingProgress)
        .where(
          and(eq(readingProgress.userId, userId), sql`${readingProgress.completedAt} IS NOT NULL`)
        )
        .orderBy(desc(readingProgress.completedAt))
        .limit(limit);
    } catch (error) {
      console.error("Failed to get completed chapters:", error);
      return [];
    }
  }

  /**
   * Delete reading progress
   * param userId
   * param progressId
   * @param userId
   * @param progressId
   */
  async deleteProgress(userId: string, progressId: number): Promise<boolean> {
    try {
      const progress = await db
        .select()
        .from(readingProgress)
        .where(eq(readingProgress.id, progressId))
        .limit(1);

      if (progress.length === 0 || progress[0]?.userId !== userId) {
        return false;
      }

      await db.delete(readingProgress).where(eq(readingProgress.id, progressId));

      await cacheService.delete(cacheKeys.userReadingProgress(userId, progress[0].comicId));
      await cacheService.delete(cacheKeys.userReadingHistory(userId));

      return true;
    } catch (error) {
      console.error("Failed to delete reading progress:", error);
      return false;
    }
  }

  /**
   * Clear all progress for a comic
   * param userId
   * param comicId
   * @param userId
   * @param comicId
   */
  async clearComicProgress(userId: string, comicId: number): Promise<void> {
    try {
      await db
        .delete(readingProgress)
        .where(and(eq(readingProgress.userId, userId), eq(readingProgress.comicId, comicId)));

      await cacheService.delete(cacheKeys.userReadingProgress(userId, comicId));
      await cacheService.delete(cacheKeys.userReadingHistory(userId));
    } catch (error) {
      console.error("Failed to clear comic progress:", error);
      throw error;
    }
  }

  /**
   * Get reading statistics
   * param userId
   * @param userId
   */
  async getStats(userId: string): Promise<ReadingStats> {
    try {
      const stats = await db
        .select({
          totalComics: sql<number>`COUNT(DISTINCT ${readingProgress.comicId})`,
          totalChapters: sql<number>`COUNT(DISTINCT ${readingProgress.chapterId})`,
          completedChapters: sql<number>`COUNT(CASE WHEN ${readingProgress.completedAt} IS NOT NULL THEN 1 END)`,
          totalPages: sql<number>`SUM(${readingProgress.totalPages})`,
          pagesRead: sql<number>`SUM(${readingProgress.pageNumber})`,
        })
        .from(readingProgress)
        .where(eq(readingProgress.userId, userId));

      return {
        totalComics: stats[0]?.totalComics ?? 0,
        totalChapters: stats[0]?.totalChapters ?? 0,
        completedChapters: stats[0]?.completedChapters ?? 0,
        totalPages: stats[0]?.totalPages ?? 0,
        pagesRead: stats[0]?.pagesRead ?? 0,
      };
    } catch (error) {
      console.error("Failed to get reading stats:", error);
      return {
        totalComics: 0,
        totalChapters: 0,
        completedChapters: 0,
        totalPages: 0,
        pagesRead: 0,
      };
    }
  }
}

// Export async wrappers for server actions
const readingProgressService = new ReadingProgressService();

export const getReadingStats = async (userId: string) => {
  return readingProgressService.getStats(userId);
};
