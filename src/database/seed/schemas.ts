/**
 * Seed Data Validation Schemas
 * Comprehensive Zod schemas for all seed data types with validation
 * Single source of truth for seed data structure validation
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// BASE SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const imageSchema = z
  .object({
    url: z.string().url("Invalid image URL"),
  })
  .strict();

export const metadataSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// ═══════════════════════════════════════════════════════════════════════════
// USER SEED SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const userSeedSchema = z
  .object({
    id: z.string().uuid("Invalid UUID"),
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    image: z.string().url("Invalid image URL").optional(),
    role: z.enum(["user", "admin", "moderator"]).default("user"),
    emailVerified: z.coerce.date().nullable().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .strict();

export type UserSeedData = z.infer<typeof userSeedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// COMIC SEED SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const comicSeedSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    slug: z.string().min(1, "Slug is required").max(512),
    description: z.string().min(1, "Description is required").max(5000),
    url: z.string().url("Invalid URL").optional(),
    images: z.array(imageSchema).optional().default([]),
    coverImage: z.string().url("Invalid cover image URL").optional(),
    rating: z.coerce.number().min(0).max(10).optional(),
    status: z.string().default("Ongoing"),
    serialization: z.string().optional(),
    updatedAt: z.union([z.string(), z.coerce.date()]).optional(),
    type: metadataSchema.optional(),
    author: metadataSchema.optional(),
    artist: metadataSchema.optional(),
    genres: z.array(metadataSchema).optional().default([]),
  })
  .strict();

export type ComicSeedData = z.infer<typeof comicSeedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// CHAPTER SEED SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const chapterSeedSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    chapterNumber: z.coerce.number().int().positive("Chapter number must be positive"),
    url: z.string().url("Invalid URL").optional(),
    releaseDate: z.union([z.string(), z.coerce.date()]).optional(),
    updatedAt: z.union([z.string(), z.coerce.date()]).optional(),
    views: z.coerce.number().int().nonnegative().default(0),
    images: z.array(imageSchema).optional().default([]),
    comic: z
      .object({
        title: z.string().min(1, "Comic title is required"),
        slug: z.string().min(1, "Comic slug is required"),
      })
      .strict(),
  })
  .strict();

export type ChapterSeedData = z.infer<typeof chapterSeedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export type SeedSchemaType = UserSeedData | ComicSeedData | ChapterSeedData;
