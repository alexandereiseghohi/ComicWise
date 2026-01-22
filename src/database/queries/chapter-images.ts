import { asc, eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { chapterImage } from "@/database/schema";

/**
 *
 * param imageId
 * @param imageId
 */
export async function getChapterImageById(imageId: number) {
  return await database.query.chapterImage.findFirst({
    where: eq(chapterImage.id, imageId),
  });
}

/**
 *
 * param chapterId
 * @param chapterId
 */
export async function getChapterImages(chapterId: number) {
  return await database.query.chapterImage.findMany({
    where: eq(chapterImage.chapterId, chapterId),
    orderBy: asc(chapterImage.pageNumber),
  });
}

/**
 *
 * param chapterId
 * @param chapterId
 */
export async function getChapterImageCount(chapterId: number) {
  const images = await database
    .select()
    .from(chapterImage)
    .where(eq(chapterImage.chapterId, chapterId));
  return images.length;
}
