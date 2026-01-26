// Central database types for ComicWise
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: "user" | "admin" | "moderator";
  emailVerified?: Date | null;
}

export interface Author {
  id: number;
  name: string;
  bio?: string | null;
  image?: string | null;
}

export interface Artist {
  id: number;
  name: string;
  bio?: string | null;
  image?: string | null;
}

export interface Genre {
  id: number;
  name: string;
  description?: string | null;
}

export interface Type {
  id: number;
  name: string;
  description?: string | null;
}

export interface Comic {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  status: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
  publicationDate?: Date | null;
  rating?: number | null;
  views: number;
  authorId?: number | null;
  artistId?: number | null;
  typeId?: number | null;
  genres?: string[];
}

export interface Chapter {
  id: number;
  title: string;
  chapterNumber: number;
  releaseDate?: Date | null;
  comicId: number | string;
  views?: number;
  content?: string | null;
}

export interface Bookmark {
  userId: string;
  comicId: number;
  lastReadChapterId?: number | string | "current";
  currentChapterId?: number | string | "current";
  notes?: string;
}

export interface Comment {
  id: number;
  content: string;
  userId?: string;
  chapterId?: number | string;
  comicId?: string;
}

export interface ComicWithDetails extends Comic {
  author?: Author;
  artist?: Artist;
  genresList?: Genre[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type DatabaseId = number | string;

export type DB = unknown;
// ═══════════════════════════════════════════════════
// DATABASE TYPES - Single Source of Truth
// ═══════════════════════════════════════════════════
// All database types, relations, and filters in one place

import type * as schema from "@/database/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// ═══════════════════════════════════════════════════
// BASE MODELS (Select & Insert)
// ═══════════════════════════════════════════════════

// User & Auth
export type User = InferSelectModel<typeof schema.user>;
export type InsertUser = InferInsertModel<typeof schema.user>;
export type Account = InferSelectModel<typeof schema.account>;
export type InsertAccount = InferInsertModel<typeof schema.account>;
export type Session = InferSelectModel<typeof schema.session>;
export type InsertSession = InferInsertModel<typeof schema.session>;
export type VerificationToken = InferSelectModel<typeof schema.verificationToken>;
export type InsertVerificationToken = InferInsertModel<typeof schema.verificationToken>;
export type Authenticator = InferSelectModel<typeof schema.authenticator>;
export type InsertAuthenticator = InferInsertModel<typeof schema.authenticator>;
export type PasswordResetToken = InferSelectModel<typeof schema.passwordResetToken>;
export type InsertPasswordResetToken = InferInsertModel<typeof schema.passwordResetToken>;

// Content Metadata
export type Author = InferSelectModel<typeof schema.author>;
export type InsertAuthor = InferInsertModel<typeof schema.author>;
export type Artist = InferSelectModel<typeof schema.artist>;
export type InsertArtist = InferInsertModel<typeof schema.artist>;
export type Genre = InferSelectModel<typeof schema.genre>;
export type InsertGenre = InferInsertModel<typeof schema.genre>;
export type Type = InferSelectModel<typeof schema.type>;
export type InsertType = InferInsertModel<typeof schema.type>;

// Core Content
export type Comic = InferSelectModel<typeof schema.comic>;
export type InsertComic = InferInsertModel<typeof schema.comic>;
export type Chapter = InferSelectModel<typeof schema.chapter>;
export type InsertChapter = InferInsertModel<typeof schema.chapter>;
export type ComicImage = InferSelectModel<typeof schema.comicImage>;
export type InsertComicImage = InferInsertModel<typeof schema.comicImage>;
export type ChapterImage = InferSelectModel<typeof schema.chapterImage>;
export type InsertChapterImage = InferInsertModel<typeof schema.chapterImage>;
export type ComicToGenre = InferSelectModel<typeof schema.comicToGenre>;
export type InsertComicToGenre = InferInsertModel<typeof schema.comicToGenre>;

// User Interactions
export type Bookmark = InferSelectModel<typeof schema.bookmark>;
export type InsertBookmark = InferInsertModel<typeof schema.bookmark>;
export type Comment = InferSelectModel<typeof schema.comment>;
export type InsertComment = InferInsertModel<typeof schema.comment>;
export type ReadingProgress = InferSelectModel<typeof schema.readingProgress>;
export type InsertReadingProgress = InferInsertModel<typeof schema.readingProgress>;

// ═══════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════

export type UserRole = (typeof schema.userRole.enumValues)[number];
export type ComicStatus = (typeof schema.comicStatus.enumValues)[number];

// ═══════════════════════════════════════════════════
// RELATIONS (With Relations Pattern)
// ═══════════════════════════════════════════════════

export type ComicWithRelations = Comic & {
  author?: Author | null;
  authorName?: string | null;
  artist?: Artist | null;
  artistName?: string | null;
  type?: Type | null;
  typeName?: string | null;
  genres?: Genre[];
  chapters?: Chapter[];
  images?: ComicImage[];
};

export type ChapterWithRelations = Chapter & {
  comic?: Comic;
  images?: ChapterImage[];
};

export type UserWithRelations = User & {
  bookmarks?: Bookmark[];
  comments?: Comment[];
  readingProgress?: ReadingProgress[];
};

export type BookmarkWithRelations = Bookmark & {
  user?: User;
  comic?: Comic;
  lastReadChapter?: Chapter | null;
};

export type CommentWithRelations = Comment & {
  user?: User;
  chapter?: Chapter;
};

export type ReadingProgressWithRelations = ReadingProgress & {
  user?: User;
  comic?: Comic;
  chapter?: Chapter;
};

// ═══════════════════════════════════════════════════
// SPECIALIZED VIEWS (Use ComicWithRelations as base)
// ═══════════════════════════════════════════════════

// ComicWithDetails is an alias for ComicWithRelations
export type ComicWithDetails = ComicWithRelations;

// Partial views for specific use cases
export type ComicWithChapters = Pick<ComicWithRelations, keyof Comic | "chapters">;
export type ComicSearchResult = Pick<
  ComicWithRelations,
  keyof Comic | "author" | "artist" | "type" | "genres"
>;
export type ChapterWithComments = Chapter & { comments?: Comment[] };
export type UserWithStats = User & {
  bookmarkCount?: number;
  commentCount?: number;
  readingProgressCount?: number;
};

// ═══════════════════════════════════════════════════
// FILTERS & QUERIES
// ═══════════════════════════════════════════════════

export interface ComicFilters {
  status?: ComicStatus;
  authorId?: number;
  artistId?: number;
  typeId?: number;
  genreIds?: number[];
  minRating?: number;
  maxRating?: number;
  search?: string;
  published?: boolean;
  sortBy?: "latest" | "rating" | "title" | "views";
  page?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════
// FORM INPUT TYPES (Using Omit pattern)
// ═══════════════════════════════════════════════════

export type CreateComicInput = Omit<
  InsertComic,
  "id" | "createdAt" | "updatedAt" | "views" | "rating"
>;
export type UpdateComicInput = Partial<CreateComicInput> & { id: number };

export type CreateChapterInput = Omit<InsertChapter, "id" | "createdAt" | "views">;
export type UpdateChapterInput = Partial<CreateChapterInput> & { id: number };

export type CreateUserInput = Omit<InsertUser, "id" | "createdAt" | "updatedAt" | "emailVerified">;
export type UpdateUserInput = Partial<CreateUserInput> & { id: string };

export type CreateAuthorInput = Omit<InsertAuthor, "id" | "createdAt" | "search_vector">;
export type UpdateAuthorInput = Partial<CreateAuthorInput> & { id: number };

export type CreateArtistInput = Omit<InsertArtist, "id" | "createdAt" | "search_vector">;
export type UpdateArtistInput = Partial<CreateArtistInput> & { id: number };

export type CreateGenreInput = Omit<InsertGenre, "id" | "createdAt">;
export type UpdateGenreInput = Partial<CreateGenreInput> & { id: number };

export type CreateTypeInput = Omit<InsertType, "id" | "createdAt">;
export type UpdateTypeInput = Partial<CreateTypeInput> & { id: number };

export type CreateCommentInput = Omit<InsertComment, "id" | "createdAt" | "updatedAt">;
export type UpdateCommentInput = Partial<Omit<CreateCommentInput, "userId" | "chapterId">> & {
  id: number;
};

export type CreateBookmarkInput = Omit<InsertBookmark, "createdAt" | "updatedAt">;
export type UpdateBookmarkInput = Partial<Omit<CreateBookmarkInput, "userId" | "comicId">>;

export type CreateReadingProgressInput = Omit<
  InsertReadingProgress,
  "id" | "createdAt" | "updatedAt" | "lastReadAt"
>;
export type UpdateReadingProgressInput = Partial<
  Omit<CreateReadingProgressInput, "userId" | "comicId">
> & { id: number };
