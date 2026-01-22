/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Server Actions DTOs - Type-safe input/output definitions
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Auto-generated DTOs for server actions with Zod validation schemas
 * Use these interfaces for type-safe server action calls
 *
 * Generated: 2026-01-18
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// Common Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthActionResponse<T = unknown> extends ActionResponse<T> {
  redirectTo?: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    role: "user" | "admin" | "moderator";
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Reading Progress DTOs
// ═══════════════════════════════════════════════════════════════════════════

export interface SaveReadingProgressInput {
  comicId: number;
  chapterId: number;
  progress: number;
}

export const SaveReadingProgressSchema = z.object({
  comicId: z.number(),
  chapterId: z.number(),
  progress: z.number().min(0).max(100),
});

export interface SaveReadingProgressOutput extends ActionResult {
  data?: {
    id: number;
    userId: string;
    comicId: number;
    chapterId: number;
    progress: number;
  };
}

export interface GetReadingHistoryInput {
  limit?: number;
}

export const GetReadingHistorySchema = z.object({
  limit: z.number().optional().default(20),
});

export interface GetReadingHistoryOutput extends ActionResult {
  data?: Array<{
    id: number;
    comicId: number;
    chapterId: number;
    progress: number;
    updatedAt: Date;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Authentication DTOs
// ═══════════════════════════════════════════════════════════════════════════

export interface SignInInput {
  email: string;
  password: string;
}

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface SignInOutput extends ActionResult {
  data?: {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  };
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export const SignUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export interface SignUpOutput extends ActionResult {
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Comic DTOs
// ═══════════════════════════════════════════════════════════════════════════

export interface GetComicsInput {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  status?: string;
}

export const GetComicsSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(12),
  search: z.string().optional(),
  genre: z.string().optional(),
  status: z.string().optional(),
});

export interface CreateComicInput {
  title: string;
  description: string;
  slug: string;
  coverImage?: string;
  status: "Ongoing" | "Completed" | "Hiatus";
}

export const CreateComicSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  slug: z.string().min(1),
  coverImage: z.string().optional(),
  status: z.enum(["Ongoing", "Completed", "Hiatus"]),
});

// ═══════════════════════════════════════════════════════════════════════════
// Chapter DTOs
// ═══════════════════════════════════════════════════════════════════════════

export interface GetChaptersInput {
  comicId: number;
  page?: number;
  limit?: number;
}

export const GetChaptersSchema = z.object({
  comicId: z.number(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
});

export interface CreateChapterInput {
  comicId: number;
  title: string;
  slug: string;
  chapterNumber: number;
  images: string[];
}

export const CreateChapterSchema = z.object({
  comicId: z.number(),
  title: z.string().min(1),
  slug: z.string().min(1),
  chapterNumber: z.number().positive(),
  images: z.array(z.string()),
});

// ═══════════════════════════════════════════════════════════════════════════
// Bookmark DTOs
// ═══════════════════════════════════════════════════════════════════════════

export interface ToggleBookmarkInput {
  comicId: number;
}

export const ToggleBookmarkSchema = z.object({
  comicId: z.number(),
});

export interface ToggleBookmarkOutput extends ActionResult {
  data?: {
    bookmarked: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Comment DTOs
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateCommentInput {
  comicId: number;
  content: string;
  parentId?: number;
}

export const CreateCommentSchema = z.object({
  comicId: z.number(),
  content: z.string().min(1).max(1000),
  parentId: z.number().optional(),
});

export interface CreateCommentOutput extends ActionResult {
  data?: {
    id: number;
    content: string;
    userId: string;
    comicId: number;
    createdAt: Date;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// User DTOs
// ═══════════════════════════════════════════════════════════════════════════

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  image?: string;
}

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
});

export interface UpdateProfileOutput extends ActionResult {
  data?: {
    id: string;
    name: string | null;
    bio: string | null;
    image: string | null;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Admin DTOs
// ═══════════════════════════════════════════════════════════════════════════

export interface DeleteComicInput {
  id: number;
}

export const DeleteComicSchema = z.object({
  id: z.number(),
});

export interface DeleteComicOutput extends ActionResult {
  data?: {
    id: number;
  };
}
