"use server";

// ═══════════════════════════════════════════════════
// OPTIMIZED AUTH SERVER ACTIONS
// Enhanced with rate limiting, workflows, and comprehensive error handling
// ═══════════════════════════════════════════════════

import appConfig, { checkRateLimit } from "@/appConfig";
import { db as database } from "@/database/db";
import { passwordResetToken, user, verificationToken } from "@/database/schema";
import type { AuthActionResponse } from "@/dto";
import {
  sendAccountUpdatedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import type {
  ForgotPasswordInput,
  ResendVerificationEmailInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
  UpdateProfileInput,
  VerifyEmailInput,
} from "@/lib/validations";
import {
  forgotPasswordSchema,
  resendVerificationEmailSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from "@/lib/validations";
import { signIn, signOut } from "auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return realIp ?? "unknown";
}

async function checkAuthRateLimit(identifier: string): Promise<boolean> {
  try {
    const rateLimit = await checkRateLimit(identifier, {
      limit: appConfig.rateLimit.auth ?? 10,
    });
    return rateLimit.allowed;
  } catch {
    // Allow on rate limit check failure to prevent blocking all auth
    return true;
  }
}

function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ═══════════════════════════════════════════════════
// SIGN IN
// ═══════════════════════════════════════════════════

export async function signInActionOptimized(input: SignInInput): Promise<AuthActionResponse> {
  try {
    // Validate input
    const validatedData = signInSchema.parse(input);
    const { email, password } = validatedData;

    // Rate limiting
    const ip = await getClientIP();
    const allowed = await checkAuthRateLimit(`signin:${ip}`);

    if (!allowed) {
      return {
        success: false,
        error: "Too many sign-in attempts. Please try again later.",
      };
    }

    // Attempt sign in
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    revalidatePath("/");
    return { success: true, message: "Sign in successful" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Sign in failed" };
  }
}

// ═══════════════════════════════════════════════════
// REGISTRATION WITH WORKFLOW
// ═══════════════════════════════════════════════════

export async function registerUserActionOptimized(input: SignUpInput): Promise<AuthActionResponse> {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(input);
    const { name, email, password } = validatedData;

    // Rate limiting
    const ip = await getClientIP();
    const allowed = await checkAuthRateLimit(`register:${ip}`);

    if (!allowed) {
      return {
        success: false,
        error: "Too many registration attempts. Please try again later.",
      };
    }

    // Check if user already exists
    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await database
      .insert(user)
      .values({
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
        role: "user",
      })
      .returning();

    if (!newUser) {
      return { success: false, error: "Failed to create user" };
    }

    // Generate verification token
    const token = generateToken(32);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await database.insert(verificationToken).values({
      identifier: email,
      token,
      expires,
    });

    // Send verification email
    try {
      await sendVerificationEmail({ email, verificationToken: token, name });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    // Trigger onboarding workflow (async, don't wait)
    fetch(`${process.env["NEXT_PUBLIC_APP_URL"]}/api/workflows/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: newUser.id, email }),
    }).catch((error) => {
      console.error("Failed to trigger onboarding workflow:", error);
    });

    return {
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Registration failed" };
  }
}

// ═══════════════════════════════════════════════════
// EMAIL VERIFICATION
// ═══════════════════════════════════════════════════

export async function verifyEmailActionOptimized(
  input: VerifyEmailInput
): Promise<AuthActionResponse> {
  try {
    const validatedData = verifyEmailSchema.parse(input);
    const { token } = validatedData;

    // Find token
    const tokenRecord = await database.query.verificationToken.findFirst({
      where: eq(verificationToken.token, token),
    });

    if (!tokenRecord) {
      return { success: false, error: "Invalid or expired token" };
    }

    // Check expiration
    if (new Date() > tokenRecord.expires) {
      await database.delete(verificationToken).where(eq(verificationToken.token, token));
      return { success: false, error: "Token has expired" };
    }

    // Update user
    await database
      .update(user)
      .set({ emailVerified: new Date() })
      .where(eq(user.email, tokenRecord.identifier));

    // Delete token
    await database.delete(verificationToken).where(eq(verificationToken.token, token));

    // Get user for welcome email
    const verifiedUser = await database.query.user.findFirst({
      where: eq(user.email, tokenRecord.identifier),
    });

    // Send welcome email
    if (verifiedUser) {
      try {
        await sendWelcomeEmail({
          email: verifiedUser.email,
          name: verifiedUser.name ?? "User",
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }

    return {
      success: true,
      message: "Email verified successfully! You can now sign in.",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Email verification failed" };
  }
}

// ═══════════════════════════════════════════════════
// RESEND VERIFICATION EMAIL
// ═══════════════════════════════════════════════════

export async function resendVerificationEmailActionOptimized(
  input: ResendVerificationEmailInput
): Promise<AuthActionResponse> {
  try {
    const validatedData = resendVerificationEmailSchema.parse(input);
    const { email } = validatedData;

    // Rate limiting
    const allowed = await checkAuthRateLimit(`resend:${email}`);
    if (!allowed) {
      return {
        success: false,
        error: "Too many requests. Please try again later.",
      };
    }

    // Find user
    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!existingUser) {
      // Don't reveal if user exists
      return {
        success: true,
        message: "If an account exists, a verification email has been sent.",
      };
    }

    if (existingUser.emailVerified) {
      return { success: false, error: "Email is already verified" };
    }

    // Delete old tokens
    await database.delete(verificationToken).where(eq(verificationToken.identifier, email));

    // Generate new token
    const token = generateToken(32);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await database.insert(verificationToken).values({
      identifier: email,
      token,
      expires,
    });

    // Send email
    await sendVerificationEmail({
      email,
      verificationToken: token,
      name: existingUser.name ?? "User",
    });

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to resend verification email" };
  }
}

// ═══════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════

export async function forgotPasswordActionOptimized(
  input: ForgotPasswordInput
): Promise<AuthActionResponse> {
  try {
    const validatedData = forgotPasswordSchema.parse(input);
    const { email } = validatedData;

    // Rate limiting
    const allowed = await checkAuthRateLimit(`forgot:${email}`);
    if (!allowed) {
      return {
        success: false,
        error: "Too many requests. Please try again later.",
      };
    }

    // Find user
    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, email),
    });

    // Always return success to prevent email enumeration
    if (!existingUser) {
      return {
        success: true,
        message: "If an account exists, a password reset email has been sent.",
      };
    }

    // Delete old tokens
    await database.delete(passwordResetToken).where(eq(passwordResetToken.email, email));

    // Generate token
    const resetToken = generateToken(32);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await database.insert(passwordResetToken).values({
      email,
      token: resetToken,
      expires,
    });

    // Send email
    await sendPasswordResetEmail({
      email,
      resetToken,
      name: existingUser.name ?? "User",
    });

    return {
      success: true,
      message: "Password reset email sent! Please check your inbox.",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to process password reset request" };
  }
}

// ═══════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════

export async function resetPasswordActionOptimized(
  input: ResetPasswordInput
): Promise<AuthActionResponse> {
  try {
    const validatedData = resetPasswordSchema.parse(input);
    const { token, password } = validatedData;

    // Find token
    const tokenRecord = await database.query.passwordResetToken.findFirst({
      where: eq(passwordResetToken.token, token),
    });

    if (!tokenRecord) {
      return { success: false, error: "Invalid or expired token" };
    }

    // Check expiration
    if (new Date() > tokenRecord.expires) {
      await database.delete(passwordResetToken).where(eq(passwordResetToken.token, token));
      return { success: false, error: "Token has expired" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await database
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.email, tokenRecord.email));

    // Delete token
    await database.delete(passwordResetToken).where(eq(passwordResetToken.token, token));

    // Get user for notification email
    const updatedUser = await database.query.user.findFirst({
      where: eq(user.email, tokenRecord.email),
    });

    // Send confirmation email
    if (updatedUser) {
      try {
        await sendAccountUpdatedEmail({
          email: updatedUser.email,
          name: updatedUser.name ?? "User",
          changeType: "password",
          changeDetails: "Password Reset",
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    }

    return {
      success: true,
      message: "Password reset successful! You can now sign in with your new password.",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Password reset failed" };
  }
}

// ═══════════════════════════════════════════════════
// UPDATE PROFILE
// ═══════════════════════════════════════════════════

export async function updateProfileActionOptimized(
  userId: string,
  input: UpdateProfileInput
): Promise<AuthActionResponse> {
  try {
    const validatedData = updateProfileSchema.parse(input);

    // Update user
    const [updatedUser] = await database
      .update(user)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    if (!updatedUser) {
      return { success: false, error: "User not found" };
    }

    // Send notification email
    try {
      await sendAccountUpdatedEmail({
        email: updatedUser.email,
        name: updatedUser.name ?? "User",
        changeType: "profile",
        changeDetails: "Profile Updated",
      });
    } catch (emailError) {
      console.error("Failed to send update notification:", emailError);
    }

    revalidatePath("/profile");
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update profile" };
  }
}

// ═══════════════════════════════════════════════════
// UPDATE PASSWORD
// ═══════════════════════════════════════════════════

export async function updatePasswordActionOptimized(
  userId: string,
  input: UpdatePasswordInput
): Promise<AuthActionResponse> {
  try {
    const validatedData = updatePasswordSchema.parse(input);
    const { currentPassword, newPassword } = validatedData;

    // Get user
    const existingUser = await database.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser?.password) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, existingUser.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await database
      .update(user)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(user.id, userId));

    // Send notification
    try {
      await sendAccountUpdatedEmail({
        email: existingUser.email,
        name: existingUser.name ?? "User",
        changeType: "password",
        changeDetails: "Password Changed",
      });
    } catch (emailError) {
      console.error("Failed to send notification:", emailError);
    }

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update password" };
  }
}

// ═══════════════════════════════════════════════════
// SIGN OUT
// ═══════════════════════════════════════════════════

export async function signOutActionOptimized(): Promise<AuthActionResponse> {
  try {
    await signOut({ redirect: false });
    revalidatePath("/");
    return { success: true, message: "Signed out successfully" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Sign out failed" };
  }
}
