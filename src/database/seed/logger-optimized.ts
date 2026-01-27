/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIFIED SEED LOGGER - Consolidated logging for all seed operations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Provides consistent, clear logging with semantic prefixes and colors
 * Supports verbose mode for detailed operation tracking
 */

import pino from "pino";

type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

interface LogContext {
  component?: string;
  operation?: string;
  duration?: number;
  itemCount?: number;
  [key: string]: any;
}

/**
 * Unified seed logger with structured output
 */
export class SeedLogger {
  private logger: pino.Logger;
  private verboseMode = false;
  private startTime = Date.now();

  constructor() {
    // In constrained environments (dry-run / CI / test) the pino transport
    // can surface thread-stream write errors on process exit. Allow falling
    // back to a plain pino logger (no threaded transport) when the
    // SKIP_ENV_VALIDATION or SEED_DISABLE_PINO_TRANSPORT env vars are set.
    try {
      if (
        process.env["SKIP_ENV_VALIDATION"] === "true" ||
        process.env["SEED_DISABLE_PINO_TRANSPORT"] === "1"
      ) {
        // simple non-transport logger to avoid thread-stream issues in dry-run
        this.logger = pino({ level: process.env["LOG_LEVEL"] ?? "info" });
      } else {
        this.logger = pino({
          level: process.env["LOG_LEVEL"] ?? "info",
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              ignore: "pid,hostname",
              singleLine: false,
            },
          },
        });
      }
    } catch (e) {
      // If transport initialization fails for any reason, fall back to a
      // plain pino instance to ensure the seeder doesn't crash on exit.
      // We intentionally swallow the error but print to console for debug.
      // eslint-disable-next-line no-console
      console.warn("SeedLogger: pino transport init failed, falling back to simple logger:", e);
      this.logger = pino({ level: process.env["LOG_LEVEL"] ?? "info" });
    }
  }

  setVerbose(verbose: boolean): void {
    this.verboseMode = verbose;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Semantic Logging Methods
  // ─────────────────────────────────────────────────────────────────────────

  header(text: string): void {
    console.log("\n" + "═".repeat(78));
    console.log(`  🌱 ${text}`);
    console.log("═".repeat(78) + "\n");
  }

  section(text: string): void {
    console.log("\n" + "─".repeat(78));
    console.log(`  📍 ${text}`);
    console.log("─".repeat(78));
  }

  subsection(text: string): void {
    console.log(`\n  ├─ ${text}`);
  }

  success(message: string, context?: LogContext): void {
    const formatted = `✅ ${message}`;
    console.log(formatted);
    this.logger.info({ ...context, message }, formatted);
  }

  info(message: string, context?: LogContext): void {
    const formatted = `ℹ️  ${message}`;
    if (this.verboseMode) console.log(formatted);
    this.logger.info({ ...context, message }, formatted);
  }

  warn(message: string, context?: LogContext): void {
    const formatted = `⚠️  ${message}`;
    console.warn(formatted);
    this.logger.warn({ ...context, message }, formatted);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const formatted = `❌ ${message}`;
    console.error(formatted);
    if (error) console.error(`   Error: ${error.message}`);
    this.logger.error({ ...context, error, message }, formatted);
  }

  debug(message: string, context?: LogContext): void {
    if (this.verboseMode) {
      const formatted = `🔍 ${message}`;
      console.log(formatted);
      this.logger.debug({ ...context, message }, formatted);
    }
  }

  metric(label: string, value: number | string, unit = ""): void {
    const formatted = `📊 ${label}: ${value}${unit ? ` ${unit}` : ""}`;
    console.log(formatted);
    this.logger.info({ label, value, unit }, formatted);
  }

  summary(stats: Record<string, unknown>): void {
    console.log("\n" + "─".repeat(78));
    console.log("  📈 SUMMARY");
    console.log("─".repeat(78));
    Object.entries(stats).forEach(([key, value]) => {
      const formattedKey = key.replaceAll(/([A-Z])/g, " $1").trim();
      console.log(`  • ${formattedKey}: ${value}`);
    });
  }

  timing(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = (performance.now() - start).toFixed(2);
      const formatted = `⏱️  ${operation}: ${duration}ms`;
      if (this.verboseMode) console.log(formatted);
      return Number.parseFloat(duration);
    };
  }

  footer(): void {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log("\n" + "═".repeat(78));
    console.log(`  ✨ Total time: ${elapsed}s`);
    console.log("═".repeat(78) + "\n");
  }
}

// Export singleton instance
export const logger = new SeedLogger();
