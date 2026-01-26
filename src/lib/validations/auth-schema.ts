// ═══════════════════════════════════════════════════
// COMPREHENSIVE ZOD VALIDATION SCHEMAS (Next.js 16)
// ═══════════════════════════════════════════════════
// Canonical centralized validation schemas
import { z } from "zod";

// Helper: accept either a valid email OR a non-empty username string
function isEmailOrUsername(value: string) {
  const v = value.trim();
  if (v.includes("@")) {
    // simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  return v.length > 0;
}

// ═══════════════════════════════════════════════════
// AUTHENTICATION SCHEMAS
// ═══════════════════════════════════════════════════

export const signInSchema = z
  .object({
    email: z
      .string({ error: "Email is required" })
      .trim()
      .transform((s) => s.toLowerCase())
      .refine((s) => isEmailOrUsername(s), "Invalid email or username"),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
  })
  .strict();

export const signUpSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .trim(),
    email: z
      .string({ error: "Email is required" })
      .trim()
      .transform((s) => s.toLowerCase())
      .refine((s) => isEmailOrUsername(s), "Invalid email or username"),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z
  .object({
    email: z
      .string({ error: "Email is required" })
      .trim()
      .transform((s) => s.toLowerCase())
      .refine((s) => isEmailOrUsername(s), "Invalid email or username"),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string({ error: "Token is required" }),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z
  .object({
    token: z.string({ error: "Token is required" }),
  })
  .strict();

export const resendVerificationEmailSchema = z
  .object({
    email: z
      .string({ error: "Email is required" })
      .trim()
      .transform((s) => s.toLowerCase())
      .refine((s) => isEmailOrUsername(s), "Invalid email or username"),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .trim()
      .optional(),
    image: z.string().url("Invalid image URL").optional(),
  })
  .strict();

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
