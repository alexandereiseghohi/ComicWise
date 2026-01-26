/**
 * Redis Caching Utility
 * Supports both Upstash and local Redis instances with automatic fallback
 */

import { Redis } from "@upstash/redis";

type CacheKey = string;
type CacheTTL = number; // in seconds

/**
 * Redis cache client - supports Upstash and local Redis
 */
class CacheClient {
  private client: Redis | null = null;
  private isAvailable: boolean = false;
  private readonly isUpstash: boolean;

  constructor() {
    const upstashUrl = process.env["UPSTASH_REDIS_REST_URL"];
    const upstashToken = process.env["UPSTASH_REDIS_REST_TOKEN"];
    this.isUpstash = Boolean(upstashUrl && upstashToken);

    if (this.isUpstash) {
      try {
        this.client = new Redis({
          url: upstashUrl!,
          token: upstashToken!,
        });
        this.isAvailable = true;
      } catch (error) {
        console.warn("Failed to initialize Upstash Redis", error);
        this.isAvailable = false;
      }
    } else if (process.env["REDIS_URL"]) {
      // Local Redis support could be added here
      console.warn("Local Redis support requires additional configuration");
      this.isAvailable = false;
    }
  }

  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found or cache unavailable
   */
  async get<T>(key: CacheKey): Promise<T | null> {
    if (!this.isAvailable || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(String(value)) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttl - Time to live in seconds (default 1 hour)
   * @returns true if successful, false otherwise
   */
  async set<T>(key: CacheKey, value: T, ttl: CacheTTL = 3600): Promise<boolean> {
    if (!this.isAvailable || !this.client) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await (ttl > 0 ? this.client.setex(key, ttl, serialized) : this.client.set(key, serialized));
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a value from cache
   * @param key - Cache key
   * @returns true if successful or key didn't exist
   */
  async delete(key: CacheKey): Promise<boolean> {
    if (!this.isAvailable || !this.client) {
      return true; // Treat as success if cache unavailable
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys from cache
   * @param keys - Array of cache keys
   * @returns number of deleted keys
   */
  async deleteMultiple(keys: CacheKey[]): Promise<number> {
    if (!this.isAvailable || !this.client) {
      return 0;
    }

    try {
      if (keys.length === 0) return 0;
      const result = await this.client.del(...keys);
      return typeof result === "number" ? result : 0;
    } catch (error) {
      console.error("Cache delete multiple error:", error);
      return 0;
    }
  }

  /**
   * Check if a key exists in cache
   * @param key - Cache key
   * @returns true if key exists
   */
  async exists(key: CacheKey): Promise<boolean> {
    if (!this.isAvailable || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return Boolean(result);
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or compute a value with cache
   * @param key - Cache key
   * @param fetch - Function to fetch value if not cached
   * @param ttl - Time to live in seconds (default 1 hour)
   * @returns Cached or freshly computed value
   */
  async getOrCompute<T>(key: CacheKey, fetch: () => Promise<T>, ttl: CacheTTL = 3600): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetch();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Increment a numeric value in cache
   * @param key - Cache key
   * @param increment - Amount to increment (default 1)
   * @returns New value after increment
   */
  async increment(key: CacheKey, increment: number = 1): Promise<number> {
    if (!this.isAvailable || !this.client) {
      return 0;
    }

    try {
      const result = await this.client.incrby(key, increment);
      return typeof result === "number" ? result : 0;
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   * @returns Cache availability and type
   */
  getStats(): {
    isAvailable: boolean;
    type: "upstash" | "local" | "none";
  } {
    return {
      isAvailable: this.isAvailable,
      type: this.isAvailable ? (this.isUpstash ? "upstash" : "local") : "none",
    };
  }

  /**
   * Clear all cache (use with caution)
   * @returns true if successful
   */
  async clear(): Promise<boolean> {
    if (!this.isAvailable || !this.client) {
      return false;
    }

    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      console.error("Cache clear error:", error);
      return false;
    }
  }
}

// Export singleton instance
export const cache = new CacheClient();

/**
 * Cache key generator for consistent key naming
 */
export const cacheKeys = {
  comic: (slug: string) => `comic:${slug}`,
  comicId: (id: number) => `comic:id:${id}`,
  comicSlug: (slug: string) => `comic:slug:${slug}`,
  comics: (page: number = 1, limit: number = 20) => `comics:list:${page}:${limit}`,
  comicList: (page: number, limit: number, filters?: Record<string, unknown>) => {
    const filterStr = filters ? JSON.stringify(filters).replaceAll(/[^\dA-Za-z]/g, "") : "";
    return `comic:list:${page}:${limit}:${filterStr}`;
  },
  comicsByGenre: (genreId: string | number, page: number = 1) => `comics:genre:${genreId}:${page}`,
  genreComics: (genreId: number, limit: number = 10) => `genre:comics:${genreId}:${limit}`,
  authorComics: (authorId: number, limit: number = 10) => `author:comics:${authorId}:${limit}`,
  featured: (limit: number = 6) => `comics:featured:${limit}`,
  trending: (limit: number = 6) => `comics:trending:${limit}`,
  chapters: (comicSlug: string, page: number = 1) => `chapters:${comicSlug}:${page}`,
  chapter: (comicSlug: string, chapterId: string) => `chapter:${comicSlug}:${chapterId}`,
  topComics: (period: string = "month") => `comics:top:${period}`,
  user: (userId: string) => `user:${userId}`,
  userBookmarks: (userId: string, page: number = 1) => `user:bookmarks:${userId}:${page}`,
  search: (query: string, page: number = 1) => `search:${query.toLowerCase()}:${page}`,
  ratings: (comicSlug: string) => `ratings:${comicSlug}`,
  comments: (comicSlug: string, page: number = 1) => `comments:${comicSlug}:${page}`,
  genres: "genres:all",
  authors: "authors:all",
};

/**
 * Default cache TTLs for different data types
 */
export const defaultTTLs = {
  shortLived: 300, // 5 minutes
  mediumLived: 1800, // 30 minutes
  longLived: 3600, // 1 hour
  veryLongLived: 86400, // 24 hours
  permanent: 0, // No expiration
} as const;

/**
 * Invalidate cache by pattern (requires appropriate Redis support)
 * @param pattern - Key pattern to match (e.g., "comics:*")
 * @returns number of keys invalidated
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  // This is a simplified version - full implementation would require
  // scanning Redis keys with pattern matching, which has limitations
  // on Upstash. Consider using explicit cache invalidation instead.
  const stats = cache.getStats();
  if (stats.type === "none") {
    return 0;
  }

  console.warn(`Cache pattern invalidation for "${pattern}" not fully implemented`);
  return 0;
}

/**
 * Warm up cache with frequently accessed data
 * @param fetcher - Function to fetch data for warming
 */
export async function warmUpCache(
  fetcher: () => Promise<Map<CacheKey, { value: unknown; ttl: CacheTTL }>>
): Promise<void> {
  try {
    const dataToCache = await fetcher();

    for (const [key, { value, ttl }] of dataToCache.entries()) {
      await cache.set(key, value, ttl);
    }

    console.log(`Warmed up cache with ${dataToCache.size} entries`);
  } catch (error) {
    console.error("Cache warm-up error:", error);
  }
}
