/**
 * User Data Access Layer
 * Handles all database operations for users
 */

import type { ListOptions } from "@/dal/baseDal";
import { BaseDal } from "@/dal/baseDal";
import { db } from "@/database/db";
import * as mutations from "@/database/mutations";
import * as queries from "@/database/queries";
import { user } from "@/database/schema";
import type { User } from "@/types/database";

// @ts-expect-error - TypeScript limitation: static methods cannot properly override generic static methods
class UserDal extends BaseDal<User, Partial<User>> {
  private static instance: UserDal;

  private constructor() {
    super("UserDal");
  }

  static override getInstance(): UserDal {
    return BaseDal.getInstance("userDal", () => new UserDal());
  }

  override async create(data: Partial<User>): Promise<User | undefined> {
    // Validate required fields
    const email = data.email ?? "";
    const name = data.name ?? "";

    if (!email || !name) {
      this.logger.warn("Create user missing required fields");
      return undefined;
    }

    return this.executeWithLogging(
      async () =>
        await mutations.createUser({
          email,
          name,
          password: data.password ?? undefined,
          image: (data.image as string | undefined) ?? undefined,
          role: data.role ?? "user",
        }),
      "Creating user",
      { email, name }
    );
  }

  async findById(id: string): Promise<User | undefined> {
    return this.executeWithLogging(
      async () => await queries.getUserById(id),
      "Finding user by ID",
      { id }
    );
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.executeWithLogging(
      async () => await queries.getUserByEmail(email),
      "Finding user by email",
      { email }
    );
  }

  async update(id: string, data: Partial<User>): Promise<User | undefined> {
    return this.executeWithLogging(
      async () =>
        await mutations.updateUser(id, {
          name: data.name ?? undefined,
          email: data.email,
          image: data.image === null ? null : data.image,
          role: data.role,
          emailVerified: data.emailVerified ?? undefined,
        }),
      "Updating user",
      { id }
    );
  }

  async delete(id: string): Promise<User | undefined> {
    return this.executeWithLogging(async () => await mutations.deleteUser(id), "Deleting user", {
      id,
    });
  }

  async findByResetToken(token: string): Promise<User | undefined> {
    return this.executeWithLogging(
      async () => {
        // Note: This functionality needs to be implemented in the queries
        return undefined;
      },
      "Finding user by reset token",
      { token: "***" }
    );
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User | undefined> {
    return this.executeWithLogging(
      async () => await mutations.updateUserPassword(id, hashedPassword),
      "Updating user password",
      { id }
    );
  }

  async setResetToken(
    id: string,
    resetToken: string,
    resetTokenExpiry: Date
  ): Promise<User | undefined> {
    return this.executeWithLogging(
      async () => {
        // Note: User mutations don't support resetToken - this should use passwordResetToken table
        return undefined;
      },
      "Setting reset token",
      { id }
    );
  }

  async list(options: ListOptions = {}): Promise<User[]> {
    const { limit = 50, offset = 0 } = options;

    return this.executeWithLogging(
      async () => await db.select().from(user).limit(limit).offset(offset),
      "Listing users",
      { limit, offset }
    );
  }

  /**
   * Find users with advanced filtering
   * Used by API routes for pagination and filtering
   * @param filters
   * @param filters.search
   * @param filters.role
   * @param filters.emailVerified
   * @param filters.page
   * @param filters.limit
   * @param filters.sortBy
   * @param filters.sortOrder
   */
  async findWithFilters(filters: {
    search?: string;
    role?: "user" | "admin" | "moderator";
    emailVerified?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.executeWithLogging(
      async () => await queries.getAllUsers(filters),
      "Finding users with filters",
      { filters: { ...filters, search: filters.search ? "***" : undefined } }
    );
  }

  /**
   * Verify user email
   * @param id
   */
  async verifyEmail(id: string): Promise<User | undefined> {
    return this.executeWithLogging(
      async () => await mutations.verifyUserEmail(id),
      "Verifying user email",
      { id }
    );
  }

  /**
   * Count users with optional filtering
   * @param params
   * @param params.search
   * @param params.role
   */
  async count(params?: {
    search?: string;
    role?: "user" | "admin" | "moderator";
  }): Promise<number> {
    return this.executeWithLogging(
      async () => await queries.getUserCount(params),
      "Counting users",
      { params }
    );
  }
}

export const userDal = UserDal.getInstance();
