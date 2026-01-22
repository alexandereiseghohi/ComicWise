"use server";

import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { type as comicType, genre } from "@/database/schema";
import type { ActionResult } from "@/dto";
import type {
    CreateGenreInput,
    CreateTypeInput,
    PaginationInput,
    UpdateGenreInput,
    UpdateTypeInput,
} from "@/lib/validations";
import {
    createGenreSchema,
    createTypeSchema,
    paginationSchema,
    updateGenreSchema,
    updateTypeSchema,
} from "@/lib/validations";
import { asc, eq, like, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createGenre(
  input: CreateGenreInput
): Promise<ActionResult<typeof genre.$inferSelect>> {
  try {
    const validated = createGenreSchema.parse(input);

    const slug = validated.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();
    const [newGenre] = await database.insert(genre).values({ ...validated, slug }).returning();

    if (!newGenre) {
      return { success: false, error: "Failed to create genre" };
    }

    revalidatePath("/admin/genres");

    return {
      success: true,
      data: newGenre,
      message: "Genre created successfully",
    };
  } catch (error) {
    console.error("Create genre error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create genre",
    };
  }
}

export async function updateGenre(
  id: number,
  input: UpdateGenreInput
): Promise<ActionResult<typeof genre.$inferSelect>> {
  try {
    const validated = updateGenreSchema.parse(input);

    const [updatedGenre] = await database
      .update(genre)
      .set(validated)
      .where(eq(genre.id, id))
      .returning();

    if (!updatedGenre) {
      return { success: false, error: "Genre not found" };
    }

    revalidatePath("/admin/genres");

    return {
      success: true,
      data: updatedGenre,
      message: "Genre updated successfully",
    };
  } catch (error) {
    console.error("Update genre error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update genre",
    };
  }
}

export async function deleteGenre(id: number): Promise<ActionResult<void>> {
  try {
    const existingGenre = await database.query.genre.findFirst({
      where: eq(genre.id, id),
    });

    if (!existingGenre) {
      return { success: false, error: "Genre not found" };
    }

    await database.delete(genre).where(eq(genre.id, id));

    revalidatePath("/admin/genres");

    return {
      success: true,
      data: undefined,
      message: "Genre deleted successfully",
    };
  } catch (error) {
    console.error("Delete genre error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete genre",
    };
  }
}

export async function getGenreById(id: number) {
  try {
    const result = await database.query.genre.findFirst({
      where: eq(genre.id, id),
    });

    if (!result) {
      return { success: false, error: "Genre not found" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Get genre error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get genre",
    };
  }
}

export async function listGenres(input?: PaginationInput & { search?: string }) {
  try {
    const validated = paginationSchema.parse(input || {});
    const {
      page = 1,
      limit = appConfig.pagination?.defaultLimit ?? 12,
      search,
    } = { ...validated, ...(input || {}) };

    const offset = (page - 1) * limit;

    const whereClause = search ? like(genre.name, `%${search}%`) : undefined;

    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(genre)
      .where(whereClause);

    const total = countResult?.count || 0;

    const results = await database.query.genre.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (genres) => [asc(genres.name)],
    });

    return {
      success: true,
      data: {
        genres: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("List genres error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list genres",
    };
  }
}

export async function getAllGenres() {
  try {
    const results = await database.query.genre.findMany({
      orderBy: (genres, { asc }) => [asc(genres.name)],
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Get all genres error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get genres",
    };
  }
}

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export async function createType(
  input: CreateTypeInput
): Promise<ActionResult<typeof comicType.$inferSelect>> {
  try {
    const validated = createTypeSchema.parse(input);

    const [newType] = await database.insert(comicType).values(validated).returning();

    if (!newType) {
      return { success: false, error: "Failed to create type" };
    }

    revalidatePath("/admin/types");

    return {
      success: true,
      data: newType,
      message: "Type created successfully",
    };
  } catch (error) {
    console.error("Create type error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create type",
    };
  }
}

export async function updateType(
  id: number,
  input: UpdateTypeInput
): Promise<ActionResult<typeof comicType.$inferSelect>> {
  try {
    const validated = updateTypeSchema.parse(input);

    const [updatedType] = await database
      .update(comicType)
      .set(validated)
      .where(eq(comicType.id, id))
      .returning();

    if (!updatedType) {
      return { success: false, error: "Type not found" };
    }

    revalidatePath("/admin/types");

    return {
      success: true,
      data: updatedType,
      message: "Type updated successfully",
    };
  } catch (error) {
    console.error("Update type error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update type",
    };
  }
}

export async function deleteType(id: number): Promise<ActionResult<void>> {
  try {
    const existingType = await database.query.type.findFirst({
      where: eq(comicType.id, id),
    });

    if (!existingType) {
      return { success: false, error: "Type not found" };
    }

    await database.delete(comicType).where(eq(comicType.id, id));

    revalidatePath("/admin/types");

    return {
      success: true,
      data: undefined,
      message: "Type deleted successfully",
    };
  } catch (error) {
    console.error("Delete type error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete type",
    };
  }
}

export async function getTypeById(id: number) {
  try {
    const result = await database.query.type.findFirst({
      where: eq(comicType.id, id),
    });

    if (!result) {
      return { success: false, error: "Type not found" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Get type error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get type",
    };
  }
}

export async function listTypes(input?: PaginationInput & { search?: string }) {
  try {
    const validated = paginationSchema.parse(input || {});
    const {
      page = 1,
      limit = appConfig.pagination?.defaultLimit ?? 12,
      search,
    } = { ...validated, ...(input || {}) };

    const offset = (page - 1) * limit;

    const whereClause = search ? like(comicType.name, `%${search}%`) : undefined;

    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(comicType)
      .where(whereClause);

    const total = countResult?.count || 0;

    const results = await database.query.type.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (types) => [asc(types.name)],
    });

    return {
      success: true,
      data: {
        types: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("List types error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list types",
    };
  }
}

export async function getAllTypes() {
  try {
    const results = await database.query.type.findMany({
      orderBy: (types, { asc }) => [asc(types.name)],
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Get all types error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get types",
    };
  }
}
