/**
 * Admin server actions for Genre management
 * Type-safe with Zod validation and role-based authorization
 */

"use server";

import { db as database } from "@/database/db";
import { genre } from "@/database/schema";
import type { ActionResult } from "@/dto";
import { requireRole } from "auth";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const createGenreSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255).trim(),
    description: z.string().max(5000).optional(),
  })
  .strict();

const updateGenreSchema = createGenreSchema.partial();

export async function createGenre(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    const data = createGenreSchema.parse(input);

    const result = await database
      .insert(genre)
      .values({
        name: data.name,
        description: data.description || null,
        createdAt: new Date(),
      })
      .returning({ id: genre.id });

    if (!result[0]) {
      return { success: false, error: "Failed to create genre" };
    }

    console.log(`✅ Genre created: ${data.name} (ID: ${result[0].id})`);
    return { success: true, data: { id: result[0].id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error creating genre:", error);
    return { success: false, error: "Failed to create genre" };
  }
}

export async function updateGenre(
  id: number,
  input: unknown
): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid genre ID" };
    }

    const data = updateGenreSchema.parse(input);
    const existing = await database.query.genre.findFirst({
      where: eq(genre.id, id),
    });

    if (!existing) {
      return { success: false, error: "Genre not found" };
    }

    await database.update(genre).set(data).where(eq(genre.id, id));
    console.log(`✅ Genre updated: ${existing.name} (ID: ${id})`);
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error updating genre:", error);
    return { success: false, error: "Failed to update genre" };
  }
}

export async function deleteGenre(id: number): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid genre ID" };
    }

    const existing = await database.query.genre.findFirst({
      where: eq(genre.id, id),
    });

    if (!existing) {
      return { success: false, error: "Genre not found" };
    }

    await database.delete(genre).where(eq(genre.id, id));
    console.log(`✅ Genre deleted: ${existing.name} (ID: ${id})`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error deleting genre:", error);
    return { success: false, error: "Failed to delete genre" };
  }
}

export async function bulkDeleteGenres(ids: number[]): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");

    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: "No genres selected for deletion" };
    }

    if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
      return { success: false, error: "Invalid genre IDs" };
    }

    const result = await database.delete(genre).where(inArray(genre.id, ids)).returning();

    console.log(`✅ Bulk deleted ${result.length} genres`);
    return { success: true, data: { deletedCount: result.length } };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error bulk deleting genres:", error);
    return { success: false, error: "Failed to delete genres" };
  }
}
