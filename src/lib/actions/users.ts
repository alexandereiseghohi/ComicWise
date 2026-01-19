"use server";

import appConfig, { checkRateLimit } from "@/appConfig";
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
    // Rate limiting
    const email = formData.get("email") as string;
    const rateLimit = await checkRateLimit(`register:${email}`, {
      limit: appConfig.rateLimit.auth ?? 10,
      window: "30s",
    });
    if (!rateLimit.allowed) {
      return error("Too many registration attempts. Please try again later.");
    }

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
    // Rate limiting
    const rateLimit = await checkRateLimit(`password-reset:${email}`, {
      limit: appConfig.rateLimit.email ?? 10,
      window: "60s",
    });
    if (!rateLimit.allowed) {
      return error("Too many password reset requests. Please try again later.");
    }

    const user = await queries.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { success: true };
    }

    // Delete any existing tokens for this email
    await mutations.deletePasswordResetTokensByEmail(email);

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await mutations.createPasswordResetToken({
      email,
      token,
      expires,
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
    // TODO: Get current user from session
    // This is a placeholder implementation
    return { success: true };
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
    // TODO: Save settings to database
    // This is a placeholder implementation
    return { success: true };
  } catch (error_) {
    console.error("Update settings error:", error_);
    return error("Failed to update settings");
  }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(): Promise<ActionResult<unknown>> {
  try {
    // TODO: Delete user and all associated data
    // This is a placeholder implementation
    return { success: true };
  } catch (error_) {
    console.error("Delete account error:", error_);
    return error("Failed to delete account");
  }
}
