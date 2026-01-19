/**
 * Seed Image Manager
 * Handles image downloading, caching, and storage for seed data
 * Prevents duplicate downloads and ensures file system optimization
 */

import { logger } from "@/database/seed/logger";
import crypto from "crypto";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ImageDownloadResult {
  original: string;
  local?: string;
  cached: boolean;
  success: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE MANAGER
// ═══════════════════════════════════════════════════════════════════════════

export class SeedImageManager {
  private downloadedUrls = new Set<string>();
  private uploadDir = path.join(process.cwd(), "public/uploads");
  private urlToLocalPath = new Map<string, string>();

  /**
   * Initialize upload directory
   */
  async init(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      logger.debug(`Image upload directory ready: ${this.uploadDir}`);
    } catch (error) {
      logger.error(`Failed to create upload directory: ${error}`);
    }
  }

  /**
   * Generate unique filename from URL
   * @param url
   */
  private generateFilename(url: string): string {
    const hash = crypto.createHash("md5").update(url).digest("hex");
    const extension = this.getExtension(url);
    return `${hash}${extension}`;
  }

  /**
   * Extract file extension from URL
   * @param url
   */
  private getExtension(url: string): string {
    try {
      const urlPath = new URL(url).pathname;
      const extension = path.extname(urlPath) || ".webp";
      return extension;
    } catch {
      return ".webp";
    }
  }

  /**
   * Download image from URL (only if not already cached locally)
   * Returns local path relative to public folder
   * @param url
   */
  async downloadImage(url: string): Promise<ImageDownloadResult> {
    // Check if already processed in this session
    if (this.downloadedUrls.has(url)) {
      const localPath = this.urlToLocalPath.get(url);
      return {
        original: url,
        local: localPath,
        cached: true,
        success: true,
      };
    }

    // Check if file already exists on file system
    const filename = this.generateFilename(url);
    const filePath = path.join(this.uploadDir, filename);
    const localPath = `/uploads/${filename}`;

    if (existsSync(filePath)) {
      this.downloadedUrls.add(url);
      this.urlToLocalPath.set(url, localPath);
      logger.debug(`Image already exists locally: ${filename}`);
      return {
        original: url,
        local: localPath,
        cached: true,
        success: true,
      };
    }

    try {
      // Download the image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      this.downloadedUrls.add(url);
      this.urlToLocalPath.set(url, localPath);

      logger.debug(`Downloaded image: ${filename}`);
      return {
        original: url,
        local: localPath,
        cached: false,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.warn(`Failed to download ${url}: ${errorMessage}`);
      return {
        original: url,
        cached: false,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Download multiple images in parallel with rate limiting
   * @param urls
   * @param concurrency
   */
  async downloadImages(urls: string[], concurrency: number = 3): Promise<ImageDownloadResult[]> {
    const results: ImageDownloadResult[] = [];
    const queue = [...urls];
    const active = new Set<Promise<ImageDownloadResult>>();

    while (queue.length > 0 || active.size > 0) {
      while (active.size < concurrency && queue.length > 0) {
        const url = queue.shift()!;
        const promise = this.downloadImage(url).then((result) => {
          active.delete(promise);
          return result;
        });
        active.add(promise);
      }

      if (active.size > 0) {
        results.push(await Promise.race(active));
      }
    }

    return results;
  }

  /**
   * Get statistics for logging
   */
  getStats() {
    return {
      totalProcessed: this.downloadedUrls.size,
      cachedUrls: [...this.downloadedUrls],
      localMappings: Object.fromEntries(this.urlToLocalPath),
    };
  }

  /**
   * Reset manager for new seed operation
   */
  reset(): void {
    this.downloadedUrls.clear();
    this.urlToLocalPath.clear();
    logger.debug("Image manager reset");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

let instance: SeedImageManager | null = null;

export async function getImageManager(): Promise<SeedImageManager> {
  if (!instance) {
    instance = new SeedImageManager();
    await instance.init();
  }
  return instance;
}

export function resetImageManager(): void {
  if (instance) {
    instance.reset();
  }
}
