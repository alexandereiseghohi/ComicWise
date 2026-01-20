// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE SERVICE - Download and store remote images using configured upload provider
// Dynamically uses UPLOAD_PROVIDER from environment (.env.local)
// Supports: local, imagekit, cloudinary
// Uses dynamic imports to prevent bundling upload provider logic into client
// ═══════════════════════════════════════════════════════════════════════════════

import type { UploadProvider } from "@/services/upload/types";
import crypto from "crypto";
import { existsSync } from "fs";
import path from "path";

export interface ImageDownloadResult {
  success: boolean;
  localPath?: string;
  url: string;
  error?: string;
}

/**
 * ImageService handles downloading remote images and storing them using the
 * configured upload provider (specified in UPLOAD_PROVIDER env variable).
 *
 * Features:
 * - Supports multiple storage backends (local, imagekit, cloudinary)
 * - Automatic provider initialization from env configuration
 * - Built-in caching to avoid duplicate downloads
 * - Batch download with concurrency control
 * - Automatic retry logic for failed downloads
 */
export class ImageService {
  private readonly downloadedImages = new Map<string, string>();
  private uploadProvider: UploadProvider | null = null;
  private providerInitialized = false;
  private lastUploadTime = 0;
  private readonly minUploadInterval = 100; // Minimum 100ms between uploads to avoid rate limits

  /**
   * Get or initialize the upload provider from environment configuration
   * Uses dynamic import to avoid bundling into client bundles
   */
  private async getProvider(): Promise<UploadProvider> {
    if (!this.uploadProvider && !this.providerInitialized) {
      // Dynamic import prevents provider logic from being bundled
      const { getUploadProvider } = await import("@/services/upload/factory");
      this.uploadProvider = await getUploadProvider();
      this.providerInitialized = true;
    }

    if (!this.uploadProvider) {
      throw new Error("Failed to initialize upload provider");
    }

    return this.uploadProvider;
  }

  /**
   * Check if file exists in local filesystem (for local provider)
   * @param relativePath - Path relative to public directory (e.g., "/comics/covers/slug/cover.jpg")
   */
  private fileExistsLocally(relativePath: string): boolean {
    try {
      const publicDir = path.join(process.cwd(), "public");
      const fullPath = path.join(publicDir, relativePath.replace(/^\//, ""));
      return existsSync(fullPath);
    } catch {
      return false;
    }
  }

  /**
   * Generate a hash for the image URL to use as filename
   * Ensures unique filenames regardless of source URL
   * @param url
   */
  private generateHash(url: string): string {
    return crypto.createHash("md5").update(url).digest("hex");
  }

  /**
   * Extract file extension from URL
   * Supports common image formats: jpg, jpeg, png, gif, webp, svg
   * @param url
   */
  private getExtension(url: string): string {
    try {
      const urlPath = new URL(url).pathname;
      const match = urlPath.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i);
      return match ? match[0].toLowerCase() : ".jpg"; // Default to .jpg
    } catch {
      return ".jpg";
    }
  }

  /**
   * Download image from URL and save using configured upload provider
   * with retry logic, filesystem checking, and improved error handling
   *
   * @param url - Remote image URL to download
   * @param subDirectory - Subdirectory in storage (e.g., "avatars", "comics/123")
   * @param retries - Number of retry attempts (default: 2)
   * @returns ImageDownloadResult with success status and URL/error details
   */
  async downloadImage(
    url: string,
    subDirectory: string = "uploads",
    retries: number = 2
  ): Promise<ImageDownloadResult> {
    try {
      // Check cache first - avoid duplicate downloads
      if (this.downloadedImages.has(url)) {
        return {
          success: true,
          localPath: this.downloadedImages.get(url)!,
          url,
        };
      }

      // Validate URL before attempting download
      try {
        new URL(url);
      } catch {
        return this.createPlaceholderResult(url, "Invalid URL format");
      }

      // Generate the expected local path with original extension
      const hash = this.generateHash(url);
      const extension = this.getExtension(url);
      const expectedPath = `/${subDirectory}/${hash}${extension}`.replaceAll(/\/+/g, "/");

      // Check if file already exists locally (for local provider)
      if (this.fileExistsLocally(expectedPath)) {
        this.downloadedImages.set(url, expectedPath);
        return {
          success: true,
          localPath: expectedPath,
          url,
        };
      }

      let lastError: Error | null = null;

      // Retry logic
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          // Download the image with proper headers
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Accept: "image/*",
            },
            signal: AbortSignal.timeout(45000), // 45 second timeout
          });

          if (!response.ok) {
            // Don't retry on 404s or 403s
            if (response.status === 404 || response.status === 403) {
              return this.createPlaceholderResult(
                url,
                `HTTP ${response.status}: ${response.statusText}`
              );
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Convert response to Buffer
          const buffer = Buffer.from(await response.arrayBuffer());

          // Validate buffer has content
          if (buffer.length === 0) {
            throw new Error("Downloaded image is empty");
          }

          // Get upload provider (uses UPLOAD_PROVIDER from .env.local)
          const provider = await this.getProvider();

          // Rate limiting: ensure minimum interval between uploads
          const now = Date.now();
          const timeSinceLastUpload = now - this.lastUploadTime;
          if (timeSinceLastUpload < this.minUploadInterval) {
            await new Promise((resolve) =>
              setTimeout(resolve, this.minUploadInterval - timeSinceLastUpload)
            );
          }

          // Upload via configured provider (local/imagekit/cloudinary)
          const uploadResult = await provider.upload(buffer, {
            folder: subDirectory,
            filename: `${hash}${extension}`, // Include original extension
            tags: ["seed", "downloaded"], // Tag for organization
          });

          this.lastUploadTime = Date.now();

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || "Upload failed");
          }

          // Cache the result for future requests
          const publicUrl = uploadResult.url;
          this.downloadedImages.set(url, publicUrl);

          return {
            success: true,
            localPath: publicUrl,
            url,
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Wait before retry (exponential backoff)
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
      }

      // All retries failed - use placeholder
      return this.createPlaceholderResult(url, lastError?.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return this.createPlaceholderResult(url, errorMessage);
    }
  }

  /**
   * Create a placeholder result for failed downloads
   * Silently falls back without logging to reduce noise
   * param url
   * param errorMessage
   * @param url
   * @param errorMessage
   */
  private createPlaceholderResult(url: string, errorMessage?: string): ImageDownloadResult {
    const placeholderUrl = "/placeholder-comic.jpg";
    this.downloadedImages.set(url, placeholderUrl);

    // Only log if it's not a common error
    if (errorMessage && !errorMessage.includes("404") && !errorMessage.includes("403")) {
      console.warn(`Image fallback for ${url.slice(0, 60)}...: ${errorMessage}`);
    }

    return {
      success: true,
      localPath: placeholderUrl,
      url,
      error: errorMessage,
    };
  }

  /**
   * Download multiple images in parallel with configurable concurrency
   *
   * param urls - Array of image URLs to download
   * param subDirectory - Subdirectory in storage
   * param concurrency - Maximum parallel downloads (default: 5)
   * returns Array of download results
   * @param urls
   * @param subDirectory
   * @param concurrency
   */
  async downloadImageBatch(
    urls: string[],
    subDirectory: string = "uploads",
    concurrency: number = 5
  ): Promise<ImageDownloadResult[]> {
    const results: ImageDownloadResult[] = [];

    // Process in batches with concurrency control
    for (let index = 0; index < urls.length; index += concurrency) {
      const batch = urls.slice(index, index + concurrency);
      const batchResults = await Promise.all(
        batch.map((url) => this.downloadImage(url, subDirectory))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Process image URL - download if remote URL, return as-is if local path
   * Useful for handling mixed local/remote image sources
   *
   * param url - Image URL or local path
   * param subDirectory - Where to store if downloading
   * returns Public URL (local or remote) or null if processing failed
   * @param url
   * @param subDirectory
   */
  async processImageUrl(
    url: string | null | undefined,
    subDirectory: string = "uploads"
  ): Promise<string | null> {
    if (!url) {
      return null;
    }

    // If it's already a local path or not an HTTP URL, return as-is
    if (url.startsWith("/") || !url.startsWith("http")) {
      return url;
    }

    // Download and upload remote image
    const result = await this.downloadImage(url, subDirectory);
    return result.success ? result.localPath! : null;
  }

  /**
   * Get statistics about cached downloads
   */
  getStats() {
    return {
      totalDownloaded: this.downloadedImages.size,
      images: [...this.downloadedImages.entries()].map(([sourceUrl, publicUrl]) => ({
        sourceUrl,
        publicUrl,
      })),
    };
  }

  /**
   * Clear the download cache
   * Useful for testing or memory management
   */
  clearCache() {
    this.downloadedImages.clear();
  }
}

// Export singleton instance
// Uses UPLOAD_PROVIDER from .env.local (local/imagekit/cloudinary)
export const imageService = new ImageService();
