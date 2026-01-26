/**
 * User Profile Validation Schemas
 * Zod schemas for user profile operations: edit, password change, etc.
 */

import { z } from "zod";

/**
 * User profile update schema - for edit profile page
 */
export const userProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().nullable(),
  image: z.string().url("Must be a valid URL").optional().nullable(),
});

export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;

/**
 * Password change schema - for change password page
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * User settings schema - for user preferences
 */
export const userSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["en", "es", "fr", "de"]).default("en"),
  privacy: z.enum(["public", "friends", "private"]).default("private"),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

/**
 * User password schema - standalone password validation
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number");

/**
 * User ID schema - for user identification
 */
export const userIdSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

export type UserId = z.infer<typeof userIdSchema>;

/**
 * Combined profile schema with validation
 */
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  bio: z.string().max(500).nullable().optional(),
  image: z.string().url().nullable().optional(),
  emailVerified: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
