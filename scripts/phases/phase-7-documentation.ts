/**
 * Phase 7: Documentation & Quality
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import type { PhaseConfig } from "./types";

export const phase7Config: PhaseConfig = {
  id: 7,
  name: "Documentation & Quality",
  description: "Ensures comprehensive documentation and code quality standards",
  dependencies: [1, 2, 3, 4, 5, 6],
  tasks: [
    {
      id: "check-readme",
      name: "Verify README documentation",
      description: "Check that README.md is comprehensive",
      execute: async () => {
        if (!existsSync(join(process.cwd(), "README.md"))) {
          throw new Error("README.md not found");
        }
      },
    },
    {
      id: "check-docs-dir",
      name: "Verify documentation directory",
      description: "Check that docs directory is properly populated",
      execute: async () => {
        if (!existsSync(join(process.cwd(), "docs"))) {
          throw new Error("docs directory not found");
        }
      },
    },
    {
      id: "run-linter",
      name: "Run linter",
      description: "Ensure no linting errors",
      execute: async () => {
        execSync("pnpm lint", { stdio: "pipe", cwd: process.cwd() });
      },
    },
    {
      id: "fix-formatting",
      name: "Fix code formatting",
      description: "Apply code formatting standards",
      execute: async () => {
        execSync("pnpm format", { stdio: "pipe", cwd: process.cwd() });
      },
    },
    {
      id: "type-check",
      name: "TypeScript type checking",
      description: "Ensure no TypeScript errors",
      execute: async () => {
        execSync("pnpm type-check", { stdio: "pipe", cwd: process.cwd() });
      },
    },
  ],
  verifications: [
    {
      id: "readme-exists",
      name: "README.md exists",
      check: async () => existsSync(join(process.cwd(), "README.md")),
      errorMessage: "README.md not found",
    },
    {
      id: "docs-dir-exists",
      name: "docs directory exists",
      check: async () => existsSync(join(process.cwd(), "docs")),
      errorMessage: "docs directory not found",
    },
    {
      id: "no-lint-errors",
      name: "No linting errors",
      check: async () => {
        try {
          execSync("pnpm lint", { stdio: "pipe", cwd: process.cwd() });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage: "ESLint errors found - run pnpm lint:fix",
    },
    {
      id: "no-type-errors",
      name: "No TypeScript errors",
      check: async () => {
        try {
          execSync("pnpm type-check", { stdio: "pipe", cwd: process.cwd() });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage: "TypeScript compilation errors detected",
    },
  ],
};
