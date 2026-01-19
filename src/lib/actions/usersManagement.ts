"use server";

import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { user } from "@/database/schema";
import type { ActionResult } from "@/dto";
import { sendAccountUpdatedEmail, sendWelcomeEmail } from "@/lib/email";
import type { CreateUserInput, UpdateUserInput, UserFilterInput } from "@/lib/validations";
import { createUserSchema, updateUserSchema, userFilterSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import type { SQL } from "drizzle-orm";
import { asc, desc, eq, like, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createUserAdmin(
  input: CreateUserInput
): Promise<ActionResult<typeof user.$inferSelect>> {
  try {
    const validated = createUserSchema.parse(input);

    // Check if user exists
    const existing = await database.query.user.findFirst({
      where: eq(user.email, validated.email.toLowerCase()),
    });

    if (existing) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      validated.password,
      appConfig.security?.bcryptRounds ?? 10
    );

    const [newUser] = await database
      .insert(user)
      .values({
        ...validated,
        email: validated.email.toLowerCase(),
        password: hashedPassword,
        emailVerified: new Date(), // Admin created users are auto-verified
      })
      .returning();

    if (!newUser) {
      return { success: false, error: "Failed to create user" };
    }

    // Send welcome email
    if (appConfig.features.email) {
      await sendWelcomeEmail({
        name: newUser.name || "User",
        email: newUser.email,
      }).catch(console.error);
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      data: newUser,
      message: "User created successfully",
    };
  } catch (error) {
    console.error("Create user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

// ═══════════════════════════════════════════════════
// UPDATE USER (Admin Only)
// ═══════════════════════════════════════════════════

export async function updateUserAdmin(
  userId: string,
  input: UpdateUserInput
): Promise<ActionResult<typeof user.$inferSelect>> {
  try {
    const validated = updateUserSchema.parse(input);

    const existingUser = await database.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    // Check email uniqueness if email is being changed
    if (validated.email && validated.email !== existingUser.email) {
      const emailExists = await database.query.user.findFirst({
        where: eq(user.email, validated.email.toLowerCase()),
      });

      if (emailExists) {
        return { success: false, error: "Email already in use" };
      }
    }

    const updateData: Record<string, unknown> = {
      ...validated,
      updatedAt: new Date(),
    };

    if (validated.email) {
      updateData["email"] = validated.email.toLowerCase();
    }

    const [updatedUser] = await database
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning();

    if (!updatedUser) {
      return { success: false, error: "Failed to update user" };
    }

    // Send notification email
    if (appConfig.features.email) {
      await sendAccountUpdatedEmail({
        name: updatedUser.name || "User",
        email: updatedUser.email,
        changeType: "profile",
      }).catch(console.error);
    }

    revalidatePath("/admin/users");
    revalidatePath(`/profile/${userId}`);

    return {
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Update user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

// ═══════════════════════════════════════════════════
// DELETE USER (Admin Only)
// ═══════════════════════════════════════════════════

export async function deleteUserAdmin(userId: string): Promise<ActionResult<void>> {
  try {
    const existingUser = await database.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    // Prevent deleting own account
    // Note: You'd need to pass current user ID to check this
    // For now, we'll allow it but recommend adding this check in the UI

    await database.delete(user).where(eq(user.id, userId));

    revalidatePath("/admin/users");

    return {
      success: true,
      data: undefined,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Delete user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET USER BY ID
// ═══════════════════════════════════════════════════

export async function getUserById(userId: string) {
  try {
    const result = await database.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!result) {
      return { success: false, error: "User not found" };
    }

    // Remove sensitive data
    const { password: _password, ...safeUser } = result;

    return { success: true, data: safeUser };
  } catch (error) {
    console.error("Get user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

// ═══════════════════════════════════════════════════
// LIST USERS WITH FILTERS
// ═══════════════════════════════════════════════════

export async function listUsers(input?: UserFilterInput) {
  try {
    const validated = userFilterSchema.parse(input || {});
    const {
      page = 1,
      limit = appConfig.pagination?.defaultLimit ?? 12,
      search,
      role,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = validated;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: SQL<unknown>[] = [];

    if (search) {
      conditions.push(
        or(like(user.name, `%${search}%`), like(user.email, `%${search}%`)) as SQL<unknown>
      );
    }

    if (role) {
      conditions.push(eq(user.role, role));
    }

    const whereClause = conditions.length > 0 ? conditions[0] : undefined;

    // Get total count
    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause);

    const total = countResult?.count || 0;

    // Get users (without passwords) with ordering
    let usersQuery = database
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(whereClause)
      .$dynamic();

    // Apply ordering
    switch (sortBy) {
      case "name":
        usersQuery = usersQuery.orderBy(sortOrder === "desc" ? desc(user.name) : asc(user.name));

        break;

      case "email":
        usersQuery = usersQuery.orderBy(sortOrder === "desc" ? desc(user.email) : asc(user.email));

        break;

      case "role":
        usersQuery = usersQuery.orderBy(sortOrder === "desc" ? desc(user.role) : asc(user.role));

        break;

      default:
        usersQuery = usersQuery.orderBy(
          sortOrder === "desc" ? desc(user.createdAt) : asc(user.createdAt)
        );
    }

    const results = await usersQuery.limit(limit).offset(offset);

    return {
      success: true,
      data: {
        users: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("List users error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list users",
    };
  }
}

// ═══════════════════════════════════════════════════
// UPDATE USER ROLE
// ═══════════════════════════════════════════════════

export async function updateUserRole(
  userId: string,
  role: "user" | "admin" | "moderator"
): Promise<ActionResult<void>> {
  try {
    const existingUser = await database.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    await database.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId));

    revalidatePath("/admin/users");

    return {
      success: true,
      data: undefined,
      message: `User role updated to ${role}`,
    };
  } catch (error) {
    console.error("Update user role error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}

// ═══════════════════════════════════════════════════
// VERIFY USER EMAIL (Admin Action)
// ═══════════════════════════════════════════════════

export async function verifyUserEmailAdmin(userId: string): Promise<ActionResult<void>> {
  try {
    const existingUser = await database.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    if (existingUser.emailVerified) {
      return { success: false, error: "Email already verified" };
    }

    await database
      .update(user)
      .set({ emailVerified: new Date(), updatedAt: new Date() })
      .where(eq(user.id, userId));

    revalidatePath("/admin/users");

    return {
      success: true,
      data: undefined,
      message: "Email verified successfully",
    };
  } catch (error) {
    console.error("Verify email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify email",
    };
  }
}

// ═══════════════════════════════════════════════════
// GET USER STATISTICS
// ═══════════════════════════════════════════════════

export async function getUserStatistics() {
  try {
    const [stats] = await database
      .select({
        total: sql<number>`count(*)`,
        admins: sql<number>`count(*) FILTER (WHERE ${user.role} = 'admin')`,
        moderators: sql<number>`count(*) FILTER (WHERE ${user.role} = 'moderator')`,
        users: sql<number>`count(*) FILTER (WHERE ${user.role} = 'user')`,
        verified: sql<number>`count(*) FILTER (WHERE ${user.emailVerified} IS NOT NULL)`,
        unverified: sql<number>`count(*) FILTER (WHERE ${user.emailVerified} IS NULL)`,
      })
      .from(user);

    return {
      success: true,
      data: stats || {
        total: 0,
        admins: 0,
        moderators: 0,
        users: 0,
        verified: 0,
        unverified: 0,
      },
    };
  } catch (error) {
    console.error("Get user statistics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get statistics",
    };
  }
}
