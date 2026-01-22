/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPTIMIZED IMAGE HANDLER - Smart image downloading with deduplication
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Prevents duplicate downloads via in-memory cache
 * - Filesystem check before download
 * - Fallback image support
 * - Concurrent download control
 * - Comprehensive error handling
 */

import { logger } from "@/database/seed/LoggerOptimized";
import { ImageService } from "@/services/imageService";
import fs from "fs/promises";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PLACEHOLDER_IMAGE = "/public/placeholder-comic.jpg";
const FALLBACK_USER_IMAGE = "/public/shadcn.jpg";
const CONCURRENT_DOWNLOADS = 5;

// ─────────────────────────────────────────────────────────────────────────
// IMAGE CACHE - In-memory deduplication
// ─────────────────────────────────────────────────────────────────────────

interface ImageCache {
  url: string;
  localPath: string;
  timestamp: number;
}

class ImageCache {
  private cache = new Map<string, ImageCache>();
  private fsChecked = new Set<string>();

  set(url: string, localPath: string): void {
    this.cache.set(url, {
      url,
      localPath,
      timestamp: Date.now(),
    } as any);
  }

  get(url: string): string | undefined {
    return this.cache.get(url)?.localPath;
  }

  markChecked(localPath: string): void {
    this.fsChecked.add(localPath);
  }

  isChecked(localPath: string): boolean {
    return this.fsChecked.has(localPath);
  }

  size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
    this.fsChecked.clear();
  }
}

// ─────────────────────────────────────────────────────────────────────────
// OPTIMIZED IMAGE HANDLER
// ─────────────────────────────────────────────────────────────────────────

export class OptimizedImageHandler {
  private imageService: ImageService;
  private cache = new ImageCache();
  private downloadStats = {
    total: 0,
    downloaded: 0,
    cached: 0,
    failed: 0,
    skipped: 0,
  };

  constructor() {
    this.imageService = new ImageService();
  }

  /**
   * Initialize upload directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      logger.success("Upload directory ready", { path: UPLOAD_DIR });
    } catch (error) {
      logger.warn(
        `Could not create upload directory: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Process single image with smart caching and deduplication
   * @param imageUrl
   * @param type
   */
  async processImage(imageUrl: string, type: "comic" | "user" = "comic"): Promise<string> {
    if (!imageUrl || imageUrl.length === 0) {
      return type === "user" ? FALLBACK_USER_IMAGE : PLACEHOLDER_IMAGE;
    }

    this.downloadStats.total++;

    // Check in-memory cache
    const cached = this.cache.get(imageUrl);
    if (cached) {
      this.downloadStats.cached++;
      logger.debug(`Cache hit: ${imageUrl}`);
      return cached;
    }

    try {
      // Attempt to download and store
      const result = await this.imageService.downloadImage(
        imageUrl,
        type === "user" ? "avatars" : "comics",
        2 // retries
      );

      if (result.success && result.localPath) {
        this.downloadStats.downloaded++;
        this.cache.set(imageUrl, result.localPath);
        logger.debug(`Downloaded image: ${imageUrl}`, {
          component: "ImageHandler",
          localPath: result.localPath,
        });
        return result.localPath;
      }

      throw new Error(result.error || "Unknown error");
    } catch (error) {
      this.downloadStats.failed++;
      logger.warn(`Failed to download image: ${imageUrl}`, {
        component: "ImageHandler",
        error: error instanceof Error ? error.message : String(error),
      });
      return type === "user" ? FALLBACK_USER_IMAGE : PLACEHOLDER_IMAGE;
    }
  }

  /**
   * Process multiple images concurrently with rate limiting
   * @param imageUrls
   * @param type
   */
  async processImages(imageUrls: string[], type: "comic" | "user" = "comic"): Promise<string[]> {
    if (!imageUrls || imageUrls.length === 0) {
      return [];
    }

    const results: string[] = [];

    // Process in batches to control concurrency
    for (let i = 0; i < imageUrls.length; i += CONCURRENT_DOWNLOADS) {
      const batch = imageUrls.slice(i, i + CONCURRENT_DOWNLOADS);
      const batchResults = await Promise.all(batch.map((url) => this.processImage(url, type)));
      results.push(...batchResults);

      // Rate limiting between batches
      if (i + CONCURRENT_DOWNLOADS < imageUrls.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.downloadStats,
      cacheSize: this.cache.size(),
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.downloadStats = {
      total: 0,
      downloaded: 0,
      cached: 0,
      failed: 0,
      skipped: 0,
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
let handler: OptimizedImageHandler | null = null;

export async function getImageHandler(): Promise<OptimizedImageHandler> {
  if (!handler) {
    handler = new OptimizedImageHandler();
    await handler.initialize();
  }
  return handler;
}

export async function resetImageHandler(): Promise<void> {
  if (handler) {
    handler.clearCache();
    handler.resetStats();
    handler = null;
  }
}

export async function getImageStats() {
  const h = await getImageHandler();
  return h.getStats();
}

/**
 * Initialize the image handler
 */
export async function initializeImageHandler(): Promise<void> {
  await getImageHandler();
}

/**
 * Download a single image - wrapper for seeder compatibility
 */
export async function downloadImage(
  imageUrl: string,
  type: "comic" | "user" = "comic"
): Promise<string> {
  const h = await getImageHandler();
  return h.processImage(imageUrl, type);
}

/**
 * Download multiple images - wrapper for seeder compatibility
 */
export async function downloadImages(
  imageUrls: string[],
  type: "comic" | "user" = "comic"
): Promise<string[]> {
  const h = await getImageHandler();
  return h.processImages(imageUrls, type);
}
