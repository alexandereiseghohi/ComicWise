/**
 * Redis Cache Service
 * Re-exports from consolidated @/lib/cache
 */

import type { CacheOptions } from "@/lib/cache";
import { cache, CACHE_KEYS, CACHE_TTL, cacheKeys, cacheTTL } from "@/lib/cache";

export { cache, CACHE_KEYS, CACHE_TTL, cacheKeys, cacheTTL };
export type { CacheOptions };

// For backward compatibility, export main service instance
export const cacheService = cache;

// Type alias for compatibility
export type CacheService = typeof cache;
