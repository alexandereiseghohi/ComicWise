"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { ComponentProps, ReactNode } from "react";
import { lazy, Suspense } from "react";
import { AuthSync } from "@/components/auth/AuthSync";

const Toaster = lazy(() =>
  import("@/components/ui/sonner").then((module_) => ({ default: module_.Toaster }))
);

type AppProps = {
  children: ReactNode;
  session?: Session | null;
} & ComponentProps<typeof ThemeProvider>;
export function Providers({ children, attribute, defaultTheme, enableSystem }: AppProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute={attribute} defaultTheme={defaultTheme} enableSystem={enableSystem}>
        <AuthSync />
        {children}
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      </ThemeProvider>
    </SessionProvider>
  );
}
