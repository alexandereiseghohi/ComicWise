/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TypeScript Type Definitions - Missing Action Response Types
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Standard action response structure
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Authentication-specific action response
 */
export interface AuthActionResponse<T = unknown> extends ActionResponse<T> {
  redirectTo?: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    role: "user" | "admin" | "moderator";
  };
}

/**
 * Paginated action response
 */
export interface PaginatedActionResponse<T> extends ActionResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Form validation error structure
 */
export interface FormValidationError {
  field: string;
  message: string;
}

/**
 * Action response with validation errors
 */
export interface ValidationActionResponse<T = unknown> extends ActionResponse<T> {
  validationErrors?: FormValidationError[];
}
