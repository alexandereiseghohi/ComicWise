import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env, isDevelopment } from "@/appConfig";
import * as schema from "@/database/schema";

// If running under tests or when explicit skip is requested, avoid initializing
// a real database client which can throw during import time. This makes unit
// tests that import DB-related modules safe to run in CI/local without a
// DATABASE_URL.
const safeEnv: Record<string, any> = typeof env === "object" && env ? env : (process.env as any);
const isTestRun =
  process.env.NODE_ENV === "test" ||
  process.env["SKIP_ENV_VALIDATION"] === "true" ||
  Boolean((safeEnv as any)["SKIP_ENV_VALIDATION"]);

if (!safeEnv["DATABASE_URL"]) {
  console.warn("DATABASE_URL not set — database connections may fail in runtime.");
}

// Export immutable connections/clients. Use IIFEs to avoid mutable exported
// bindings while preserving conditional initialization for test vs runtime.
export const sql: any = (() => {
  if (isTestRun) return {} as any;
  return postgres(safeEnv["DATABASE_URL"] ?? "", {
    host: undefined,
    max: 10,
  });
})();

export const client: any = (() => {
  if (isTestRun) return {} as any;

  // ═══════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════

  if (!safeEnv["DATABASE_URL"]) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Please check your .env.local file."
    );
  }

  // ═══════════════════════════════════════════════════
  // CONNECTION CONFIGURATION
  // ═══════════════════════════════════════════════════

  const connectionConfig = {
    max: isDevelopment ? 5 : 20, // Connection pool size
    idle_timeout: isDevelopment ? 30 : 20, // Seconds before idle connection closes
    connect_timeout: 10, // Connection timeout in seconds
    prepare: false, // Disable prepared statements for serverless
    onnotice: isDevelopment ? undefined : () => {}, // Silence notices in production
  } as const;

  // Create postgres client with optimized settings
  return postgres(safeEnv["DATABASE_URL"], connectionConfig);
})();

export const db: PostgresJsDatabase<typeof schema> | any = (() => {
  if (isTestRun) return {} as any;
  return drizzle(client, {
    schema,
    logger: isDevelopment, // Enable query logging in development
  }) as PostgresJsDatabase<typeof schema>;
})();

// ═══════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// CONNECTION HELPERS
// ═══════════════════════════════════════════════════

/**
 * Test database connection
 * Useful for health checks and initialization
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (isTestRun) return true;
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

/**
 * Close database connections
 * Useful for cleanup in tests or scripts
 */
export async function closeConnection(): Promise<void> {
  if (isTestRun) return;
  await client.end({ timeout: 5 });
}

// // ═══════════════════════════════════════════════════
// // GRACEFUL SHUTDOWN
// // ═══════════════════════════════════════════════════

// if (typeof process !== "undefined") {
//   process.on("beforeExit", async () => {
//     await closeConnection();
//   });
// }
