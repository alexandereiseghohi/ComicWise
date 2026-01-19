/**
 * Database Type Definitions
 * TypeScript interfaces for database queries with proper typing
 */

import type {
  artist,
  author,
  chapter,
  chapterImage,
  comic,
  comicImage,
  comicToGenre,
  genre,
  type as typeTable,
  user,
} from "@/database/schema";
import type { InferSelectModel } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// BASE MODEL TYPES (Direct from Drizzle)
// ═══════════════════════════════════════════════════════════════════════════

export type ComicModel = InferSelectModel<typeof comic>;
export type ChapterModel = InferSelectModel<typeof chapter>;
export type GenreModel = InferSelectModel<typeof genre>;
export type AuthorModel = InferSelectModel<typeof author>;
export type ArtistModel = InferSelectModel<typeof artist>;
export type TypeModel = InferSelectModel<typeof typeTable>;
export type UserModel = InferSelectModel<typeof user>;
export type ComicImageModel = InferSelectModel<typeof comicImage>;
export type ChapterImageModel = InferSelectModel<typeof chapterImage>;
export type ComicToGenreModel = InferSelectModel<typeof comicToGenre>;

// ═══════════════════════════════════════════════════════════════════════════
// RELATION TYPES (With Related Records)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Comic with all related data
 * Includes: chapters, genres, author, artist, images
 */
export interface ComicWithRelations extends ComicModel {
  chapters?: ChapterModel[];
  genres?: GenreModel[];
  author?: AuthorModel | null;
  artist?: ArtistModel | null;
  type?: TypeModel | null;
  images?: ComicImageModel[];
}

/**
 * Comic with chapters only
 */
export interface ComicWithChapters extends ComicModel {
  chapters: ChapterModel[];
}

/**
 * Chapter with comic and images
 */
export interface ChapterWithRelations extends ChapterModel {
  comic: ComicModel;
  images?: ChapterImageModel[];
}

/**
 * Chapter with comic reference only
 */
export interface ChapterWithComic extends ChapterModel {
  comic: ComicModel;
}

/**
 * Comic for search results
 * Lightweight version for search/list queries
 */
export interface ComicSearchResult {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  status: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
  rating: string | null;
  views: number;
  author?: { id: number; name: string } | null;
  artist?: { id: number; name: string } | null;
  type?: { id: number; name: string } | null;
  genres?: { id: number; name: string }[];
}

/**
 * User with reading statistics
 */
export interface UserWithStats extends UserModel {
  stats?: {
    totalComicsRead: number;
    totalChaptersRead: number;
    bookmarkedCount: number;
    ratingsCount: number;
  };
}

/**
 * Genre with comic count
 */
export interface GenreWithCount extends GenreModel {
  comicCount?: number;
}

/**
 * Author with comic count
 */
export interface AuthorWithCount extends AuthorModel {
  comicCount?: number;
}

/**
 * Artist with comic count
 */
export interface ArtistWithCount extends ArtistModel {
  comicCount?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION & LIST TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    cursor?: string;
    hasMore: boolean;
  };
}

/**
 * List query options
 */
export interface ListOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE/UPDATE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Comic creation payload
 */
export interface CreateComicPayload {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  status?: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
  publicationDate: Date;
  rating?: string;
  authorId?: number | null;
  artistId?: number | null;
  typeId?: number | null;
  genres?: number[];
}

/**
 * Comic update payload
 */
export interface UpdateComicPayload extends Partial<CreateComicPayload> {
  id: number;
}

/**
 * Chapter creation payload
 */
export interface CreateChapterPayload {
  title: string;
  slug: string;
  chapterNumber: number;
  releaseDate: Date;
  comicId: number;
  images?: { imageUrl: string; pageNumber: number }[];
}

/**
 * Chapter update payload
 */
export interface UpdateChapterPayload extends Partial<CreateChapterPayload> {
  id: number;
}

/**
 * Author creation payload
 */
export interface CreateAuthorPayload {
  name: string;
  bio?: string;
  image?: string;
}

/**
 * Artist creation payload
 */
export interface CreateArtistPayload {
  name: string;
  bio?: string;
  image?: string;
}

/**
 * Genre creation payload
 */
export interface CreateGenrePayload {
  name: string;
  description?: string;
}

/**
 * Type creation payload
 */
export interface CreateTypePayload {
  name: string;
  description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Comic filter options
 */
export interface ComicFilters {
  status?: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
  authorId?: number;
  artistId?: number;
  typeId?: number;
  genreIds?: number[];
  minRating?: number;
  maxRating?: number;
  search?: string;
  published?: boolean;
}

/**
 * Chapter filter options
 */
export interface ChapterFilters {
  comicId?: number;
  search?: string;
  minChapterNumber?: number;
  maxChapterNumber?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Standard API response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type {
  ArtistModel,
  AuthorModel,
  ChapterImageModel,
  ChapterModel,
  ComicImageModel,
  ComicModel,
  ComicToGenreModel,
  GenreModel,
  TypeModel,
  UserModel,
};
