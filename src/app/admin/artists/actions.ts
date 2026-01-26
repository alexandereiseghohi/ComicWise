/**
 * Admin server actions for Artist management
 * Type-safe with Zod validation and role-based authorization
 */

"use server";

import { db as database } from "@/database/db";
import { artist } from "@/database/schema";
import type { ActionResult } from "@/dto";
import { requireRole } from "auth";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const createArtistSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    bio: z.string().max(5000).optional(),
    image: z.string().url("Invalid image URL").optional(),
  })
  .strict();

const updateArtistSchema = createArtistSchema.partial();

export async function createArtist(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    const data = createArtistSchema.parse(input);

    const result = await database
      .insert(artist)
      .values({
        name: data.name,
        bio: data.bio || null,
        image: data.image || null,
        createdAt: new Date(),
      })
      .returning({ id: artist.id });

    if (!result[0]) {
      return { success: false, error: "Failed to create artist" };
    }

    console.log(`✅ Artist created: ${data.name} (ID: ${result[0].id})`);
    return { success: true, data: { id: result[0].id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error creating artist:", error);
    return { success: false, error: "Failed to create artist" };
  }
}

export async function updateArtist(
  id: number,
  input: unknown
): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid artist ID" };
    }

    const data = updateArtistSchema.parse(input);
    const existing = await database.query.artist.findFirst({
      where: eq(artist.id, id),
    });

    if (!existing) {
      return { success: false, error: "Artist not found" };
    }

    await database.update(artist).set(data).where(eq(artist.id, id));
    console.log(`✅ Artist updated: ${existing.name} (ID: ${id})`);
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error updating artist:", error);
    return { success: false, error: "Failed to update artist" };
  }
}

export async function deleteArtist(id: number): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid artist ID" };
    }

    const existing = await database.query.artist.findFirst({
      where: eq(artist.id, id),
    });

    if (!existing) {
      return { success: false, error: "Artist not found" };
    }

    await database.delete(artist).where(eq(artist.id, id));
    console.log(`✅ Artist deleted: ${existing.name} (ID: ${id})`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error deleting artist:", error);
    return { success: false, error: "Failed to delete artist" };
  }
}

export async function bulkDeleteArtists(ids: number[]): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");

    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: "No artists selected for deletion" };
    }

    if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
      return { success: false, error: "Invalid artist IDs" };
    }

    const result = await database.delete(artist).where(inArray(artist.id, ids)).returning();

    console.log(`✅ Bulk deleted ${result.length} artists`);
    return { success: true, data: { deletedCount: result.length } };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error bulk deleting artists:", error);
    return { success: false, error: "Failed to delete artists" };
  }
}
