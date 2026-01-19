"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Global Error Boundary Component
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Catches and handles errors in the application
 * Provides user-friendly error messages
 * Logs errors to Sentry (if configured)
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset(): void;
}) {
  useEffect(() => {
    // Log error to Sentry or other monitoring service
    console.error("Global error caught:", error);

    // Optional: Send to Sentry
    if (typeof window !== "undefined" && window.Sentry) {
      window.Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div
          className="
          flex min-h-screen flex-col items-center justify-center bg-linear-to-b
          from-background to-muted p-4
        "
        >
          <div className="max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <h1
                className="
                text-4xl font-bold tracking-tighter text-destructive
              "
              >
                Oops! Something went wrong
              </h1>
              <p className="text-lg text-muted-foreground">
                We're sorry for the inconvenience. An unexpected error occurred.
              </p>
            </div>

            {error.digest && (
              <div className="rounded-lg bg-muted p-4">
                <p className="font-mono text-sm text-muted-foreground">Error ID: {error.digest}</p>
              </div>
            )}

            <div
              className="
              flex flex-col gap-2
              sm:flex-row sm:justify-center
            "
            >
              <button
                onClick={reset}
                className="
                  inline-flex items-center justify-center rounded-md bg-primary
                  px-6 py-3 text-sm font-medium text-primary-foreground
                  transition-colors
                  hover:bg-primary/90
                  focus:ring-2 focus:ring-primary focus:ring-offset-2
                  focus:outline-none
                "
              >
                Try Again
              </button>
              <a
                href="/"
                className="
                  inline-flex items-center justify-center rounded-md border
                  border-input bg-background px-6 py-3 text-sm font-medium
                  transition-colors
                  hover:bg-accent hover:text-accent-foreground
                  focus:ring-2 focus:ring-primary focus:ring-offset-2
                  focus:outline-none
                "
              >
                Go Home
              </a>
            </div>

            {process.env["NODE_ENV"] === "development" && (
              <details className="mt-8 rounded-lg bg-muted p-4 text-left">
                <summary className="cursor-pointer font-semibold">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 overflow-auto text-xs">
                  {error.message}
                  {"\n\n"}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}

declare global {
  interface Window {
    Sentry?: {
      captureException(error: Error): void;
    };
  }
}
