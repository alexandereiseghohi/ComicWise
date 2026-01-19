/**
 * Seed Data Transfer Objects (DTOs)
 * Consolidates all validation schemas and types for database seeding operations
 * Eliminates embedded Zod schemas and centralizes validation logic
 * Reduces cognitive complexity of universalSeeder.ts
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// USER SEEDING TYPES & VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export const UserSeedSchema = z
  .object({
    id: z.string().uuid().optional(),
    email: z.string().email(),
    name: z.string(),
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

export type UserSeedDto = z.infer<typeof UserSeedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// COMIC SEEDING TYPES & VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export const ComicImageSchema = z
  .object({
    url: z.string().url(),
    path: z.string().optional(),
    checksum: z.string().optional(),
    status: z.string().optional(),
  })
  .strict();

export const ComicTypesSchema = z
  .object({
    name: z.string(),
  })
  .strict();

export const ComicAuthorSchema = ComicTypesSchema.or(z.string());

export const ComicArtistSchema = ComicTypesSchema.or(z.string());

export const ComicGenreSchema = ComicTypesSchema.or(z.string());

export const ComicSeedSchema = z
  .object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    coverImage: z.string().optional(),
    status: z.enum(["Ongoing", "Completed", "Hiatus", "Dropped", "Coming Soon"]).default("Ongoing"),
    rating: z.coerce.number().max(10.0).optional(),
    serialization: z.string().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
    url: z.string().url().optional(),
    images: z.array(ComicImageSchema).optional(),
    numchapters: z.number().optional(),
    image_urls: z.array(z.string().url()).optional(),
    type: ComicTypesSchema.optional(),
    category: z.string().optional(),
    author: ComicAuthorSchema.optional(),
    artist: ComicArtistSchema.optional(),
    genres: z.array(ComicGenreSchema).default([]),
    spider: z.string().optional(),
  })
  .strict();

export type ComicSeedDto = z.infer<typeof ComicSeedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// CHAPTER SEEDING TYPES & VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export const ChapterComicRefSchema = z
  .object({
    title: z.string(),
    slug: z.string(),
  })
  .strict();

export const ChapterSeedSchema = z
  .object({
    // Format 1: chapters.json (nested comic object)
    name: z.string().optional(),
    title: z.string().optional(),
    url: z.string().url().optional(),
    slug: z.string().optional(),
    chapterNumber: z.coerce.number().optional(),
    releaseDate: z.coerce.date().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
    views: z.number().optional(),
    comic: ChapterComicRefSchema.optional(),
    comicSlug: z.string().optional(),
    content: z.string().optional(),
    images: z.array(ComicImageSchema).optional(),

    // Format 2: chaptersdata*.json (direct properties)
    comictitle: z.string().optional(),
    comicslug: z.string().optional(),
    chaptername: z.string().optional(),
    chaptertitle: z.string().optional(),
    chapterslug: z.string().optional(),
    image_urls: z.array(z.string().url()).optional(),
    spider: z.string().optional(),
  })
  .strict();

export type ChapterSeedDto = z.infer<typeof ChapterSeedSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// PROCESSED METADATA TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ComicNormalizedData {
  title: string;
  slug: string;
  description: string;
  coverImage?: string | null;
  status: "Ongoing" | "Completed" | "Hiatus" | "Dropped" | "Coming Soon";
  rating?: number;
  [key: string]: unknown;
}

export interface ChapterMetadata {
  chapterName: string;
  chapterTitle: string;
  chapterNumber: number;
  chapterSlug: string;
  comicSlug: string;
  imageUrls: string[];
}

export interface ComicEntities {
  authorId: number;
  artistId: number;
  typeId: number;
  genreIds: number[];
}

export interface ComicPayload {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  status: "Ongoing" | "Completed" | "Hiatus" | "Dropped" | "Coming Soon";
  rating: string;
  authorId: number;
  artistId: number;
  typeId: number;
  publicationDate: Date;
}

export interface ChapterPayload {
  title: string;
  slug: string;
  chapterNumber: number;
  releaseDate: Date;
  views: number;
  comicId: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// OPERATION RESULTS & STATUS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ProcessingResult<T = unknown> {
  success: boolean;
  id?: number | T;
  created?: boolean;
  error?: string;
  message?: string;
}

export interface SeedingStatistics {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  skipped?: number;
}

export interface FileProcessingStats {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  skipped?: number;
}

export interface SeedingSummary {
  totalProcessed: number;
  totalCreated: number;
  totalUpdated: number;
  totalErrors: number;
  totalSkipped: number;
  fileResults: Record<string, FileProcessingStats>;
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE CACHE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ImageCacheStats {
  urlCacheSize: number;
  hashCacheSize: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}

export interface ImageProcessingResult {
  success: boolean;
  url: string | null;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate and parse user seed data
 * @param data - Raw user data to validate
 * @returns Validated UserSeedDto
 */
export function validateUserSeedData(data: unknown): UserSeedDto {
  return UserSeedSchema.parse(data);
}

/**
 * Validate and parse comic seed data
 * @param data - Raw comic data to validate
 * @returns Validated ComicSeedDto
 */
export function validateComicSeedData(data: unknown): ComicSeedDto {
  return ComicSeedSchema.parse(data);
}

/**
 * Validate and parse chapter seed data
 * @param data - Raw chapter data to validate
 * @returns Validated ChapterSeedDto
 */
export function validateChapterSeedData(data: unknown): ChapterSeedDto {
  return ChapterSeedSchema.parse(data);
}

/**
 * Safe validation with error handling
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Context for error messages
 * @returns Validation result with data or error
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : String(error);
    return { success: false, error: `${context}: ${message}` };
  }
}
