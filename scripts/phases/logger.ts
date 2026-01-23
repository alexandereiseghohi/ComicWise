/**
 * Phase Automation System - Logger
 * Provides consistent, colorized logging with context
 */

import chalk from "chalk";
import { pino } from "pino";

// Create pino logger for file output
const pinoLogger = pino({
  level: process.env["LOG_LEVEL"] || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      singleLine: false,
      translateTime: "SYS:standard",
    },
  },
});

export class PhaseLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: "info" | "warn" | "error" | "debug", message: string, emoji: string) {
    const contextStr = chalk.gray(`[${this.context}]`);
    const msg = `${emoji} ${message}`;

    switch (level) {
      case "info":
        console.log(chalk.cyan(msg), contextStr);
        pinoLogger.info({ context: this.context }, message);
        break;
      case "warn":
        console.log(chalk.yellow(msg), contextStr);
        pinoLogger.warn({ context: this.context }, message);
        break;
      case "error":
        console.log(chalk.red(msg), contextStr);
        pinoLogger.error({ context: this.context }, message);
        break;
      case "debug":
        console.log(chalk.gray(msg), contextStr);
        pinoLogger.debug({ context: this.context }, message);
        break;
    }
  }

  info(message: string) {
    this.log("info", message, "ℹ️");
  }

  success(message: string) {
    console.log(chalk.green(`✅ ${message}`), chalk.gray(`[${this.context}]`));
    pinoLogger.info({ context: this.context }, `[SUCCESS] ${message}`);
  }

  error(message: string) {
    this.log("error", message, "❌");
  }

  warn(message: string) {
    this.log("warn", message, "⚠️");
  }

  debug(message: string) {
    this.log("debug", message, "🔍");
  }

  pending(message: string) {
    this.log("info", message, "🔄");
  }

  header(message: string) {
    console.log("");
    console.log(chalk.bold.cyan("┌─────────────────────────────────────────────────────────┐"));
    console.log(chalk.bold.cyan(`│ ${message.padEnd(57)} │`));
    console.log(chalk.bold.cyan("└─────────────────────────────────────────────────────────┘"));
    console.log("");
  }

  section(message: string) {
    console.log("");
    console.log(chalk.bold.blue(`► ${message}`));
    console.log(chalk.blue("─".repeat(60)));
  }

  table(data: Record<string, string | number>[]) {
    console.log("");
    if (data.length === 0 || !data[0]) return;

    const keys = Object.keys(data[0]);
    const widths = keys.map((key) =>
      Math.max(key.length, ...data.map((row) => String(row[key] ?? "").length))
    );

    // Header
    console.log(keys.map((key, i) => chalk.bold(key.padEnd(widths[i] ?? 0))).join("  "));
    console.log((widths || []).map((w) => "─".repeat(w ?? 0)).join("  "));

    // Rows
    data.forEach((row) => {
      console.log(keys.map((key, i) => String(row[key] ?? "").padEnd(widths[i] ?? 0)).join("  "));
    });
    console.log("");
  }

  divider() {
    console.log(chalk.gray("─".repeat(60)));
  }

  newline() {
    console.log("");
  }
}

// Global logger instance
export const logger = new PhaseLogger("phases");
