/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Image Downloader - Optimized Image Download & Caching System
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Download images with retry logic
 * - Check for existing files (no duplicate downloads)
 * - Save with original filename and extension
 * - Progress tracking and logging
 * - Error handling and recovery
 */

import { logger } from "@/database/seed/logger";
import axios from "axios";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export interface ImageDownloadOptions {
  url: string;
  destinationPath: string;
  filename?: string;
  maxRetries?: number;
  timeout?: number;
  skipIfExists?: boolean;
}

export interface ImageDownloadResult {
  success: boolean;
  filePath?: string;
  filename?: string;
  size?: number;
  fromCache?: boolean;
  error?: string;
}

/**
 * Download an image from URL to local filesystem
 * @param options
 */
export async function downloadImage(options: ImageDownloadOptions): Promise<ImageDownloadResult> {
  const {
    url,
    destinationPath,
    filename,
    maxRetries = 3,
    timeout = 30000,
    skipIfExists = true,
  } = options;

  try {
    // Ensure destination directory exists
    await fs.mkdir(destinationPath, { recursive: true });

    // Determine filename
    let finalFilename = filename;
    if (!finalFilename) {
      // Extract filename from URL
      const urlParts = new URL(url).pathname.split("/");
      finalFilename = urlParts[urlParts.length - 1] || `image_${Date.now()}.jpg`;
    }

    // Ensure filename has extension
    if (!path.extname(finalFilename)) {
      finalFilename += ".jpg";
    }

    const filePath = path.join(destinationPath, finalFilename);

    // Check if file already exists
    if (skipIfExists) {
      try {
        const stats = await fs.stat(filePath);
        if (stats.size > 0) {
          logger.debug(`Image already exists: ${finalFilename}`);
          return {
            success: true,
            filePath,
            filename: finalFilename,
            size: stats.size,
            fromCache: true,
          };
        }
      } catch {
        // File doesn't exist, proceed with download
      }
    }

    // Download image with retries
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Downloading image (attempt ${attempt}/${maxRetries}): ${url}`);

        const response = await axios.get(url, {
          responseType: "arraybuffer",
          timeout,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        // Save to file
        await fs.writeFile(filePath, Buffer.from(response.data));

        const stats = await fs.stat(filePath);

        logger.info(`✓ Downloaded: ${finalFilename} (${(stats.size / 1024).toFixed(2)} KB)`);

        return {
          success: true,
          filePath,
          filename: finalFilename,
          size: stats.size,
          fromCache: false,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`Download attempt ${attempt} failed for ${url}: ${lastError.message}`);

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError?.message || "Download failed after all retries",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Image download error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get hash of image URL for caching
 * @param url
 */
export function getImageHash(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex");
}

/**
 * Check if image exists in filesystem
 * @param filePath
 */
export async function imageExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile() && stats.size > 0;
  } catch {
    return false;
  }
}

/**
 * Download multiple images in batches
 * @param images
 * @param concurrency
 */
export async function downloadImagesBatch(
  images: ImageDownloadOptions[],
  concurrency = 5
): Promise<ImageDownloadResult[]> {
  const results: ImageDownloadResult[] = [];

  logger.info(`Downloading ${images.length} images with concurrency ${concurrency}`);

  for (let i = 0; i < images.length; i += concurrency) {
    const batch = images.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((img) => downloadImage(img)));
    results.push(...batchResults);

    logger.info(
      `Progress: ${Math.min(i + concurrency, images.length)}/${images.length} images processed`
    );
  }

  const successful = results.filter((r) => r.success).length;
  const cached = results.filter((r) => r.fromCache).length;
  const failed = results.filter((r) => !r.success).length;

  logger.info(
    `Download complete: ${successful} successful, ${cached} from cache, ${failed} failed`
  );

  return results;
}

/**
 * Clean filename for filesystem
 * @param filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replaceAll(/["*/:<>?\\|]/g, "_")
    .replaceAll(/\s+/g, "_")
    .replaceAll(/_+/g, "_")
    .trim();
}

/**
 * Extract extension from URL or content-type
 * @param url
 * @param contentType
 */
export function getImageExtension(url: string, contentType?: string): string {
  // Try to get from URL
  const urlExtension = path.extname(new URL(url).pathname);
  if (
    urlExtension &&
    [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(urlExtension.toLowerCase())
  ) {
    return urlExtension;
  }

  // Try to get from content-type
  if (contentType) {
    const typeMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/avif": ".avif",
    };
    return typeMap[contentType] || ".jpg";
  }

  return ".jpg";
}

/**
 * Extract filename from URL with extension
 */
export function getOriginalFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = path.basename(pathname);
    return filename || `image-${Date.now()}.jpg`;
  } catch {
    return `image-${Date.now()}.jpg`;
  }
}

/**
 * Download multiple images with concurrency control
 */
export async function downloadImagesWithConcurrency(
  downloads: Array<{
    url: string;
    outputPath: string;
    fallbackImage?: string;
    skipIfExists?: boolean;
  }>,
  concurrency = 5
): Promise<Array<{ success: boolean; path: string; cached: boolean; error?: string }>> {
  const results: Array<{ success: boolean; path: string; cached: boolean; error?: string }> = [];

  for (let i = 0; i < downloads.length; i += concurrency) {
    const batch = downloads.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async ({ url, outputPath, fallbackImage, skipIfExists }) => {
        // Check if exists
        if (skipIfExists && (await imageExists(outputPath))) {
          return { success: true, path: outputPath, cached: true };
        }

        const result = await downloadImage({
          url,
          destinationPath: path.dirname(outputPath),
          filename: path.basename(outputPath),
          skipIfExists,
        });

        return {
          success: result.success,
          path: result.filePath || outputPath,
          cached: result.fromCache || false,
          error: result.error,
        };
      })
    );
    results.push(...batchResults);
  }

  return results;
}
