import { eq, sql } from "drizzle-orm";

import { db as database } from "@/database/db";
import { chapter, chapterImage } from "@/database/schema";

interface CreateChapterData {
  title: string;
  chapterNumber: number;
  releaseDate: Date;
  comicId: number;
  slug?: string;
}

/**
 *
 * param data
 * @param data
 */
export async function createChapter(
  data: CreateChapterData
): Promise<typeof chapter.$inferSelect | undefined> {
  const { slug: providedSlug, title } = data as { slug?: string; title: string };
  const slugModule = await import("@/lib/utils");
  const slugify = slugModule.slugify;
  const slug = providedSlug ?? slugify(title);

  const [newChapter] = await database
    .insert(chapter)
    .values({
      ...data,
      slug,
      views: 0,
    })
    .returning();

  return newChapter;
}

interface UpdateChapterData {
  title?: string;
  chapterNumber?: number;
  releaseDate?: Date;
}

/**
 *
 * param chapterId
 * param data
 * @param chapterId
 * @param data
 */
export async function updateChapter(
  chapterId: number,
  data: UpdateChapterData
): Promise<typeof chapter.$inferSelect | undefined> {
  const [updated] = await database
    .update(chapter)
    .set(data)
    .where(eq(chapter.id, chapterId))
    .returning();

  return updated;
}

/**
 *
 * param chapterId
 * @param chapterId
 */
export async function deleteChapter(
  chapterId: number
): Promise<typeof chapter.$inferSelect | undefined> {
  await database.delete(chapterImage).where(eq(chapterImage.chapterId, chapterId));

  const [deleted] = await database.delete(chapter).where(eq(chapter.id, chapterId)).returning();

  return deleted;
}

/**
 *
 * param chapterId
 * @param chapterId
 */
export async function incrementChapterViews(
  chapterId: number
): Promise<typeof chapter.$inferSelect | undefined> {
  const [updated] = await database
    .update(chapter)
    .set({
      views: sql`${chapter.views} + 1`,
    })
    .where(eq(chapter.id, chapterId))
    .returning();

  return updated;
}

interface AddChapterImageData {
  chapterId: number;
  imageUrl: string;
  pageNumber: number;
}

/**
 *
 * param data
 * @param data
 */
export async function addChapterImage(data: AddChapterImageData) {
  const [newImage] = await database.insert(chapterImage).values(data).returning();

  return newImage;
}

/**
 *
 * param chapterId
 * param imageUrls
 * @param chapterId
 * @param imageUrls
 */
export async function addChapterImages(chapterId: number, imageUrls: string[]) {
  const images = imageUrls.map((url, index) => ({
    chapterId,
    imageUrl: url,
    pageNumber: index + 1,
  }));

  return await database.insert(chapterImage).values(images).returning();
}

/**
 *
 * param imageId
 * @param imageId
 */
export async function deleteChapterImage(imageId: number) {
  const [deleted] = await database
    .delete(chapterImage)
    .where(eq(chapterImage.id, imageId))
    .returning();

  return deleted;
}
