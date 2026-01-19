// ═══════════════════════════════════════════════════
// FORM TYPES - Form Input & Validation Types
// ═══════════════════════════════════════════════════

import type { z } from "zod";

// ═══════════════════════════════════════════════════
// AUTHENTICATION FORMS
// ═══════════════════════════════════════════════════

export interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailFormData {
  token: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ═══════════════════════════════════════════════════
// COMIC FORMS
// ═══════════════════════════════════════════════════

export interface ComicFormData {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  status: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
  publicationDate: Date | string;
  authorId: number | null;
  artistId: number | null;
  typeId: number | null;
  genreIds?: number[];
}

export interface ChapterFormData {
  title: string;
  slug: string;
  chapterNumber: number;
  releaseDate: Date | string;
  comicId: number;
  images?: ChapterImageFormData[];
}

export interface ChapterImageFormData {
  imageUrl: string;
  pageNumber: number;
}

export interface ComicImageFormData {
  imageUrl: string;
  imageOrder: number;
}

// ═══════════════════════════════════════════════════
// METADATA FORMS
// ═══════════════════════════════════════════════════

export interface AuthorFormData {
  name: string;
  bio?: string;
  image?: string;
}

export interface ArtistFormData {
  name: string;
  bio?: string;
  image?: string;
}

export interface GenreFormData {
  name: string;
  description?: string;
}

export interface TypeFormData {
  name: string;
  description?: string;
}

// ═══════════════════════════════════════════════════
// USER INTERACTION FORMS
// ═══════════════════════════════════════════════════

export interface CommentFormData {
  content: string;
  chapterId: number;
}

export interface BookmarkFormData {
  comicId: number;
  lastReadChapterId?: number | null;
  notes?: string;
}

export interface ReadingProgressFormData {
  comicId: number;
  chapterId: number;
  pageNumber: number;
  scrollPosition: number;
  totalPages: number;
  progressPercent: number;
  completedAt?: Date | string | null;
}

// ═══════════════════════════════════════════════════
// USER MANAGEMENT FORMS
// ═══════════════════════════════════════════════════

export interface UserProfileFormData {
  name?: string;
  email?: string;
  image?: string;
}

export interface UserManagementFormData {
  name?: string;
  email?: string;
  role?: "user" | "admin" | "moderator";
  password?: string;
}

// ═══════════════════════════════════════════════════
// SEARCH & FILTER FORMS
// ═══════════════════════════════════════════════════

export interface ComicSearchFormData {
  query?: string;
  status?: string[];
  genreIds?: number[];
  authorIds?: number[];
  artistIds?: number[];
  typeIds?: number[];
  sortBy?: "title" | "rating" | "views" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface ComicFilterFormData {
  status?: string;
  genreId?: number;
  authorId?: number;
  artistId?: number;
  typeId?: number;
}

// ═══════════════════════════════════════════════════
// UPLOAD FORMS
// ═══════════════════════════════════════════════════

export interface ImageUploadFormData {
  file: File;
  folder?: string;
  public_id?: string;
}

export interface BulkUploadFormData {
  files: File[];
  folder?: string;
  provider?: "cloudinary" | "imagekit" | "aws" | "local";
}

// ═══════════════════════════════════════════════════
// ZOD SCHEMA INFERENCE HELPER
// ═══════════════════════════════════════════════════

export type InferZodSchema<T extends z.ZodTypeAny> = z.infer<T>;

// ═══════════════════════════════════════════════════
// FORM STATE TYPES
// ═══════════════════════════════════════════════════

export interface FormState<T = unknown> {
  data?: T;
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export type FormAction<TInput, TOutput = void> = (
  previousState: FormState<TOutput>,
  formData: FormData | TInput
) => Promise<FormState<TOutput>>;
