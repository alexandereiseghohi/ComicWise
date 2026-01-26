/**
 * Admin server actions for Author management
 * Type-safe with Zod validation and role-based authorization
 */

"use server";

import { db as database } from "@/database/db";
import { author } from "@/database/schema";
import type { ActionResult } from "@/dto";
import { requireRole } from "auth";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const createAuthorSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255, "Name too long"),
    bio: z.string().max(5000, "Bio too long").optional(),
    image: z.string().url("Invalid image URL").optional(),
  })
  .strict();

const updateAuthorSchema = createAuthorSchema.partial();

// Input types for reference
// type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
// type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;

// ═══════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new author (Admin only)
 * @param input
 */
export async function createAuthor(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    // Check authorization
    await requireRole("admin");

    // Validate input
    const data = createAuthorSchema.parse(input);

    // Insert into database
    const result = await database
      .insert(author)
      .values({
        name: data.name,
        bio: data.bio || null,
        image: data.image || null,
        createdAt: new Date(),
      })
      .returning({ id: author.id });

    if (!result[0]) {
      return {
        success: false,
        error: "Failed to create author",
      };
    }

    const newAuthor = result[0];

    console.log(`✅ Author created: ${data.name} (ID: ${newAuthor.id})`);

    return {
      success: true,
      data: { id: newAuthor.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message ?? "Validation failed";
      return {
        success: false,
        error: message,
      };
    }

    if (error instanceof Error && error.message === "admin role required") {
      return {
        success: false,
        error: "You don't have permission to create authors",
      };
    }

    console.error("❌ Error creating author:", error);
    return {
      success: false,
      error: "Failed to create author. Please try again.",
    };
  }
}

/**
 * Update existing author (Admin only)
 * @param id
 * @param input
 */
export async function updateAuthor(
  id: number,
  input: unknown
): Promise<ActionResult<{ id: number }>> {
  try {
    // Check authorization
    await requireRole("admin");

    // Validate ID
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "Invalid author ID",
      };
    }

    // Validate input
    const data = updateAuthorSchema.parse(input);

    // Check author exists
    const existingAuthor = await database.query.author.findFirst({
      where: eq(author.id, id),
    });

    if (!existingAuthor) {
      return {
        success: false,
        error: "Author not found",
      };
    }

    // Update database
    await database.update(author).set(data).where(eq(author.id, id));

    console.log(`✅ Author updated: ${existingAuthor.name} (ID: ${id})`);

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message ?? "Validation failed";
      return {
        success: false,
        error: message,
      };
    }

    if (error instanceof Error && error.message === "admin role required") {
      return {
        success: false,
        error: "You don't have permission to update authors",
      };
    }

    console.error("❌ Error updating author:", error);
    return {
      success: false,
      error: "Failed to update author. Please try again.",
    };
  }
}

/**
 * Delete author (Admin only)
 * @param id
 */
export async function deleteAuthor(id: number): Promise<ActionResult<unknown>> {
  try {
    // Check authorization
    await requireRole("admin");

    // Validate ID
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "Invalid author ID",
      };
    }

    // Check author exists
    const existingAuthor = await database.query.author.findFirst({
      where: eq(author.id, id),
    });

    if (!existingAuthor) {
      return {
        success: false,
        error: "Author not found",
      };
    }

    // Delete from database
    await database.delete(author).where(eq(author.id, id));

    console.log(`✅ Author deleted: ${existingAuthor.name} (ID: ${id})`);

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return {
        success: false,
        error: "You don't have permission to delete authors",
      };
    }

    console.error("❌ Error deleting author:", error);
    return {
      success: false,
      error: "Failed to delete author. Please try again.",
    };
  }
}

/**
 * Bulk delete authors (Admin only)
 * @param ids
 */
export async function bulkDeleteAuthors(ids: number[]): Promise<ActionResult<unknown>> {
  try {
    // Check authorization
    await requireRole("admin");

    // Validate IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        success: false,
        error: "No authors selected for deletion",
      };
    }

    if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
      return {
        success: false,
        error: "Invalid author IDs",
      };
    }

    // Delete from database
    const result = await database.delete(author).where(inArray(author.id, ids)).returning();

    console.log(`✅ Bulk deleted ${result.length} authors`);

    return { success: true, data: { deletedCount: result.length } };
  } catch (error) {
    if (error instanceof Error && error.message === "admin role required") {
      return {
        success: false,
        error: "You don't have permission to delete authors",
      };
    }

    console.error("❌ Error bulk deleting authors:", error);
    return {
      success: false,
      error: "Failed to delete authors. Please try again.",
    };
  }
}
