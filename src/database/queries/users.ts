import { db as database } from "@/database/db";
import { user } from "@/database/schema";
import type { SQL } from "drizzle-orm";
import { asc, desc, eq, ilike, or } from "drizzle-orm";

export async function getUserById(userId: string) {
  return await database.query.user.findFirst({
    where: eq(user.id, userId),
  });
}

export async function getUserByEmail(email: string) {
  return await database.query.user.findFirst({
    where: eq(user.email, email),
  });
}

export async function getUsers(params?: {
  limit?: number;
  offset?: number;
  sortBy?: "name" | "email" | "role" | "createdAt";
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: "user" | "admin" | "moderator";
}) {
  const {
    limit = 10,
    offset = 0,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
    role,
  } = params || {};

  let query = database.select().from(user).$dynamic();

  // Apply filters
  const conditions: SQL<unknown>[] = [];
  if (search) {
    conditions.push(
      or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)) as SQL<unknown>
    );
  }
  if (role) {
    conditions.push(eq(user.role, role));
  }

  if (conditions.length > 0) {
    query = query.where(or(...conditions));
  }

  // Apply sorting

  const sortColumn = user[sortBy];
  query = query.orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn));

  // Apply pagination
  query = query.limit(limit).offset(offset);

  return await query;
}

export async function getUserCount(params?: {
  search?: string;
  role?: "user" | "admin" | "moderator";
}) {
  const { search, role } = params || {};

  let query = database.select().from(user).$dynamic();

  const conditions: SQL<unknown>[] = [];
  if (search) {
    conditions.push(
      or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)) as SQL<unknown>
    );
  }
  if (role) {
    conditions.push(eq(user.role, role));
  }

  if (conditions.length > 0) {
    query = query.where(or(...conditions));
  }

  const result = await query;
  return result.length;
}

// Wrapper function for API compatibility
export async function getAllUsers(filters?: {
  search?: string;
  role?: "user" | "admin" | "moderator";
  emailVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const {
    search,
    role,
    emailVerified: _emailVerified,
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters || {};

  const offset = (page - 1) * limit;
  const users = await getUsers({
    search,
    role,
    limit,
    offset,
    sortBy: sortBy === "name" || sortBy === "email" || sortBy === "role" ? sortBy : "createdAt",
    sortOrder,
  });

  const total = await getUserCount({ search, role });

  return {
    users,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
