// ═══════════════════════════════════════════════════
// MIDDLEWARE - Authentication & Route Protection (Next.js 16.0.7)
// ═══════════════════════════════════════════════════
// Optimized for:
// - Next.js 16.0.7 middleware patterns
// - Edge runtime compatibility
// - Performance optimization with route matching
// - Proper redirect handling
// - Security headers
// ═══════════════════════════════════════════════════

import { auth } from "auth";
import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// ROUTE CONFIGURATION
// ═══════════════════════════════════════════════════

// Protected routes that require authentication
const protectedRoutes = ["/admin", "/admin/*", "/profile", "/bookmarks"] as const;

// Auth routes that should redirect to home if already authenticated
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/sign-out",
  "/forgot-password",
  "/resend-verification",
  "/reset-password",
  "/verify-email",
  "/verify-request",
] as const;

// Admin-only routes
const adminRoutes = ["/admin", "/admin/*"] as const;

// Public API routes that should bypass auth
const publicApiRoutes = ["/api/health", "/api/webhooks"] as const;

// Static assets and Next.js internal routes to skip
const skipPatterns = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/static",
  "/public",
] as const;

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

function shouldSkipMiddleware(pathname: string): boolean {
  return skipPatterns.some((pattern) => pathname.startsWith(pattern));
}

function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some((route) => pathname.startsWith(route));
}

function matchRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

// ═══════════════════════════════════════════════════
// MIDDLEWARE HANDLER
// ═══════════════════════════════════════════════════

export default auth((req: NextAuthRequest): NextResponse<unknown> => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Skip middleware for static assets and Next.js internals
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Skip middleware for public API routes
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Check route types
  const isProtected = matchRoute(pathname, protectedRoutes);
  const isAuthRoute = matchRoute(pathname, authRoutes);
  const isAdminRoute = matchRoute(pathname, adminRoutes);

  // ═══════════════════════════════════════════════════
  // Authentication Guards
  // ═══════════════════════════════════════════════════

  // Redirect to sign-in if accessing protected route without session
  if (isProtected && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to home if accessing auth route with active session
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ═══════════════════════════════════════════════════
  // Admin Route Protection
  // ═══════════════════════════════════════════════════

  if (isAdminRoute) {
    const authRecord = req.auth as unknown as Record<string, unknown> | undefined;
    const userRole = (authRecord?.["user"] as Record<string, unknown> | undefined)?.["role"] as
      | string
      | undefined;

    // Allow admin and moderator roles
    if (userRole !== "admin" && userRole !== "moderator") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ═══════════════════════════════════════════════════
  // Security Headers (Next.js 16 Best Practices)
  // ═══════════════════════════════════════════════════

  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return response;
});

// ═══════════════════════════════════════════════════
// MIDDLEWARE CONFIGURATION (Next.js 16.0.7)
// ═══════════════════════════════════════════════════

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
