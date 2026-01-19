/**
 * Seed Logger
 * Enhanced logging for seed operations
 * Re-exports from consolidated logger with seed-specific utilities
 */

import { seedLogger } from "@/lib/logger";

export type LogLevel = "info" | "success" | "warn" | "error" | "debug";

/**
 * Seed logger with formatted output
 */
export class SeedLogger {
  private verboseMode = false;

  setVerbose(verbose: boolean) {
    this.verboseMode = verbose;
  }

  header(text: string) {
    console.log("\n" + "═".repeat(60));
    console.log(`  ${text}`);
    console.log("═".repeat(60) + "\n");
  }

  section(text: string) {
    console.log("\n" + "─".repeat(60));
    console.log(`  ${text}`);
    console.log("─".repeat(60));
  }

  footer() {
    console.log("═".repeat(60) + "\n");
  }

  info(message: string) {
    console.log(`ℹ️  ${message}`);
    seedLogger.info(message);
  }

  success(message: string) {
    console.log(`✅ ${message}`);
    seedLogger.info(message);
  }

  warn(message: string) {
    console.warn(`⚠️  ${message}`);
    seedLogger.warn(message);
  }

  error(message: string) {
    console.error(`❌ ${message}`);
    seedLogger.error(message);
  }

  debug(message: string) {
    if (this.verboseMode) {
      console.log(`🔍 ${message}`);
      seedLogger.debug(message);
    }
  }

  stat(label: string, value: string | number) {
    console.log(`   ${label}: ${value}`);
  }
}

export const logger = new SeedLogger();

/**
 * Progress tracker for batch operations
 */
export class ProgressTracker {
  private current = 0;
  private readonly total: number;
  private readonly name: string;
  private readonly startTime: number;
  private created = 0;
  private updated = 0;
  private skipped = 0;
  private errors = 0;

  constructor(name: string, total: number) {
    this.name = name;
    this.total = total;
    this.startTime = Date.now();
  }

  incrementCreated(message?: string) {
    this.current++;
    this.created++;
    this.log("Created", message);
  }

  incrementUpdated(message?: string) {
    this.current++;
    this.updated++;
    this.log("Updated", message);
  }

  incrementSkipped(message?: string) {
    this.current++;
    this.skipped++;
    this.log("Skipped", message);
  }

  incrementError(message?: string) {
    this.current++;
    this.errors++;
    this.log("Error", message);
  }

  private log(status: string, message?: string) {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const message_ = message ? ` - ${message}` : "";
    console.log(
      `[${this.name}] ${this.current}/${this.total} (${percentage}%) - ${elapsed}s - ${status}${message_}`
    );
  }

  complete() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\n[${this.name}] Summary:`);
    console.log(`   Created:  ${this.created}`);
    console.log(`   Updated:  ${this.updated}`);
    console.log(`   Skipped:  ${this.skipped}`);
    console.log(`   Errors:   ${this.errors}`);
    console.log(`   Time:     ${elapsed}s`);
    console.log(`   Total:    ${this.total}`);
  }
}
