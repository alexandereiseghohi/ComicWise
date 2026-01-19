/**
 * Comment Validation Schema
 * Zod validation schemas for Comment entity
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════
// COMMENT SCHEMAS
// ═══════════════════════════════════════════════════

export const createCommentSchema = z
  .object({
    content: z
      .string({ error: "Content is required" })
      .min(1, "Content is required")
      .max(2000, "Content must not exceed 2000 characters")
      .trim(),
    userId: z.string({ error: "User ID is required" }).uuid(),
    chapterId: z.coerce.number({ error: "Chapter ID is required" }).int().positive(),
  })
  .strict();

export const updateCommentSchema = z
  .object({
    content: z
      .string({ error: "Content is required" })
      .min(1, "Content is required")
      .max(2000, "Content must not exceed 2000 characters")
      .trim(),
  })
  .strict();

export const commentIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid comment ID"),
  })
  .strict();

export type InsertComment = z.infer<typeof createCommentSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
