"use client";

import { AuthSync } from "@/components/auth/AuthSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { ComponentProps, ReactNode } from "react";
import { lazy, Suspense, useMemo } from "react";

const Toaster = lazy(() =>
  import("@/components/ui/sonner").then((module_) => ({ default: module_.Toaster }))
);

type AppProps = {
  children: ReactNode;
  session?: Session | null;
} & ComponentProps<typeof ThemeProvider>;

export function Providers({ children, attribute, defaultTheme, enableSystem }: AppProps) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider
          attribute={attribute}
          defaultTheme={defaultTheme}
          enableSystem={enableSystem}
        >
          <AuthSync />
          {children}
          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
