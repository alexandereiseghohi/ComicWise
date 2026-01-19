"use client";

import { Button } from "@/components/ui/button";
import { isDevelopment } from "@/lib/clientConfig";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset(): void;
}

export default function AdminError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Admin panel error:", error);
  }, [error]);

  return (
    <div
      className={`
        flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4
      `}
    >
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="size-16 text-destructive" aria-hidden="true" />
        </div>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Admin Panel Error</h1>

        <p className="mb-6 text-muted-foreground">
          An error occurred in the admin panel. This has been logged for investigation.
        </p>

        {error.digest && (
          <div
            className={`
              mb-6 rounded-md bg-muted px-3 py-2 font-mono text-sm
              text-muted-foreground
            `}
          >
            Error ID: {error.digest}
          </div>
        )}

        <div
          className={`
            flex flex-col gap-3
            sm:flex-row sm:justify-center
          `}
        >
          <Button onClick={reset} size="lg">
            Try Again
          </Button>

          <Button variant="outline" size="lg" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 size-4" />
              Admin Dashboard
            </Link>
          </Button>
        </div>

        {isDevelopment && (
          <details
            className={`
              mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4
              text-left
            `}
          >
            <summary className="cursor-pointer font-semibold text-destructive">
              Debug Information
            </summary>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-sm font-semibold">Error Message:</p>
                <p className="text-sm text-destructive">{error.message}</p>
              </div>
              {error.stack && (
                <div>
                  <p className="text-sm font-semibold">Stack Trace:</p>
                  <pre className="mt-1 overflow-auto text-xs">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
