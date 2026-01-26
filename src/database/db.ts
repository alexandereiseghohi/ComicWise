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

// Export placeholders which will be assigned depending on environment. We use
// `let` so we can conditionally initialize them below without using illegal
// top-level `export` inside blocks.
export let sql: any;
export let client: any;
export let db: PostgresJsDatabase<typeof schema> | any;

if (isTestRun) {
  // Provide no-op placeholders for exports used across the codebase so that
  // importing modules during tests doesn't trigger a real DB connection.
  // Tests should mock database calls as needed.
  sql = {};
  client = {};
  db = {} as any;
} else {
  // Using node-postgres replacement 'postgres' (postgres-js client)
  sql = postgres(safeEnv["DATABASE_URL"] ?? "", {
    host: undefined,
    max: 10,
  });

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

  // ═══════════════════════════════════════════════════
  // CLIENT INITIALIZATION
  // ═══════════════════════════════════════════════════

  // Create postgres client with optimized settings
  client = postgres(safeEnv["DATABASE_URL"], connectionConfig);

  // Assign typed Drizzle instance
  db = drizzle(client, {
    schema,
    logger: isDevelopment, // Enable query logging in development
  }) as PostgresJsDatabase<typeof schema>;
}

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
