/**
 * 🌱 Image Service Wrapper - Integration with existing imageService.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * Handles image downloads with caching and deduplication
 */

import { logger } from "@/database/seed/logger";
import { ImageService } from "@/services/imageService";
import fs from "fs/promises";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE DOWNLOAD RESULT
// ═══════════════════════════════════════════════════════════════════════════

export interface ImageDownloadResult {
  original: string;
  local?: string;
  cached: boolean;
  success: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE HANDLER SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

let imageService: ImageService | null = null;
const downloadCache = new Map<string, string>();
const fileSystemCache = new Set<string>();

/**
 * Get or initialize image service
 */
export async function getImageHandler(): Promise<ImageService> {
  imageService ??= new ImageService();
  return imageService;
}

/**
 * Build file path for upload directory
 * @param filename
 */
export function getUploadPath(filename: string): string {
  return path.join(process.cwd(), "public", "uploads", filename);
}

/**
 * Check if file exists locally
 * @param filePath
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load file system cache on startup
 */
async function initializeFileSystemCache(): Promise<void> {
  try {
    const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
    const files = await fs.readdir(uploadsDirectory, { withFileTypes: true });

    files.forEach((file) => {
      if (file.isFile()) {
        fileSystemCache.add(file.name);
      }
    });

    logger.debug(`Initialized file system cache with ${fileSystemCache.size} files`);
  } catch (error) {
    logger.warn(`Failed to initialize file system cache: ${error}`);
  }
}

/**
 * Extract filename from URL
 * @param url
 */
function extractFilename(url: string): string {
  try {
    const urlPath = new URL(url).pathname;
    return path.basename(urlPath);
  } catch {
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DOWNLOAD IMAGE WITH CACHING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Download image with 3-layer caching strategy:
 * 1. Session cache (in-memory) - fastest, prevents re-processing within session
 * 2. File system check - prevents re-downloading existing files
 * 3. Remote download via imageService - only if needed
 *
 * Implements DRY principle: each image URL downloaded maximum once per session
 * @param url - Remote image URL
 * @param subDirectory - Storage subdirectory
 */
export async function downloadImage(
  url: string,
  subDirectory: string = "uploads"
): Promise<ImageDownloadResult> {
  if (!url) {
    return {
      original: url,
      success: false,
      cached: false,
      error: "Empty URL",
    };
  }

  // Check if it's a local path (starts with / or relative path) - no download needed
  if (url.startsWith("/") || (!url.startsWith("http://") && !url.startsWith("https://"))) {
    downloadCache.set(url, url);
    return {
      original: url,
      local: url,
      success: true,
      cached: true,
    };
  }

  // Layer 1: Session cache - prevents re-downloading within the same seed operation
  if (downloadCache.has(url)) {
    const cached = downloadCache.get(url);
    if (cached) {
      return {
        original: url,
        local: cached,
        success: true,
        cached: true,
      };
    }
  }

  try {
    // Layer 2: File system cache - prevents re-downloading files that exist
    const filename = extractFilename(url);
    if (filename && fileSystemCache.has(filename)) {
      const localPath = `/uploads/${filename}`;
      downloadCache.set(url, localPath);
      return {
        original: url,
        local: localPath,
        success: true,
        cached: true,
      };
    }

    // Layer 3: Download via imageService - only if not in cache
    const imageHandler = await getImageHandler();
    const result = await imageHandler.downloadImage(url, subDirectory);

    if (result.success && result.localPath) {
      downloadCache.set(url, result.localPath);
      fileSystemCache.add(path.basename(result.localPath));
      return {
        original: url,
        local: result.localPath,
        success: true,
        cached: false,
      };
    } else {
      return {
        original: url,
        success: false,
        cached: false,
        error: result.error ?? "Download failed",
      };
    }
  } catch (error) {
    logger.warn(`Failed to download image: ${url.slice(0, 80)}... - ${error}`);
    return {
      original: url,
      success: false,
      cached: false,
      error: String(error),
    };
  }
}

/**
 * Download multiple images with concurrency control
 * @param urls - Array of image URLs
 * @param folder - Optional folder path for storage
 * @param concurrency - Maximum parallel downloads
 */
export async function downloadImages(
  urls: string[],
  folder?: string | number,
  concurrency?: number
): Promise<ImageDownloadResult[]> {
  const results: ImageDownloadResult[] = [];
  const chunks: string[][] = [];

  // Handle overloading: if folder is a number, it's concurrency
  let actualFolder = "uploads";
  let actualConcurrency = 3;

  if (typeof folder === "number") {
    actualConcurrency = folder;
  } else if (typeof folder === "string") {
    actualFolder = folder;
    if (typeof concurrency === "number") {
      actualConcurrency = concurrency;
    }
  }

  for (let i = 0; i < urls.length; i += actualConcurrency) {
    chunks.push(urls.slice(i, i + actualConcurrency));
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map((url) => downloadImage(url, actualFolder)));
    results.push(...chunkResults);
  }

  return results;
}

/**
 * Initialize image handler
 */
export async function initializeImageHandler(): Promise<void> {
  await getImageHandler();
  await initializeFileSystemCache();
  logger.info("Image handler initialized");
}

/**
 * Get image statistics
 */
export function getImageStats(): {
  sessionCached: number;
  fileSystemCached: number;
  totalUnique: number;
} {
  return {
    sessionCached: downloadCache.size,
    fileSystemCached: fileSystemCache.size,
    totalUnique: downloadCache.size + fileSystemCache.size,
  };
}

/**
 * Reset image handler
 */
export function resetImageHandler(): void {
  imageService = null;
  downloadCache.clear();
  fileSystemCache.clear();
  logger.debug("Image handler reset");
}
