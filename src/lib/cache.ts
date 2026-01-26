// ═══════════════════════════════════════════════════════════════════════════
// CONSOLIDATED CACHE SERVICE
// ═══════════════════════════════════════════════════════════════════════════
// Consolidates: cache.ts + cacheService.ts + cacheMiddleware.ts fundamentals
// Provides unified Redis/in-memory caching with type safety and advanced operations

import { env } from "@/appConfig";
import { createHash } from "crypto";
import Redis from "ioredis";
import type { NextRequest } from "next/server";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type CacheValue = string | number | object | null;

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear?(): Promise<void>;
  raw?: Redis | Record<string, unknown> | null;
}

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  tags?: string[];
}

export interface CacheMiddlewareConfig {
  ttl?: number;
  prefix?: string;
  includeQuery?: boolean;
  includeBody?: boolean;
  keyGenerator?(request: NextRequest): string | Promise<string>;
  userSpecific?: boolean;
  tags?: string[];
  skipCache?(request: NextRequest): boolean | Promise<boolean>;
  revalidate?(request: NextRequest): boolean | Promise<boolean>;
}

// ═══════════════════════════════════════════════════════════════════════════
// REDIS CLIENT INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

const getRedisConfig = (): Record<string, unknown> => {
  const baseConfig: Record<string, unknown> = {
    host: env.REDIS_HOST ?? "localhost",
    port: Number(env.REDIS_PORT ?? "6379"),
    password: env.REDIS_PASSWORD || undefined,
    database: Number(env.REDIS_DB ?? "0"),
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err: Error) {
      const targetErrors = ["READONLY", "ECONNRESET"];
      return targetErrors.some((target) => err.message.includes(target));
    },
    lazyConnect: true,
    enableReadyCheck: true,
    showFriendlyErrorStack: env.NODE_ENV === "development",
  };

  if (env.NODE_ENV === "production" && String(env.REDIS_TLS_ENABLED ?? false) === "true") {
    baseConfig["tls"] = {
      rejectUnauthorized: false,
    };
  }

  return baseConfig;
};

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(getRedisConfig());

    redisClient.on("error", (error) => {
      console.error("Redis Client Error:", error);
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis client ready");
    });

    redisClient.on("close", () => {
      console.warn("⚠️  Redis connection closed");
    });

    redisClient.on("reconnecting", () => {
      console.log("🔄 Redis reconnecting...");
    });
  }

  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("✅ Redis connection closed");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE CLIENT FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export function createCacheClient(rawClient: Redis | Record<string, unknown> | null): CacheClient {
  // Upstash Redis client detection
  if (
    rawClient &&
    typeof rawClient === "object" &&
    "get" in rawClient &&
    typeof rawClient.get === "function" &&
    "set" in rawClient &&
    typeof rawClient.set === "function"
  ) {
    return {
      raw: rawClient as Record<string, unknown>,
      async get(key: string) {
        const getFunction = (rawClient as Record<string, unknown>)["get"] as
          | ((k: string) => Promise<string | null>)
          | undefined;
        if (!getFunction) return null;
        const result = await getFunction(key);
        return result ?? null;
      },
      async set(key: string, value: string, ttlSeconds?: number) {
        const setFunction = (rawClient as Record<string, unknown>)["set"] as
          | ((k: string, v: string, options?: unknown) => Promise<void>)
          | undefined;
        if (!setFunction) return;
        await (ttlSeconds ? setFunction(key, value, { ex: ttlSeconds }) : setFunction(key, value));
      },
      async del(key: string) {
        const delFunction = (rawClient as Record<string, unknown>)["del"] as
          | ((k: string) => Promise<number>)
          | undefined;
        if (delFunction) await delFunction(key);
      },
      async clear() {
        const client = rawClient as Record<string, unknown>;
        const flushdbFunction = client["flushdb"] as (() => Promise<void>) | undefined;
        if (typeof flushdbFunction === "function") {
          await flushdbFunction();
        }
      },
    };
  }

  // ioredis client detection
  if (
    (rawClient && typeof (rawClient as Record<string, unknown>)["call"] === "function") ||
    rawClient instanceof Redis
  ) {
    const client: Redis = rawClient as Redis;
    return {
      raw: client,
      async get(key: string) {
        return await client["get"](key);
      },
      async set(key: string, value: string, ttlSeconds?: number) {
        await (ttlSeconds
          ? client["set"](key, value, "EX", ttlSeconds)
          : client["set"](key, value));
      },
      async del(key: string) {
        await client["del"](key);
      },
      async clear() {
        await client["flushdb"]();
      },
    };
  }

  // Fallback in-memory cache
  const store = new Map<string, string>();
  return {
    raw: null,
    async get(key: string) {
      return store.has(key) ? (store["get"](key) as string) : null;
    },
    async set(key: string, value: string) {
      store["set"](key, value);
    },
    async del(key: string) {
      store.delete(key);
    },
    async clear() {
      store.clear();
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE KEYS & TTL CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const CACHE_KEYS = {
  COMIC: "comic:",
  COMICS_LIST: "comics:list:",
  COMIC_CHAPTERS: "comic:chapters:",
  CHAPTER: "chapter:",
  AUTHOR: "author:",
  ARTIST: "artist:",
  GENRE: "genre:",
  GENRES_LIST: "genres:list:",
  SEARCH: "search:",
  TRENDING: "trending:",
  POPULAR: "popular:",
  USER_BOOKMARKS: "user:bookmarks:",
  USER_HISTORY: "user:history:",
  COMMENT_COUNT: "comic:comments:",
  VIEW_COUNT: "views:",
  RATING_AVG: "rating:",
} as const;

export const CACHE_TTL = {
  SHORT: 60 * 5,
  MEDIUM: 60 * 30,
  LONG: 60 * 60 * 2,
  VERY_LONG: 60 * 60 * 12,
  DAILY: 60 * 60 * 24,
  WEEKLY: 60 * 60 * 24 * 7,
} as const;

export const cacheKeys = {
  comic: (id: number) => `comic:${id}`,
  comics: (filters?: string) => `comics:${filters ?? "all"}`,
  comicsByGenre: (genreId: number) => `comics:genre:${genreId}`,
  comicsByAuthor: (authorId: number) => `comics:author:${authorId}`,
  comicsByStatus: (status: string) => `comics:status:${status}`,
  chapter: (id: number) => `chapter:${id}`,
  chapters: (comicId: number) => `chapters:comic:${comicId}`,
  chapterImages: (chapterId: number) => `chapter:${chapterId}:images`,
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userBookmarks: (userId: string) => `bookmarks:user:${userId}`,
  comicBookmark: (userId: string, comicId: number) => `bookmark:${userId}:${comicId}`,
  chapterComments: (chapterId: number) => `comments:chapter:${chapterId}`,
  searchResults: (query: string) => `search:${query}`,
  comicViews: (comicId: number) => `views:comic:${comicId}`,
  chapterViews: (chapterId: number) => `views:chapter:${chapterId}`,
  popularComics: () => "popular:comics",
  trendingComics: () => "trending:comics",
  genres: () => "genres:all",
  authors: () => "authors:all",
  artists: () => "artists:all",
  types: () => "types:all",
  userReadingProgress: (userId: string, comicId: number) => `reading:${userId}:${comicId}`,
  userReadingHistory: (userId: string) => `reading:history:${userId}`,
} as const;

export const cacheTTL = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 3600,
  VERY_LONG: 86400,
  WEEK: 604800,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// REDIS CACHE SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class RedisCache {
  private redis: Redis;

  constructor() {
    this.redis = getRedisClient();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis["get"](key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const ttl = options?.ttl || CACHE_TTL.MEDIUM;

      await (ttl > 0 ? this.redis.setex(key, ttl, serialized) : this.redis["set"](key, serialized));

      if (options?.tags && options.tags.length > 0) {
        await this.addTagsToKey(key, options.tags);
      }

      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.redis["del"](key);
      return true;
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error);
      return false;
    }
  }

  async deleteMany(keys: string[]): Promise<boolean> {
    try {
      if (keys.length === 0) return true;
      await this.redis["del"](...keys);
      return true;
    } catch (error) {
      console.error(`Cache DELETE MANY error:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async getTTL(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  async setTTL(key: string, ttl: number): Promise<boolean> {
    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(`Cache SET TTL error for key ${key}:`, error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      await this.redis["del"](...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache DELETE PATTERN error for ${pattern}:`, error);
      return 0;
    }
  }

  async getKeys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error(`Cache GET KEYS error for ${pattern}:`, error);
      return [];
    }
  }

  async increment(key: string, amount = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      console.error(`Cache INCREMENT error for key ${key}:`, error);
      return 0;
    }
  }

  async decrement(key: string, amount = 1): Promise<number> {
    try {
      return await this.redis.decrby(key, amount);
    } catch (error) {
      console.error(`Cache DECREMENT error for key ${key}:`, error);
      return 0;
    }
  }

  async addToSet(key: string, ...members: string[]): Promise<boolean> {
    try {
      await this.redis.sadd(key, ...members);
      return true;
    } catch (error) {
      console.error(`Cache ADD TO SET error for key ${key}:`, error);
      return false;
    }
  }

  async getSet(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      console.error(`Cache GET SET error for key ${key}:`, error);
      return [];
    }
  }

  async removeFromSet(key: string, member: string): Promise<boolean> {
    try {
      await this.redis.srem(key, member);
      return true;
    } catch (error) {
      console.error(`Cache REMOVE FROM SET error for key ${key}:`, error);
      return false;
    }
  }

  async isInSet(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error(`Cache IS IN SET error for key ${key}:`, error);
      return false;
    }
  }

  async addToSortedSet(key: string, score: number, member: string): Promise<boolean> {
    try {
      await this.redis.zadd(key, score, member);
      return true;
    } catch (error) {
      console.error(`Cache ADD TO SORTED SET error for key ${key}:`, error);
      return false;
    }
  }

  async getTopFromSortedSet(
    key: string,
    count: number
  ): Promise<Array<{ member: string; score: number }>> {
    try {
      const results = await this.redis.zrevrange(key, 0, count - 1, "WITHSCORES");
      const items: Array<{ member: string; score: number }> = [];

      for (let i = 0; i < results.length; i += 2) {
        items.push({
          member: results[i] as string,
          score: Number.parseFloat(results[i + 1] as string),
        });
      }

      return items;
    } catch (error) {
      console.error(`Cache GET TOP FROM SORTED SET error for key ${key}:`, error);
      return [];
    }
  }

  async incrementScoreInSortedSet(key: string, member: string, increment: number): Promise<number> {
    try {
      const result = await this.redis.zincrby(key, increment, member);
      return typeof result === "number" ? result : Number(result);
    } catch (error) {
      console.error(`Cache INCREMENT SCORE error for key ${key}:`, error);
      return 0;
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const data = await fetchFunction();
    this["set"](key, data, options).catch((error) => {
      console.error(`Failed to cache data for key ${key}:`, error);
    });

    return data;
  }

  private async addTagsToKey(key: string, tags: string[]): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();

      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        pipeline.sadd(tagKey, key);
      }

      await pipeline.exec();
    } catch (error) {
      console.error(`Failed to add tags to key ${key}:`, error);
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    try {
      const tagKey = `tag:${tag}`;
      const keys = await this.redis.smembers(tagKey);

      if (keys.length === 0) return 0;

      await this.redis["del"](...keys);
      await this.redis["del"](tagKey);

      return keys.length;
    } catch (error) {
      console.error(`Failed to invalidate by tag ${tag}:`, error);
      return 0;
    }
  }

  async flushAll(): Promise<boolean> {
    try {
      const flushFunction = (this.redis as unknown as Record<string, unknown>)["flushdb"] as
        | (() => Promise<void>)
        | undefined;
      if (flushFunction) {
        await flushFunction();
      }
      console.warn("⚠️  Cache flushed");
      return true;
    } catch (error) {
      console.error(`Cache FLUSH error:`, error);
      return false;
    }
  }

  async getStats(): Promise<{
    keys: number;
    memory: string;
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    try {
      const infoFunction = (this.redis as unknown as Record<string, unknown>)["info"] as
        | ((type: string) => Promise<string>)
        | undefined;
      const info = infoFunction ? await infoFunction("stats") : "";
      const memory = infoFunction ? await infoFunction("memory") : "";
      const databasesizeFunction = (this.redis as unknown as Record<string, unknown>)["dbsize"] as
        | (() => Promise<number>)
        | undefined;
      const databasesize = databasesizeFunction ? await databasesizeFunction() : 0;

      const stats = {
        keys: databasesize,
        memory: memory.match(/used_memory_human:([^\n\r]+)/)?.[1] ?? "N/A",
        hits: Number.parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] ?? "0"),
        misses: Number.parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] ?? "0"),
        hitRate: 0,
      };

      const total = stats.hits + stats.misses;
      stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;

      return stats;
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      return {
        keys: 0,
        memory: "N/A",
        hits: 0,
        misses: 0,
        hitRate: 0,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === "PONG";
    } catch (error) {
      console.error("Redis health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const cache = new RedisCache();

// ═══════════════════════════════════════════════════════════════════════════
// CACHE MIDDLEWARE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

async function generateCacheKey(
  request: NextRequest,
  config: CacheMiddlewareConfig
): Promise<string> {
  if (config.keyGenerator) {
    return config.keyGenerator(request);
  }

  const url = new URL(request.url);
  let key = `${config.prefix ?? "api"}:${url.pathname}`;

  if (config.includeQuery && url.search) {
    const sortedParameters = [...url.searchParams.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    key += `:${sortedParameters}`;
  }

  if (config.includeBody && ["POST", "PUT", "PATCH"].includes(request.method)) {
    try {
      const body = await request.clone().text();
      if (body) {
        const bodyHash = createHash("md5").update(body).digest("hex");
        key += `:body:${bodyHash}`;
      }
    } catch (error) {
      console.error("Failed to read request body:", error);
    }
  }

  if (config.userSpecific) {
    const userId = request.headers["get"]("x-user-id") || request.cookies["get"]("userId")?.value;
    if (userId) {
      key += `:user:${userId}`;
    }
  }

  return key;
}

export function withCache(
  handler: (request: NextRequest) => Promise<unknown>,
  config: CacheMiddlewareConfig = {}
) {
  return async (request: NextRequest) => {
    if (config.skipCache && (await config.skipCache(request))) {
      return handler(request);
    }

    if (request.method !== "GET" && !config.includeBody) {
      return handler(request);
    }

    try {
      const cacheKey = await generateCacheKey(request, config);
      const shouldRevalidate = config.revalidate && (await config.revalidate(request));

      if (!shouldRevalidate) {
        const cached = await cache.get<{
          body: Record<string, unknown>;
          headers: Record<string, string>;
          status: number;
        }>(cacheKey);

        if (cached) {
          console.log(`✅ Cache HIT: ${cacheKey}`);
          const response = new Response(JSON.stringify(cached.body), {
            status: cached.status,
            headers: new Headers(cached.headers),
          });
          response.headers["set"]("X-Cache", "HIT");
          response.headers["set"]("X-Cache-Key", cacheKey);
          return response;
        }
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);
      const response = (await handler(request)) as Response;

      if (response.ok) {
        try {
          const clonedResponse = response.clone();
          const body = await clonedResponse.json();

          const cacheData = {
            body,
            headers: Object.fromEntries(response.headers.entries()),
            status: response.status,
          };

          cache["set"](cacheKey, cacheData, {
            ttl: config.ttl || CACHE_TTL.MEDIUM,
            tags: config.tags,
          }).catch((error) => {
            console.error(`Failed to cache response for ${cacheKey}:`, error);
          });

          response.headers["set"]("X-Cache", "MISS");
          response.headers["set"]("X-Cache-Key", cacheKey);
        } catch (error) {
          console.error("Failed to cache response:", error);
        }
      }

      return response;
    } catch (error) {
      console.error("Cache middleware error:", error);
      return handler(request);
    }
  };
}

export async function invalidateCache(options: {
  prefix?: string;
  pattern?: string;
  tags?: string[];
}): Promise<number> {
  let totalInvalidated = 0;

  if (options.pattern) {
    const count = await cache.deletePattern(options.pattern);
    totalInvalidated += count;
    console.log(`🗑️  Invalidated ${count} keys matching ${options.pattern}`);
  }

  if (options.prefix) {
    const pattern = `${options.prefix}:*`;
    const count = await cache.deletePattern(pattern);
    totalInvalidated += count;
    console.log(`🗑️  Invalidated ${count} keys with prefix ${options.prefix}`);
  }

  if (options.tags && options.tags.length > 0) {
    for (const tag of options.tags) {
      const count = await cache.invalidateByTag(tag);
      totalInvalidated += count;
      console.log(`🗑️  Invalidated ${count} keys with tag ${tag}`);
    }
  }

  return totalInvalidated;
}

export function withCacheInvalidation(
  handler: (request: NextRequest) => Promise<unknown>,
  config: {
    patterns?: string[];
    tags?: string[];
    invalidate?(request: NextRequest): Promise<void>;
  }
) {
  return async (request: NextRequest) => {
    const response = (await handler(request)) as Response;

    if (response.ok && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      try {
        if (config.invalidate) {
          await config.invalidate(request);
        }

        if (config.patterns && config.patterns.length > 0) {
          for (const pattern of config.patterns) {
            await cache.deletePattern(pattern);
          }
        }

        if (config.tags && config.tags.length > 0) {
          for (const tag of config.tags) {
            await cache.invalidateByTag(tag);
          }
        }

        console.log("✅ Cache invalidated after mutation");
      } catch (error) {
        console.error("Cache invalidation error:", error);
      }
    }

    return response;
  };
}

export function withSmartCache(
  handler: (request: NextRequest) => Promise<unknown>,
  config: {
    cache?: CacheMiddlewareConfig;
    invalidate?: {
      patterns?: string[];
      tags?: string[];
      invalidate?(request: NextRequest): Promise<void>;
    };
  }
) {
  let wrappedHandler = handler;
  if (config.invalidate) {
    wrappedHandler = withCacheInvalidation(wrappedHandler, config.invalidate);
  }

  if (config.cache) {
    wrappedHandler = withCache(wrappedHandler, config.cache);
  }

  return wrappedHandler;
}

export async function rateLimit(
  identifier: string,
  options: {
    window: number;
    max: number;
  }
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`;

  try {
    const current = await cache.increment(key);

    if (current === 1) {
      await cache.setTTL(key, options.window);
    }

    const ttl = await cache.getTTL(key);
    const remaining = Math.max(0, options.max - current);

    return {
      success: current <= options.max,
      remaining,
      reset: Date.now() + ttl * 1000,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    return { success: true, remaining: options.max, reset: Date.now() };
  }
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<unknown>,
  options: {
    window?: number;
    max?: number;
    keyGenerator?(request: NextRequest): string;
  } = {}
) {
  return async (request: NextRequest) => {
    const identifier =
      (options.keyGenerator?.(request) ||
        request.headers["get"]("x-forwarded-for") ||
        request.headers["get"]("x-real-ip")) ??
      "anonymous";

    const result = await rateLimit(identifier, {
      window: options.window ?? 60,
      max: options.max ?? 100,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": options.max?.toString() ?? "100",
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
            "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const response = (await handler(request)) as Response;

    response.headers["set"]("X-RateLimit-Limit", options.max?.toString() ?? "100");
    response.headers["set"]("X-RateLimit-Remaining", result.remaining.toString());
    response.headers["set"]("X-RateLimit-Reset", result.reset.toString());

    return response;
  };
}
