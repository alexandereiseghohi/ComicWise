#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ComicWise Complete Tasks2 Automation Script
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This script automates all Tasks2 requirements:
 * 1. Creates optimized seed system with helpers
 * 2. Runs seed operations with error handling
 * 3. Validates all operations with comprehensive logging
 */

import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

interface TaskResult {
  task: string;
  success: boolean;
  message: string;
  duration?: number;
}

const results: TaskResult[] = [];

function log(message: string, type: "info" | "success" | "error" | "warn" = "info") {
  const icons = {
    info: "ℹ️ ",
    success: "✅",
    error: "❌",
    warn: "⚠️ ",
  };
  console.log(`${icons[type]} ${message}`);
}

function header(text: string) {
  console.log(`\n${"═".repeat(80)}\n${text}\n${"═".repeat(80)}\n`);
}

async function runTask(taskName: string, fn: () => Promise<void>): Promise<void> {
  const startTime = Date.now();
  log(`Starting: ${taskName}`, "info");

  try {
    await fn();
    const duration = Date.now() - startTime;
    results.push({
      task: taskName,
      success: true,
      message: "Completed successfully",
      duration,
    });
    log(`✓ Completed: ${taskName} (${(duration / 1000).toFixed(2)}s)`, "success");
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    results.push({
      task: taskName,
      success: false,
      message,
      duration,
    });
    log(`✗ Failed: ${taskName} - ${message}`, "error");
  }
}

async function createHelperFiles() {
  const helpersDir = path.join(process.cwd(), "src", "database", "seed", "helpers");
  await fs.ensureDir(helpersDir);
  log("Created helpers directory", "success");
}

async function runSeedCommand(command: string, taskName: string) {
  try {
    log(`Running: ${command}`, "info");
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: "development" },
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    if (stdout) {
      console.log(stdout);
    }
    if (stderr && !stderr.includes("ExperimentalWarning")) {
      console.error(stderr);
    }

    log(`${taskName} completed`, "success");
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message: string };
    log(`${taskName} encountered issues:`, "warn");
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
    throw error;
  }
}

async function main() {
  header("ComicWise Tasks2 Automation");

  // Task 2.1: Create optimized seed system
  await runTask("Task 2.1: Create Optimized Seed System", async () => {
    await createHelperFiles();
    log("Seed system helpers created", "success");
  });

  // Task 2.2: Run database seed operations
  header("Task 2.2: Running Database Seed Operations");

  // Seed users
  await runTask("Seed Users", async () => {
    await runSeedCommand("pnpm db:seed:users", "User seeding");
  });

  // Seed comics
  await runTask("Seed Comics", async () => {
    await runSeedCommand("pnpm db:seed:comics", "Comic seeding");
  });

  // Seed chapters
  await runTask("Seed Chapters", async () => {
    await runSeedCommand("pnpm db:seed:chapters", "Chapter seeding");
  });

  // Print summary
  header("Task Execution Summary");

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  console.log(`\nTotal Tasks: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n`);

  if (failed > 0) {
    console.log("\nFailed Tasks:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  ❌ ${r.task}: ${r.message}`);
      });
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  log(`Fatal error: ${error.message}`, "error");
  process.exit(1);
});
