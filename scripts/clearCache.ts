#!/usr/bin/env tsx
/**
 * Clear Cache Script
 * Clears Redis cache with options
 */

import IORedis from "ioredis";
import { env } from "../appConfig";

const redis = new IORedis({
  host: env.REDIS_HOST || "localhost",
  port: Number(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASSWORD || undefined,
});

async function clearCache() {
  const args = process.argv.slice(2);
  const pattern = args[0] || "*";

  try {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  🧹 Clear Cache");
    console.log("═══════════════════════════════════════════════════════════\n");

    if (pattern === "*" || pattern === "all") {
      console.log("⚠️  Clearing ALL cache entries...\n");
      await redis.flushdb();
      console.log("✅ All cache cleared\n");
    } else {
      console.log(`🔍 Clearing pattern: ${pattern}\n`);
      const keys = await redis.keys(pattern);

      if (keys.length === 0) {
        console.log("⚠️  No keys found matching pattern\n");
      } else {
        console.log(`📦 Found ${keys.length} keys`);
        await redis.del(...keys);
        console.log(`✅ Deleted ${keys.length} keys\n`);
      }
    }

    console.log("═══════════════════════════════════════════════════════════");

    await redis.quit();
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

clearCache();
