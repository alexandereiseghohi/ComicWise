/**
 * ComicImage Validation Schema
 * Zod validation schemas for ComicImage entity
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════
// IMAGE SCHEMAS
// ═══════════════════════════════════════════════════

export const createComicImageSchema = z
  .object({
    comicId: z.coerce.number({ error: "Comic ID is required" }).int().positive(),
    imageUrl: z.string({ error: "Image URL is required" }).url("Invalid image URL"),
    imageOrder: z.coerce.number({ error: "Image order is required" }).int().min(0),
  })
  .strict();

export const updateComicImageSchema = createComicImageSchema.partial().extend({
  comicId: z.coerce.number().int().positive().optional(),
});

export const comicImageIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid comic image ID"),
  })
  .strict();

export type InsertComicImage = z.infer<typeof createComicImageSchema>;
export type UpdateComicImage = z.infer<typeof updateComicImageSchema>;
