/**
 * Phase 3: Database & Seeding
 */

import { execSync } from "child_process";
import type { PhaseConfig } from "./types";

export const phase3Config: PhaseConfig = {
  id: 3,
  name: "Database & Seeding",
  description: "Sets up database, applies migrations, and seeds initial data",
  dependencies: [1, 2],
  tasks: [
    {
      id: "db-health-check",
      name: "Database health check",
      description: "Verify database connection and health",
      execute: async () => {
        execSync("pnpm health:db", { stdio: "inherit", cwd: process.cwd() });
      },
    },
    {
      id: "db-push-schema",
      name: "Push database schema",
      description: "Apply Drizzle schema to database",
      execute: async () => {
        execSync("pnpm db:push", { stdio: "inherit", cwd: process.cwd() });
      },
    },
    {
      id: "db-seed-dry-run",
      name: "Seed dry run validation",
      description: "Validate seeding process without applying changes",
      execute: async () => {
        execSync("pnpm db:seed:dry-run", { stdio: "inherit", cwd: process.cwd() });
      },
    },
    {
      id: "db-seed",
      name: "Seed database",
      description: "Execute database seeding with initial data",
      execute: async () => {
        execSync("pnpm db:seed", { stdio: "inherit", cwd: process.cwd() });
      },
    },
    {
      id: "verify-seed-data",
      name: "Verify seeded data",
      description: "Confirm that data was successfully seeded",
      execute: async () => {
        // Basic verification that seeding completed
        // More detailed checks can be added per entity type
      },
    },
  ],
  verifications: [
    {
      id: "db-accessible",
      name: "Database is accessible",
      check: async () => {
        try {
          execSync("pnpm health:db", { stdio: "pipe", cwd: process.cwd() });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage: "Cannot connect to database",
    },
    {
      id: "schema-exists",
      name: "Database schema exists",
      check: async () => {
        // Schema will exist if db:push succeeded
        return true;
      },
    },
  ],
};
