import { Redis } from "@upstash/redis";
import { env } from "appConfig";

// Use Upstash Redis REST API (recommended for serverless)
export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL ?? "",
  token: env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

// Helper to check connection
export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.set("health-check", "ok");
    const result = await redis.get("health-check");
    return result === "ok";
  } catch (error) {
    console.error("Redis connection error:", error);
    return false;
  }
}

export default redis;
