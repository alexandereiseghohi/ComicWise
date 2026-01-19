/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Sentry Client Configuration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This file configures Sentry for the client-side (browser)
 * Run: pnpm add @sentry/nextjs to install Sentry
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"],

  // Replay configuration
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Performance monitoring
  tracesSampleRate: process.env["NODE_ENV"] === "production" ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env["NODE_ENV"],

  // Enable debug mode in development
  debug: process.env["NODE_ENV"] === "development",

  // Filter out errors
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (
      hint.originalException &&
      typeof hint.originalException === "object" &&
      "message" in hint.originalException
    ) {
      const message = String(hint.originalException.message);
      if (message.includes("ResizeObserver") || message.includes("Non-Error promise rejection")) {
        return null;
      }
    }
    return event;
  },
});
