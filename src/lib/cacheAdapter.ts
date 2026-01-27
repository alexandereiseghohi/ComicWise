// Simple typed CacheAdapter and an in-memory adapter for development.
// This file provides a minimal interface so code using `any` for cache
// access can be migrated to use a typed adapter.

export interface CacheAdapter<V = string> {
  get(key: string): Promise<V | null>;
  set(key: string, value: V, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear?(): Promise<void>;
}

// In-memory cache implementation suitable for local dev & tests.
export class InMemoryCache<V = string> implements CacheAdapter<V> {
  private store = new Map<string, { value: V; expiresAt?: number }>();

  constructor(private defaultTtlSeconds = 300) {}

  async get(key: string): Promise<V | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: V, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// Export a default instance for quick migration; replace with Redis/Upstash adapter in production
export const defaultCache = new InMemoryCache<string>(300);
