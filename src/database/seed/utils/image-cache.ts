/**
 * Image Cache Utility - Prevent Duplicate Downloads
 *
 * This module provides caching mechanisms to prevent downloading
 * the same image multiple times during seeding operations.
 *
 * Features:
 * - URL-based caching (same URL = same image)
 * - Hash-based caching (different URLs, same content)
 * - Memory-efficient caching
 * - Thread-safe operations
 */

import { createHash } from "crypto";

// ═══════════════════════════════════════════════════
// CACHE STORAGE
// ═══════════════════════════════════════════════════

// Cache: Original URL -> Uploaded URL
const urlCache = new Map<string, string>();

// Cache: Image Hash -> Uploaded URL (for deduplication)
const hashCache = new Map<string, string>();

// Statistics
let cacheHits = 0;
let cacheMisses = 0;

// ═══════════════════════════════════════════════════
// CACHE OPERATIONS
// ═══════════════════════════════════════════════════

/**
 * Get image hash from buffer
 * @param buffer
 */
export function getImageHash(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Check if URL is already cached
 * @param url
 */
export function isCached(url: string): boolean {
  return urlCache.has(url);
}

/**
 * Get cached URL by original URL
 * @param url
 */
export function getCachedUrl(url: string): string | undefined {
  const cached = urlCache.get(url);
  if (cached) {
    cacheHits++;
  } else {
    cacheMisses++;
  }
  return cached;
}

/**
 * Get cached URL by image hash
 * @param hash
 */
export function getCachedByHash(hash: string): string | undefined {
  const cached = hashCache.get(hash);
  if (cached) {
    cacheHits++;
  }
  return cached;
}

/**
 * Cache image URL
 * @param originalUrl
 * @param uploadedUrl
 * @param imageHash
 */
export function cacheImage(originalUrl: string, uploadedUrl: string, imageHash?: string): void {
  urlCache.set(originalUrl, uploadedUrl);

  if (imageHash) {
    hashCache.set(imageHash, uploadedUrl);
  }
}

/**
 * Check if image hash exists in cache
 * @param hash
 */
export function hasHash(hash: string): boolean {
  return hashCache.has(hash);
}

/**
 * Clear all caches
 */
export function clearCache(): void {
  urlCache.clear();
  hashCache.clear();
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    urlCacheSize: urlCache.size,
    hashCacheSize: hashCache.size,
    cacheHits,
    cacheMisses,
    hitRate: cacheHits + cacheMisses > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0,
  };
}

/**
 * Get all cached URLs
 */
export function getAllCachedUrls(): Map<string, string> {
  return new Map(urlCache);
}

/**
 * Export cache for debugging
 */
export function exportCache() {
  return {
    urlCache: [...urlCache.entries()],
    hashCache: [...hashCache.entries()],
    stats: getCacheStats(),
  };
}

// ═══════════════════════════════════════════════════
// CACHE SINGLETON
// ═══════════════════════════════════════════════════

export const imageCache = {
  isCached,
  getCachedUrl,
  getCachedByHash,
  cacheImage,
  hasHash,
  getImageHash,
  clearCache,
  getCacheStats,
  getAllCachedUrls,
  exportCache,
};

export default imageCache;
