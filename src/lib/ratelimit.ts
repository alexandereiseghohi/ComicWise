/**
 * Rate Limiting Service
 *
 * Provides centralized rate limiting for API routes and server actions using Upstash Redis.
 * Supports multiple rate limit configurations for different endpoints.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client using bracket notation for index signature access
const redis = new Redis({
  url: process.env["UPSTASH_REDIS_REST_URL"]!,
  token: process.env["UPSTASH_REDIS_REST_TOKEN"]!,
});

/**
 * Rate limit configurations for different operations
 */
export const rateLimitConfigs = {
  // Authentication endpoints (strict)
  auth: {
    signin: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15m"), // 5 attempts per 15 minutes
      analytics: true,
      prefix: "ratelimit:auth:signin",
    }),
    signup: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1h"), // 3 attempts per hour
      analytics: true,
      prefix: "ratelimit:auth:signup",
    }),
    forgotPassword: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1h"), // 3 attempts per hour
      analytics: true,
      prefix: "ratelimit:auth:forgot",
    }),
    resetPassword: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1h"), // 5 attempts per hour
      analytics: true,
      prefix: "ratelimit:auth:reset",
    }),
  },

  // API endpoints (moderate)
  api: {
    comics: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1m"), // 100 requests per minute
      analytics: true,
      prefix: "ratelimit:api:comics",
    }),
    chapters: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1m"), // 100 requests per minute
      analytics: true,
      prefix: "ratelimit:api:chapters",
    }),
    search: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1m"), // 30 searches per minute
      analytics: true,
      prefix: "ratelimit:api:search",
    }),
  },

  // User actions (moderate)
  user: {
    comment: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1m"), // 10 comments per minute
      analytics: true,
      prefix: "ratelimit:user:comment",
    }),
    bookmark: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1m"), // 30 bookmarks per minute
      analytics: true,
      prefix: "ratelimit:user:bookmark",
    }),
    like: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1m"), // 60 likes per minute
      analytics: true,
      prefix: "ratelimit:user:like",
    }),
    upload: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "5m"), // 10 uploads per 5 minutes
      analytics: true,
      prefix: "ratelimit:user:upload",
    }),
    profileUpdate: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "5m"), // 5 updates per 5 minutes
      analytics: true,
      prefix: "ratelimit:user:profile",
    }),
  },

  // Admin/creator actions (lenient)
  creator: {
    uploadComic: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1h"), // 20 uploads per hour
      analytics: true,
      prefix: "ratelimit:creator:comic",
    }),
    uploadChapter: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1h"), // 50 chapters per hour
      analytics: true,
      prefix: "ratelimit:creator:chapter",
    }),
  },
} as const;

/**
 * Rate limit result type
 */
export interface RateLimitResult {
  success: boolean;
  /** Alias for success - for backward compatibility */
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}

/**
 * Options for simple rate limiting
 */
export interface SimpleRateLimitOptions {
  limit?: number;
  window?: string;
}

/**
 * Default rate limit configuration
 */
const DEFAULT_RATE_LIMIT = 100;
const DEFAULT_WINDOW = "1m";

/**
 * Cache for dynamically created rate limiters
 */
const dynamicLimiters = new Map<string, Ratelimit>();

/**
 * Get or create a rate limiter for dynamic rate limiting
 * @param limit
 * @param window
 * @param identifier
 */
function getOrCreateLimiter(limit: number, window: string, identifier: string): Ratelimit {
  const key = `${limit}:${window}`;

  if (!dynamicLimiters.has(key)) {
    dynamicLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          limit,
          window as `${number}${"ms" | "s" | "m" | "h" | "d"}`
        ),
        analytics: true,
        prefix: `ratelimit:dynamic:${key}`,
      })
    );
  }

  return dynamicLimiters.get(key)!;
}

/**
 * Check rate limit - supports two calling patterns:
 *
 * 1. With Ratelimit instance (recommended for production):
 *    `checkRateLimit(rateLimitConfigs.auth.signin, "user:123")`
 *
 * 2. With identifier and options (simple usage):
 *    `checkRateLimit("user:123", { limit: 10, window: "1m" })`
 *
 * @param limiterOrIdentifier - Either a Ratelimit instance or an identifier string
 * @param identifierOrOptions - Either an identifier string or options object
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimit(
  limiterOrIdentifier: Ratelimit | string,
  identifierOrOptions?: string | SimpleRateLimitOptions
): Promise<RateLimitResult> {
  let limiter: Ratelimit;
  let identifier: string;

  // Determine which calling pattern is being used
  if (typeof limiterOrIdentifier === "string") {
    // Simple pattern: checkRateLimit("user:123", { limit: 10, window: "1m" })
    identifier = limiterOrIdentifier;
    const options = (identifierOrOptions as SimpleRateLimitOptions) || {};
    const limit = options.limit ?? DEFAULT_RATE_LIMIT;
    const window = options.window ?? DEFAULT_WINDOW;
    limiter = getOrCreateLimiter(limit, window, identifier);
  } else {
    // Production pattern: checkRateLimit(rateLimitConfigs.auth.signin, "user:123")
    limiter = limiterOrIdentifier;
    identifier = identifierOrOptions as string;
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    allowed: result.success, // Alias for backward compatibility
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    pending: result.pending,
  };
}

/**
 * Create a standardized rate limit error response
 * @param result
 */
export function createRateLimitError(result: RateLimitResult) {
  const resetDate = new Date(result.reset);
  const resetMinutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000);

  return {
    error: "Too many requests",
    message: `Rate limit exceeded. Try again in ${resetMinutes} minute${resetMinutes !== 1 ? "s" : ""}.`,
    retryAfter: result.reset,
    limit: result.limit,
    remaining: result.remaining,
  };
}

/**
 * Helper to get identifier from request
 * Uses user ID if authenticated, otherwise falls back to IP address
 * @param userId
 * @param ip
 */
export function getIdentifier(userId?: string, ip?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  if (ip) {
    return `ip:${ip}`;
  }
  return "anonymous";
}

/**
 * Middleware wrapper for API routes
 *
 * @param limiter
 * @param request
 * @param userId
 * @example
 * ```ts
 * import { withRateLimit } from "@/lib/rateLimit";
 *
 * export async function POST(request: Request) {
 *   const rateLimitResult = await withRateLimit(
 *     rateLimitConfigs.api.comics,
 *     request
 *   );
 *
 *   if (!rateLimitResult.success) {
 *     return Response.json(
 *       createRateLimitError(rateLimitResult),
 *       { status: 429 }
 *     );
 *   }
 *
 *   // ... handle request
 * }
 * ```
 */
export async function withRateLimit(
  limiter: Ratelimit,
  request: Request,
  userId?: string
): Promise<RateLimitResult> {
  const ip =
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  const identifier = getIdentifier(userId, ip);
  return await checkRateLimit(limiter, identifier);
}

/**
 * Server action rate limit helper
 *
 * @param limiter
 * @param userId
 * @example
 * ```ts
 * import { rateLimitAction } from "@/lib/rateLimit";
 *
 * export async function createComment(data: FormData) {
 *   const session = await auth();
 *   if (!session?.user?.id) {
 *     return { success: false, error: "Unauthorized" };
 *   }
 *
 *   const rateLimit = await rateLimitAction(
 *     rateLimitConfigs.user.comment,
 *     session.user.id
 *   );
 *
 *   if (!rateLimit.success) {
 *     return { success: false, error: createRateLimitError(rateLimit).message };
 *   }
 *
 *   // ... create comment
 * }
 * ```
 */
export async function rateLimitAction(
  limiter: Ratelimit,
  userId: string
): Promise<RateLimitResult> {
  const identifier = getIdentifier(userId);
  return await checkRateLimit(limiter, identifier);
}

/**
 * Batch rate limit check for multiple operations
 * Useful when a single request triggers multiple rate-limited operations
 * @param checks
 */
export async function checkMultipleRateLimits(
  checks: Array<{ limiter: Ratelimit; identifier: string }>
): Promise<RateLimitResult[]> {
  return await Promise.all(
    checks.map(({ limiter, identifier }) => checkRateLimit(limiter, identifier))
  );
}

/**
 * Custom rate limiter factory
 * Create a rate limiter with custom configuration
 * @param requests
 * @param window
 * @param prefix
 */
export function createRateLimiter(
  requests: number,
  window: `${number}${"ms" | "s" | "m" | "h" | "d"}`,
  prefix: string
): Ratelimit {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `ratelimit:${prefix}`,
  });
}

/**
 * Reset rate limit for a specific identifier
 * Useful for admin overrides or testing
 * @param limiter
 * @param identifier
 */
export async function resetRateLimit(limiter: Ratelimit, identifier: string): Promise<void> {
  // Upstash Ratelimit doesn't expose reset, but we can clear the key manually
  const prefix = (limiter as any).prefix;
  await redis.del(`${prefix}:${identifier}`);
}
