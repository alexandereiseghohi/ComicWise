"use server";

import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { artist, author } from "@/database/schema";
import type { ActionResult } from "@/dto";
import type {
  CreateArtistInput,
  CreateAuthorInput,
  PaginationInput,
  UpdateArtistInput,
  UpdateAuthorInput,
} from "@/lib/validations";
import {
  createArtistSchema,
  createAuthorSchema,
  paginationSchema,
  updateArtistSchema,
  updateAuthorSchema,
} from "@/lib/validations";
import { asc, eq, like, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createAuthor(
  input: CreateAuthorInput
): Promise<ActionResult<typeof author.$inferSelect>> {
  try {
    const validated = createAuthorSchema.parse(input);

    const [newAuthor] = await database.insert(author).values(validated).returning();

    if (!newAuthor) {
      return { success: false, error: "Failed to create author" };
    }

    revalidatePath("/admin/authors");

    return {
      success: true,
      data: newAuthor,
      message: "Author created successfully",
    };
  } catch (error) {
    console.error("Create author error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create author",
    };
  }
}

export async function updateAuthor(
  id: number,
  input: UpdateAuthorInput
): Promise<ActionResult<typeof author.$inferSelect>> {
  try {
    const validated = updateAuthorSchema.parse(input);

    const [updatedAuthor] = await database
      .update(author)
      .set(validated)
      .where(eq(author.id, id))
      .returning();

    if (!updatedAuthor) {
      return { success: false, error: "Author not found" };
    }

    revalidatePath("/admin/authors");
    revalidatePath(`/authors/${id}`);

    return {
      success: true,
      data: updatedAuthor,
      message: "Author updated successfully",
    };
  } catch (error) {
    console.error("Update author error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update author",
    };
  }
}

export async function deleteAuthor(id: number): Promise<ActionResult<void>> {
  try {
    const existingAuthor = await database.query.author.findFirst({
      where: eq(author.id, id),
    });

    if (!existingAuthor) {
      return { success: false, error: "Author not found" };
    }

    await database.delete(author).where(eq(author.id, id));

    revalidatePath("/admin/authors");

    return {
      success: true,
      data: undefined,
      message: "Author deleted successfully",
    };
  } catch (error) {
    console.error("Delete author error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete author",
    };
  }
}

export async function getAuthorById(id: number) {
  try {
    const result = await database.query.author.findFirst({
      where: eq(author.id, id),
    });

    if (!result) {
      return { success: false, error: "Author not found" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Get author error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get author",
    };
  }
}

export async function listAuthors(input?: PaginationInput & { search?: string }) {
  try {
    const validated = paginationSchema.parse(input || {});
    const {
      page = 1,
      limit = appConfig.pagination?.defaultLimit ?? 12,
      search,
    } = { ...validated, ...input };

    const offset = (page - 1) * limit;

    const whereClause = search ? like(author.name, `%${search}%`) : undefined;

    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(author)
      .where(whereClause);

    const total = countResult?.count ?? 0;

    const results = await database.query.author.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (authors: any) => [asc(authors.name)],
    });

    return {
      success: true,
      data: {
        authors: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("List authors error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list authors",
    };
  }
}

export async function getAllAuthors() {
  try {
    const results = await database.query.author.findMany({
      orderBy: (authors: any) => [asc(authors.name)],
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Get all authors error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get authors",
    };
  }
}

// ═══════════════════════════════════════════════════
// ARTISTS
// ═══════════════════════════════════════════════════

export async function createArtist(
  input: CreateArtistInput
): Promise<ActionResult<typeof artist.$inferSelect>> {
  try {
    const validated = createArtistSchema.parse(input);

    const [newArtist] = await database.insert(artist).values(validated).returning();

    if (!newArtist) {
      return { success: false, error: "Failed to create artist" };
    }

    revalidatePath("/admin/artists");

    return {
      success: true,
      data: newArtist,
      message: "Artist created successfully",
    };
  } catch (error) {
    console.error("Create artist error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create artist",
    };
  }
}

export async function updateArtist(
  id: number,
  input: UpdateArtistInput
): Promise<ActionResult<typeof artist.$inferSelect>> {
  try {
    const validated = updateArtistSchema.parse(input);

    const [updatedArtist] = await database
      .update(artist)
      .set(validated)
      .where(eq(artist.id, id))
      .returning();

    if (!updatedArtist) {
      return { success: false, error: "Artist not found" };
    }

    revalidatePath("/admin/artists");
    revalidatePath(`/artists/${id}`);

    return {
      success: true,
      data: updatedArtist,
      message: "Artist updated successfully",
    };
  } catch (error) {
    console.error("Update artist error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update artist",
    };
  }
}

export async function deleteArtist(id: number): Promise<ActionResult<void>> {
  try {
    const existingArtist = await database.query.artist.findFirst({
      where: eq(artist.id, id),
    });

    if (!existingArtist) {
      return { success: false, error: "Artist not found" };
    }

    await database.delete(artist).where(eq(artist.id, id));

    revalidatePath("/admin/artists");

    return {
      success: true,
      data: undefined,
      message: "Artist deleted successfully",
    };
  } catch (error) {
    console.error("Delete artist error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete artist",
    };
  }
}

export async function getArtistById(id: number) {
  try {
    const result = await database.query.artist.findFirst({
      where: eq(artist.id, id),
    });

    if (!result) {
      return { success: false, error: "Artist not found" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Get artist error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get artist",
    };
  }
}

export async function listArtists(input?: PaginationInput & { search?: string }) {
  try {
    const validated = paginationSchema.parse(input || {});
    const {
      page = 1,
      limit = appConfig.pagination?.defaultLimit ?? 12,
      search,
    } = { ...validated, ...input };

    const offset = (page - 1) * limit;

    const whereClause = search ? like(artist.name, `%${search}%`) : undefined;

    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(artist)
      .where(whereClause);

    const total = countResult?.count ?? 0;

    const results = await database.query.artist.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (artists: any) => [asc(artists.name)],
    });

    return {
      success: true,
      data: {
        artists: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("List artists error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list artists",
    };
  }
}

export async function getAllArtists() {
  try {
    const results = await database.query.artist.findMany({
      orderBy: (artists: any) => [asc(artists.name)],
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Get all artists error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get artists",
    };
  }
}
