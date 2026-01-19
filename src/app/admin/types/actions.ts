/**
 * Admin server actions for Type management
 * Type-safe with Zod validation and role-based authorization
 */

"use server";

import { db as database } from "@/database/db";
import { type as typeTable } from "@/database/schema";
import type { ActionResult } from "@/dto";
import { requireRole } from "auth";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const createTypeSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255).trim(),
    description: z.string().max(5000).optional(),
  })
  .strict();

const updateTypeSchema = createTypeSchema.partial();

export async function createType(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    const data = createTypeSchema.parse(input);

    const result = await database
      .insert(typeTable)
      .values({
        name: data.name,
        description: data.description || null,
        createdAt: new Date(),
      })
      .returning({ id: typeTable.id });

    if (!result[0]) {
      return { success: false, error: "Failed to create type" };
    }

    console.log(`✅ Type created: ${data.name} (ID: ${result[0].id})`);
    return { success: true, data: { id: result[0].id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error creating type:", error);
    return { success: false, error: "Failed to create type" };
  }
}

export async function updateType(
  id: number,
  input: unknown
): Promise<ActionResult<{ id: number }>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid type ID" };
    }

    const data = updateTypeSchema.parse(input);
    const existing = await database.query.type.findFirst({
      where: eq(typeTable.id, id),
    });

    if (!existing) {
      return { success: false, error: "Type not found" };
    }

    await database.update(typeTable).set(data).where(eq(typeTable.id, id));
    console.log(`✅ Type updated: ${existing.name} (ID: ${id})`);
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error updating type:", error);
    return { success: false, error: "Failed to update type" };
  }
}

export async function deleteType(id: number): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid type ID" };
    }

    const existing = await database.query.type.findFirst({
      where: eq(typeTable.id, id),
    });

    if (!existing) {
      return { success: false, error: "Type not found" };
    }

    await database.delete(typeTable).where(eq(typeTable.id, id));
    console.log(`✅ Type deleted: ${existing.name} (ID: ${id})`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error deleting type:", error);
    return { success: false, error: "Failed to delete type" };
  }
}

export async function bulkDeleteTypes(ids: number[]): Promise<ActionResult<unknown>> {
  try {
    await requireRole("admin");

    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: "No types selected for deletion" };
    }

    if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
      return { success: false, error: "Invalid type IDs" };
    }

    const result = await database.delete(typeTable).where(inArray(typeTable.id, ids)).returning();

    console.log(`✅ Bulk deleted ${result.length} types`);
    return { success: true, data: { deletedCount: result.length } };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return { success: false, error: "You don't have permission" };
    }
    console.error("❌ Error bulk deleting types:", error);
    return { success: false, error: "Failed to delete types" };
  }
}
