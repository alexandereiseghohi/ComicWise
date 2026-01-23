import { z } from "zod";

/**
 * Profile Update Schema - For editing user profile information
 */
export const ProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

/**
 * Change Password Schema - For changing user password
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

export type ChangePassword = z.infer<typeof ChangePasswordSchema>;

/**
 * Notification Settings Schema
 */
export const NotificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  weeklyDigest: z.boolean(),
});

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

/**
 * Privacy Settings Schema
 */
export const PrivacySettingsSchema = z.object({
  profileVisibility: z.enum(["public", "private", "friends"]),
  showActivity: z.boolean(),
});

export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;

/**
 * Account Settings Schema
 */
export const AccountSettingsSchema = z.object({
  language: z.enum(["en", "es", "fr", "de"]),
  theme: z.enum(["light", "dark", "system"]),
  twoFactorEnabled: z.boolean(),
});

export type AccountSettings = z.infer<typeof AccountSettingsSchema>;
