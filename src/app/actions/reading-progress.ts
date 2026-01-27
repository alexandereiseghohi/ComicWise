"use server";

import { db } from "@/database/db";
import { chapter, comic, readingProgress } from "@/database/schema";
import type { SimpleActionResult } from "@/dto";
import { auth } from "auth";
import { and, desc, eq, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface SaveProgressData {
  comicId: number;
  chapterId: number;
  pageNumber: number;
  scrollPosition: number;
  totalPages: number;
}

export interface ReadingHistory {
  id: number;
  comicId: number;
  comicTitle: string;
  chapterId: number;
  chapterTitle: string;
  chapterNumber: number;
  pageNumber: number;
  progressPercent: number;
  lastReadAt: Date;
  completedAt: Date | null;
}

/**
 * Save reading progress for a chapter
 * param data
 * @param data
 */
export async function saveReadingProgress(data: SaveProgressData): Promise<SimpleActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate progress percentage
    const progressPercent = Math.round((data.pageNumber / data.totalPages) * 100);

    // Check if completed (>95% read)
    const completedAt = progressPercent >= 95 ? new Date() : null;

    // Check if progress exists
    const existing = await db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.userId, session.user.id),
          eq(readingProgress.chapterId, data.chapterId)
        )
      )
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      // Update existing progress
      await db
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
        .where(eq(readingProgress.id, existing[0].id));
    } else {
      // Create new progress
      await db.insert(readingProgress).values({
        userId: session.user.id,
        comicId: data.comicId,
        chapterId: data.chapterId,
        pageNumber: data.pageNumber,
        scrollPosition: data.scrollPosition,
        totalPages: data.totalPages,
        progressPercent,
        completedAt,
        lastReadAt: new Date(),
      });
    }

    // Revalidate the comic page by slug if available (route uses slug). Fall back to the comics index.
    try {
      const comicRow = await db
        .select({ slug: comic.slug })
        .from(comic)
        .where(eq(comic.id, data.comicId))
        .limit(1);

      const slug = (comicRow[0] as any)?.slug;
      if (slug) {
        revalidatePath(`/comics/${slug}`);
      } else {
        revalidatePath("/comics");
      }
    } catch (e) {
      // If DB lookup fails, still revalidate the index to ensure progress is visible somewhere
      revalidatePath("/comics");
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to save reading progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save progress",
    };
  }
}

/**
 * Get reading progress for a chapter
 * param chapterId
 * @param chapterId
 */
export async function getReadingProgress(chapterId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const progress = await db
      .select()
      .from(readingProgress)
      .where(
        and(eq(readingProgress.userId, session.user.id), eq(readingProgress.chapterId, chapterId))
      )
      .limit(1);

    return { success: true, data: progress[0] || null };
  } catch (error) {
    console.error("Failed to get reading progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get progress",
    };
  }
}

/**
 * Get reading history for user
 * param limit
 * @param limit
 */
export async function getReadingHistory(
  limit = 20
): Promise<{ success: boolean; data?: ReadingHistory[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

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
      .where(eq(readingProgress.userId, session.user.id))
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(limit);

    const formattedHistory: ReadingHistory[] = history.map((item: any) => ({
      id: item.id,
      comicId: item.comicId,
      comicTitle: item.comicTitle ?? "Unknown",
      chapterId: item.chapterId,
      chapterTitle: item.chapterTitle ?? "Unknown",
      chapterNumber: item.chapterNumber ?? 0,
      pageNumber: item.pageNumber,
      progressPercent: item.progressPercent,
      lastReadAt: item.lastReadAt,
      completedAt: item.completedAt,
    }));

    return { success: true, data: formattedHistory };
  } catch (error) {
    console.error("Failed to get reading history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get history",
    };
  }
}

/**
 * Get continue reading list (comics with progress)
 * param limit
 * @param limit
 */
export async function getContinueReading(limit = 10) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get latest progress for each comic (not completed)
    const progress = await db
      .select({
        id: readingProgress.id,
        comicId: readingProgress.comicId,
        chapterId: readingProgress.chapterId,
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
      .where(
        and(eq(readingProgress.userId, session.user.id), lt(readingProgress.progressPercent, 100))
      )
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(limit);

    return { success: true, data: progress };
  } catch (error) {
    console.error("Failed to get continue reading list:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get continue reading",
    };
  }
}

/**
 * Delete reading progress
 * param progressId
 * @param progressId
 */
export async function deleteReadingProgress(progressId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .delete(readingProgress)
      .where(and(eq(readingProgress.id, progressId), eq(readingProgress.userId, session.user.id)));

    revalidatePath("/profile/history");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete reading progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete progress",
    };
  }
}
