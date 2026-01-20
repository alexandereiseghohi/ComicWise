#!/usr/bin/env tsx

/**
 * ComicWise CLI Tool
 *
 * Comprehensive command-line interface for ComicWise development and administration.
 *
 * Commands:
 * - scaffold [type] - Generate new components, hooks, actions, etc.
 * - database [command] - Database operations
 * - admin [command] - Admin operations
 * - cache [command] - Cache management
 * - search [command] - Search operations
 * - health - Check system health
 * - config - Show configuration
 *
 * Usage:
 *   pnpm cw scaffold component --name MyComponent
 *   pnpm cw database seed --verbose
 *   pnpm cw admin user:create --email user@example.com
 *   pnpm cw cache clear
 *   pnpm cw health
 */

import chalk from "chalk";
import { execSync } from "child_process";
import { Command } from "commander";
import fs from "fs/promises";
import path from "path";

const program = new Command();

// ═══════════════════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Log with formatting
 */
const logger = {
  info: (msg: string) => console.log(chalk.blue("ℹ"), msg),
  success: (msg: string) => console.log(chalk.green("✓"), msg),
  warning: (msg: string) => console.log(chalk.yellow("⚠"), msg),
  error: (msg: string) => console.log(chalk.red("✗"), msg),
  log: (msg: string) => console.log(msg),
};

/**
 * Execute shell command
 * @param cmd
 */
function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8" });
  } catch {
    throw new Error(`Command failed: ${cmd}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Scaffold Command
// ═══════════════════════════════════════════════════════════════════════════

const scaffoldTemplates = {
  component: `"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface {{NAME}}Props {
  className?: string;
  children?: React.ReactNode;
}

/**
 * {{NAME}} Component
 *
 * Description of the component and its purpose.
 *
 * @param {Object} props Component props
 * @returns {React.ReactElement}
 */
export function {{NAME}}({ className, children }: {{NAME}}Props) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

export default {{NAME}};
`,

  hook: `import { useState, useCallback } from "react";

/**
 * use{{NAME}} Hook
 *
 * Description of the hook and its purpose.
 *
 * @returns {Object} Hook return values
 */
export function use{{NAME}}() {
  const [state, setState] = useState(null);

  const handler = useCallback(() => {
    // Implementation here
  }, []);

  return {
    state,
    handler,
  };
}
`,

  action: `"use server";

import { ActionResult } from "@/dto";

/**
 * {{name}} Server Action
 *
 * Description of the action and its purpose.
 *
 * @param {Object} input Input data
 * @returns {Promise<ActionResult>}
 */
export async function {{name}}(input: any): Promise<ActionResult<any>> {
  try {
    // Validation
    // Execution
    // Revalidation

    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
`,

  store: `import { create } from "zustand";
import { persist } from "zustand/middleware";

interface {{NAME}}State {
  // State properties
  isLoading: boolean;

  // Actions
  // Add action methods here
}

export const use{{NAME}}Store = create<{{NAME}}State>()(
  persist(
    (set) => ({
      isLoading: false,

      // Action implementations
    }),
    {
      name: "{{name}}-storage",
    }
  )
);
`,
};

program
  .command("scaffold <type> [name]")
  .description("Generate new component, hook, action, or store")
  .option("-n, --name <name>", "Name of the file")
  .action(async (type: string, name: string | undefined, options: any) => {
    const fileName = options.name || name;

    if (!fileName) {
      logger.error("Please provide a name using --name or as argument");
      process.exit(1);
    }

    const template = scaffoldTemplates[type as keyof typeof scaffoldTemplates];
    if (!template) {
      logger.error(`Unknown scaffold type: ${type}`);
      logger.log(`Available types: ${Object.keys(scaffoldTemplates).join(", ")}`);
      process.exit(1);
    }

    try {
      const content = template
        .replaceAll("{{NAME}}", fileName.charAt(0).toUpperCase() + fileName.slice(1))
        .replaceAll("{{name}}", fileName);

      const dirPath = path.join(process.cwd(), "src", "components", `${fileName}.tsx`);
      await fs.writeFile(dirPath, content);

      logger.success(`Created ${type}: ${dirPath}`);
    } catch (error) {
      logger.error(
        `Failed to create ${type}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      process.exit(1);
    }
  });

// ═══════════════════════════════════════════════════════════════════════════
// Database Command
// ═══════════════════════════════════════════════════════════════════════════

program
  .command("database")
  .description("Database operations")
  .addCommand(
    new Command("seed").description("Seed database").action(() => {
      logger.info("Seeding database...");
      exec("pnpm db:seed");
      logger.success("Database seeded");
    })
  )
  .addCommand(
    new Command("reset").description("Reset database").action(() => {
      logger.warning("This will reset the database!");
      logger.info("Running reset...");
      exec("pnpm db:reset");
      logger.success("Database reset complete");
    })
  )
  .addCommand(
    new Command("studio").description("Open Drizzle Studio").action(() => {
      logger.info("Opening Drizzle Studio...");
      exec("pnpm db:studio");
    })
  );

// ═══════════════════════════════════════════════════════════════════════════
// Admin Command
// ═══════════════════════════════════════════════════════════════════════════

program
  .command("admin")
  .description("Admin operations")
  .addCommand(
    new Command("user:list").description("List all users").action(() => {
      logger.info("Listing users...");
      logger.log("(User listing not yet implemented)");
    })
  )
  .addCommand(
    new Command("cache:clear").description("Clear cache").action(() => {
      logger.info("Clearing cache...");
      exec("pnpm cache:clear");
      logger.success("Cache cleared");
    })
  );

// ═══════════════════════════════════════════════════════════════════════════
// Cache Command
// ═══════════════════════════════════════════════════════════════════════════

program
  .command("cache")
  .description("Cache management")
  .addCommand(
    new Command("clear").description("Clear all caches").action(() => {
      logger.info("Clearing caches...");
      exec("pnpm cache:clear");
      logger.success("All caches cleared");
    })
  )
  .addCommand(
    new Command("stats").description("Show cache statistics").action(() => {
      logger.info("Cache statistics:");
      exec("pnpm cache:stats");
    })
  );

// ═══════════════════════════════════════════════════════════════════════════
// Health Command
// ═══════════════════════════════════════════════════════════════════════════

program
  .command("health")
  .description("Check system health")
  .action(() => {
    logger.info("Checking system health...");
    exec("pnpm health:all");
  });

// ═══════════════════════════════════════════════════════════════════════════
// Config Command
// ═══════════════════════════════════════════════════════════════════════════

program
  .command("config")
  .description("Show current configuration")
  .action(() => {
    logger.info("Current Configuration:");
    logger.log(`Node Environment: ${process.env["NODE_ENV"] || "development"}`);
    logger.log(`Database URL: ${process.env["DATABASE_URL"] ? "✓ Set" : "✗ Not set"}`);
    logger.log(`Auth Secret: ${process.env["AUTH_SECRET"] ? "✓ Set" : "✗ Not set"}`);
    logger.log(`Redis URL: ${process.env["REDIS_URL"] ? "✓ Set" : "✗ Not set"}`);
  });

// ═══════════════════════════════════════════════════════════════════════════
// Validate Command
// ═══════════════════════════════════════════════════════════════════════════

program
  .command("validate")
  .description("Run full validation suite")
  .action(() => {
    logger.info("Running full validation...");
    logger.info("Type checking...");
    exec("pnpm type-check");
    logger.success("✓ Type check passed");

    logger.info("Linting...");
    exec("pnpm lint");
    logger.success("✓ Linting passed");

    logger.info("Building...");
    exec("pnpm build");
    logger.success("✓ Build passed");

    logger.success("All validations passed!");
  });

// ═══════════════════════════════════════════════════════════════════════════
// Dev Command
// ═══════════════════════════════════════════════════════════════════════════

program
  .command("dev")
  .description("Start development server")
  .action(() => {
    logger.info("Starting development server...");
    exec("pnpm dev");
  });

// ═══════════════════════════════════════════════════════════════════════════
// Test Command
// ═══════════════════════════════════════════════════════════════════════════

program
  .command("test")
  .description("Run tests")
  .option("-u, --unit", "Run unit tests only")
  .option("-e, --e2e", "Run E2E tests only")
  .option("--watch", "Watch mode")
  .action((options) => {
    if (options.unit || !options.e2e) {
      logger.info("Running unit tests...");
      exec(options.watch ? "pnpm test:unit" : "pnpm test:unit:run");
    }

    if (options.e2e || !options.unit) {
      logger.info("Running E2E tests...");
      exec("pnpm test");
    }

    logger.success("Tests completed");
  });

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════

program
  .name("cw")
  .description("ComicWise CLI - Development and administration tool")
  .version("1.0.0")
  .parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
