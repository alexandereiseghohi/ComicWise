import { db as database } from "@/database/db";
import { type } from "@/database/schema";
import { asc, desc, eq, ilike } from "drizzle-orm";

export async function getTypeById(typeId: number) {
  return await database.query.type.findFirst({
    where: eq(type.id, typeId),
  });
}

export async function getTypeByName(name: string) {
  return await database.query.type.findFirst({
    where: eq(type.name, name),
  });
}

// Seed helper: get or null for batch operations
export async function getTypeByNameForSeed(name: string) {
  return await database.query.type.findFirst({
    where: eq(type.name, name),
  });
}

export async function getTypes(params?: {
  limit?: number;
  offset?: number;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  search?: string;
}) {
  const { limit = 10, offset = 0, sortBy = "name", sortOrder = "asc", search } = params || {};

  let query = database.select().from(type).$dynamic();

  // Apply search filter
  if (search) {
    query = query.where(ilike(type.name, `%${search}%`));
  }

  // Apply sorting

  const sortColumn = type[sortBy];
  query = query.orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn));

  // Apply pagination
  query = query.limit(limit).offset(offset);

  return await query;
}

export async function getTypeCount(params?: { search?: string }) {
  const { search } = params || {};

  let query = database.select().from(type).$dynamic();

  if (search) {
    query = query.where(ilike(type.name, `%${search}%`));
  }

  const result = await query;
  return result.length;
}

// Wrapper function for API compatibility
export async function getAllTypes(filters?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const { search, page = 1, limit = 50, sortBy = "name", sortOrder = "asc" } = filters || {};

  const offset = (page - 1) * limit;
  const items = await getTypes({
    search,
    limit,
    offset,
    sortBy: sortBy === "createdAt" || sortBy === "name" ? sortBy : "name",
    sortOrder,
  });
  const total = await getTypeCount({ search });

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
