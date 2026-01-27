import { createInMemoryAdapter as createMemoryAdapter } from "./adapters/in-memory";
import { cacheKeys, defaultTTLs, invalidateCachePattern, cache as redisCache } from "./redis";

/**
 * Compatibility adapter exposing legacy cache surface while delegating to the new redis client
 */

export type CacheKey = string;
export type TTL = number;
export interface CacheOptions {
  ttl?: TTL;
  tags?: string[];
}

export const CACHE_KEYS = cacheKeys;
export const CACHE_TTL = {
  SHORT: defaultTTLs.shortLived,
  MEDIUM: defaultTTLs.mediumLived,
  LONG: defaultTTLs.longLived,
  VERY_LONG: defaultTTLs.veryLongLived,
  PERMANENT: defaultTTLs.permanent,
} as const;

// Internal reference to the active adapter. Defaults to redis-backed cache unless overridden.
let adapter: any = redisCache;

// Switch to in-memory adapter in tests or when explicitly requested
export function useCacheAdapter(adapterName: "redis" | "in-memory") {
  adapter = adapterName === "in-memory" ? createMemoryAdapter() : redisCache;
}

// Auto-select in-memory for test environments
if (process.env.NODE_ENV === "test" || process.env["CACHE_ADAPTER"] === "in-memory") {
  adapter = createMemoryAdapter();
}

// Core operations
export async function get<T = unknown>(key: CacheKey): Promise<T | null> {
  return adapter.get?.(key);
}

export async function set<T = unknown>(
  key: CacheKey,
  value: T,
  ttl: TTL = CACHE_TTL.MEDIUM
): Promise<boolean> {
  return adapter.set?.(key, value, ttl) ?? false;
}

export async function del(key: CacheKey): Promise<boolean> {
  return adapter.delete?.(key) ?? true;
}

export async function mget<T = unknown>(keys: CacheKey[]): Promise<Array<T | null>> {
  if (adapter.mget) return adapter.mget(keys);
  const results = await Promise.all(keys.map((k) => get<T>(k)));
  return results;
}

export async function setTTL(key: CacheKey, ttl: TTL): Promise<void> {
  // best-effort: re-set value with new TTL if possible
  if (adapter.exists && adapter.get && adapter.set) {
    const exists = await adapter.exists(key);
    if (!exists) return;
    const current = await adapter.get(key);
    if (current !== null) await adapter.set(key, current, ttl);
  }
}

// Compatibility: getOrCompute / getOrSet
export async function getOrCompute<T = unknown>(
  key: CacheKey,
  compute: () => Promise<T> | T,
  ttl: TTL = CACHE_TTL.MEDIUM
): Promise<T> {
  if (adapter.getOrCompute) return adapter.getOrCompute(key, compute, ttl);

  const cached = await get<T>(key);
  if (cached !== null) return cached;
  const value = await compute();
  await set(key, value as T, ttl);
  return value as T;
}

export async function getOrSet<T = unknown>(
  key: CacheKey,
  compute: () => Promise<T> | T,
  options?: CacheOptions
): Promise<T> {
  // alias that preserves older signature
  return getOrCompute(key, compute, options?.ttl ?? CACHE_TTL.MEDIUM);
}

// Pattern and key management
export async function keys(pattern: string): Promise<string[]> {
  if (adapter.keys) return adapter.keys(pattern);
  // Not supported - return empty list
  return [];
}

export async function deletePattern(pattern: string): Promise<number> {
  // Delegate to explicit invalidate function if available
  if (invalidateCachePattern) return invalidateCachePattern(pattern);
  if (adapter.deletePattern) return adapter.deletePattern(pattern);
  return 0;
}

export async function invalidateByTag(tag: string): Promise<number> {
  if (adapter.invalidateByTag) return adapter.invalidateByTag(tag);
  // no-op fallback
  return 0;
}

// Sorted set helpers (best-effort no-ops if not supported)
export async function addToSortedSet(
  key: CacheKey,
  member: string,
  score: number = Date.now()
): Promise<void> {
  if (adapter.addToSortedSet) return adapter.addToSortedSet(key, member, score);
}

export async function getTopFromSortedSet(key: CacheKey, topN: number): Promise<string[]> {
  if (adapter.getTopFromSortedSet) return adapter.getTopFromSortedSet(key, topN);
  return [];
}

export async function getScoreFromSortedSet(key: CacheKey, member: string): Promise<number | null> {
  if (adapter.getScoreFromSortedSet) return adapter.getScoreFromSortedSet(key, member);
  return null;
}

// Testing helper
export function createInMemoryAdapter() {
  return createMemoryAdapter();
}

export default {
  get,
  set,
  del,
  mget,
  setTTL,
  getOrCompute,
  getOrSet,
  keys,
  deletePattern,
  invalidateByTag,
  addToSortedSet,
  getTopFromSortedSet,
  getScoreFromSortedSet,
  useCacheAdapter,
  createInMemoryAdapter,
  CACHE_KEYS,
  CACHE_TTL,
};
