/**
 * Rate Limiting Service
 * Provides rate limiting for API routes and server actions
 * Using sliding window algorithm with Redis
 */

import { env } from "@/appConfig";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL || "",
  token: env.UPSTASH_REDIS_REST_TOKEN || "",
});

export interface RateLimitConfig {
  limit: number; // Number of requests allowed
  window: number; // Time window in seconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Timestamp when limit resets
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is within rate limit
   * @param identifier
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();

    try {
      // Get current count from a simple counter
      const countKey = `${key}:count`;
      const timestampKey = `${key}:timestamp`;

      // Get current count and first timestamp
      const currentCount = (await redis.get<number>(countKey)) || 0;
      const firstTimestamp = (await redis.get<number>(timestampKey)) || now;

      // Check if window has expired
      if (now - firstTimestamp >= this.config.window * 1000) {
        // Reset window
        await redis.set(countKey, 1, { ex: this.config.window });
        await redis.set(timestampKey, now, { ex: this.config.window });

        return {
          success: true,
          limit: this.config.limit,
          remaining: this.config.limit - 1,
          reset: now + this.config.window * 1000,
        };
      }

      // Check if limit exceeded
      if (currentCount >= this.config.limit) {
        const reset = firstTimestamp + this.config.window * 1000;
        return {
          success: false,
          limit: this.config.limit,
          remaining: 0,
          reset,
        };
      }

      // Increment counter
      await redis.set(countKey, currentCount + 1, { ex: this.config.window });

      const remaining = Math.max(0, this.config.limit - currentCount - 1);
      const reset = firstTimestamp + this.config.window * 1000;

      return {
        success: true,
        limit: this.config.limit,
        remaining,
        reset,
      };
    } catch (error) {
      console.error("Rate limit check error:", error);
      // On error, allow the request
      return {
        success: true,
        limit: this.config.limit,
        remaining: this.config.limit,
        reset: now + this.config.window * 1000,
      };
    }
  }

  /**
   * Reset rate limit for identifier
   * @param identifier
   */
  async reset(identifier: string): Promise<void> {
    try {
      const key = `ratelimit:${identifier}`;
      await redis.del(key);
    } catch (error) {
      console.error("Rate limit reset error:", error);
    }
  }
}

// Predefined rate limit configurations
export const rateLimitConfig = {
  // Authentication endpoints
  auth: {
    signIn: { limit: 5, window: 300 }, // 5 attempts per 5 minutes
    signUp: { limit: 3, window: 3600 }, // 3 attempts per hour
    resetPassword: { limit: 3, window: 3600 }, // 3 attempts per hour
    verifyEmail: { limit: 5, window: 300 }, // 5 attempts per 5 minutes
  },

  // API endpoints
  api: {
    default: { limit: 100, window: 60 }, // 100 requests per minute
    search: { limit: 20, window: 60 }, // 20 searches per minute
    upload: { limit: 10, window: 3600 }, // 10 uploads per hour
    create: { limit: 30, window: 3600 }, // 30 creates per hour
    update: { limit: 50, window: 3600 }, // 50 updates per hour
    delete: { limit: 20, window: 3600 }, // 20 deletes per hour
  },

  // User actions
  user: {
    comment: { limit: 10, window: 300 }, // 10 comments per 5 minutes
    bookmark: { limit: 50, window: 300 }, // 50 bookmarks per 5 minutes
    rating: { limit: 20, window: 300 }, // 20 ratings per 5 minutes
  },
};

// Helper function to create rate limiters
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

// Predefined rate limiters
export const rateLimiters = {
  auth: {
    signIn: createRateLimiter(rateLimitConfig.auth.signIn),
    signUp: createRateLimiter(rateLimitConfig.auth.signUp),
    resetPassword: createRateLimiter(rateLimitConfig.auth.resetPassword),
    verifyEmail: createRateLimiter(rateLimitConfig.auth.verifyEmail),
  },
  api: {
    default: createRateLimiter(rateLimitConfig.api.default),
    search: createRateLimiter(rateLimitConfig.api.search),
    upload: createRateLimiter(rateLimitConfig.api.upload),
    create: createRateLimiter(rateLimitConfig.api.create),
    update: createRateLimiter(rateLimitConfig.api.update),
    delete: createRateLimiter(rateLimitConfig.api.delete),
  },
  user: {
    comment: createRateLimiter(rateLimitConfig.user.comment),
    bookmark: createRateLimiter(rateLimitConfig.user.bookmark),
    rating: createRateLimiter(rateLimitConfig.user.rating),
  },
};

/**
 * Get rate limit identifier from request
 * Uses IP address or user ID
 * @param request
 * @param userId
 */
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from headers
  const ip =
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  return `ip:${ip}`;
}

/**
 * Rate limit middleware for API routes
 * @param request
 * @param limiter
 * @param identifier
 */
export async function rateLimit(
  request: Request,
  limiter: RateLimiter,
  identifier?: string
): Promise<RateLimitResult> {
  const id = identifier || getRateLimitIdentifier(request);
  return limiter.check(id);
}

/**
 * Create rate limit response
 * @param result
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Please try again later",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  );
}
