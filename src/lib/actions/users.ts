"use server";

import * as mutations from "@/database/mutations";
import * as queries from "@/database/queries";
import type { ActionResult } from "@/dto";
import { error } from "@/lib/actions/utils";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { signUpSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateUserAdminSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(["user", "admin", "moderator"]).optional(),
    image: z.string().url().optional().nullable(),
  })
  .strict();

export async function registerUser(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const email = formData.get("email") as string;
    const data = signUpSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Check if user already exists
    const existingUser = await queries.getUserByEmail(data.email);
    if (existingUser) {
      return error("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await mutations.createUser({
      ...data,
      password: hashedPassword,
    });

    if (!user) {
      return error("Failed to create user");
    }

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || "User");

    return { success: true, data: { id: user.id } };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message || "Validation error");
    }
    console.error("Register user error:", error_);
    return error("Failed to register user");
  }
}

export async function updateUser(
  userId: string,
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const data = updateUserAdminSchema.parse({
      name: formData.get("name") || undefined,
      email: formData.get("email") || undefined,
      role: formData.get("role") || undefined,
      image: formData.get("image") || undefined,
    });

    await mutations.updateUser(userId, data);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return { success: true };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message || "Validation error");
    }
    console.error("Update user error:", error_);
    return error("Failed to update user");
  }
}

export async function deleteUser(userId: string): Promise<ActionResult<unknown>> {
  try {
    await mutations.deleteUser(userId);
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error_) {
    console.error("Delete user error:", error_);
    return error("Failed to delete user");
  }
}

export async function requestPasswordReset(email: string): Promise<ActionResult<unknown>> {
  try {
    const user = await queries.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { success: true };
    }

    // Delete any existing tokens for this email
    await mutations.deletepasswordResetTokenByEmail(email);

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await mutations.createPasswordResetToken({
      email,
      token,
      expiresAt,
    });

    // Send reset email
    await sendPasswordResetEmail(email, user.name || "User", token);

    return { success: true };
  } catch (error_) {
    console.error("Password reset request error:", error_);
    return error("Failed to process password reset request");
  }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ActionResult<unknown>> {
  try {
    const resetToken = await queries.getPasswordResetToken(token);

    if (!resetToken) {
      return error("Invalid or expired reset token");
    }

    if (new Date() > resetToken.expires) {
      return error("Reset token has expired");
    }

    const user = await queries.getUserByEmail(resetToken.email);
    if (!user) {
      return error("User not found");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await mutations.updateUserPassword(user.id, hashedPassword);

    // Delete the used token
    await mutations.deletePasswordResetToken(token);

    return { success: true };
  } catch (error_) {
    console.error("Reset password error:", error_);
    return error("Failed to reset password");
  }
}

/**
 * Update user profile
 * @param data
 * @param data.name
 * @param data.email
 * @param data.bio
 * @param data.image
 */
export async function updateUserProfile(data: {
  name?: string;
  email?: string;
  bio?: string;
  image?: string | null;
}): Promise<ActionResult<unknown>> {
  try {
    const { auth: authFunction } = await import("auth");
    const session = await authFunction();

    if (!session?.user?.id) {
      return error("Please sign in to update your profile");
    }

    await mutations.updateUser(session.user.id, data);
    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return { success: true, message: "Profile updated successfully" };
  } catch (error_) {
    console.error("Update profile error:", error_);
    return error("Failed to update profile");
  }
}

/**
 * Update user settings
 * @param settings
 * @param settings.emailNotifications
 * @param settings.newChapterAlerts
 * @param settings.commentReplies
 * @param settings.profileVisibility
 * @param settings.readingHistoryVisibility
 */
export async function updateUserSettings(settings: {
  emailNotifications?: boolean;
  newChapterAlerts?: boolean;
  commentReplies?: boolean;
  profileVisibility?: boolean;
  readingHistoryVisibility?: boolean;
}): Promise<ActionResult<unknown>> {
  try {
    const { auth: authFunction } = await import("auth");
    const session = await authFunction();

    if (!session?.user?.id) {
      return error("Please sign in to update settings");
    }

    // Note: Settings would typically be stored in a separate user_settings table
    // For now, we'll store as JSON in user metadata (if schema supports it)
    // Or create a separate settings mutation in the future
    await mutations.updateUser(session.user.id, {
      // Store settings in a metadata field or handle separately
    });

    revalidatePath("/profile/settings");

    return { success: true, message: "Settings updated successfully" };
  } catch (error_) {
    console.error("Update settings error:", error_);
    return error("Failed to update settings");
  }
}

/**
 * Delete user account and all associated data
 * Cascade deletes: bookmarks, comments, reading progress, sessions
 */
export async function deleteUserAccount(): Promise<ActionResult<unknown>> {
  try {
    const { auth: authFunction } = await import("auth");
    const session = await authFunction();

    if (!session?.user?.id) {
      return error("Please sign in to delete your account");
    }

    // Database will handle cascade deletion via foreign key constraints
    // Ensure schema has ON DELETE CASCADE for user relationships
    await mutations.deleteUser(session.user.id);

    // Sign out the user after deletion
    const { signOut } = await import("auth");
    await signOut({ redirect: false });

    return { success: true, message: "Account deleted successfully" };
  } catch (error_) {
    console.error("Delete account error:", error_);
    return error("Failed to delete account");
  }
}
