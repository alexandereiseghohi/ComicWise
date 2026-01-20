#!/usr/bin/env node

/**
 * ComicWise CLI - Unified Command-Line Interface
 *
 * A comprehensive CLI tool for managing all aspects of the ComicWise platform.
 * Provides unified access to development, database, testing, deployment, and maintenance operations.
 */

import chalk from "chalk";
import { execSync } from "child_process";
import { Command } from "commander";
import ora from "ora";

const program = new Command();

// Helper function to execute commands with spinner
const executeCommand = (command: string, description: string, silent = false) => {
  const spinner = ora(description).start();
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    });
    spinner.succeed(chalk.green(description));
    return output;
  } catch (error) {
    spinner.fail(chalk.red(`Failed: ${description}`));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
};

// ═══════════════════════════════════════════════════
// CLI CONFIGURATION
// ═══════════════════════════════════════════════════

program
  .name("comicwise")
  .description("ComicWise Platform CLI - Unified development and operations tool")
  .version("1.0.0");

// ═══════════════════════════════════════════════════
// DATABASE COMMANDS
// ═══════════════════════════════════════════════════

const db = program.command("db").description("Database operations");

db.command("generate")
  .description("Generate database migrations")
  .action(() => {
    console.log(chalk.blue("\n📦 Generating database migrations...\n"));
    executeCommand("pnpm db:generate", "Generating migrations");
  });

db.command("migrate")
  .description("Run database migrations")
  .action(() => {
    console.log(chalk.blue("\n🔄 Running database migrations...\n"));
    executeCommand("pnpm db:migrate", "Running migrations");
  });

db.command("push")
  .description("Push schema changes to database")
  .action(() => {
    console.log(chalk.blue("\n⬆️  Pushing schema to database...\n"));
    executeCommand("pnpm db:push", "Pushing schema");
  });

db.command("studio")
  .description("Open Drizzle Studio")
  .action(() => {
    console.log(chalk.blue("\n🎨 Opening Drizzle Studio...\n"));
    executeCommand("pnpm db:studio", "Opening studio", false);
  });

db.command("seed")
  .description("Seed database with test data")
  .option("-d, --dry-run", "Run seed in dry-run mode")
  .action((options) => {
    if (options.dryRun) {
      console.log(chalk.blue("\n🌱 Running database seed (DRY RUN)...\n"));
      executeCommand("pnpm db:seed:dry-run", "Dry run seed");
    } else {
      console.log(chalk.blue("\n🌱 Seeding database...\n"));
      executeCommand("pnpm db:seed", "Seeding database");
    }
  });

db.command("reset")
  .description("Reset database (WARNING: Destructive)")
  .action(() => {
    console.log(chalk.red("\n⚠️  WARNING: This will delete all data!\n"));
    executeCommand("pnpm db:reset", "Resetting database");
  });

// ═══════════════════════════════════════════════════
// DEVELOPMENT COMMANDS
// ═══════════════════════════════════════════════════

const dev = program.command("dev").description("Development operations");

dev
  .command("start")
  .description("Start development server")
  .action(() => {
    console.log(chalk.blue("\n🚀 Starting development server...\n"));
    executeCommand("pnpm dev", "Starting dev server", false);
  });

dev
  .command("build")
  .description("Build production bundle")
  .action(() => {
    console.log(chalk.blue("\n🔨 Building production bundle...\n"));
    executeCommand("pnpm build", "Building bundle");
  });

dev
  .command("start-prod")
  .description("Start production server")
  .action(() => {
    console.log(chalk.blue("\n🚀 Starting production server...\n"));
    executeCommand("pnpm start", "Starting production server", false);
  });

// ═══════════════════════════════════════════════════
// CODE QUALITY COMMANDS
// ═══════════════════════════════════════════════════

const quality = program.command("quality").alias("q").description("Code quality operations");

quality
  .command("lint")
  .description("Run ESLint")
  .option("-f, --fix", "Auto-fix issues")
  .action((options) => {
    console.log(chalk.blue("\n🔍 Running ESLint...\n"));
    const command = options.fix ? "pnpm lint:fix" : "pnpm lint";
    executeCommand(command, "Linting code");
  });

quality
  .command("format")
  .description("Format code with Prettier")
  .action(() => {
    console.log(chalk.blue("\n✨ Formatting code...\n"));
    executeCommand("pnpm format", "Formatting code");
  });

quality
  .command("type-check")
  .description("Run TypeScript type checking")
  .action(() => {
    console.log(chalk.blue("\n🔎 Running type check...\n"));
    executeCommand("pnpm type-check", "Type checking");
  });

quality
  .command("validate")
  .description("Run all validations (lint, format, type-check)")
  .action(() => {
    console.log(chalk.blue("\n✅ Running all validations...\n"));
    executeCommand("pnpm validate", "Validating codebase");
  });

// ═══════════════════════════════════════════════════
// TESTING COMMANDS
// ═══════════════════════════════════════════════════

const test = program.command("test").alias("t").description("Testing operations");

test
  .command("unit")
  .description("Run unit tests")
  .option("-w, --watch", "Watch mode")
  .option("-c, --coverage", "Generate coverage report")
  .action((options) => {
    console.log(chalk.blue("\n🧪 Running unit tests...\n"));
    let command = "pnpm test:unit";
    if (options.watch) command += " --watch";
    if (options.coverage) command += " --coverage";
    executeCommand(command, "Running unit tests", false);
  });

test
  .command("e2e")
  .description("Run E2E tests")
  .action(() => {
    console.log(chalk.blue("\n🎭 Running E2E tests...\n"));
    executeCommand("pnpm test:e2e", "Running E2E tests");
  });

test
  .command("all")
  .description("Run all tests")
  .action(() => {
    console.log(chalk.blue("\n🧪 Running all tests...\n"));
    executeCommand("pnpm test", "Running all tests");
  });

// ═══════════════════════════════════════════════════
// DOCKER COMMANDS
// ═══════════════════════════════════════════════════

const docker = program.command("docker").description("Docker operations");

docker
  .command("up")
  .description("Start Docker containers")
  .option("-d, --detach", "Run in detached mode")
  .action((options) => {
    console.log(chalk.blue("\n🐳 Starting Docker containers...\n"));
    const command = options.detach ? "docker-compose up -d" : "docker-compose up";
    executeCommand(command, "Starting containers", !options.detach);
  });

docker
  .command("down")
  .description("Stop Docker containers")
  .action(() => {
    console.log(chalk.blue("\n🛑 Stopping Docker containers...\n"));
    executeCommand("docker-compose down", "Stopping containers");
  });

docker
  .command("logs")
  .description("View Docker logs")
  .option("-f, --follow", "Follow log output")
  .action((options) => {
    console.log(chalk.blue("\n📋 Viewing Docker logs...\n"));
    const command = options.follow ? "docker-compose logs -f" : "docker-compose logs";
    executeCommand(command, "Viewing logs", false);
  });

docker
  .command("rebuild")
  .description("Rebuild Docker containers")
  .action(() => {
    console.log(chalk.blue("\n🔄 Rebuilding Docker containers...\n"));
    executeCommand("docker-compose up --build -d", "Rebuilding containers");
  });

// ═══════════════════════════════════════════════════
// UTILITY COMMANDS
// ═══════════════════════════════════════════════════

program
  .command("clean")
  .description("Clean build artifacts and dependencies")
  .option("-a, --all", "Clean everything including node_modules")
  .action((options) => {
    console.log(chalk.blue("\n🧹 Cleaning project...\n"));

    const spinner = ora("Removing build artifacts").start();
    executeCommand("rm -rf .next out dist", "Removing build artifacts", true);
    spinner.succeed();

    if (options.all) {
      const spinner2 = ora("Removing node_modules").start();
      executeCommand("rm -rf node_modules", "Removing node_modules", true);
      spinner2.succeed();

      console.log(
        chalk.green("\n✨ Clean complete! Run pnpm install to reinstall dependencies.\n")
      );
    } else {
      console.log(chalk.green("\n✨ Clean complete!\n"));
    }
  });

program
  .command("setup")
  .description("Initial project setup")
  .action(() => {
    console.log(chalk.blue("\n🚀 Setting up ComicWise...\n"));

    executeCommand("pnpm install", "Installing dependencies");
    executeCommand("pnpm db:generate", "Generating database schema");
    executeCommand("pnpm db:push", "Pushing schema to database");

    console.log(chalk.green("\n✨ Setup complete! Run `pnpm dev` to start developing.\n"));
  });

program
  .command("status")
  .description("Show project status")
  .action(() => {
    console.log(chalk.blue("\n📊 ComicWise Status\n"));
    console.log(chalk.yellow("─".repeat(50)));

    // Git status
    try {
      const gitBranch = execSync("git branch --show-current", { encoding: "utf-8" }).trim();
      const gitStatus = execSync("git status --short", { encoding: "utf-8" }).trim();
      console.log(chalk.cyan("Git Branch:"), gitBranch);
      console.log(chalk.cyan("Git Status:"), gitStatus || "Clean");
    } catch {
      console.log(chalk.gray("Git: Not a git repository"));
    }

    console.log(chalk.yellow("─".repeat(50)));

    // Node/pnpm versions
    try {
      const nodeVersion = execSync("node --version", { encoding: "utf-8" }).trim();
      const pnpmVersion = execSync("pnpm --version", { encoding: "utf-8" }).trim();
      console.log(chalk.cyan("Node:"), nodeVersion);
      console.log(chalk.cyan("pnpm:"), pnpmVersion);
    } catch {
      console.log(chalk.red("Error getting versions"));
    }

    console.log(chalk.yellow("─".repeat(50)));
    console.log();
  });

// ═══════════════════════════════════════════════════
// PARSE AND EXECUTE
// ═══════════════════════════════════════════════════

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
