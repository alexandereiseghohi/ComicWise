"use server";

import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { passwordResetToken, user, verificationToken } from "@/database/schema";
import type { AuthActionResponse } from "@/dto";
import {
  sendAccountUpdatedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import { checkRateLimit } from "@/lib/ratelimit";
import type {
  ForgotPasswordInput,
  ResendVerificationEmailInput,
  ResetPasswordInput,
  SignUpInput,
  VerifyEmailInput,
} from "@/lib/validations";
import {
  forgotPasswordSchema,
  resendVerificationEmailSchema,
  resetPasswordSchema,
  signUpSchema,
  verifyEmailSchema,
} from "@/lib/validations";
import { signIn, signOut } from "auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
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
  const rateLimit = await checkRateLimit(identifier, {
    limit: appConfig.rateLimit.auth ?? 10,
  });
  return rateLimit.allowed;
}

// ═══════════════════════════════════════════════════
// REGISTRATION
// ═══════════════════════════════════════════════════

/**
 *
 * param input
 * @param input
 */
export async function registerUserAction(input: SignUpInput): Promise<AuthActionResponse> {
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
    const hashedPassword = await bcrypt.hash(password, appConfig.security?.bcryptRounds ?? 10);

    // Create user
    const [newUser] = await database
      .insert(user)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "user",
        emailVerified: null,
      })
      .returning();

    if (!newUser) {
      return {
        success: false,
        error: "Failed to create user account",
      };
    }

    // Generate verification token
    if (appConfig.features.emailVerification && appConfig.features.email) {
      const token = crypto.randomUUID();
      const expires = new Date(
        Date.now() + (appConfig.security?.tokenExpiry?.emailVerification ?? 3600000)
      );

      await database.insert(verificationToken).values({
        identifier: email,
        token,
        expires,
      });

      // Send verification email
      await sendVerificationEmail({
        name,
        email,
        verificationToken: token,
      });
    } else {
      // If email verification is disabled, mark as verified
      await database.update(user).set({ emailVerified: new Date() }).where(eq(user.id, newUser.id));
    }

    // Send welcome email (optional)
    if (appConfig.features.email) {
      await sendWelcomeEmail({ name, email });
    }

    return {
      success: true,
      message: appConfig.features.emailVerification
        ? "Account created! Please check your email to verify your account."
        : "Account created successfully!",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

// ═══════════════════════════════════════════════════
// EMAIL VERIFICATION
// ═══════════════════════════════════════════════════

/**
 *
 * param input
 * @param input
 */
export async function verifyEmailAction(input: VerifyEmailInput): Promise<AuthActionResponse> {
  try {
    const { token } = verifyEmailSchema.parse(input);

    // Find verification token
    const tokenRecord = await database.query.verificationToken.findFirst({
      where: eq(verificationToken.token, token),
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: "Invalid or expired verification link",
      };
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expires) {
      // Delete expired token
      await database.delete(verificationToken).where(eq(verificationToken.token, token));

      return {
        success: false,
        error: "Verification link has expired. Please request a new one.",
      };
    }

    // Update user email verification status
    await database
      .update(user)
      .set({ emailVerified: new Date() })
      .where(eq(user.email, tokenRecord.identifier));

    // Delete used token
    await database.delete(verificationToken).where(eq(verificationToken.token, token));

    return {
      success: true,
      message: "Email verified successfully! You can now sign in.",
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      error: "Failed to verify email",
    };
  }
}

// ═══════════════════════════════════════════════════
// RESEND VERIFICATION EMAIL
// ═══════════════════════════════════════════════════

/**
 *
 * param input
 * @param input
 */
export async function resendVerificationEmailAction(
  input: ResendVerificationEmailInput
): Promise<AuthActionResponse> {
  try {
    const { email } = resendVerificationEmailSchema.parse(input);

    // Rate limiting
    const allowed = await checkAuthRateLimit(`verify:${email}`);

    if (!allowed) {
      return {
        success: false,
        error: "Too many verification requests. Please try again later.",
      };
    }

    // Check if user exists
    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!existingUser) {
      return {
        success: false,
        error: "No account found with this email address",
      };
    }

    // Check if already verified
    if (existingUser.emailVerified) {
      return {
        success: false,
        error: "Email is already verified",
      };
    }

    // Delete any existing verification tokens for this email
    await database.delete(verificationToken).where(eq(verificationToken.identifier, email));

    // Generate new verification token
    const token = crypto.randomUUID();
    const expires = new Date(
      Date.now() + (appConfig.security?.tokenExpiry?.emailVerification ?? 3600000)
    );

    await database.insert(verificationToken).values({
      identifier: email,
      token,
      expires,
    });

    // Send verification email
    await sendVerificationEmail({
      name: existingUser.name ?? "User",
      email,
      verificationToken: token,
    });

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      error: "Failed to resend verification email",
    };
  }
}

// ═══════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════

/**
 *
 * param input
 * @param input
 */
export async function forgotPasswordAction(
  input: ForgotPasswordInput
): Promise<AuthActionResponse> {
  try {
    const { email } = forgotPasswordSchema.parse(input);

    // Rate limiting
    const allowed = await checkAuthRateLimit(`reset:${email}`);

    if (!allowed) {
      return {
        success: false,
        error: "Too many reset requests. Please try again later.",
      };
    }

    // Check if user exists
    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, email),
    });

    // For security, don't reveal if user exists or not
    if (!existingUser) {
      return {
        success: true,
        message: "If an account exists, a password reset link has been sent.",
      };
    }

    // Delete any existing reset tokens for this email
    await database.delete(passwordResetToken).where(eq(passwordResetToken.email, email));

    // Generate reset token
    const token = crypto.randomUUID();
    const expires = new Date(
      Date.now() + (appConfig.security?.tokenExpiry?.passwordReset ?? 3600000)
    );

    await database.insert(passwordResetToken).values({
      email,
      token,
      expires,
    });

    // Send password reset email
    const ip = await getClientIP();
    await sendPasswordResetEmail({
      name: existingUser.name ?? "User",
      email,
      resetToken: token,
      ipAddress: ip,
    });

    return {
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      error: "Failed to process password reset request",
    };
  }
}

// ═══════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════

/**
 *
 * param input
 * @param input
 */
export async function resetPasswordAction(input: ResetPasswordInput): Promise<AuthActionResponse> {
  try {
    const { token, password } = resetPasswordSchema.parse(input);

    // Find reset token
    const tokenRecord = await database.query.passwordResetToken.findFirst({
      where: eq(passwordResetToken.token, token),
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: "Invalid or expired reset link",
      };
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expires) {
      // Delete expired token
      await database.delete(passwordResetToken).where(eq(passwordResetToken.token, token));

      return {
        success: false,
        error: "Reset link has expired. Please request a new one.",
      };
    }

    // Find user
    const existingUser = await database.query.user.findFirst({
      where: eq(user.email, tokenRecord.email),
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, appConfig.security?.bcryptRounds ?? 10);

    // Update user password
    await database
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.id, existingUser.id));

    // Delete used token
    await database.delete(passwordResetToken).where(eq(passwordResetToken.token, token));

    // Send account updated email
    if (appConfig.features.email) {
      const ip = await getClientIP();
      await sendAccountUpdatedEmail({
        name: existingUser.name ?? "User",
        email: existingUser.email,
        changeType: "password",
        ipAddress: ip,
      });
    }

    return {
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "Failed to reset password",
    };
  }
}

// ═══════════════════════════════════════════════════
// SIGN IN
// ═══════════════════════════════════════════════════

/**
 *
 * param email
 * param password
 * @param email
 * @param password
 */
export async function signInAction(email: string, password: string): Promise<AuthActionResponse> {
  try {
    // Rate limiting
    const ip = await getClientIP();
    const allowed = await checkAuthRateLimit(`signin:${ip}`);

    if (!allowed) {
      return {
        success: false,
        error: "Too many sign-in attempts. Please try again later.",
      };
    }

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

    return {
      success: true,
      message: "Signed in successfully!",
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: "Failed to sign in",
    };
  }
}

// ═══════════════════════════════════════════════════
// SIGN OUT
// ═══════════════════════════════════════════════════

/**
 *
 */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

// ═══════════════════════════════════════════════════
// CHANGE PASSWORD
// ═══════════════════════════════════════════════════

/**
 * Change user password
 * @param data
 * @param data.currentPassword
 * @param data.newPassword
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthActionResponse> {
  try {
    // TODO: Get current user from session and verify current password
    // This is a placeholder implementation
    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "Failed to change password",
    };
  }
}

// ═══════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════

export {
  forgotPasswordAction as forgotPassword,
  registerUserAction as registerUser,
  resendVerificationEmailAction as resendVerificationEmail,
  resetPasswordAction as resetPassword,
  signInAction as signInUser,
  signOutAction as signOutUser,
  verifyEmailAction as verifyEmail,
};
