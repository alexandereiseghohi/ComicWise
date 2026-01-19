import { asc, desc, eq, ilike } from "drizzle-orm";

import { db as database } from "@/database/db";
import { artist } from "@/database/schema";

/**
 *
 * param artistId
 * @param artistId
 */
export async function getArtistById(artistId: number) {
  return await database.query.artist.findFirst({
    where: eq(artist.id, artistId),
  });
}

// Seed helper: get artist by name
export async function getArtistByName(name: string) {
  return await database.query.artist.findFirst({
    where: eq(artist.name, name),
  });
}

/**
 *
 * param parameters
 * param parameters.limit
 * param parameters.offset
 * param parameters.sortBy
 * param parameters.sortOrder
 * param parameters.search
 * @param parameters
 * @param parameters.limit
 * @param parameters.offset
 * @param parameters.sortBy
 * @param parameters.sortOrder
 * @param parameters.search
 */
export async function getArtists(parameters?: {
  limit?: number;
  offset?: number;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  search?: string;
}) {
  const { limit = 10, offset = 0, sortBy = "name", sortOrder = "asc", search } = parameters || {};

  let query = database.select().from(artist).$dynamic();

  // Apply search filter
  if (search) {
    query = query.where(ilike(artist.name, `%${search}%`));
  }

  // Apply sorting

  const sortColumn = artist[sortBy];
  query = query.orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn));

  // Apply pagination
  query = query.limit(limit).offset(offset);

  return await query;
}

/**
 *
 * param parameters
 * param parameters.search
 * @param parameters
 * @param parameters.search
 */
export async function getArtistCount(parameters?: { search?: string }) {
  const { search } = parameters || {};

  let query = database.select().from(artist).$dynamic();

  if (search) {
    query = query.where(ilike(artist.name, `%${search}%`));
  }

  const result = await query;
  return result.length;
}

// Wrapper function for API compatibility
/**
 *
 * param filters
 * param filters.search
 * param filters.page
 * param filters.limit
 * param filters.sortBy
 * param filters.sortOrder
 * @param filters
 * @param filters.search
 * @param filters.page
 * @param filters.limit
 * @param filters.sortBy
 * @param filters.sortOrder
 */
export async function getAllArtists(filters?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const { search, page = 1, limit = 50, sortBy = "name", sortOrder = "asc" } = filters || {};

  const offset = (page - 1) * limit;
  const items = await getArtists({
    search,
    limit,
    offset,
    sortBy: sortBy === "createdAt" || sortBy === "name" ? sortBy : "name",
    sortOrder,
  });
  const total = await getArtistCount({ search });

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 *
 */
export async function getArtistsForSelect() {
  return await database
    .select({ id: artist.id, name: artist.name })
    .from(artist)
    .orderBy(asc(artist.name));
}
