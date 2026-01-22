/**
 * User Validation Schema
 * Zod validation schemas for user entity
 */

import { z } from "zod";

/**
 * User validation schema - flexible to handle multiple formats
 */
export const UserSeedSchema = z
  .object({
    id: z.string().uuid().optional(),
    email: z.string().email("Invalid email format"),
    name: z.string().min(1, "Name is required"),
    password: z.string().optional(),
    role: z.enum(["user", "admin", "moderator"]).default("user"),
    image: z.string().nullable().optional(),
    emailVerified: z.coerce.date().nullable().optional(),
    status: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    lastActivityDate: z.coerce.date().nullable().optional(),
  })
  .strict();

export type UserSeedData = z.infer<typeof UserSeedSchema>;

export const insertUserSchema = z
  .object({
    name: z.string().optional().nullable(),
    email: z.string().email("Must be a valid email address"),
    emailVerified: z.coerce.date().optional().nullable(),
    image: z.string().url("Must be a valid URL").optional().nullable(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    role: z.enum(["user", "admin", "moderator"]).default("user"),
  })
  .strict();

export const userIdSchema = z
  .object({
    id: z.string().uuid("Invalid user ID"),
  })
  .strict();

export const updateUserSchema = insertUserSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
