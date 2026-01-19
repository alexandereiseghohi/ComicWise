#!/usr/bin/env tsx
/**
 * Check Database Connection
 */

import { db } from "@/database/db";
import { sql } from "drizzle-orm";

async function checkDatabase() {
  console.log("🗄️  Checking database connection...\n");

  try {
    const result = await db.execute(sql`SELECT version()`);
    console.log("✅ Database connected");

    // Handle drizzle-orm result
    const rows = Array.isArray(result) ? result : [];
    if (rows.length > 0) {
      const row = rows[0]!;
      console.log("📊 Version:", row["version"] || "Unknown");
    }

    console.log();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error("Error:", error instanceof Error ? error.message : error);
    console.log();
    process.exit(1);
  }
}

checkDatabase();
