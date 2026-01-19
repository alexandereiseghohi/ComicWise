/**
 * ChapterImage Validation Schema
 * Zod validation schemas for ChapterImage entity
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════
// IMAGE SCHEMAS
// ═══════════════════════════════════════════════════

export const createChapterImageSchema = z
  .object({
    chapterId: z.coerce.number({ error: "Chapter ID is required" }).int().positive(),
    imageUrl: z.string({ error: "Image URL is required" }).url("Invalid image URL"),
    pageNumber: z.coerce.number({ error: "Page number is required" }).int().positive(),
  })
  .strict();

export const updateChapterImageSchema = createChapterImageSchema.partial().extend({
  chapterId: z.coerce.number().int().positive().optional(),
});

export const chapterImageIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid chapter image ID"),
  })
  .strict();

export type InsertChapterImage = z.infer<typeof createChapterImageSchema>;
export type UpdateChapterImage = z.infer<typeof updateChapterImageSchema>;
