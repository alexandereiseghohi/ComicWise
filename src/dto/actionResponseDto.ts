/**
 * Action Response DTOs
 * Standardized response types for all server actions
 * Ensures type safety and consistency across the application
 *
 * @performance
 * - Minimal type overhead
 * - Generic type support for flexible data payloads
 * - No serialization issues (plain objects only)
 */

/**
 * Generic success response
 * @template T - The data type returned on success
 */
export interface ActionSuccess<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * Generic error response
 */
export interface ActionError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Union type for all action results
 * @template T - The data type for successful responses
 */
export type ActionResult<T = unknown> = ActionSuccess<T> | ActionError;

/**
 * Simple response without data payload
 */
export type SimpleActionResult = ActionSuccess<void> | ActionError;

/**
 * ID response - Common pattern for create operations
 */
export interface IdResponse {
  id: string | number;
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  hasMore?: boolean;
}

/**
 * Paginated list response
 */
export interface PaginatedResult<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

/**
 * Paginated result or error
 */
export type PaginatedActionResult<T = unknown> = PaginatedResult<T> | ActionError;

/**
 * Auth-specific response
 */
export interface AuthActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Create operation response (returns created entity ID)
 */
export type CreateActionResult<T = IdResponse> = ActionResult<T>;

/**
 * Update operation response (no data required, just confirmation)
 */
export type UpdateActionResult = SimpleActionResult;

/**
 * Delete operation response (no data required, just confirmation)
 */
export type DeleteActionResult = SimpleActionResult;

/**
 * Fetch/Read operation response
 */
export type ReadActionResult<T> = ActionResult<T>;

/**
 * Bulk operation response
 */
export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    index: number;
    error: string;
    item?: unknown;
  }>;
}

/**
 * Batch result for multiple items
 * @template T - Individual item type
 */
export interface BatchResult<T> {
  success: true;
  items: T[];
  skipped?: Array<{
    item: unknown;
    reason: string;
  }>;
  message?: string;
}

/**
 * Upload/File response
 */
export interface UploadActionResult {
  success: boolean;
  url?: string;
  fileName?: string;
  size?: number;
  error?: string;
}

/**
 * Validation result with detailed error information
 */
export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

/**
 * Combined validation and action result
 */
export type ValidatedActionResult<T = unknown> = ActionResult<T> & ValidationResult;

/**
 * Response for operations with side effects
 */
export interface SideEffectResult {
  success: boolean;
  affected: number;
  message?: string;
  error?: string;
}

/**
 * Rate limit response
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetAt?: number;
  message?: string;
}

/**
 * Cache operation response
 */
export interface CacheActionResult {
  success: boolean;
  cached: boolean;
  ttl?: number;
  error?: string;
}

/**
 * Search results response
 */
export interface SearchResult<T> {
  success: true;
  results: T[];
  total: number;
  query: string;
  executionTime?: number;
}

/**
 * Search result or error
 */
export type SearchActionResult<T = unknown> = SearchResult<T> | ActionError;

/**
 * Health check response
 */
export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: Record<string, { status: string; latency?: number }>;
  message?: string;
}

/**
 * Common API response wrapper
 * Used when action response types don't match standard patterns
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  timestamp?: string;
}
