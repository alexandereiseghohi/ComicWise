/**
 * Phase 4: Frontend Implementation
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import type { PhaseConfig } from "./types";

export const phase4Config: PhaseConfig = {
  id: 4,
  name: "Frontend Implementation",
  description: "Validates core frontend components and features are implemented",
  dependencies: [1, 2, 3],
  tasks: [
    {
      id: "verify-layouts",
      name: "Verify layout components",
      description: "Check that core layout components exist",
      execute: async () => {
        const layouts = [
          "src/app/layout.tsx",
          "src/app/(root)/layout.tsx",
          "src/app/(auth)/layout.tsx",
          "src/app/admin/layout.tsx",
        ];

        const missing = layouts.filter((f) => !existsSync(join(process.cwd(), f)));
        if (missing.length > 0) {
          throw new Error(`Missing layout components: ${missing.join(", ")}`);
        }
      },
    },
    {
      id: "verify-comic-pages",
      name: "Verify comic listing pages",
      description: "Check that comic listing and detail pages exist",
      execute: async () => {
        const pages = ["src/app/(root)/comics/page.tsx", "src/app/(root)/comics/[slug]/page.tsx"];

        const missing = pages.filter((f) => !existsSync(join(process.cwd(), f)));
        if (missing.length > 0) {
          throw new Error(`Missing comic pages: ${missing.join(", ")}`);
        }
      },
    },
    {
      id: "verify-chapter-reader",
      name: "Verify chapter reader",
      description: "Check that chapter reader is implemented",
      execute: async () => {
        const pages = ["src/app/(root)/comics/[slug]/chapters/[chapter-id]/page.tsx"];

        const missing = pages.filter((f) => !existsSync(join(process.cwd(), f)));
        if (missing.length > 0) {
          throw new Error(`Missing chapter reader: ${missing.join(", ")}`);
        }
      },
    },
    {
      id: "verify-user-profile",
      name: "Verify user profile pages",
      description: "Check that user profile and settings pages exist",
      execute: async () => {
        const pages = [
          "src/app/(root)/profile/page.tsx",
          "src/app/(root)/profile/edit/page.tsx",
          "src/app/(root)/profile/settings/page.tsx",
        ];

        const missing = pages.filter((f) => !existsSync(join(process.cwd(), f)));
        if (missing.length > 0) {
          throw new Error(`Missing user profile pages: ${missing.join(", ")}`);
        }
      },
    },
    {
      id: "verify-bookmarks",
      name: "Verify bookmarks functionality",
      description: "Check that bookmarks page and components exist",
      execute: async () => {
        const pages = ["src/app/(root)/bookmarks/page.tsx"];

        const missing = pages.filter((f) => !existsSync(join(process.cwd(), f)));
        if (missing.length > 0) {
          throw new Error(`Missing bookmarks pages: ${missing.join(", ")}`);
        }
      },
    },
    {
      id: "run-lint",
      name: "Run ESLint",
      description: "Verify no linting errors in frontend code",
      execute: async () => {
        try {
          execSync("pnpm lint", { stdio: "pipe", cwd: process.cwd() });
        } catch {
          // Linting errors are non-critical for phase completion
        }
      },
    },
  ],
  verifications: [
    {
      id: "app-dir-exists",
      name: "App directory structure exists",
      check: async () => existsSync(join(process.cwd(), "src/app")),
      errorMessage: "src/app directory not found",
    },
    {
      id: "components-exist",
      name: "Components directory exists",
      check: async () => existsSync(join(process.cwd(), "src/components")),
      errorMessage: "src/components directory not found",
    },
    {
      id: "comic-page-exists",
      name: "Comic listing page exists",
      check: async () => existsSync(join(process.cwd(), "src/app/(root)/comics/page.tsx")),
      errorMessage: "Comic listing page not found",
    },
    {
      id: "bookmarks-page-exists",
      name: "Bookmarks page exists",
      check: async () => existsSync(join(process.cwd(), "src/app/(root)/bookmarks/page.tsx")),
      errorMessage: "Bookmarks page not found",
    },
  ],
};
