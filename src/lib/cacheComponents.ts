import cache from "@/lib/cache";
import crypto from "node:crypto";

/**
 * Lightweight component output caching utility.
 * Stores serialized render outputs (string) keyed by component name + props hash.
 */

export interface CacheComponentOptions {
  ttl?: number; // seconds
}

function hashProps(props: unknown): string {
  try {
    const s = JSON.stringify(props || {});
    return crypto.createHash("sha256").update(s).digest("hex");
  } catch (err) {
    return String(Date.now());
  }
}

export async function getCachedComponent(name: string, props: unknown): Promise<string | null> {
  const key = `component:${name}:${hashProps(props)}`;
  try {
    const cached = await cache.get<string>(key);
    return cached ?? null;
  } catch (err) {
    return null;
  }
}

export async function setCachedComponent(
  name: string,
  props: unknown,
  html: string,
  options: CacheComponentOptions = {}
): Promise<boolean> {
  const key = `component:${name}:${hashProps(props)}`;
  try {
    await cache.set<string>(key, html, options.ttl ?? cache.CACHE_TTL.MEDIUM);
    return true;
  } catch (err) {
    return false;
  }
}

export async function invalidateComponent(name: string): Promise<number> {
  // Remove any keys that start with component:name:
  const pattern = `component:${name}:*`;
  try {
    const deleted = await cache.deletePattern(pattern);
    return deleted ?? 0;
  } catch (err) {
    return 0;
  }
}

export default { getCachedComponent, setCachedComponent, invalidateComponent };
