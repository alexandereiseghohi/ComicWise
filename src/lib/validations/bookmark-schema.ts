/**
 * Type Validation Schema
 * Zod validation schemas for Type entity
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════
// BOOKMARK SCHEMAS
// ═══════════════════════════════════════════════════

export const createBookmarkSchema = z
  .object({
    userId: z.string().uuid().optional(),
    comicId: z.union([
      z.coerce.number({ error: "Comic ID is required" }).int().positive(),
      z.string().min(1),
    ]),
    lastReadChapterId: z
      .union([z.coerce.number().int().positive(), z.literal("current"), z.string().min(1)])
      .optional(),
    notes: z.string().max(1000, "Notes must not exceed 1000 characters").optional(),
  })
  .strict();

export const updateBookmarkSchema = z
  .object({
    lastReadChapterId: z
      .union([z.coerce.number().int().positive(), z.literal("current"), z.string().min(1)])
      .optional(),
    currentChapterId: z
      .union([z.coerce.number().int().positive(), z.literal("current"), z.string().min(1)])
      .optional(),
    notes: z.string().max(1000).optional(),
  })
  .strict();

export const bookmarkIdSchema = z
  .object({
    userId: z.string().uuid(),
    comicId: z.union([z.coerce.number().int().positive(), z.string().min(1)]),
  })
  .strict();

export type InsertBookmark = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmark = z.infer<typeof updateBookmarkSchema>;
