#!/usr/bin/env tsx
/**
 * Cache Statistics Script
 * Shows Redis cache usage and statistics
 */

import IORedis from "ioredis";
import { env } from "../appConfig";

const redis = new IORedis({
  host: env.REDIS_HOST || "localhost",
  port: Number(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASSWORD || undefined,
});

async function getCacheStats() {
  try {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  📊 Redis Cache Statistics");
    console.log("═══════════════════════════════════════════════════════════\n");

    // Get basic info
    const info = await redis.info();
    const dbsize = await redis.dbsize();
    const memory = await redis.info("memory");

    // Parse info
    const infoLines = info.split("\r\n");
    const memoryLines = memory.split("\r\n");

    console.log("📦 Database:");
    console.log(`  Keys: ${dbsize}`);

    console.log("\n💾 Memory:");
    memoryLines.forEach((line) => {
      if (line.startsWith("used_memory_human:")) {
        console.log(`  Used: ${line.split(":")[1]}`);
      }
      if (line.startsWith("used_memory_peak_human:")) {
        console.log(`  Peak: ${line.split(":")[1]}`);
      }
    });

    console.log("\n📈 Stats:");
    infoLines.forEach((line) => {
      if (line.startsWith("total_commands_processed:")) {
        console.log(`  Commands: ${line.split(":")[1]}`);
      }
      if (line.startsWith("keyspace_hits:")) {
        console.log(`  Hits: ${line.split(":")[1]}`);
      }
      if (line.startsWith("keyspace_misses:")) {
        console.log(`  Misses: ${line.split(":")[1]}`);
      }
    });

    // Get keys by pattern
    const patterns = ["comic:*", "chapter:*", "user:*", "cache:*"];
    console.log("\n🔑 Keys by Type:");
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        console.log(`  ${pattern}: ${keys.length}`);
      }
    }

    console.log("\n═══════════════════════════════════════════════════════════");

    await redis.quit();
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

getCacheStats();
