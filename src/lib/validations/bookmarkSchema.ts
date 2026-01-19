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
    userId: z.string({ error: "User ID is required" }).uuid(),
    comicId: z.coerce.number({ error: "Comic ID is required" }).int().positive(),
    lastReadChapterId: z.coerce.number().int().positive().optional(),
    notes: z.string().max(1000, "Notes must not exceed 1000 characters").optional(),
  })
  .strict();

export const updateBookmarkSchema = z
  .object({
    lastReadChapterId: z.coerce.number().int().positive().optional(),
    notes: z.string().max(1000).optional(),
  })
  .strict();

export const bookmarkIdSchema = z
  .object({
    userId: z.string().uuid(),
    comicId: z.coerce.number().int().positive(),
  })
  .strict();

export type InsertBookmark = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmark = z.infer<typeof updateBookmarkSchema>;
