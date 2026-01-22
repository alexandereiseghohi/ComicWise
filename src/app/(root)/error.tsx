"use client";

import { Button } from "@/components/ui/button";
import { isDevelopment } from "@/lib/client-config";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset(): void;
}

export default function RootError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="text-warning size-12" aria-hidden="true" />
        </div>

        <h2 className="mb-2 text-2xl font-bold tracking-tight">Oops! Something went wrong</h2>

        <p className="mb-6 text-muted-foreground">
          We encountered an issue while loading this page. Please try again.
        </p>

        <div
          className={`
            flex flex-col gap-3
            sm:flex-row sm:justify-center
          `}
        >
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" asChild>
            <a href="/">Back to Home</a>
          </Button>
        </div>

        {isDevelopment && (
          <details
            className={`
              mt-6 rounded-lg border border-border bg-muted p-4 text-left
            `}
          >
            <summary className="cursor-pointer text-sm font-semibold">
              Development Error Details
            </summary>
            <pre className="mt-2 overflow-auto text-xs">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
