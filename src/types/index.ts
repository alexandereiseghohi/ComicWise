// Central workspace types and utilities
export type SortOrder = "asc" | "desc";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface ComicFilters extends PaginationOptions {
  search?: string;
  status?: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
  genreId?: number;
  typeId?: number;
  authorId?: number;
  artistId?: number;
  minRating?: number;
}

export type ActionResponse<T = any> = {
  success: boolean;
  error?: string | null;
  data?: T;
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export {
  Artist,
  Author,
  Chapter,
  Comic,
  ComicWithDetails,
  Genre,
  PaginatedResponse,
  Type,
} from "./database";
// ═══════════════════════════════════════════════════
// TYPES INDEX - Centralized Type Exports
// ═══════════════════════════════════════════════════
// Single source of truth for all type imports

// ═══════════════════════════════════════════════════
// CORE & UTILITIES
// ═══════════════════════════════════════════════════

export * from "./core"; // BaseEntity, TimestampedEntity, etc.
export * from "./utility"; // Nullable, Prettify, DeepPartial, etc.

// ═══════════════════════════════════════════════════
// DATABASE (All models, relations, filters, inputs)
// ═══════════════════════════════════════════════════

export * from "./database"; // All database types (consolidated)

// ═══════════════════════════════════════════════════
// APPLICATION LAYER
// ═══════════════════════════════════════════════════

export * from "./actions"; // Server actions
export * from "./api"; // API responses
export * from "./components"; // Component props
export * from "./forms"; // Form types

// ═══════════════════════════════════════════════════
// INFRASTRUCTURE
// ═══════════════════════════════════════════════════

export * from "./cache"; // Cache types
export * from "./monitoring"; // Monitoring types
export * from "./queue"; // Queue types
export * from "./upload"; // Upload types
