"use server";

import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { chapter, chapterImage, comic } from "@/database/schema";
import type { ActionResult } from "@/dto";
import type { ChapterFilterInput, CreateChapterInput, UpdateChapterInput } from "@/lib/validations";
import { chapterFilterSchema, createChapterSchema, updateChapterSchema } from "@/lib/validations";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { slugify } from "utils";

type ParsedCreateChapter = CreateChapterInput & { slug?: string };

// ═══════════════════════════════════════════════════
// CREATE CHAPTER
// ═══════════════════════════════════════════════════

export async function createChapter(
  input: CreateChapterInput
): Promise<ActionResult<typeof chapter.$inferSelect>> {
  try {
    const validated = createChapterSchema.parse(input) as ParsedCreateChapter;

    // Check if comic exists
    const comicRecord = await database.query.comic.findFirst({
      where: eq(comic.id, validated.comicId),
    });

    if (!comicRecord) {
      return { success: false, error: "Comic not found" };
    }

    const slug = validated.slug ?? slugify(validated.title);

    const [newChapter] = await database
      .insert(chapter)
      .values({
        ...validated,
        slug,
        views: 0,
      })
      .returning();

    if (!newChapter) {
      return { success: false, error: "Failed to create chapter" };
    }

    // Send notifications to users who bookmarked this comic (async)
    if (appConfig.features.email) {
      // This would query bookmarks and send emails - implement as needed
      console.log(`New chapter ${newChapter.id} created for comic ${comicRecord.id}`);
    }

    revalidatePath("/admin/chapters");
    revalidatePath(`/comics/${validated.comicId}`);

    return {
      success: true,
      data: newChapter,
      message: "Chapter created successfully",
    };
  } catch (error) {
    console.error("Create chapter error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create chapter",
    };
  }
}

// ═══════════════════════════════════════════════════
// UPDATE CHAPTER
// ═══════════════════════════════════════════════════

export async function updateChapter(
  id: number,
  input: UpdateChapterInput
): Promise<ActionResult<typeof chapter.$inferSelect>> {
  try {
    const validated = updateChapterSchema.parse(input);

    const [updatedChapter] = await database
      .update(chapter)
      .set({
        ...validated,
      })
      .where(eq(chapter.id, id))
      .returning();

    if (!updatedChapter) {
      return { success: false, error: "Chapter not found" };
    }

    revalidatePath("/admin/chapters");
    revalidatePath(`/comics/${updatedChapter.comicId}`);
    revalidatePath(`/read/${id}`);

    return {
      success: true,
      data: updatedChapter,
      message: "Chapter updated successfully",
    };
  } catch (error) {
    console.error("Update chapter error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update chapter",
    };
  }
}

// ═══════════════════════════════════════════════════
// DELETE CHAPTER
// ═══════════════════════════════════════════════════

export async function deleteChapter(id: number): Promise<ActionResult<void>> {
  try {
    const existingChapter = await database.query.chapter.findFirst({
      where: eq(chapter.id, id),
    });

    if (!existingChapter) {
      return { success: false, error: "Chapter not found" };
    }

    await database.delete(chapter).where(eq(chapter.id, id));

    revalidatePath("/admin/chapters");
    revalidatePath(`/comics/${existingChapter.comicId}`);

    return {
      success: true,
      data: undefined,
      message: "Chapter deleted successfully",
    };
  } catch (error) {
    console.error("Delete chapter error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete chapter",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET CHAPTER BY ID
// ═══════════════════════════════════════════════════

export async function getChapterById(id: number) {
  try {
    const result = await database.query.chapter.findFirst({
      where: eq(chapter.id, id),
      with: {
        comic: {
          with: {
            author: true,
            artist: true,
          },
        },
      },
    });

    if (!result) {
      return { success: false, error: "Chapter not found" };
    }

    // Increment view count
    await database
      .update(chapter)
      .set({ views: sql`${chapter.views} + 1` })
      .where(eq(chapter.id, id));

    return { success: true, data: result };
  } catch (error) {
    console.error("Get chapter error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get chapter",
    };
  }
}

// ═══════════════════════════════════════════════════
// LIST CHAPTERS WITH FILTERS
// ═══════════════════════════════════════════════════

export async function listChapters(input?: ChapterFilterInput) {
  try {
    const validated = chapterFilterSchema.parse(input || {});
    const {
      page = 1,
      limit = appConfig.pagination?.chaptersPerPage ?? 12,
      comicId,
      sortBy = "chapterNumber",
      sortOrder = "asc",
    } = validated;

    const offset = (page - 1) * limit;

    const conditions: SQL<unknown>[] = [];
    if (comicId) {
      conditions.push(eq(chapter.comicId, comicId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(chapter)
      .where(whereClause);

    const total = countResult?.count ?? 0;

    // Get chapters
    const results = await database.query.chapter.findMany({
      where: whereClause,
      with: {
        comic: true,
      },
      limit,
      offset,
      orderBy: (chapters, { desc: descOrder, asc }) => {
        const order = sortOrder === "desc" ? descOrder : asc;
        switch (sortBy) {
          case "releaseDate":
            return [order(chapters.releaseDate)];
          case "views":
            return [order(chapters.views)];
          default:
            return [order(chapters.chapterNumber)];
        }
      },
    });

    return {
      success: true,
      data: {
        chapters: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("List chapters error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list chapters",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET CHAPTERS BY COMIC
// ═══════════════════════════════════════════════════

export async function getChaptersByComic(comicId: number) {
  try {
    const results = await database.query.chapter.findMany({
      where: eq(chapter.comicId, comicId),
      orderBy: [desc(chapter.chapterNumber)],
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Get chapters by comic error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get chapters",
    };
  }
}

// ═══════════════════════════════════════════════════
// ADD CHAPTER IMAGES
// ═══════════════════════════════════════════════════

export async function addChapterImages(
  chapterId: number,
  images: Array<{ imageUrl: string; pageNumber: number }>
): Promise<ActionResult<void>> {
  try {
    // Verify chapter exists
    const chapterRecord = await database.query.chapter.findFirst({
      where: eq(chapter.id, chapterId),
    });

    if (!chapterRecord) {
      return { success: false, error: "Chapter not found" };
    }

    // Delete existing images
    await database.delete(chapterImage).where(eq(chapterImage.chapterId, chapterId));

    // Insert new images
    if (images.length > 0) {
      await database.insert(chapterImage).values(
        images.map((img) => ({
          chapterId,
          imageUrl: img.imageUrl,
          pageNumber: img.pageNumber,
        }))
      );
    }

    revalidatePath(`/read/${chapterId}`);

    return {
      success: true,
      data: undefined,
      message: "Chapter images updated successfully",
    };
  } catch (error) {
    console.error("Add chapter images error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add images",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET CHAPTER IMAGES
// ═══════════════════════════════════════════════════

export async function getChapterImages(chapterId: number) {
  try {
    const images = await database.query.chapterImage.findMany({
      where: eq(chapterImage.chapterId, chapterId),
      orderBy: [desc(chapterImage.pageNumber)],
    });

    return { success: true, data: images };
  } catch (error) {
    console.error("Get chapter images error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get images",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET LATEST CHAPTERS
// ═══════════════════════════════════════════════════

export async function getLatestChapters(limit = 20) {
  try {
    const results = await database.query.chapter.findMany({
      with: {
        comic: {
          with: {
            author: true,
          },
        },
      },
      limit,
      orderBy: [desc(chapter.releaseDate)],
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Get latest chapters error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get latest chapters",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET NEXT/PREVIOUS CHAPTER
// ═══════════════════════════════════════════════════

export async function getAdjacentChapters(chapterId: number) {
  try {
    const currentChapter = await database.query.chapter.findFirst({
      where: eq(chapter.id, chapterId),
    });

    if (!currentChapter) {
      return { success: false, error: "Chapter not found" };
    }

    // Get next chapter (higher chapter number)
    const [nextChapter] = await database
      .select()
      .from(chapter)
      .where(
        and(
          eq(chapter.comicId, currentChapter.comicId),
          sql`${chapter.chapterNumber} > ${currentChapter.chapterNumber}`
        )
      )
      .orderBy(chapter.chapterNumber)
      .limit(1);

    // Get previous chapter (lower chapter number)
    const [prevChapter] = await database
      .select()
      .from(chapter)
      .where(
        and(
          eq(chapter.comicId, currentChapter.comicId),
          sql`${chapter.chapterNumber} < ${currentChapter.chapterNumber}`
        )
      )
      .orderBy(desc(chapter.chapterNumber))
      .limit(1);

    return {
      success: true,
      data: {
        current: currentChapter,
        next: nextChapter || null,
        previous: prevChapter || null,
      },
    };
  } catch (error) {
    console.error("Get adjacent chapters error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get adjacent chapters",
    };
  }
}
