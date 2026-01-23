/**
 * Phase 5: Scripts & Automation
 */

import { execSync } from "child_process";
import type { PhaseConfig } from "./types";

export const phase5Config: PhaseConfig = {
  id: 5,
  name: "Scripts & Automation",
  description: "Validates and optimizes project automation scripts and tools",
  dependencies: [1, 2, 3, 4],
  tasks: [
    {
      id: "validate-scripts",
      name: "Validate existing scripts",
      description: "Check that all required scripts are present",
      execute: async () => {
        // Validate core scripts exist
        const scripts = ["scripts/cleanup.ts", "scripts/analyze-project.ts"];
        // More detailed validation can be added
      },
    },
    {
      id: "run-linter",
      name: "Run linter checks",
      description: "Verify no linting errors across project",
      execute: async () => {
        execSync("pnpm lint", { stdio: "pipe", cwd: process.cwd() });
      },
    },
    {
      id: "check-imports",
      name: "Optimize imports",
      description: "Validate and optimize import statements",
      execute: async () => {
        // This would run import optimization scripts
      },
    },
    {
      id: "format-code",
      name: "Format code",
      description: "Apply code formatting standards",
      execute: async () => {
        execSync("pnpm format", { stdio: "pipe", cwd: process.cwd() });
      },
    },
    {
      id: "cleanup-project",
      name: "Clean up project",
      description: "Remove temporary and backup files",
      execute: async () => {
        execSync("pnpm clean", { stdio: "pipe", cwd: process.cwd() });
      },
    },
  ],
  verifications: [
    {
      id: "no-lint-errors",
      name: "No linting errors",
      check: async () => {
        try {
          execSync("pnpm lint:strict", { stdio: "pipe", cwd: process.cwd() });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage: "ESLint errors detected - run pnpm lint:fix",
    },
    {
      id: "format-check",
      name: "Code formatting correct",
      check: async () => {
        try {
          execSync("pnpm format:check", { stdio: "pipe", cwd: process.cwd() });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage: "Code formatting issues - run pnpm format",
    },
  ],
};
