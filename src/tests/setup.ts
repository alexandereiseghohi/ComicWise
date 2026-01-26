// Ensure tests run in a predictable environment
(process.env as any)["NODE_ENV"] = process.env["NODE_ENV"] ?? "test";
(process.env as any)["SKIP_ENV_VALIDATION"] = process.env["SKIP_ENV_VALIDATION"] ?? "true";
(process.env as any)["CACHE_ADAPTER"] = process.env["CACHE_ADAPTER"] ?? "in-memory";

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Provide a lightweight mock for `next/server` used by next-auth within tests.
// This avoids module resolution issues when running outside of Next's runtime.
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown) => ({ body }),
  },
  headers: () => new Map<string, string>(),
  cookies: () => new Map<string, string>(),
}));

// Mock next-auth and its provider modules to avoid importing Next.js runtime
// internals during unit tests. Tests that need to assert provider behavior
// should mock these modules explicitly in their test files.
vi.mock("next-auth", () => {
  // NextAuth is typically a function that accepts options and returns helpers.
  const NextAuth = (opts: any) => {
    return {
      handlers: {},
      auth: async () => null,
      signIn: async () => undefined,
      signOut: async () => undefined,
    };
  };

  return {
    default: NextAuth,
    getServerSession: async () => null,
  };
});

vi.mock("next-auth/providers/credentials", () => ({ default: (opts: any) => ({ ...opts }) }));

vi.mock("next-auth/providers/google", () => ({ default: (opts: any) => ({ ...opts }) }));

vi.mock("next-auth/providers/github", () => ({ default: (opts: any) => ({ ...opts }) }));

// Cleanup after each test
afterEach(() => {
  cleanup();
});
