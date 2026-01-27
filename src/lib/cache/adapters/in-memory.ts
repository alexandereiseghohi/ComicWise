/**
 * Simple in-memory cache adapter for tests and local usage.
 * Implements the minimal compatibility surface used by the adapter.
 */

type CacheKey = string;
type TTL = number;

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function createInMemoryAdapter() {
  const store = new Map<string, { value: unknown; expiresAt: number | null }>();

  return {
    async get<T = unknown>(key: CacheKey): Promise<T | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && entry.expiresAt < nowSeconds()) {
        store.delete(key);
        return null;
      }
      return entry.value as T;
    },

    async set<T = unknown>(key: CacheKey, value: T, ttl: TTL = 3600): Promise<boolean> {
      const expiresAt = ttl > 0 ? nowSeconds() + Math.floor(ttl) : null;
      store.set(key, { value, expiresAt });
      return true;
    },

    async delete(key: CacheKey): Promise<boolean> {
      store.delete(key);
      return true;
    },

    async mget<T = unknown>(keys: CacheKey[]): Promise<Array<T | null>> {
      return Promise.all(keys.map((k) => (this.get as any)(k)));
    },

    async exists(key: CacheKey): Promise<boolean> {
      const v = await (this.get as any)(key);
      return v !== null && v !== undefined;
    },

    async getOrCompute<T = unknown>(
      key: CacheKey,
      compute: () => Promise<T> | T,
      ttl: TTL = 3600
    ): Promise<T> {
      const cached = await (this.get as any)(key);
      if (cached !== null) return cached as T;
      const value = await compute();
      await (this.set as any)(key, value, ttl);
      return value as T;
    },

    // Best-effort stubs for pattern/sorted set APIs
    async keys(_pattern: string): Promise<string[]> {
      return [...store.keys()];
    },

    async deletePattern(pattern: string): Promise<number> {
      const keys = [...store.keys()].filter((k) => k.includes(pattern.replaceAll('*', "")));
      for (const k of keys) store.delete(k);
      return keys.length;
    },

    async addToSortedSet(
      _key: string,
      _member: string,
      _score: number = Date.now()
    ): Promise<void> {
      // no-op for in-memory adapter
    },

    async getTopFromSortedSet(_key: string, _topN: number): Promise<string[]> {
      return [];
    },

    async getScoreFromSortedSet(_key: string, _member: string): Promise<number | null> {
      return null;
    },

    // debug helpers
    __dump() {
      return [...store.entries()];
    },
  } as const;
}

export default createInMemoryAdapter;
