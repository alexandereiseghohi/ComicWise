"use client";

import { Button } from "@/components/ui/button";
import { isDevelopment } from "@/lib/clientConfig";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset(): void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error to monitoring service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div
      className={`
        flex min-h-screen flex-col items-center justify-center bg-background
        px-4
      `}
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="size-16 text-destructive" aria-hidden="true" />
        </div>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Something went wrong</h1>

        <p className="mb-6 text-muted-foreground">
          An unexpected error occurred. Our team has been notified and is working on a fix.
        </p>

        {error.digest && (
          <p className="mb-6 text-sm text-muted-foreground">Error ID: {error.digest}</p>
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
            <Link href="/">Go Home</Link>
          </Button>
        </div>

        {isDevelopment && (
          <details
            className={`
              mt-8 rounded-lg border border-border bg-muted p-4 text-left
            `}
          >
            <summary className="cursor-pointer font-semibold">Error Details</summary>
            <pre className="mt-2 overflow-auto text-xs">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
