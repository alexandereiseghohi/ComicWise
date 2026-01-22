/**
 * Rate Limit Middleware for API Routes
 *
 * Automatically applies rate limiting to API routes based on the endpoint path.
 */

import { auth } from "@/lib/auth";
import { checkRateLimit, createRateLimitError } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * API route patterns and their corresponding rate limiters
 */
const routePatterns = [
  // Authentication routes
  { pattern: /^\/api\/auth\/signin/, limit: 10 },
  { pattern: /^\/api\/auth\/signup/, limit: 5 },
  { pattern: /^\/api\/auth\/forgot-password/, limit: 3 },
  { pattern: /^\/api\/auth\/reset-password/, limit: 5 },

  // API routes
  { pattern: /^\/api\/comics/, limit: 100 },
  { pattern: /^\/api\/chapters/, limit: 100 },
  { pattern: /^\/api\/search/, limit: 50 },

  // User action routes
  { pattern: /^\/api\/comments/, limit: 30 },
  { pattern: /^\/api\/bookmarks/, limit: 60 },
  { pattern: /^\/api\/likes/, limit: 60 },
  { pattern: /^\/api\/upload/, limit: 10 },
  { pattern: /^\/api\/profile/, limit: 10 },

  // Creator routes
  { pattern: /^\/api\/creator\/comics/, limit: 5 },
  { pattern: /^\/api\/creator\/chapters/, limit: 10 },
] as const;

/**
 * Apply rate limiting to API routes
 * @param request
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
  const identifier = userId ?? "anonymous";

  // Check rate limit
  const result = await checkRateLimit(identifier, { limit: match.limit });

  if (!result.allowed) {
    const error = createRateLimitError(result.reset - Date.now());

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
