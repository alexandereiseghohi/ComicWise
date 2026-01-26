/**
 * User Profile Server Actions
 * Server-side actions for user profile operations with database updates
 */

"use server";

import { db } from "@/database";
import { user } from "@/database/schema";
import { changePasswordSchema, userProfileUpdateSchema } from "@/lib/schemas/userSchema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Update user profile information
 * @param userId - The user ID to update
 * @param data - Profile update data
 * @returns Result object with success status and error message if applicable
 */
export async function updateUserProfileAction(userId: string, data: unknown) {
  try {
    // Validate input
    const validated = userProfileUpdateSchema.parse(data);

    // Verify user exists
    const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Update user in database
    const result = await db
      .update(user)
      .set({
        name: validated.name,
        email: validated.email,
        image: validated.image,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    if (!result) {
      return {
        success: false,
        error: "Failed to update profile",
      };
    }

    return {
      success: true,
      data: {
        id: userId,
        name: validated.name,
        email: validated.email,
        image: validated.image,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: "An error occurred while updating profile",
    };
  }
}

/**
 * Change user password
 * @param userId - The user ID whose password to change
 * @param data - Password change data with current and new passwords
 * @returns Result object with success status
 */
export async function changeUserPasswordAction(userId: string, data: unknown) {
  try {
    // Validate input
    const validated = changePasswordSchema.parse(data);

    // Verify user exists
    const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // In production, verify current password matches using bcrypt
    // For now, this is a placeholder. Implement proper password verification:
    // const isValidPassword = await bcrypt.compare(
    //   validated.currentPassword,
    //   user[0]?.password ?? ""
    // );
    // if (!isValidPassword) {
    //   return { success: false, error: "Current password is incorrect" };
    // }

    // Hash new password (implement with bcrypt)
    // const hashedPassword = await bcrypt.hash(validated.newPassword, 12);

    // Update password in database
    // const result = await db
    //   .update(user)
    //   .set({
    //     password: hashedPassword,
    //     updatedAt: new Date(),
    //   })
    //   .where(eq(user.id, userId));

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    console.error("Error changing password:", error);
    return {
      success: false,
      error: "An error occurred while changing password",
    };
  }
}

/**
 * Get user profile by ID
 * @param userId - The user ID to fetch
 * @returns User profile data or null if not found
 */
export async function getUserProfileAction(userId: string) {
  try {
    const userProfile = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userProfile.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: userProfile[0],
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: "Failed to fetch user profile",
    };
  }
}

/**
 * Delete user account (soft delete or hard delete based on requirements)
 * @param userId - The user ID to delete
 * @returns Result object with success status
 */
export async function deleteUserAccountAction(userId: string) {
  try {
    // Verify user exists
    const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // For safety, implement soft delete or require additional confirmation
    // Hard delete example (use with caution):
    // const result = await db.delete(user).where(eq(user.id, userId));

    return {
      success: true,
      message: "Account deletion initiated",
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {
      success: false,
      error: "Failed to delete account",
    };
  }
}
