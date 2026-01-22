import { z } from "zod";

/**
 * Comic validation schema - handles multiple data formats
 */
export const ComicSeedSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    slug: z.string().trim().min(1, "Slug is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .trim()
      .default(""),
    coverImage: z.string().trim().optional(),
    status: z
      .enum(["Ongoing", "Completed", "Hiatus", "Dropped", "Coming Soon", "Season End"])
      .default("Ongoing"),
    rating: z.coerce.number().max(10.0).default(0),
    serialization: z.string().trim().optional(),

    views: z.coerce.number().default(0),

    genres: z
      .array(z.object({ name: z.string().trim() }).optional().or(z.string().trim().optional()))
      .default([]),
    updatedAt: z.string().trim().optional(),
    updated_at: z.string().trim().optional(),
    url: z.string().trim().optional(),
    images: z
      .array(
        z
          .object({
            url: z.string().trim().min(1), // Accept both URLs and local paths
            path: z.string().trim().optional(),
            checksum: z.string().trim().optional(),
            status: z.string().trim().optional(),
          })
          .passthrough() // Allow extra fields
      )
      .optional(),
    numchapters: z.number().optional(),
    image_urls: z.array(z.string().trim()).optional(),
    type: z.object({ name: z.string().trim() }).passthrough().optional(),
    category: z.string().trim().optional(),
    author: z
      .object({ name: z.string().trim() })
      .passthrough()
      .optional()
      .or(z.string().trim())
      .optional(),
    artist: z
      .object({ name: z.string().trim() })
      .passthrough()
      .optional()
      .or(z.string().trim())
      .optional(),

    spider: z.string().trim().optional(),
  })
  .passthrough(); // Allow extra fields for flexible data loading

// ═══════════════════════════════════════════════════
// COMIC SCHEMAS
// ═══════════════════════════════════════════════════

export const createComicSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .min(1, "Title is required")
      .max(255, "Title must not exceed 255 characters")
      .trim(),
    description: z
      .string({ error: "Description is required" })
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters")
      .trim(),
    coverImage: z.string({ error: "Cover image is required" }).url("Invalid cover image URL"),
    status: z
      .enum(["Ongoing", "Hiatus", "Completed", "Dropped", "Coming Soon", "Season End"])
      .default("Ongoing"),
    publicationDate: z.coerce.date(),
    rating: z.coerce
      .number()
      .min(0, "Rating must be at least 0")
      .max(10, "Rating must not exceed 10")
      .optional(),
    views: z.coerce.number().int().min(0).default(0),
    authorId: z.coerce.number().int().positive().optional(),
    artistId: z.coerce.number().int().positive().optional(),
    typeId: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const updateComicSchema = createComicSchema.partial();

export const comicIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid comic ID"),
  })
  .strict();

export const comicSlugSchema = z
  .object({
    slug: z.string().trim().min(1, "Slug is required"),
  })
  .strict();

export const comicFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(512, "Title must not exceed 512 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(512, "Slug must not exceed 512 characters")
      .regex(/^[\da-z]+(?:-[\da-z]+)*$/, "Slug must be lowercase with hyphens only")
      .optional(),
    coverImage: z.string().trim().url("Cover image must be a valid URL"),
    status: z.enum(["Ongoing", "Hiatus", "Completed", "Dropped", "Coming Soon", "Season End"]),
    publicationDate: z.instanceof(Date).or(z.string().trim().pipe(z.coerce.date())),
    authorId: z.string().trim().optional(),
    artistId: z.string().trim().optional(),
    typeId: z.string().trim().optional(),
    genreIds: z.array(z.string().trim()).optional().default([]),
  })
  .strict();
export type CreateComicInput = z.infer<typeof createComicSchema>;
export type UpdateComicInput = z.infer<typeof updateComicSchema>;
export type ComicIdInput = z.infer<typeof comicIdSchema>;
export type ComicSlugInput = z.infer<typeof comicSlugSchema>;
export type ComicFormData = z.infer<typeof comicFormSchema>;
export type ComicSeedData = z.infer<typeof ComicSeedSchema>;
