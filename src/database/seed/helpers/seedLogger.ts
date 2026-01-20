/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Enhanced Seed Logger
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose:
 *   - Provide structured logging for seeding operations
 *   - Track progress with statistics and counters
 *   - Filter output based on verbosity level
 *   - Format console output with visual separators
 *   - Export logs to JSON for analysis
 *
 * Features:
 *   - Multiple log levels: debug, info, success, warn, error
 *   - Automatic timestamp tracking
 *   - Statistics collection and reporting
 *   - Colored console output
 *   - JSON log export capability
 *
 * @module seedLogger
 */

/**
 * Log entry format for structured logging
 */
export interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "success" | "warn" | "error";
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Configuration for logger behavior
 */
export interface LoggerConfig {
  verbose: boolean;
  includeTimestamps: boolean;
  includeContext: boolean;
  maxHistorySize: number;
}

/**
 * Enhanced logger for seed operations
 */
export class Logger {
  private verbose: boolean;
  private includeTimestamps: boolean;
  private includeContext: boolean;
  private history: LogEntry[] = [];
  private maxHistorySize: number;
  private startTime: number = Date.now();

  /**
   * Creates a new Logger instance
   *
   * @param {Partial<LoggerConfig>} config - Logger configuration
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.verbose = config.verbose ?? false;
    this.includeTimestamps = config.includeTimestamps ?? true;
    this.includeContext = config.includeContext ?? false;
    this.maxHistorySize = config.maxHistorySize ?? 1000;
  }

  /**
   * Formats a message with optional timestamp and context
   *
   * @param {string} message - The message to format
   * @param {Record<string, unknown>} context - Optional context data
   * @returns {string} Formatted message
   */
  private formatMessage(message: string, context?: Record<string, unknown>): string {
    let formatted = message;

    if (this.includeTimestamps) {
      const timestamp = new Date().toISOString();
      formatted = `[${timestamp}] ${formatted}`;
    }

    if (this.includeContext && context && Object.keys(context).length > 0) {
      const contextStr = Object.entries(context)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(" ");
      formatted = `${formatted} {${contextStr}}`;
    }

    return formatted;
  }

  /**
   * Adds a log entry to history
   *
   * @param {LogEntry} entry - Entry to add
   */
  private addToHistory(entry: LogEntry): void {
    this.history.push(entry);

    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Logs a debug message (only shown in verbose mode)
   *
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} context - Optional context
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.verbose) return;

    const formatted = this.formatMessage(message, context);
    console.debug(`🔍 ${formatted}`);

    this.addToHistory({
      timestamp: new Date().toISOString(),
      level: "debug",
      message,
      context,
    });
  }

  /**
   * Logs an informational message
   *
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} context - Optional context
   */
  info(message: string, context?: Record<string, unknown>): void {
    const formatted = this.formatMessage(message, context);
    console.log(`ℹ️  ${formatted}`);

    this.addToHistory({
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      context,
    });
  }

  /**
   * Logs a success message
   *
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} context - Optional context
   */
  success(message: string, context?: Record<string, unknown>): void {
    const formatted = this.formatMessage(message, context);
    console.log(`✅ ${formatted}`);

    this.addToHistory({
      timestamp: new Date().toISOString(),
      level: "success",
      message,
      context,
    });
  }

  /**
   * Logs a warning message
   *
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} context - Optional context
   */
  warn(message: string, context?: Record<string, unknown>): void {
    const formatted = this.formatMessage(message, context);
    console.warn(`⚠️  ${formatted}`);

    this.addToHistory({
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      context,
    });
  }

  /**
   * Logs an error message
   *
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} context - Optional context
   */
  error(message: string, context?: Record<string, unknown>): void {
    const formatted = this.formatMessage(message, context);
    console.error(`❌ ${formatted}`);

    this.addToHistory({
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      context,
    });
  }

  /**
   * Prints a formatted header
   *
   * @param {string} text - Header text
   */
  header(text: string): void {
    console.log("\n" + "═".repeat(70));
    console.log(`  ${text}`);
    console.log("═".repeat(70) + "\n");
  }

  /**
   * Prints a formatted section divider
   *
   * @param {string} text - Section name
   */
  section(text: string): void {
    console.log("\n" + "─".repeat(70));
    console.log(`  ${text}`);
    console.log("─".repeat(70) + "\n");
  }

  /**
   * Prints a formatted footer
   */
  footer(): void {
    console.log("═".repeat(70) + "\n");
  }

  /**
   * Prints a statistics block
   *
   * @param {Record<string, unknown>} stats - Statistics to display
   */
  stats(stats: Record<string, unknown>): void {
    console.log("\n📊 Statistics:");
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log("");
  }

  /**
   * Gets elapsed time since logger creation in milliseconds
   *
   * @returns {number} Elapsed time
   */
  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Gets elapsed time formatted as human-readable string
   *
   * @returns {string} Formatted time (e.g., "1m 23s 456ms")
   */
  getElapsedTimeFormatted(): string {
    const elapsed = this.getElapsedTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const milliseconds = elapsed % 1000;

    const parts = [];
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || minutes > 0) parts.push(`${seconds}s`);
    if (milliseconds > 0) parts.push(`${milliseconds}ms`);

    return parts.length > 0 ? parts.join(" ") : "0ms";
  }

  /**
   * Sets verbose mode
   *
   * @param {boolean} verbose - Enable/disable verbose logging
   */
  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  /**
   * Gets all log history
   *
   * @returns {LogEntry[]} Array of all logged entries
   */
  getHistory(): LogEntry[] {
    return [...this.history];
  }

  /**
   * Clears log history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Exports logs to JSON format
   *
   * @returns {string} JSON string of all logs
   */
  exportAsJson(): string {
    return JSON.stringify(this.history, null, 2);
  }

  /**
   * Filters log history by level
   *
   * @param {string} level - Log level to filter by
   * @returns {LogEntry[]} Filtered log entries
   */
  filterByLevel(level: string): LogEntry[] {
    return this.history.filter((entry) => entry.level === level);
  }

  /**
   * Counts logs by level
   *
   * @returns {Record<string, number>} Count of each log level
   */
  getLogCounts(): Record<string, number> {
    const counts: Record<string, number> = {
      debug: 0,
      info: 0,
      success: 0,
      warn: 0,
      error: 0,
    };

    this.history.forEach((entry) => {
      counts[entry.level]++;
    });

    return counts;
  }
}

/**
 * Creates a new logger instance with default configuration
 *
 * @param {boolean} verbose - Enable verbose mode
 * @returns {Logger} New logger instance
 */
export function createLogger(verbose: boolean = false): Logger {
  return new Logger({
    verbose,
    includeTimestamps: true,
    includeContext: verbose,
    maxHistorySize: 1000,
  });
}

/**
 * Creates a quiet logger (minimal output)
 *
 * @returns {Logger} Quiet logger instance
 */
export function createQuietLogger(): Logger {
  return new Logger({
    verbose: false,
    includeTimestamps: false,
    includeContext: false,
  });
}
