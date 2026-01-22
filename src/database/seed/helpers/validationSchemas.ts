/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Validation Schemas - Zod Schemas for Seed Data Validation
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { z } from "zod";

export const UserSeedSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().optional(),
  role: z.enum(["user", "admin", "moderator"]).default("user"),
  image: z.string().nullable().optional(),
  emailVerified: z.coerce.date().nullable().optional(),
  status: z.boolean().optional().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  lastActivityDate: z.coerce.date().nullable().optional(),
});

export const ComicSeedSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  url: z.string().url().optional(),
  rating: z.coerce.number().min(0).max(10).default(0),
  status: z
    .enum(["Ongoing", "Completed", "Hiatus", "Dropped", "Season End", "Coming Soon"])
    .default("Ongoing"),
  serialization: z.string().optional(),
  updatedAt: z.string().optional(),
  category: z.string().optional(), // Alternative to type
  type: z
    .object({
      name: z.string(),
    })
    .optional(),
  artist: z
    .object({
      name: z.string(),
    })
    .optional(),
  author: z
    .object({
      name: z.string(),
    })
    .optional(),
  genres: z
    .array(
      z.object({
        name: z.string(),
      })
    )
    .optional()
    .default([]),
  images: z
    .array(
      z.object({
        url: z.string().url(),
      })
    )
    .optional()
    .default([]),
  image_urls: z.array(z.string()).optional(),
});

export const ChapterSeedSchema = z.object({
  url: z.string().url().optional(),
  name: z.string().optional(),
  title: z.string().min(1).optional().default("Untitled Chapter"),
  slug: z.string().optional(),
  chapterslug: z.string().optional(),
  comicslug: z.string().optional(),
  comic: z
    .object({
      title: z.string(),
      slug: z.string(),
    })
    .optional(),
  updatedAt: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
      })
    )
    .optional()
    .default([]),
  image_urls: z.array(z.string()).optional(),
});

export type UserSeedData = z.infer<typeof UserSeedSchema>;
export type ComicSeedData = z.infer<typeof ComicSeedSchema>;
export type ChapterSeedData = z.infer<typeof ChapterSeedSchema>;

// Re-export for convenience
export type {
    ChapterSeedData as ChapterSeed,
    ComicSeedData as ComicSeed,
    UserSeedData as UserSeed
};

