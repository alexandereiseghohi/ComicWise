// ═══════════════════════════════════════════════════
// CACHE TYPES - Redis Caching
// ═══════════════════════════════════════════════════

/**
 * Cache key patterns
 */
export type CacheKeyPattern =
  | `comic:${string}`
  | `chapter:${string}`
  | `user:${string}`
  | `session:${string}`
  | `search:${string}`;

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  revalidate?: boolean;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  keys: number;
  memoryUsed: number;
  evictions: number;
}

/**
 * Cache entry
 */
export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt?: number;
  tags?: string[];
}

/**
 * Cache invalidation options
 */
export interface CacheInvalidationOptions {
  pattern?: string;
  tags?: string[];
  keys?: string[];
}
