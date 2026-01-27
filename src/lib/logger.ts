// ═══════════════════════════════════════════════════
// CONSOLIDATED LOGGING - Using Pino
// ═══════════════════════════════════════════════════
// This file consolidates logger.ts (basic) and loggerEnhanced.ts
// for unified logging across the application

import { env } from "@/appConfig";
import pino from "pino";

const isDevelopment = env.NODE_ENV === "development";
const isProduction = env.NODE_ENV === "production";
const logLevel = isDevelopment ? "debug" : "info";

// Avoid initializing the pino transport (which uses thread-stream/pino-pretty)
// in dry-run/test-like modes where SKIP_ENV_VALIDATION is set. The threaded
// transport can cause writeSync "overwritten" errors on process exit in
// certain CI or restricted environments.
const shouldUseTransport =
  isDevelopment &&
  process.env["SKIP_ENV_VALIDATION"] !== "true" &&
  process.env["SEED_DISABLE_PINO_TRANSPORT"] !== "1";

const baseOptions: pino.LoggerOptions = {
  level: logLevel,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: env.NODE_ENV,
    pid: process.pid,
  },
};

export const logger = pino(
  shouldUseTransport
    ? {
        ...baseOptions,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
            singleLine: false,
            levelFirst: true,
          },
        },
      }
    : baseOptions
);

// ═══════════════════════════════════════════════════
// CHILD LOGGERS FOR DIFFERENT CONTEXTS
// ═══════════════════════════════════════════════════

export const dbLogger = logger.child({ context: "database" });
export const authLogger = logger.child({ context: "auth" });
export const apiLogger = logger.child({ context: "api" });
export const cacheLogger = logger.child({ context: "cache" });
export const uploadLogger = logger.child({ context: "upload" });
export const queueLogger = logger.child({ context: "queue" });
export const seedLogger = logger.child({ context: "seed" });

export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};

// ═══════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════

export function logError(error: unknown, context?: string): void {
  const errorLogger = context ? logger.child({ context }) : logger;

  if (error instanceof Error) {
    errorLogger.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  } else {
    errorLogger.error({ error });
  }
}

export function logRequest(
  method: string,
  url: string,
  statusCode?: number,
  duration?: number
): void {
  apiLogger.info({
    method,
    url,
    statusCode,
    duration: duration ? `${duration}ms` : undefined,
  });
}

export function logDatabaseQuery(query: string, duration?: number): void {
  dbLogger.debug({
    query,
    duration: duration ? `${duration}ms` : undefined,
  });
}

// Log levels: trace, debug, info, warn, error, fatal
export default logger;
