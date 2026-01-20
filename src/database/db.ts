import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env, isDevelopment } from "@/appConfig";
import * as schema from "@/database/schema";

if (!env.DATABASE_URL) {
  console.warn("DATABASE_URL not set — database connections may fail in runtime.");
}

// Using node-postgres replacement 'postgres' (postgres-js client)
export const sql = postgres(env.DATABASE_URL ?? "", {
  host: undefined,
  max: 10,
});

// ═══════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════

if (!env.DATABASE_URL) {
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
const client = postgres(env.DATABASE_URL, connectionConfig);

// Export typed Drizzle instance
export const db: PostgresJsDatabase<typeof schema> = drizzle(client, {
  schema,
  logger: isDevelopment, // Enable query logging in development
});

// Export client for advanced use cases
export { client };

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
