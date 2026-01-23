/**
 * Rate Limiting Utilities
 * Provides rate limiting functionality for server actions
 */

import type { ActionResult } from "@/dto";

export interface RateLimitConfig {
  enabled?: boolean;
  limit?: number;
  maxAttempts?: number;
  windowMs?: number;
  window?: string;
}

export interface RateLimitResult {
  success: boolean;
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export const rateLimitConfigs = {
  auth: {
    signin: { enabled: true, limit: 10, windowMs: 15 * 60 * 1000 },
    signup: { enabled: true, limit: 5, windowMs: 60 * 60 * 1000 },
    forgotPassword: { enabled: true, limit: 3, windowMs: 60 * 60 * 1000 },
    resetPassword: { enabled: true, limit: 5, windowMs: 15 * 60 * 1000 },
  },
  email: { enabled: true, limit: 3, windowMs: 60 * 60 * 1000 },
  api: {
    comics: { enabled: true, limit: 100, windowMs: 60 * 1000 },
    chapters: { enabled: true, limit: 100, windowMs: 60 * 1000 },
    search: { enabled: true, limit: 50, windowMs: 60 * 1000 },
  },
  user: {
    comment: { enabled: true, limit: 30, windowMs: 60 * 1000 },
    bookmark: { enabled: true, limit: 60, windowMs: 60 * 1000 },
    like: { enabled: true, limit: 60, windowMs: 60 * 1000 },
    upload: { enabled: true, limit: 10, windowMs: 60 * 60 * 1000 },
    profileUpdate: { enabled: true, limit: 10, windowMs: 60 * 60 * 1000 },
  },
  creator: {
    uploadComic: { enabled: true, limit: 5, windowMs: 60 * 60 * 1000 },
    uploadChapter: { enabled: true, limit: 10, windowMs: 60 * 60 * 1000 },
  },
  default: { enabled: true, limit: 30, windowMs: 60 * 1000 },
} as const;

/**
 * Check if rate limit has been exceeded
 * @param key
 * @param options
 * @param options.limit
 * @param options.window
 */
export async function checkRateLimit(
  key: string,
  options?: { limit?: number; window?: string }
): Promise<RateLimitResult> {
  const limit = options?.limit ?? 30;
  const now = Date.now();
  const reset = now + 60 * 1000; // 1 minute from now

  // Stub implementation - replace with actual rate limiting logic (Redis, Upstash, etc.)
  return {
    success: true,
    allowed: true,
    limit,
    remaining: limit - 1,
    reset,
  };
}

/**
 * Create a rate limit error response
 * @param retryAfter
 */
export function createRateLimitError<T = unknown>(retryAfter?: number): ActionResult<T> {
  return {
    success: false,
    error: retryAfter
      ? `Rate limit exceeded. Try again in ${Math.ceil(retryAfter / 1000)} seconds.`
      : "Rate limit exceeded. Please try again later.",
  };
}

/**
 * Wrapper for rate-limited actions
 * @param action
 * @param options
 * @param options.limit
 * @param options.window
 */
export function rateLimitAction<T extends (...args: any[]) => Promise<ActionResult>>(
  action: T,
  options?: { limit?: number; window?: string }
): T {
  return (async (...args: Parameters<T>) => {
    const result = await checkRateLimit("action", options);
    if (!result.allowed) {
      return createRateLimitError(result.reset - Date.now());
    }
    return action(...args);
  }) as T;
}

/**
 * HOC for rate-limiting middleware
 * @param handler
 * @param options
 * @param options.limit
 * @param options.window
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options?: { limit?: number; window?: string }
): T {
  return (async (...args: Parameters<T>) => {
    const result = await checkRateLimit("middleware", options);
    if (!result.allowed) {
      return new Response("Rate limit exceeded", { status: 429 });
    }
    return handler(...args);
  }) as T;
}

/**
 * Clear rate limit for identifier (useful for testing)
 * @param identifier
 */
export async function clearRateLimit(identifier: string): Promise<void> {
  // Stub implementation
  return Promise.resolve();
}
