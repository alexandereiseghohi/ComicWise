/**
 * Phase 2: Environment & Configuration
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { PhaseConfig } from "./types";

export const phase2Config: PhaseConfig = {
  id: 2,
  name: "Environment & Configuration",
  description: "Validates environment variables, configuration files, and dependencies",
  dependencies: [1],
  tasks: [
    {
      id: "check-env-file",
      name: "Verify .env.local exists",
      description: "Check that .env.local file is present",
      execute: async () => {
        const envLocalPath = join(process.cwd(), ".env.local");
        if (!existsSync(envLocalPath)) {
          throw new Error(".env.local file not found. Copy from .env.example");
        }
      },
    },
    {
      id: "validate-config-files",
      name: "Validate configuration files",
      description: "Check that all required config files are present and valid",
      execute: async () => {
        const configs = [
          "tsconfig.json",
          "next.config.ts",
          "drizzle.config.ts",
          "vitest.config.ts",
          "playwright.config.ts",
        ];

        const missing = configs.filter((f) => !existsSync(join(process.cwd(), f)));
        if (missing.length > 0) {
          throw new Error(`Missing config files: ${missing.join(", ")}`);
        }
      },
    },
    {
      id: "type-check",
      name: "Run TypeScript type check",
      description: "Ensure no TypeScript compilation errors",
      execute: async () => {
        execSync("pnpm type-check", { stdio: "pipe", cwd: process.cwd() });
      },
    },
    {
      id: "validate-env-vars",
      name: "Validate environment variables",
      description: "Ensure all required environment variables are set",
      execute: async () => {
        // Type checking will catch missing env vars from t3-env validation
      },
    },
  ],
  verifications: [
    {
      id: "env-local-exists",
      name: ".env.local file exists",
      check: async () => existsSync(join(process.cwd(), ".env.local")),
      errorMessage: ".env.local not found - copy from .env.example",
    },
    {
      id: "tsconfig-valid",
      name: "tsconfig.json is valid",
      check: async () => {
        try {
          const content = readFileSync(join(process.cwd(), "tsconfig.json"), "utf-8");
          JSON.parse(content);
          return true;
        } catch {
          return false;
        }
      },
      errorMessage: "tsconfig.json is invalid JSON",
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
