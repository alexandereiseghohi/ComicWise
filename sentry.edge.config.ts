/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Sentry Edge Configuration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This file configures Sentry for Edge Runtime (Middleware, Edge API Routes)
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env["SENTRY_DSN"],

  // Performance monitoring
  tracesSampleRate: process.env["NODE_ENV"] === "production" ? 0.1 : 1.0,

  // Environment
  environment: process.env["NODE_ENV"],

  // Debug mode
  debug: false, // Keep false for edge runtime
});
