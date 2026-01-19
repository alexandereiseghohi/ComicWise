import { asc, desc, eq, ilike } from "drizzle-orm";

import { db as database } from "@/database/db";
import { author } from "@/database/schema";

/**
 *
 * param authorId
 * @param authorId
 */
export async function getAuthorById(authorId: number) {
  return await database.query.author.findFirst({
    where: eq(author.id, authorId),
  });
}

// Seed helper: get author by name
export async function getAuthorByName(name: string) {
  return await database.query.author.findFirst({
    where: eq(author.name, name),
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
export async function getAuthors(parameters?: {
  limit?: number;
  offset?: number;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  search?: string;
}) {
  const { limit = 10, offset = 0, sortBy = "name", sortOrder = "asc", search } = parameters || {};

  let query = database.select().from(author).$dynamic();

  // Apply search filter
  if (search) {
    query = query.where(ilike(author.name, `%${search}%`));
  }

  // Apply sorting

  const sortColumn = author[sortBy];
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
export async function getAuthorCount(parameters?: { search?: string }) {
  const { search } = parameters || {};

  let query = database.select().from(author).$dynamic();

  if (search) {
    query = query.where(ilike(author.name, `%${search}%`));
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
export async function getAllAuthors(filters?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const { search, page = 1, limit = 50, sortBy = "name", sortOrder = "asc" } = filters || {};

  const offset = (page - 1) * limit;
  const items = await getAuthors({
    search,
    limit,
    offset,
    sortBy: sortBy === "createdAt" || sortBy === "name" ? sortBy : "name",
    sortOrder,
  });
  const total = await getAuthorCount({ search });

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
export async function getAuthorsForSelect() {
  return await database
    .select({ id: author.id, name: author.name })
    .from(author)
    .orderBy(asc(author.name));
}
