/**
 * Rate Limit Middleware for API Routes
 *
 * Automatically applies rate limiting to API routes based on the endpoint path.
 */

import { auth } from "@/lib/auth";
import { createRateLimitError, rateLimitConfigs, withRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

/**
 * API route patterns and their corresponding rate limiters
 */
const routePatterns = [
  // Authentication routes
  { pattern: /^\/api\/auth\/signin/, limiter: rateLimitConfigs.auth.signin },
  { pattern: /^\/api\/auth\/signup/, limiter: rateLimitConfigs.auth.signup },
  { pattern: /^\/api\/auth\/forgot-password/, limiter: rateLimitConfigs.auth.forgotPassword },
  { pattern: /^\/api\/auth\/reset-password/, limiter: rateLimitConfigs.auth.resetPassword },

  // API routes
  { pattern: /^\/api\/comics/, limiter: rateLimitConfigs.api.comics },
  { pattern: /^\/api\/chapters/, limiter: rateLimitConfigs.api.chapters },
  { pattern: /^\/api\/search/, limiter: rateLimitConfigs.api.search },

  // User action routes
  { pattern: /^\/api\/comments/, limiter: rateLimitConfigs.user.comment },
  { pattern: /^\/api\/bookmarks/, limiter: rateLimitConfigs.user.bookmark },
  { pattern: /^\/api\/likes/, limiter: rateLimitConfigs.user.like },
  { pattern: /^\/api\/upload/, limiter: rateLimitConfigs.user.upload },
  { pattern: /^\/api\/profile/, limiter: rateLimitConfigs.user.profileUpdate },

  // Creator routes
  { pattern: /^\/api\/creator\/comics/, limiter: rateLimitConfigs.creator.uploadComic },
  { pattern: /^\/api\/creator\/chapters/, limiter: rateLimitConfigs.creator.uploadChapter },
] as const;

/**
 * Apply rate limiting to API routes
 */
export async function rateLimitMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Find matching rate limiter
  const match = routePatterns.find(({ pattern }) => pattern.test(pathname));

  if (!match) {
    // No rate limit configured for this route
    return NextResponse.next();
  }

  // Get user ID from session if available
  const session = await auth();
  const userId = session?.user?.id;

  // Check rate limit
  const result = await withRateLimit(match.limiter, request, userId);

  if (!result.success) {
    const error = createRateLimitError(result);

    return NextResponse.json(error, {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    });
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());

  return response;
}
