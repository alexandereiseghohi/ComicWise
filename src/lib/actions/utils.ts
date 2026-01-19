// ═══════════════════════════════════════════════════
// ACTION UTILITIES (Next.js 16 Optimized)
// ═══════════════════════════════════════════════════

import type { ActionError, ActionSuccess } from "@/dto";

/**
 * Create a successful action response
 * @param data
 * @param message
 */
export function success<T>(data: T, message?: string): ActionSuccess<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create an error action response
 * @param errorMessage
 */
export function error(errorMessage: string): ActionError {
  return {
    success: false,
    error: errorMessage,
  };
}

/**
 * Create a validation error response
 * @param message
 */
export function validationError(message: string): ActionError {
  return {
    success: false,
    error: message,
  };
}
