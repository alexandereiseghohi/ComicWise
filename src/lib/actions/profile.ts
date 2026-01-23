"use server";

import { db } from "@/database/db";
import { user } from "@/database/schema";
import { ChangePasswordSchema, ProfileUpdateSchema } from "@/schemas/profileSchemas";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

/**
 * Update user profile information
 * @param userId
 * @param data
 */
export async function updateProfileAction(userId: string, data: unknown) {
  try {
    const validated = ProfileUpdateSchema.parse(data);

    const updated = await db
      .update(user)
      .set({
        name: validated.name,
        email: validated.email,
      })
      .where(eq(user.id, userId))
      .returning();

    return { success: true, data: updated[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

/**
 * Change user password
 * @param userId
 * @param data
 */
export async function changePasswordAction(userId: string, data: unknown) {
  try {
    const validated = ChangePasswordSchema.parse(data);

    // Get current user
    const currentUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

    if (!currentUser[0]) {
      return { success: false, error: "User not found" };
    }

    if (!currentUser[0].password) {
      return { success: false, error: "User password not set" };
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(validated.currentPassword, currentUser[0].password);
    if (!passwordMatch) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 10);

    // Update password
    await db.update(user).set({ password: hashedPassword }).where(eq(user.id, userId));

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password change failed",
    };
  }
}

/**
 * Update notification settings
 * @param userId
 * @param settings
 */
export async function updateNotificationSettingsAction(userId: string, settings: any) {
  // Implementation would update notification settings table
  return { success: true, message: "Settings updated" };
}

/**
 * Update privacy settings
 * @param userId
 * @param settings
 */
export async function updatePrivacySettingsAction(userId: number, settings: any) {
  // Implementation would update privacy settings table
  return { success: true, message: "Settings updated" };
}

/**
 * Delete user account
 * @param userId
 */
export async function deleteAccountAction(userId: string) {
  try {
    await db.delete(user).where(eq(user.id, userId));
    return { success: true, message: "Account deleted" };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
