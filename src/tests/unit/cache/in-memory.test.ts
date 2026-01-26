import cache from "@/lib/cache/index";
import { describe, expect, it } from "vitest";

describe("In-memory cache adapter (compat layer)", () => {
  it("should set and get a value", async () => {
    const key = "test:key:setget";
    await cache.set(key, { hello: "world" }, cache.CACHE_TTL.SHORT);
    const v = await cache.get<{ hello: string }>(key);
    expect(v).not.toBeNull();
    expect(v?.hello).toBe("world");
  });

  it("should delete a key", async () => {
    const key = "test:key:delete";
    await cache.set(key, "x", cache.CACHE_TTL.SHORT);
    await cache.del(key);
    const v = await cache.get(key);
    expect(v).toBeNull();
  });

  it("should mget multiple keys", async () => {
    const a = "test:key:ma";
    const b = "test:key:mb";
    await cache.set(a, 1, cache.CACHE_TTL.SHORT);
    await cache.set(b, 2, cache.CACHE_TTL.SHORT);
    const res = await cache.mget<number>([a, b, "nonexistent"]);
    expect(res[0]).toBe(1);
    expect(res[1]).toBe(2);
    expect(res[2]).toBeNull();
  });

  it("should getOrSet (getOrCompute) compute value when missing", async () => {
    const key = "test:key:getorset";
    await cache.del(key);
    const v = await cache.getOrSet(
      key,
      async () => {
        return { computed: true };
      },
      { ttl: cache.CACHE_TTL.SHORT }
    );
    expect(v).toEqual({ computed: true });
    const again = await cache.get(key);
    expect(again).not.toBeNull();
  });
});
