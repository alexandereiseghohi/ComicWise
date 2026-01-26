import * as cache from "@/lib/cache";
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
    const s = JSON.stringify(props ?? {});
    return crypto.createHash("sha256").update(s).digest("hex");
  } catch {
    return String(Date.now());
  }
}

export async function getCachedComponent(name: string, props: unknown): Promise<string | null> {
  const key = `component:${name}:${hashProps(props)}`;
  try {
    const cached = await (cache as any).get(key);
    return (cached as string) ?? null;
  } catch {
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
    // Use CACHE_TTL if available on the cache module, otherwise fallback to 300s
    const ttl = options.ttl ?? (cache as any).CACHE_TTL?.MEDIUM ?? 300;
    await (cache as any).set(key, html, ttl);
    return true;
  } catch {
    return false;
  }
}

export async function invalidateComponent(name: string): Promise<number> {
  const pattern = `component:${name}:*`;
  try {
    const deleted = await (cache as any).deletePattern(pattern);
    return deleted ?? 0;
  } catch {
    return 0;
  }
}

export default { getCachedComponent, setCachedComponent, invalidateComponent };
