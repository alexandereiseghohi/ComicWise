"use server";

import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { passwordResetToken, user, verificationToken } from "@/database/schema";
import { error } from "@/lib/actions/utils";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signUpSchema,
  verifyEmailSchema,
} from "@/lib/validations";
import type { ActionResponse } from "@/types";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function registerWorkflow(formData: FormData): Promise<ActionResponse> {
  try {
    const data = signUpSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Rate limiting
    const rateLimit = await checkRateLimit(`register:${data.email}`, {
      limit:
        typeof appConfig.rateLimit.auth === "object" && appConfig.rateLimit.auth !== null
          ? ((appConfig.rateLimit.auth as { requests?: number }).requests ?? 10)
          : 10,
      window:
        typeof appConfig.rateLimit.auth === "object" && appConfig.rateLimit.auth !== null
          ? `${(appConfig.rateLimit.auth as { window?: number }).window ?? 60}s`
          : "60s",
    });
    if (!rateLimit.allowed) {
      return error("Too many registration attempts. Please try again later.");
    }

    // Check if user exists
    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, data.email),
    });

    if (existingUser) {
      return error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const [newUser] = await database
      .insert(user)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "user",
      })
      .returning();

    if (!newUser) {
      return error("Failed to create user");
    }

    // Create verification token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await database.insert(verificationToken).values({
      identifier: data.email,
      token,
      expires,
    });

    // Send verification email
    await sendVerificationEmail(data.email, data.name, token);

    return { success: true, data: { userId: newUser.id } };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues?.[0]?.message ?? "Validation error");
    }
    console.error("Registration error:", error_);
    return error("Failed to register user");
  }
}

export async function forgotPasswordWorkflow(formData: FormData): Promise<ActionResponse> {
  try {
    const data = forgotPasswordSchema.parse({
      email: formData.get("email"),
    });

    // Rate limiting
    const rateLimit = await checkRateLimit(`reset:${data.email}`, {
      limit:
        typeof appConfig.rateLimit.email === "object" && appConfig.rateLimit.email !== null
          ? ((appConfig.rateLimit.email as { requests?: number }).requests ?? 10)
          : 10,
      window:
        typeof appConfig.rateLimit.email === "object" && appConfig.rateLimit.email !== null
          ? `${(appConfig.rateLimit.email as { window?: number }).window ?? 60}s`
          : "60s",
    });
    if (!rateLimit.allowed) {
      return error("Too many reset attempts. Please try again later.");
    }

    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, data.email),
    });

    if (!existingUser) {
      // Don't reveal if user exists
      return { success: true };
    }

    // Create reset token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete existing tokens
    await database.delete(passwordResetToken).where(eq(passwordResetToken.email, data.email));

    await database.insert(passwordResetToken).values({
      email: data.email,
      token,
      expires,
    });

    // Send reset email
    await sendPasswordResetEmail(data.email, existingUser.name ?? "User", token);

    return { success: true };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues?.[0]?.message ?? "Validation error");
    }
    console.error("Forgot password error:", error_);
    return error("Failed to process request");
  }
}

export async function resetPasswordWorkflow(formData: FormData): Promise<ActionResponse> {
  try {
    const data = resetPasswordSchema.parse({
      token: formData.get("token"),
      password: formData.get("password"),
    });

    const resetToken = await database.query.passwordResetToken.findFirst({
      where: eq(passwordResetToken.token, data.token),
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return error("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await database
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.email, resetToken.email));

    await database.delete(passwordResetToken).where(eq(passwordResetToken.token, data.token));

    return { success: true };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues?.[0]?.message ?? "Validation error");
    }
    console.error("Reset password error:", error_);
    return error("Failed to reset password");
  }
}

export async function verifyEmailWorkflow(formData: FormData): Promise<ActionResponse> {
  try {
    const data = verifyEmailSchema.parse({
      token: formData.get("token"),
    });

    const token = await database.query.verificationToken.findFirst({
      where: eq(verificationToken.token, data.token),
    });

    if (!token || token.expires < new Date()) {
      return error("Invalid or expired token");
    }

    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, token.identifier),
    });

    if (!existingUser) {
      return error("User not found");
    }

    await database
      .update(user)
      .set({ emailVerified: new Date() })
      .where(eq(user.email, token.identifier));

    await database.delete(verificationToken).where(eq(verificationToken.token, data.token));

    // Send welcome email
    await sendWelcomeEmail(existingUser.email, existingUser.name ?? "User");

    return { success: true };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues?.[0]?.message ?? "Validation error");
    }
    console.error("Verify email error:", error_);
    return error("Failed to verify email");
  }
}

export async function resendVerificationEmail(email: string): Promise<ActionResponse> {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(`resend:${email}`, {
      limit:
        typeof appConfig.rateLimit.email === "object" && appConfig.rateLimit.email !== null
          ? ((appConfig.rateLimit.email as { requests?: number }).requests ?? 10)
          : 10,
      window:
        typeof appConfig.rateLimit.email === "object" && appConfig.rateLimit.email !== null
          ? `${(appConfig.rateLimit.email as { window?: number }).window ?? 60}s`
          : "60s",
    });
    if (!rateLimit.allowed) {
      return error("Too many requests. Please try again later.");
    }

    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!existingUser) {
      return error("User not found");
    }

    if (existingUser.emailVerified) {
      return error("Email already verified");
    }

    // Delete existing tokens
    await database.delete(verificationToken).where(eq(verificationToken.identifier, email));

    // Create new token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await database.insert(verificationToken).values({
      identifier: email,
      token,
      expires,
    });

    await sendVerificationEmail(email, existingUser.name ?? "User", token);

    return { success: true };
  } catch (error_) {
    console.error("Resend verification error:", error_);
    return error("Failed to resend verification email");
  }
}
