/**
 * Admin server actions for Chapter management
 * Type-safe with Zod validation and role-based authorization
 */

"use server";

import { db as database } from "@/database/db";
import { chapter, comic } from "@/database/schema";
import type { ActionResult } from "@/dto";
import { requireRole } from "auth";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const createChapterSchema = z
  .object({
    comicId: z.coerce.number().int().positive("Comic ID is required"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must not exceed 255 characters")
      .trim(),
    slug: z.string().min(1, "Slug is required").max(255).trim(),
    chapterNumber: z.coerce.number().int().positive("Chapter number must be positive"),
    releaseDate: z.coerce.date(),
    views: z.coerce.number().int().nonnegative().default(0),
  })
  .strict();

const updateChapterSchema = createChapterSchema.partial();

export async function createChapter(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    const data = createChapterSchema.parse(input);

    // Verify comic exists by id
    const result = await database
      .select({ id: comic.id })
      .from(comic)
      .where(eq(comic.id, data.comicId))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Comic not found" };
    }

    const chapterResult = await database
      .insert(chapter)
      .values({
        comicId: data.comicId,
        title: data.title,
        slug: data.slug,
        chapterNumber: data.chapterNumber,
        releaseDate: data.releaseDate,
        views: data.views,
        createdAt: new Date(),
      })
      .returning({ id: chapter.id });

    if (!chapterResult[0]) {
      return { success: false, error: "Failed to create chapter" };
    }

    console.log(`✅ Chapter created: ${data.title} (ID: ${chapterResult[0].id})`);
    return { success: true, data: { id: chapterResult[0].id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error creating chapter:", error);
    return { success: false, error: "Failed to create chapter" };
  }
}

export async function updateChapter(
  id: number,
  input: unknown
): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid chapter ID" };
    }

    const data = updateChapterSchema.parse(input);
    const existing = await database.query.chapter.findFirst({
      where: eq(chapter.id, id),
    });

    if (!existing) {
      return { success: false, error: "Chapter not found" };
    }

    // If comicId is being updated, verify new comic exists
    if (data.comicId && data.comicId !== existing.comicId) {
      const comicCheck = await database
        .select({ id: comic.id })
        .from(comic)
        .where(eq(comic.id, data.comicId))
        .limit(1);

      if (comicCheck.length === 0) {
        return { success: false, error: "Comic not found" };
      }
    }

    const updateData: Record<string, unknown> = data;

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    await database.update(chapter).set(updateData).where(eq(chapter.id, id));
    console.log(`✅ Chapter updated: ${existing.title} (ID: ${id})`);
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error updating chapter:", error);
    return { success: false, error: "Failed to update chapter" };
  }
}

export async function deleteChapter(id: number): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid chapter ID" };
    }

    const existing = await database.query.chapter.findFirst({
      where: eq(chapter.id, id),
    });

    if (!existing) {
      return { success: false, error: "Chapter not found" };
    }

    await database.delete(chapter).where(eq(chapter.id, id));
    console.log(`✅ Chapter deleted: ${existing.title} (ID: ${id})`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error deleting chapter:", error);
    return { success: false, error: "Failed to delete chapter" };
  }
}

export async function bulkDeleteChapters(ids: number[]): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");

    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: "No chapters selected for deletion" };
    }

    // Validate all IDs
    if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
      return { success: false, error: "Invalid chapter IDs" };
    }

    const result = await database.delete(chapter).where(inArray(chapter.id, ids)).returning();

    console.log(`✅ Bulk deleted ${result.length} chapters`);
    return { success: true, data: { deletedCount: result.length } };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error bulk deleting chapters:", error);
    return { success: false, error: "Failed to delete chapters" };
  }
}
