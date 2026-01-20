// ═══════════════════════════════════════════════════
// IMAGEKIT UPLOAD PROVIDER
// Next.js 16.0.7 + ImageKit Integration
// ═══════════════════════════════════════════════════

import { env } from "@/appConfig";
import { logger } from "@/database/seed/logger";
import type { UploadOptions, UploadProvider, UploadResult } from "@/services/upload/types";
import ImageKit from "imagekit";

// Validate ImageKit configuration
if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
  throw new Error(
    "ImageKit configuration missing. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT."
  );
}

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});

export class ImageKitProvider implements UploadProvider {
  /**
   * Upload file to ImageKit with improved error handling
   * @param file
   * @param options
   */
  async upload(
    file: File | Buffer,
    options: UploadOptions & { transformation?: Record<string, unknown> } = {}
  ): Promise<UploadResult> {
    try {
      let buffer: Buffer;
      // Convert File to Buffer if needed
      if (typeof File !== "undefined" && file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else if (Buffer.isBuffer(file)) {
        buffer = file;
      } else {
        return {
          url: "",
          publicId: "",
          size: 0,
          format: "",
          success: false,
          error: "Invalid file type. Must be Buffer or File.",
        };
      }

      // Validate buffer size (ImageKit has limits)
      const maxSize = 25 * 1024 * 1024; // 25MB limit
      if (buffer.length > maxSize) {
        return {
          url: "",
          publicId: "",
          size: buffer.length,
          format: "",
          success: false,
          error: `File too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (max ${maxSize / 1024 / 1024}MB)`,
        };
      }

      // Prepare transformation options
      const transformation = options.transformation ?? undefined;

      logger.info(`${transformation}`);

      // Upload to ImageKit with timeout
      const uploadPromise = imagekit.upload({
        file: buffer,
        fileName: options.filename ?? `image-${Date.now()}`,
        folder: options.folder ?? "/comicwise",
        tags: options.tags,
        useUniqueFileName: !options.filename,
      });

      // Add timeout to upload
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout after 60s")), 60000)
      );

      const result = await Promise.race([uploadPromise, timeoutPromise]);

      return {
        url: (result as any).url,
        publicId: (result as any).fileId,
        width: (result as any).width,
        height: (result as any).height,
        format: (result as any).fileType,
        size: (result as any).size,
        thumbnail: this.getThumbnailUrl((result as any).url),
        success: true,
      };
    } catch (error) {
      // Extract meaningful error message
      let errorMessage = "ImageKit upload failed";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for common ImageKit errors
        if (errorMessage.includes("timeout") ?? errorMessage.includes("ETIMEDOUT")) {
          errorMessage = "Upload timeout - image may be too large or network is slow";
        } else if (errorMessage.includes("ECONNREFUSED") ?? errorMessage.includes("ENOTFOUND")) {
          errorMessage = "Network connection failed";
        } else if (errorMessage.includes("401") ?? errorMessage.includes("Unauthorized")) {
          errorMessage = "ImageKit authentication failed - check API keys";
        } else if (errorMessage.includes("413") ?? errorMessage.includes("too large")) {
          errorMessage = "File size exceeds ImageKit limits";
        }
      }

      return {
        url: "",
        publicId: "",
        size: 0,
        format: "",
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Delete file from ImageKit
   * @param publicId
   */
  async delete(publicId: string): Promise<boolean> {
    try {
      await imagekit.deleteFile({ fileId: publicId });
      return true;
    } catch (error) {
      console.error("ImageKit delete error:", error);
      return false;
    }
  }

  /**
   * Get optimized URL with transformations
   * @param publicId
   * @param transformation
   */
  getUrl(publicId: string, transformation?: Record<string, unknown>): string {
    try {
      return imagekit.url({
        path: publicId,
        transformation: this.buildTransformation(transformation),
      });
    } catch (error) {
      console.error("ImageKit URL generation error:", error);
      return publicId;
    }
  }

  /**
   * Get thumbnail URL
   * @param url
   * @param width
   * @param height
   */
  getThumbnailUrl(url: string, width = 300, height = 300): string {
    return imagekit.url({
      path: url,
      transformation: [
        {
          width: width.toString(),
          height: height.toString(),
          cropMode: "at_max",
          quality: "80",
        },
      ],
    });
  }

  /**
   * Get responsive image URLs
   * @param url
   */
  getResponsiveUrls(url: string): Record<string, string> {
    return {
      small: this.getTransformedUrl(url, { width: 640 }),
      medium: this.getTransformedUrl(url, { width: 1024 }),
      large: this.getTransformedUrl(url, { width: 1920 }),
      thumbnail: this.getThumbnailUrl(url),
    };
  }

  /**
   * Helper: Build transformation string
   * @param transformation
   */
  private buildTransformation(transformation?: Record<string, unknown>): Array<{
    [key: string]: string;
  }> {
    if (!transformation) {
      return [{ quality: "80", format: "auto" }];
    }

    const transformationArray: Array<{ [key: string]: string }> = [];
    const transformObject: { [key: string]: string } = {};

    const allowedKeys = [
      "width",
      "height",
      "quality",
      "format",
      "cropMode",
      "focus",
      "radius",
      "background",
      "border",
      "rotation",
      "blur",
      "named",
    ];
    for (const allowedKey of allowedKeys) {
      if (
        Object.prototype.hasOwnProperty.call(transformation, allowedKey) &&
        typeof transformation[allowedKey] !== "object" &&
        typeof transformation[allowedKey] !== "function"
      ) {
        transformObject[allowedKey] = String(transformation[allowedKey]);
      }
    }

    transformationArray.push(transformObject);
    return transformationArray;
  }

  /**
   * Helper: Get transformed URL
   * @param url
   * @param transformation
   */
  private getTransformedUrl(url: string, transformation: Record<string, unknown>): string {
    return imagekit.url({
      path: url,
      transformation: this.buildTransformation(transformation),
    });
  }

  /**
   * Bulk upload images
   * @param files
   * @param options
   */
  async bulkUpload(
    files: Array<File | Buffer>,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.upload(file, options);
        results.push(result);
      } catch (error) {
        console.error("Bulk upload error:", error);
        // Continue with other files
      }
    }

    return results;
  }
}
