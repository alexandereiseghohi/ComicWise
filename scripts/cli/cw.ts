#!/usr/bin/env node
/**
 * ComicWise CLI - Comprehensive management tool
 *
 * A complete command-line interface for managing all aspects of the ComicWise platform.
 * Provides unified access to development, database, testing, deployment, and maintenance operations.
 *
 * @version 1.0.0
 * @author ComicWise Team
 */

import chalk from "chalk";
import { execSync } from "child_process";
import { Command } from "commander";

const program = new Command();

// Version and description
program
  .name("cw")
  .description("ComicWise CLI - Comprehensive platform management tool")
  .version("1.0.0");

// ═══════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════

function runCommand(command: string, options: { silent?: boolean } = {}) {
  try {
    if (!options.silent) {
      console.log(chalk.gray(`› ${command}`));
    }
    const output = execSync(command, {
      stdio: options.silent ? "pipe" : "inherit",
      encoding: "utf-8",
    });
    return output;
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`✗ Command failed: ${command}`));
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

function printHeader(text: string) {
  console.log("");
  console.log(chalk.cyan("═".repeat(70)));
  console.log(chalk.cyan.bold(`  ${text}`));
  console.log(chalk.cyan("═".repeat(70)));
  console.log("");
}

function printSuccess(text: string) {
  console.log(chalk.green(`✓ ${text}`));
}

function printInfo(text: string) {
  console.log(chalk.blue(`ℹ ${text}`));
}

function printWarning(text: string) {
  console.log(chalk.yellow(`⚠ ${text}`));
}

// ═══════════════════════════════════════════════════
// Database Commands
// ═══════════════════════════════════════════════════

const db = program.command("db").description("Database operations");

db.command("push")
  .description("Push schema to database")
  .action(() => {
    printHeader("Database Schema Push");
    runCommand("pnpm db:push");
    printSuccess("Schema pushed successfully");
  });

db.command("pull")
  .description("Pull schema from database")
  .action(() => {
    printHeader("Database Schema Pull");
    runCommand("pnpm db:pull");
    printSuccess("Schema pulled successfully");
  });

db.command("generate")
  .description("Generate migrations")
  .action(() => {
    printHeader("Generate Migrations");
    runCommand("pnpm db:generate");
    printSuccess("Migrations generated");
  });

db.command("migrate")
  .description("Run migrations")
  .action(() => {
    printHeader("Run Migrations");
    runCommand("pnpm db:migrate");
    printSuccess("Migrations completed");
  });

db.command("studio")
  .description("Open Drizzle Studio")
  .action(() => {
    printInfo("Opening Drizzle Studio...");
    runCommand("pnpm db:studio");
  });

db.command("seed")
  .description("Seed database with sample data")
  .option("-u, --users", "Seed only users")
  .option("-c, --comics", "Seed only comics")
  .option("-h, --chapters", "Seed only chapters")
  .option("-v, --verbose", "Verbose output")
  .option("-d, --dry-run", "Dry run (validation only)")
  .action((options) => {
    printHeader("Database Seeding");

    let cmd = "pnpm db:seed";
    if (options.users) cmd = "pnpm db:seed:users";
    if (options.comics) cmd = "pnpm db:seed:comics";
    if (options.chapters) cmd = "pnpm db:seed:chapters";
    if (options.verbose) cmd += " --verbose";
    if (options.dryRun) cmd += " --dry-run";

    runCommand(cmd);
    printSuccess("Seeding completed");
  });

db.command("reset")
  .description("Reset database (drop, push, seed)")
  .option("--hard", "Hard reset (regenerate schema)")
  .action((options) => {
    printHeader("Database Reset");
    printWarning("This will delete all data!");

    const cmd = options.hard ? "pnpm db:reset:hard" : "pnpm db:reset";
    runCommand(cmd);
    printSuccess("Database reset completed");
  });

// ═══════════════════════════════════════════════════
// Development Commands
// ═══════════════════════════════════════════════════

const dev = program.command("dev").description("Development operations");

dev
  .command("start")
  .description("Start development server")
  .option("--debug", "Start with debugger")
  .option("--https", "Use HTTPS")
  .action((options) => {
    printHeader("Starting Development Server");

    let cmd = "pnpm dev";
    if (options.debug) cmd = "pnpm dev:debug";
    if (options.https) cmd = "pnpm dev:https";

    runCommand(cmd);
  });

dev
  .command("build")
  .description("Build for production")
  .option("--analyze", "Analyze bundle size")
  .option("--debug", "Build with debug info")
  .action((options) => {
    printHeader("Building Application");

    let cmd = "pnpm build";
    if (options.analyze) cmd = "pnpm build:analyze";
    if (options.debug) cmd = "pnpm build:debug";

    runCommand(cmd);
    printSuccess("Build completed");
  });

dev
  .command("clean")
  .description("Clean build artifacts")
  .option("--all", "Clean all (including node_modules)")
  .action((options) => {
    printHeader("Cleaning Build Artifacts");

    const cmd = options.all ? "pnpm clean:all" : "pnpm clean";
    runCommand(cmd);
    printSuccess("Cleanup completed");
  });

// ═══════════════════════════════════════════════════
// Testing Commands
// ═══════════════════════════════════════════════════

const test = program.command("test").description("Testing operations");

test
  .command("all")
  .description("Run all tests")
  .action(() => {
    printHeader("Running All Tests");
    runCommand("pnpm test:all");
  });

test
  .command("unit")
  .description("Run unit tests")
  .option("-w, --watch", "Watch mode")
  .option("-c, --coverage", "Generate coverage")
  .action((options) => {
    printHeader("Running Unit Tests");

    let cmd = "pnpm test:unit";
    if (options.watch) cmd = "pnpm test:unit:watch";
    if (options.coverage) cmd = "pnpm test:unit:coverage";

    runCommand(cmd);
  });

test
  .command("e2e")
  .description("Run E2E tests")
  .option("--ui", "Run with UI")
  .option("--headed", "Run headed")
  .option("--debug", "Debug mode")
  .action((options) => {
    printHeader("Running E2E Tests");

    let cmd = "pnpm test";
    if (options.ui) cmd = "pnpm test:ui";
    if (options.headed) cmd = "pnpm test:headed";
    if (options.debug) cmd = "pnpm test:debug";

    runCommand(cmd);
  });

// ═══════════════════════════════════════════════════
// Code Quality Commands
// ═══════════════════════════════════════════════════

const quality = program.command("quality").alias("q").description("Code quality operations");

quality
  .command("lint")
  .description("Run linter")
  .option("--fix", "Auto-fix issues")
  .option("--strict", "Strict mode (no warnings)")
  .action((options) => {
    printHeader("Running Linter");

    let cmd = "pnpm lint";
    if (options.fix) cmd = "pnpm lint:fix";
    if (options.strict) cmd = "pnpm lint:strict";

    runCommand(cmd);
  });

quality
  .command("format")
  .description("Format code")
  .option("--check", "Check only (no write)")
  .action((options) => {
    printHeader("Formatting Code");

    const cmd = options.check ? "pnpm format:check" : "pnpm format";
    runCommand(cmd);
    if (!options.check) printSuccess("Code formatted");
  });

quality
  .command("type-check")
  .description("Run TypeScript type checking")
  .option("-w, --watch", "Watch mode")
  .action((options) => {
    printHeader("Type Checking");

    const cmd = options.watch ? "pnpm type-check:watch" : "pnpm type-check";
    runCommand(cmd);
  });

quality
  .command("validate")
  .description("Run all checks (type-check, lint, format)")
  .option("--quick", "Quick validation (skip format check)")
  .action((options) => {
    printHeader("Validating Code Quality");

    const cmd = options.quick ? "pnpm validate:quick" : "pnpm validate";
    runCommand(cmd);
    printSuccess("Validation completed");
  });

// ═══════════════════════════════════════════════════
// Cache Commands
// ═══════════════════════════════════════════════════

const cache = program.command("cache").description("Cache operations");

cache
  .command("clear")
  .description("Clear application cache")
  .action(() => {
    printHeader("Clearing Cache");
    runCommand("pnpm cache:clear");
    printSuccess("Cache cleared");
  });

cache
  .command("stats")
  .description("Show cache statistics")
  .action(() => {
    printHeader("Cache Statistics");
    runCommand("pnpm cache:stats");
  });

// ═══════════════════════════════════════════════════
// Health Commands
// ═══════════════════════════════════════════════════

const health = program.command("health").description("System health checks");

health
  .command("check")
  .description("Run health check")
  .action(() => {
    printHeader("System Health Check");
    runCommand("pnpm health:check");
  });

health
  .command("db")
  .description("Check database connection")
  .action(() => {
    printHeader("Database Health Check");
    runCommand("pnpm health:db");
  });

health
  .command("redis")
  .description("Check Redis connection")
  .action(() => {
    printHeader("Redis Health Check");
    runCommand("pnpm health:redis");
  });

health
  .command("all")
  .description("Run all health checks")
  .action(() => {
    printHeader("Complete Health Check");
    runCommand("pnpm health:all");
  });

// ═══════════════════════════════════════════════════
// Setup Commands
// ═══════════════════════════════════════════════════

const setup = program.command("setup").description("Project setup operations");

setup
  .command("init")
  .description("Initial project setup")
  .action(() => {
    printHeader("Initial Project Setup");
    runCommand("pnpm setup");
    printSuccess("Setup completed");
  });

setup
  .command("clean")
  .description("Clean setup (fresh install)")
  .action(() => {
    printHeader("Clean Setup");
    printWarning("This will delete node_modules and reinstall");
    runCommand("pnpm setup:clean");
    printSuccess("Clean setup completed");
  });

setup
  .command("full")
  .description("Full setup (clean + build)")
  .action(() => {
    printHeader("Full Setup");
    runCommand("pnpm setup:full");
    printSuccess("Full setup completed");
  });

// ═══════════════════════════════════════════════════
// Optimization Commands
// ═══════════════════════════════════════════════════

const optimize = program.command("optimize").alias("opt").description("Project optimization");

optimize
  .command("all")
  .description("Run comprehensive optimization")
  .action(() => {
    printHeader("Comprehensive Optimization");
    runCommand("pnpm optimize:all");
    printSuccess("Optimization completed");
  });

optimize
  .command("types")
  .description("Optimize TypeScript types")
  .action(() => {
    printHeader("Type Optimization");
    runCommand("pnpm optimize:types");
    printSuccess("Types optimized");
  });

optimize
  .command("camelcase")
  .description("Convert filenames to CamelCase")
  .option("--execute", "Execute changes (default: dry-run)")
  .action((options) => {
    printHeader("CamelCase Conversion");

    if (options.execute) {
      runCommand("pnpm exec tsx scripts/camelCaseConverter2025.ts --execute");
      printSuccess("Files renamed");
    } else {
      printInfo("Running dry-run (use --execute to apply changes)");
      runCommand("pnpm exec tsx scripts/camelCaseConverter2025.ts");
    }
  });

// ═══════════════════════════════════════════════════
// Cleanup Commands
// ═══════════════════════════════════════════════════

program
  .command("cleanup")
  .description("Clean up project (remove duplicates, unused files)")
  .option("--dry-run", "Preview changes without executing")
  .action((options) => {
    printHeader("Project Cleanup");

    const cmd = options.dryRun ? "pnpm cleanup:dry-run" : "pnpm cleanup";
    runCommand(cmd);
    if (!options.dryRun) printSuccess("Cleanup completed");
  });

// ═══════════════════════════════════════════════════
// Deployment Commands
// ═══════════════════════════════════════════════════

const deploy = program.command("deploy").description("Deployment operations");

deploy
  .command("preview")
  .description("Deploy to preview environment")
  .action(() => {
    printHeader("Deploying to Preview");
    runCommand("pnpm deploy:preview");
    printSuccess("Preview deployment completed");
  });

deploy
  .command("production")
  .description("Deploy to production")
  .action(() => {
    printHeader("Deploying to Production");
    printWarning("Deploying to production!");
    runCommand("pnpm deploy:vercel");
    printSuccess("Production deployment completed");
  });

// ═══════════════════════════════════════════════════
// Docker Commands
// ═══════════════════════════════════════════════════

const docker = program.command("docker").description("Docker operations");

docker
  .command("up")
  .description("Start Docker containers")
  .action(() => {
    printHeader("Starting Docker Containers");
    runCommand("pnpm docker:up");
    printSuccess("Containers started");
  });

docker
  .command("down")
  .description("Stop Docker containers")
  .action(() => {
    printHeader("Stopping Docker Containers");
    runCommand("pnpm docker:down");
    printSuccess("Containers stopped");
  });

docker
  .command("build")
  .description("Build Docker images")
  .action(() => {
    printHeader("Building Docker Images");
    runCommand("pnpm docker:build");
    printSuccess("Images built");
  });

docker
  .command("clean")
  .description("Clean Docker containers and volumes")
  .action(() => {
    printHeader("Cleaning Docker Resources");
    runCommand("pnpm docker:clean");
    printSuccess("Docker cleaned");
  });

docker
  .command("logs")
  .description("Show Docker logs")
  .action(() => {
    runCommand("pnpm docker:logs");
  });

// ═══════════════════════════════════════════════════
// Scaffold Commands
// ═══════════════════════════════════════════════════

const scaffold = program
  .command("scaffold")
  .alias("new")
  .description("Generate new components/files");

scaffold
  .command("component <name>")
  .description("Generate new component")
  .action((name) => {
    printHeader(`Scaffolding Component: ${name}`);
    runCommand(`pnpm scaffold:component --name=${name}`);
    printSuccess(`Component ${name} created`);
  });

scaffold
  .command("hook <name>")
  .description("Generate new hook")
  .action((name) => {
    printHeader(`Scaffolding Hook: ${name}`);
    runCommand(`pnpm scaffold:hook --name=${name}`);
    printSuccess(`Hook ${name} created`);
  });

scaffold
  .command("action <name>")
  .description("Generate new server action")
  .action((name) => {
    printHeader(`Scaffolding Action: ${name}`);
    runCommand(`pnpm scaffold:action --name=${name}`);
    printSuccess(`Action ${name} created`);
  });

// ═══════════════════════════════════════════════════
// Info Commands
// ═══════════════════════════════════════════════════

program
  .command("info")
  .description("Display project information")
  .action(() => {
    printHeader("ComicWise Project Information");

    console.log(chalk.bold("Version:"), "1.0.0");
    console.log(chalk.bold("Node:"), process.version);

    try {
      const pnpmVersion = runCommand("pnpm --version", { silent: true });
      console.log(chalk.bold("PNPM:"), pnpmVersion.trim());
    } catch {
      console.log(chalk.bold("PNPM:"), "Not found");
    }

    console.log("");
    console.log(chalk.bold("Tech Stack:"));
    console.log("  • Next.js 16 (App Router + Turbopack)");
    console.log("  • React 19");
    console.log("  • TypeScript 5");
    console.log("  • PostgreSQL (Drizzle ORM)");
    console.log("  • NextAuth v5");
    console.log("  • Tailwind CSS 4");
    console.log("");
  });

// Parse and execute
program.parse();
