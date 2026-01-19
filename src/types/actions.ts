// ═══════════════════════════════════════════════════
// ACTION TYPES - Server Actions & Response Types
// ═══════════════════════════════════════════════════

import type { z } from "zod";

// ═══════════════════════════════════════════════════
// BASE ACTION RESPONSE
// ═══════════════════════════════════════════════════

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  statusCode?: number;
}

export type ActionResult<T = unknown> = Promise<ActionResponse<T>>;

// ═══════════════════════════════════════════════════
// PAGINATED RESPONSE
// ═══════════════════════════════════════════════════

// export interface PaginatedResponse<T = unknown> {
//   data: T[];
//   pagination: {
//     page: number;
//     pageSize: number;
//     totalItems: number;
//     totalPages: number;
//     hasNextPage: boolean;
//     hasPrevPage: boolean;
//   };
// }

// export type PaginatedActionResult<T = unknown> = ActionResult<PaginatedResponse<T>>;

// ═══════════════════════════════════════════════════
// SEARCH RESPONSE
// ═══════════════════════════════════════════════════

export interface SearchResponse<T = unknown> {
  results: T[];
  totalResults: number;
  query: string;
  filters?: Record<string, unknown>;
}

export type SearchActionResult<T = unknown> = ActionResult<SearchResponse<T>>;

// ═══════════════════════════════════════════════════
// VALIDATION TYPES
// ═══════════════════════════════════════════════════

export type ValidationErrors = Record<string, string[]>;

export interface ValidatedInput<T> {
  data: T;
  errors?: ValidationErrors;
  isValid: boolean;
}

export type ValidationResult<T> = ValidatedInput<T>;

// ═══════════════════════════════════════════════════
// CRUD ACTION TYPES
// ═══════════════════════════════════════════════════

export type CreateAction<TInput, TOutput> = (input: TInput) => ActionResult<TOutput>;
export type ReadAction<TOutput> = (id: string | number) => ActionResult<TOutput>;
export type UpdateAction<TInput, TOutput> = (
  id: string | number,
  input: TInput
) => ActionResult<TOutput>;
export type DeleteAction = (id: string | number) => ActionResult<void>;
export type ListAction<TOutput, TFilters = unknown> = (
  filters?: TFilters
) => ActionResult<TOutput[]>;

// ═══════════════════════════════════════════════════
// AUTH ACTION TYPES
// ═══════════════════════════════════════════════════

export interface AuthActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
}

export type AuthActionResult = Promise<AuthActionResponse>;

// ═══════════════════════════════════════════════════
// FILE UPLOAD ACTION TYPES
// ═══════════════════════════════════════════════════

export interface UploadActionResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export type UploadActionResult = Promise<UploadActionResponse>;

export interface BulkUploadActionResponse {
  success: boolean;
  urls?: string[];
  failed?: string[];
  error?: string;
}

export type BulkUploadActionResult = Promise<BulkUploadActionResponse>;

// ═══════════════════════════════════════════════════
// WORKFLOW ACTION TYPES
// ═══════════════════════════════════════════════════

export interface WorkflowStepResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  stepName: string;
}

export interface WorkflowResult<T = unknown> {
  success: boolean;
  results: WorkflowStepResult[];
  finalData?: T;
  error?: string;
}

export type WorkflowActionResult<T = unknown> = Promise<WorkflowResult<T>>;

// ═══════════════════════════════════════════════════
// CACHE ACTION TYPES
// ═══════════════════════════════════════════════════

export interface CacheActionResponse {
  success: boolean;
  data?: unknown;
  cached?: boolean;
  error?: string;
}

export type CacheActionResult = Promise<CacheActionResponse>;

// ═══════════════════════════════════════════════════
// RATE LIMIT TYPES
// ═══════════════════════════════════════════════════

export interface RateLimitResult {
  success: boolean;
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export type RateLimitCheck = (identifier: string) => Promise<RateLimitResult>;

// ═══════════════════════════════════════════════════
// HELPER TYPE FOR ZOD VALIDATED ACTIONS
// ═══════════════════════════════════════════════════

export type ZodValidatedAction<TSchema extends z.ZodTypeAny, TOutput> = (
  input: z.infer<TSchema>
) => ActionResult<TOutput>;
