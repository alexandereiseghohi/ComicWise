/**
 * Image Seeder Helper Utilities
 * Handles downloading and caching images during seeding
 * Prevents re-downloading of existing images using ImageService caching
 *
 * Features:
 * - Deduplicates image URLs to avoid multiple downloads
 * - Caches downloaded image URLs/paths
 * - Integrates with ImageService for storage
 * - Handles fallback for download failures
 */

import { logger } from "@/database/seed/logger";
import { ImageService } from "@/services/image-service";
import crypto from "crypto";

export interface CachedImage {
  originalUrl: string;
  localPath: string;
  checksum: string;
  downloadedAt: Date;
}

/**
 * Image Cache Manager - Singleton pattern
 * Prevents re-downloading images during seed operations
 */
export class ImageCacheManager {
  private static instance: ImageCacheManager;
  private imageCache = new Map<string, CachedImage>();
  private imageService = new ImageService();
  private downloadStats = { attempted: 0, successful: 0, failed: 0, cached: 0 };

  private constructor() {}

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  /**
   * Get cached image or download if not cached
   * Uses ImageService to handle actual download/storage
   * @param url
   * @param _context
   */
  async getOrDownloadImage(url: string, _context: string = "unknown"): Promise<string | undefined> {
    // Check if already cached
    const cached = this.imageCache.get(url);
    if (cached) {
      this.downloadStats.cached++;
      logger.debug(`Using cached image: ${url}`);
      return cached.localPath;
    }

    try {
      this.downloadStats.attempted++;
      logger.debug(`Downloading image: ${url}`);

      // Use ImageService to download and store
      const result = await this.imageService.downloadImage(url);

      if (result.success) {
        const cached: CachedImage = {
          originalUrl: url,
          localPath: result.url,
          checksum: this.generateChecksum(url),
          downloadedAt: new Date(),
        };
        this.imageCache.set(url, cached);
        this.downloadStats.successful++;
        logger.debug(`Successfully downloaded image: ${url}`);
        return result.url;
      } else {
        this.downloadStats.failed++;
        logger.warn(`Failed to download image: ${url} - ${result.error}`);
        return undefined;
      }
    } catch (error) {
      this.downloadStats.failed++;
      logger.error(
        `Error downloading image ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return undefined;
    }
  }

  /**
   * Download multiple images with deduplication
   * Only downloads unique URLs
   * @param urls
   * @param context
   */
  async getOrDownloadImages(
    urls: string[],
    context: string = "unknown"
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    // Deduplicate URLs
    const uniqueUrls = [...new Set(urls)];

    for (const url of uniqueUrls) {
      const result = await this.getOrDownloadImage(url, context);
      if (result) {
        results.set(url, result);
      }
    }

    return results;
  }

  /**
   * Generate checksum for URL (for duplicate detection)
   * @param url
   */
  private generateChecksum(url: string): string {
    return crypto.createHash("md5").update(url).digest("hex");
  }

  /**
   * Get download statistics
   */
  getStats(): {
    attempted: number;
    successful: number;
    failed: number;
    cached: number;
    cacheSize: number;
  } {
    return {
      ...this.downloadStats,
      cacheSize: this.imageCache.size,
    };
  }

  /**
   * Clear cache (for fresh downloads)
   */
  clearCache(): void {
    this.imageCache.clear();
    this.downloadStats = { attempted: 0, successful: 0, failed: 0, cached: 0 };
    logger.info("Image cache cleared");
  }

  /**
   * Log cache statistics
   */
  logStats(): void {
    const stats = this.getStats();
    logger.info(
      `Image Download Stats - Attempted: ${stats.attempted}, Successful: ${stats.successful}, Cached: ${stats.cached}, Failed: ${stats.failed}`
    );
  }
}

/**
 * Extract image URLs from comic/chapter data
 * Handles various data formats
 * @param data
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function extractImageUrls(data: Record<string, unknown>): string[] {
  const urls: string[] = [];

  // Direct cover/image URL
  if (data["coverImage"] && typeof data["coverImage"] === "string") {
    urls.push(data["coverImage"]);
  }

  if (data["image"] && typeof data["image"] === "string") {
    urls.push(data["image"]);
  }

  // Array of image objects with URLs
  if (Array.isArray(data["images"])) {
    for (const img of data["images"]) {
      if (typeof img === "string") {
        urls.push(img);
      } else if (typeof img === "object" && img.url) {
        urls.push(img.url);
      }
    }
  }

  // Array of image URLs
  if (Array.isArray(data["image_urls"])) {
    for (const img of data["image_urls"]) {
      if (typeof img === "string") {
        urls.push(img);
      }
    }
  }

  // Chapter page URLs
  if (Array.isArray(data["pages"])) {
    for (const page of data["pages"]) {
      if (typeof page === "string") {
        urls.push(page);
      } else if (typeof page === "object" && page.url) {
        urls.push(page.url);
      }
    }
  }

  return urls.filter((url) => url.startsWith("http"));
}

/**
 * Singleton instance accessor
 */
export const imageCacheManager = ImageCacheManager.getInstance();
