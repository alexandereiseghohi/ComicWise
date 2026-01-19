import { and, asc, desc, eq, gt, lt } from "drizzle-orm";

import { db as database } from "@/database/db";
import { chapter, chapterImage, comic } from "@/database/schema";

// Seed helper: find chapter by comic and chapter number
export async function getChapterByComicAndNumber(comicId: number, chapterNumber: number) {
  return await database.query.chapter.findFirst({
    where: and(eq(chapter.comicId, comicId), eq(chapter.chapterNumber, chapterNumber)),
  });
}

/**
 *
 * param comicId
 * @param comicId
 */
export async function getChaptersByComicId(comicId: number) {
  return await database
    .select()
    .from(chapter)
    .where(eq(chapter.comicId, comicId))
    .orderBy(asc(chapter.chapterNumber));
}

/**
 *
 * param chapterId
 * @param chapterId
 */
export async function getChapter(chapterId: number) {
  const result = await database
    .select({
      chapter: chapter,
      comic: comic,
    })
    .from(chapter)
    .leftJoin(comic, eq(chapter.comicId, comic.id))
    .where(eq(chapter.id, chapterId))
    .limit(1);

  if (!result[0]) return null;

  const images = await database
    .select()
    .from(chapterImage)
    .where(eq(chapterImage.chapterId, chapterId))
    .orderBy(asc(chapterImage.pageNumber));

  return {
    ...result[0].chapter,
    comic: result[0].comic,
    images,
  };
}

/**
 *
 * param chapterId
 * @param chapterId
 */
export async function getChapterImages(chapterId: number) {
  return await database
    .select()
    .from(chapterImage)
    .where(eq(chapterImage.chapterId, chapterId))
    .orderBy(asc(chapterImage.pageNumber));
}

/**
 *
 * param currentChapterId
 * @param currentChapterId
 */
export async function getNextChapter(currentChapterId: number) {
  const current = await database
    .select()
    .from(chapter)
    .where(eq(chapter.id, currentChapterId))
    .limit(1);

  if (!current[0]) return null;

  const next = await database
    .select()
    .from(chapter)
    .where(
      and(
        eq(chapter.comicId, current[0].comicId),
        gt(chapter.chapterNumber, current[0].chapterNumber)
      )
    )
    .orderBy(asc(chapter.chapterNumber))
    .limit(1);

  return next[0] || null;
}

/**
 *
 * param currentChapterId
 * @param currentChapterId
 */
export async function getPreviousChapter(currentChapterId: number) {
  const current = await database
    .select()
    .from(chapter)
    .where(eq(chapter.id, currentChapterId))
    .limit(1);

  if (!current[0]) return null;

  const previous = await database
    .select()
    .from(chapter)
    .where(
      and(
        eq(chapter.comicId, current[0].comicId),
        lt(chapter.chapterNumber, current[0].chapterNumber)
      )
    )
    .orderBy(desc(chapter.chapterNumber))
    .limit(1);

  return previous[0] || null;
}

/**
 *
 * param comicId
 * @param comicId
 */
export async function getFirstChapter(comicId: number) {
  const result = await database
    .select()
    .from(chapter)
    .where(eq(chapter.comicId, comicId))
    .orderBy(asc(chapter.chapterNumber))
    .limit(1);

  return result[0] || null;
}

/**
 *
 * param comicId
 * @param comicId
 */
export async function getLatestChapter(comicId: number) {
  const result = await database
    .select()
    .from(chapter)
    .where(eq(chapter.comicId, comicId))
    .orderBy(desc(chapter.chapterNumber))
    .limit(1);

  return result[0] || null;
}

// Wrapper function for API compatibility
/**
 *
 * param filters
 * param filters.comicId
 * param filters.search
 * param filters.page
 * param filters.limit
 * param filters.sortBy
 * param filters.sortOrder
 * @param filters
 * @param filters.comicId
 * @param filters.search
 * @param filters.page
 * @param filters.limit
 * @param filters.sortBy
 * @param filters.sortOrder
 */
export async function getAllChapters(filters?: {
  comicId?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const {
    comicId,
    search,
    page = 1,
    limit = 12,
    sortBy = "chapterNumber",
    sortOrder = "asc",
  } = filters || {};

  let query = database.select().from(chapter).$dynamic();

  if (comicId) {
    query = query.where(eq(chapter.comicId, comicId));
  }

  if (search) {
    query = query.where(eq(chapter.title, `%${search}%`));
  }

  // Apply sorting
  if (sortBy === "chapterNumber") {
    query = query.orderBy(
      sortOrder === "asc" ? asc(chapter.chapterNumber) : desc(chapter.chapterNumber)
    );
  } else if (sortBy === "views") {
    query = query.orderBy(sortOrder === "asc" ? asc(chapter.views) : desc(chapter.views));
  } else {
    query = query.orderBy(sortOrder === "asc" ? asc(chapter.createdAt) : desc(chapter.createdAt));
  }

  const offset = (page - 1) * limit;
  const chapters = await query.limit(limit).offset(offset);

  // Get total count
  let countQuery = database.select().from(chapter).$dynamic();
  if (comicId) {
    countQuery = countQuery.where(eq(chapter.comicId, comicId));
  }
  const allChapters = await countQuery;
  const total = allChapters.length;

  return {
    chapters,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
