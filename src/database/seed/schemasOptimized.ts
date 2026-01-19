/**
 * 🌱 Optimized Seed System - Zod Validation Schemas
 * ═══════════════════════════════════════════════════════════════════════════
 * Comprehensive validation for all seed data types
 * Integrates with imageService for image downloads
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// URL & Image Validation
// ═══════════════════════════════════════════════════════════════════════════

export const imageUrlSchema = z
  .object({
    url: z.string().url("Invalid image URL"),
  })
  .strict();

export const imageArraySchema = z.array(imageUrlSchema).optional().default([]);

// ═══════════════════════════════════════════════════════════════════════════
// METADATA SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const typeSchema = z
  .object({
    name: z.string().min(1, "Type name required").max(255),
  })
  .passthrough();

export const authorSchema = z
  .object({
    name: z.string().min(1, "Author name required").max(255),
  })
  .passthrough();

export const artistSchema = z
  .object({
    name: z.string().min(1, "Artist name required").max(255),
  })
  .passthrough();

export const genreSchema = z
  .object({
    name: z.string().min(1, "Genre name required").max(255),
  })
  .passthrough();

// ═══════════════════════════════════════════════════════════════════════════
// USER SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const userSeedSchema = z.object({
  id: z.string().uuid("Invalid user ID").optional(),
  name: z.string().min(1, "Name required").max(100),
  email: z.string().email("Invalid email").toLowerCase(),
  image: z.string().min(1).optional(), // Accept both URLs and local paths
  role: z.enum(["user", "admin", "moderator"]).default("user"),
  emailVerified: z.string().datetime().or(z.date()).optional(),
  createdAt: z.string().datetime().or(z.date()).optional(),
  updatedAt: z.string().datetime().or(z.date()).optional(),
});

export type UserSeedData = z.infer<typeof userSeedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// COMIC SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const comicSeedSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Title required").max(255),
    slug: z.string().min(1, "Slug required").max(512),
    description: z.string().min(1, "Description required").max(5000),
    coverImage: z.string().min(1).optional(), // Accept URLs and local paths
    images: z
      .array(
        z.object({
          url: z.string().min(1), // Accept both URLs and local paths
        })
      )
      .optional()
      .default([]),
    rating: z
      .union([z.string(), z.number()])
      .refine((value) => {
        const number_ = typeof value === "string" ? Number.parseFloat(value) : value;
        return number_ >= 0 && number_ <= 10;
      }, "Rating must be between 0 and 10")
      .optional(),
    status: z
      .enum(["Ongoing", "Hiatus", "Completed", "Dropped", "Season End", "Coming Soon"])
      .default("Ongoing"),
    serialization: z.string().optional(),
    url: z.string().optional(),
    type: typeSchema.optional(),
    author: authorSchema.optional(),
    artist: artistSchema.optional(),
    genres: z.array(genreSchema).optional().default([]),
    updatedAt: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough(); // Allow additional fields for flexible data loading

export type ComicSeedData = z.infer<typeof comicSeedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// CHAPTER SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const chapterSeedSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Chapter title required").max(255).optional(),
    name: z.string().min(1, "Chapter name required").max(255).optional(),
    chapterNumber: z.union([z.string(), z.number()]).optional(),
    releaseDate: z.string().datetime().optional(),
    url: z.string().url().optional(),
    updatedAt: z.string().optional(),
    views: z.union([z.string(), z.number()]).optional(),
    images: imageArraySchema,
    comic: z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
    }),
    createdAt: z.string().optional(),
  })
  .transform((data) => {
    // Extract chapter number from name if available
    let chapterNumber = 0;
    if (data.chapterNumber) {
      const number_ =
        typeof data.chapterNumber === "string"
          ? Number.parseFloat(data.chapterNumber)
          : data.chapterNumber;
      chapterNumber = isNaN(number_) ? 0 : number_;
    }

    if (!chapterNumber && data.name) {
      const match = data.name.match(/chapter\s+(\d+\.?\d*)/i);
      if (match) {
        chapterNumber = Number.parseFloat(match[1]!);
      }
    }

    return {
      ...data,
      chapterNumber,
      title: data.title || data.name || "Unknown Chapter",
    };
  });

export type ChapterSeedData = z.infer<typeof chapterSeedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// ARRAY SCHEMAS FOR BULK LOADING
// ═══════════════════════════════════════════════════════════════════════════

export const userArraySchema = z.array(userSeedSchema);
export const comicArraySchema = z.array(comicSeedSchema);
export const chapterArraySchema = z.array(chapterSeedSchema);

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidationResult<T> {
  data: T[];
  valid: number;
  invalid: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
}

/**
 * Validate array of items with error collection
 * @param items
 * @param schema
 */
export function validateArray<T>(items: unknown[], schema: z.ZodSchema<T>): ValidationResult<T> {
  const data: T[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  items.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      data.push(result.data);
    } else {
      errors.push({
        index,
        error: result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      });
    }
  });

  return {
    data,
    valid: data.length,
    invalid: errors.length,
    errors,
  };
}
