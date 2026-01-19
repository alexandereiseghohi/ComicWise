import { db as database } from "@/database/db";
import { genre } from "@/database/schema";
import { asc, desc, eq, ilike } from "drizzle-orm";

export async function getGenreById(genreId: number) {
  return await database.query.genre.findFirst({
    where: eq(genre.id, genreId),
  });
}

export async function getGenreByName(name: string) {
  return await database.query.genre.findFirst({
    where: eq(genre.name, name),
  });
}

// Seed helper: get or null for batch operations
export async function getGenreByNameForSeed(name: string) {
  return await database.query.genre.findFirst({
    where: eq(genre.name, name),
  });
}

export async function getGenres(params?: {
  limit?: number;
  offset?: number;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  search?: string;
}) {
  const { limit = 10, offset = 0, sortBy = "name", sortOrder = "asc", search } = params || {};

  let query = database.select().from(genre).$dynamic();

  // Apply search filter
  if (search) {
    query = query.where(ilike(genre.name, `%${search}%`));
  }

  // Apply sorting

  const sortColumn = genre[sortBy];
  query = query.orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn));

  // Apply pagination
  query = query.limit(limit).offset(offset);

  return await query;
}

export async function getGenreCount(params?: { search?: string }) {
  const { search } = params || {};

  let query = database.select().from(genre).$dynamic();

  if (search) {
    query = query.where(ilike(genre.name, `%${search}%`));
  }

  const result = await query;
  return result.length;
}

// Wrapper function for API compatibility
export async function getAllGenres(filters?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const { search, page = 1, limit = 50, sortBy = "name", sortOrder = "asc" } = filters || {};

  const offset = (page - 1) * limit;
  const items = await getGenres({
    search,
    limit,
    offset,
    sortBy: sortBy === "createdAt" || sortBy === "name" ? sortBy : "name",
    sortOrder,
  });
  const total = await getGenreCount({ search });

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getGenresForSelect() {
  return await database
    .select({ id: genre.id, name: genre.name })
    .from(genre)
    .orderBy(asc(genre.name));
}
