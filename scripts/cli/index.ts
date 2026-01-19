#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMICWISE CLI - Enhanced Command Line Interface
 * ═══════════════════════════════════════════════════════════════════════════
 */

import chalk from "chalk";
import { Command } from "commander";
import { cache } from "./commands/cache";
import { ci } from "./commands/ci";
import { db as database } from "./commands/db";
import { health } from "./commands/health";
import { queue } from "./commands/queue";
import { upload } from "./commands/upload";

const program = new Command();

program.name("cw").description("ComicWise CLI - Powerful development tools").version("1.0.0");

// ═══════════════════════════════════════════════════
// REGISTER COMMANDS
// ═══════════════════════════════════════════════════

program
  .command("cache <action>")
  .description("Cache management (clear, stats, flush)")
  .action(cache);
program
  .command("ci <action>")
  .description("CI/CD operations (test, build, check, deploy)")
  .action(ci);
program
  .command("db <action>")
  .description("Database operations (migrate, seed, reset, studio)")
  .action(database);
program.command("health [check]").description("Health check operations").action(health);
program
  .command("queue <action>")
  .description("Queue management (worker, stats, clean)")
  .action(queue);
program
  .command("upload <action>")
  .description("Upload operations (bulk, test)")
  .option("-d, --dir <directory>", "Directory")
  .action(upload);

// ═══════════════════════════════════════════════════
// HELP COMMAND
// ═══════════════════════════════════════════════════

program
  .command("help")
  .description("Show detailed help")
  .action(() => {
    console.log(chalk.cyan("\n╔══════════════════════════════════════════════════════════════╗"));
    console.log(chalk.cyan("║             ComicWise CLI - Quick Reference                  ║"));
    console.log(chalk.cyan("╚══════════════════════════════════════════════════════════════╝\n"));

    console.log(chalk.yellow("Database Commands:"));
    console.log(chalk.gray("  cw db push           Push schema changes"));
    console.log(chalk.gray("  cw db seed           Seed the database"));
    console.log(chalk.gray("  cw db studio         Open Drizzle Studio"));
    console.log(chalk.gray("  cw db reset          Reset database\n"));

    console.log(chalk.yellow("Cache Commands:"));
    console.log(chalk.gray("  cw cache clear       Clear all cache"));
    console.log(chalk.gray("  cw cache stats       Show cache statistics"));
    console.log(chalk.gray("  cw cache flush       Flush Redis cache\n"));

    console.log(chalk.yellow("Health Commands:"));
    console.log(chalk.gray("  cw health check      Run system health check"));
    console.log(chalk.gray("  cw health db         Check database connection"));
    console.log(chalk.gray("  cw health redis      Check Redis connection\n"));

    console.log(chalk.yellow("Queue Commands:"));
    console.log(chalk.gray("  cw queue worker      Start queue worker"));
    console.log(chalk.gray("  cw queue stats       Show queue statistics"));
    console.log(chalk.gray("  cw queue clean       Clean failed jobs\n"));

    console.log(chalk.yellow("Upload Commands:"));
    console.log(chalk.gray("  cw upload bulk       Bulk upload images"));
    console.log(chalk.gray("  cw upload test       Test upload provider\n"));

    console.log(chalk.yellow("Scaffold Commands:"));
    console.log(chalk.gray("  cw scaffold          Interactive scaffolding"));
    console.log(chalk.gray("  cw scaffold page     Create new page"));
    console.log(chalk.gray("  cw scaffold api      Create new API route\n"));

    console.log(chalk.yellow("CI Commands:"));
    console.log(chalk.gray("  cw ci check          Run CI checks"));
    console.log(chalk.gray("  cw ci lint           Run linters"));
    console.log(chalk.gray("  cw ci test           Run tests\n"));
  });

// ═══════════════════════════════════════════════════
// PARSE ARGUMENTS
// ═══════════════════════════════════════════════════

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
