"use server";

import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { comic, comicToGenre } from "@/database/schema";
import type { ActionResult } from "@/dto";
import type { ComicFilterInput, CreateComicInput, UpdateComicInput } from "@/lib/validations";
import { comicFilterSchema, createComicSchema, updateComicSchema } from "@/lib/validations";
import type { Genre } from "@/types/database";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { slugify } from "utils";

type ParsedCreateComic = CreateComicInput & { slug?: string };
type ParsedUpdateComic = UpdateComicInput & { slug?: string };

// ═══════════════════════════════════════════════════
// CREATE COMIC
// ═══════════════════════════════════════════════════

export async function createComic(
  input: unknown
): Promise<ActionResult<typeof comic.$inferSelect>> {
  try {
    const validated = createComicSchema.parse(input) as ParsedCreateComic;

    const slug = validated.slug ?? slugify(validated.title);

    const [newComic] = await database
      .insert(comic)
      .values({
        ...validated,
        slug,
        views: 0,
        rating: validated.rating ? String(validated.rating) : "0",
      })
      .returning();

    if (!newComic) {
      return { success: false, error: "Failed to create comic" };
    }

    revalidatePath("/admin/comics");
    revalidatePath("/");

    return {
      success: true,
      data: newComic,
      message: "Comic created successfully",
    };
  } catch (error) {
    console.error("Create comic error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create comic",
    };
  }
}

// ═══════════════════════════════════════════════════
// UPDATE COMIC
// ═══════════════════════════════════════════════════

export async function updateComic(
  id: number,
  input: UpdateComicInput
): Promise<ActionResult<typeof comic.$inferSelect>> {
  try {
    const validated = updateComicSchema.parse(input) as ParsedUpdateComic;

    const updateData: Record<string, unknown> = {
      ...validated,
      updatedAt: new Date(),
    };

    if (validated.slug !== undefined) {
      updateData["slug"] = validated.slug;
    }

    if (validated.rating !== undefined) {
      updateData["rating"] = String(validated.rating);
    }

    const [updatedComic] = await database
      .update(comic)
      .set(updateData)
      .where(eq(comic.id, id))
      .returning();

    if (!updatedComic) {
      return { success: false, error: "Comic not found" };
    }

    revalidatePath("/admin/comics");
    revalidatePath(`/comics/${id}`);
    revalidatePath("/");

    return {
      success: true,
      data: updatedComic,
      message: "Comic updated successfully",
    };
  } catch (error) {
    console.error("Update comic error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update comic",
    };
  }
}

// ═══════════════════════════════════════════════════
// DELETE COMIC
// ═══════════════════════════════════════════════════

export async function deleteComic(id: number): Promise<ActionResult<void>> {
  try {
    const existingComic = await database.query.comic.findFirst({
      where: eq(comic.id, id),
    });

    if (!existingComic) {
      return { success: false, error: "Comic not found" };
    }

    // Delete comic (cascade will handle related records)
    await database.delete(comic).where(eq(comic.id, id));

    revalidatePath("/admin/comics");
    revalidatePath("/");

    return {
      success: true,
      data: undefined,
      message: "Comic deleted successfully",
    };
  } catch (error) {
    console.error("Delete comic error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comic",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET COMIC BY ID
// ═══════════════════════════════════════════════════

export async function getComicById(id: number) {
  try {
    const result = await database.query.comic.findFirst({
      where: eq(comic.id, id),
      with: {
        author: true,
        artist: true,
        type: true,
      },
    });

    if (!result) {
      return { success: false, error: "Comic not found" };
    }

    // Increment view count
    await database
      .update(comic)
      .set({ views: sql`${comic.views} + 1` })
      .where(eq(comic.id, id));

    return { success: true, data: result };
  } catch (error) {
    console.error("Get comic error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get comic",
    };
  }
}

// ═══════════════════════════════════════════════════
// LIST COMICS WITH FILTERS
// ═══════════════════════════════════════════════════

export async function listComics(input?: ComicFilterInput) {
  try {
    const validated = comicFilterSchema.parse(input || {});
    const {
      page = 1,
      limit = appConfig.pagination?.comicsPerPage ?? 12,
      search,
      status,
      typeId,
      authorId,
      artistId,
      minRating,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = validated;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: SQL<unknown>[] = [];

    if (search) {
      conditions.push(like(comic.title, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(comic.status, status));
    }

    if (typeId) {
      conditions.push(eq(comic.typeId, typeId));
    }

    if (authorId) {
      conditions.push(eq(comic.authorId, authorId));
    }

    if (artistId) {
      conditions.push(eq(comic.artistId, artistId));
    }

    if (minRating !== undefined) {
      conditions.push(sql`CAST(${comic.rating} AS DECIMAL) >= ${minRating}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(comic)
      .where(whereClause);

    const total = countResult?.count ?? 0;

    // Get comics with relations
    const results = await database.query.comic.findMany({
      where: whereClause,
      with: {
        author: true,
        artist: true,
        type: true,
      },
      limit,
      offset,
      orderBy: (comics: any, { desc: descOrder, asc }: any) => {
        const order = sortOrder === "desc" ? descOrder : asc;
        switch (sortBy) {
          case "title":
            return [order(comics.title)];
          case "rating":
            return [order(comics.rating)];
          case "views":
            return [order(comics.views)];
          case "publicationDate":
            return [order(comics.publicationDate)];
          default:
            return [order(comics.createdAt)];
        }
      },
    });

    return {
      success: true,
      data: {
        comics: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("List comics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list comics",
    };
  }
}

// ═══════════════════════════════════════════════════
// ASSIGN GENRES TO COMIC
// ═══════════════════════════════════════════════════

export async function assignGenresToComic(
  comicId: number,
  genreIds: number[]
): Promise<ActionResult<void>> {
  try {
    // Remove existing genres
    await database.delete(comicToGenre).where(eq(comicToGenre.comicId, comicId));

    // Add new genres
    if (genreIds.length > 0) {
      await database.insert(comicToGenre).values(
        genreIds.map((genreId) => ({
          comicId,
          genreId,
        }))
      );
    }

    revalidatePath("/admin/comics");
    revalidatePath(`/comics/${comicId}`);

    return {
      success: true,
      data: undefined,
      message: "Genres updated successfully",
    };
  } catch (error) {
    console.error("Assign genres error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign genres",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET COMIC GENRES
// ═══════════════════════════════════════════════════

export async function getComicGenres(comicId: number) {
  try {
    const genres = await database.query.comicToGenre.findMany({
      where: eq(comicToGenre.comicId, comicId),
      with: {
        genre: true,
      },
    });

    return {
      success: true,
      data: genres.map((g: { genre: Genre }) => g.genre),
    };
  } catch (error) {
    console.error("Get comic genres error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get genres",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET POPULAR COMICS
// ═══════════════════════════════════════════════════

export async function getPopularComics(limit = 10) {
  try {
    const results = await database.query.comic.findMany({
      with: {
        author: true,
        artist: true,
        type: true,
      },
      limit,
      orderBy: [desc(comic.views), desc(comic.rating)],
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Get popular comics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get popular comics",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET LATEST COMICS
// ═══════════════════════════════════════════════════

export async function getLatestComics(limit = 12) {
  try {
    const results = await database.query.comic.findMany({
      with: {
        author: true,
        artist: true,
        type: true,
      },
      limit,
      orderBy: [desc(comic.createdAt)],
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Get latest comics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get latest comics",
    };
  }
}
