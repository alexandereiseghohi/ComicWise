// Minimal types index — single authoritative source for small shared types
export type SortOrder = "asc" | "desc";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string | null;
  data?: T;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export type ComicFilters = import("./database").ComicFilters;

// Re-export consolidated database types (authoritative)
export * from "./database";
