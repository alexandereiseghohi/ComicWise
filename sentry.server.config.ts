/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Sentry Server Configuration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This file configures Sentry for the server-side (Node.js)
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env["SENTRY_DSN"],

  // Performance monitoring
  tracesSampleRate: process.env["NODE_ENV"] === "production" ? 0.1 : 1.0,

  // Environment
  environment: process.env["NODE_ENV"],

  // Enable debug mode in development
  debug: process.env["NODE_ENV"] === "development",
});
