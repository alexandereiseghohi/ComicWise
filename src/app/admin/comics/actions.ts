/**
 * Admin server actions for Comic management
 * Type-safe with Zod validation and role-based authorization
 */

"use server";

import { db as database } from "@/database/db";
import { comic, comicToGenre } from "@/database/schema";
import type { ActionResult } from "@/dto";
import { requireRole } from "auth";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const createComicSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must not exceed 255 characters")
      .trim(),
    slug: z.string().min(1, "Slug is required").max(255).trim(),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000).trim(),
    coverImage: z.string().url("Invalid cover image URL"),
    status: z.enum(["Ongoing", "Hiatus", "Completed", "Dropped", "Coming Soon"]).default("Ongoing"),
    publicationDate: z.coerce.date(),
    rating: z.coerce.number().min(0).max(10).optional().default(0),
    authorId: z.coerce.number().int().positive().optional(),
    artistId: z.coerce.number().int().positive().optional(),
    typeId: z.coerce.number().int().positive().optional(),
    genreIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  })
  .strict();

const updateComicSchema = createComicSchema.partial();

export async function createComic(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    const data = createComicSchema.parse(input);

    const result = await database
      .insert(comic)
      .values({
        title: data.title,
        slug: data.slug,
        description: data.description,
        coverImage: data.coverImage,
        status: data.status,
        publicationDate: data.publicationDate,
        rating: data.rating?.toString(),
        authorId: data.authorId,
        artistId: data.artistId,
        typeId: data.typeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: comic.id });

    if (!result[0]) {
      return { success: false, error: "Failed to create comic" };
    }

    const newComicId = result[0].id;

    // Add genres if provided
    if (data.genreIds && data.genreIds.length > 0) {
      await database.insert(comicToGenre).values(
        data.genreIds.map((genreId) => ({
          comicId: newComicId,
          genreId,
        }))
      );
    }

    console.log(`✅ Comic created: ${data.title} (ID: ${newComicId})`);
    return { success: true, data: { id: newComicId } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error creating comic:", error);
    return { success: false, error: "Failed to create comic" };
  }
}

export async function updateComic(
  id: number,
  input: unknown
): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid comic ID" };
    }

    const data = updateComicSchema.parse(input);
    const existing = await database.query.comic.findFirst({
      where: eq(comic.id, id),
    });

    if (!existing) {
      return { success: false, error: "Comic not found" };
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    await database.update(comic).set(updateData).where(eq(comic.id, id));

    // Update genres if provided
    if (data.genreIds !== undefined) {
      await database.delete(comicToGenre).where(eq(comicToGenre.comicId, id));
      if (data.genreIds.length > 0) {
        await database.insert(comicToGenre).values(
          data.genreIds.map((genreId) => ({
            comicId: id,
            genreId,
          }))
        );
      }
    }

    console.log(`✅ Comic updated: ${existing.title} (ID: ${id})`);
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error updating comic:", error);
    return { success: false, error: "Failed to update comic" };
  }
}

export async function deleteComic(id: number): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid comic ID" };
    }

    const existing = await database.query.comic.findFirst({
      where: eq(comic.id, id),
    });

    if (!existing) {
      return { success: false, error: "Comic not found" };
    }

    // Genres will cascade delete automatically
    await database.delete(comic).where(eq(comic.id, id));
    console.log(`✅ Comic deleted: ${existing.title} (ID: ${id})`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error deleting comic:", error);
    return { success: false, error: "Failed to delete comic" };
  }
}

export async function bulkDeleteComics(ids: number[]): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");

    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: "No comics selected for deletion" };
    }

    // Validate all IDs
    if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
      return { success: false, error: "Invalid comic IDs" };
    }

    // Delete genres and comics
    for (const id of ids) {
      await database.delete(comicToGenre).where(eq(comicToGenre.comicId, id));
    }
    const result = await database.delete(comic).where(inArray(comic.id, ids)).returning();

    console.log(`✅ Bulk deleted ${result.length} comics`);
    return { success: true, data: { deletedCount: result.length } };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error bulk deleting comics:", error);
    return { success: false, error: "Failed to delete comics" };
  }
}
