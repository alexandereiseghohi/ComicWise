/**
 * Image Service - Handles image optimization, upload, and management
 *
 * Features:
 * - WebP conversion
 * - Image compression
 * - Thumbnail generation
 * - CDN integration ready
 * - Local/cloud storage support
 */

import { createHash } from "crypto";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

// ═══════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════

const IMAGE_CONFIG = {
  uploadDir: path.join(process.cwd(), "public", "uploads"),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ["jpeg", "jpg", "png", "webp", "gif"] as const,
  quality: {
    webp: 85,
    jpeg: 85,
    png: 90,
  },
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 400 },
    medium: { width: 600, height: 800 },
    large: { width: 1200, height: 1600 },
  },
};

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface ImageUploadOptions {
  folder?: string;
  generateThumbnail?: boolean;
  convertToWebP?: boolean;
  sizes?: ("thumbnail" | "small" | "medium" | "large")[];
}

export interface ImageUploadResult {
  originalUrl: string;
  webpUrl?: string;
  thumbnailUrl?: string;
  variants?: Record<string, string>;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    hash: string;
  };
}

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Generate hash for file deduplication
 * @param buffer
 */
function generateHash(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}

/**
 * Ensure directory exists
 * @param dir
 */
async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Generate unique filename
 * @param originalName
 * @param hash
 * @param suffix
 */
function generateFilename(originalName: string, hash: string, suffix?: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const safeName = name.replaceAll(/[^\da-z]/gi, "-").toLowerCase();
  const suffixPart = suffix ? `-${suffix}` : "";
  return `${safeName}-${hash}${suffixPart}-${timestamp}${ext}`;
}

// ═══════════════════════════════════════════════════
// IMAGE PROCESSING
// ═══════════════════════════════════════════════════

/**
 * Optimize and process image
 * @param buffer
 * @param options
 * @param options.width
 * @param options.height
 * @param options.format
 * @param options.quality
 * @param options.fit
 */
async function processImage(
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    format?: "jpeg" | "png" | "webp";
    quality?: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  } = {}
): Promise<Buffer> {
  const {
    width,
    height,
    format,
    quality = IMAGE_CONFIG.quality[format || "webp"],
    fit = "cover",
  } = options;

  let pipeline = sharp(buffer);

  // Resize if dimensions provided
  if (width || height) {
    pipeline = pipeline.resize(width, height, { fit });
  }

  // Convert format and apply quality
  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality });

      break;

    case "jpeg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });

      break;

    case "png":
      pipeline = pipeline.png({ quality, compressionLevel: 9 });

      break;

    // No default
  }

  return pipeline.toBuffer();
}

/**
 * Generate thumbnail
 * @param buffer
 */
async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return processImage(buffer, {
    width: IMAGE_CONFIG.sizes.thumbnail.width,
    height: IMAGE_CONFIG.sizes.thumbnail.height,
    format: "webp",
    fit: "cover",
  });
}

/**
 * Convert to WebP
 * @param buffer
 */
async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  return processImage(buffer, {
    format: "webp",
  });
}

// ═══════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════

/**
 * Upload and process image
 * @param file
 * @param originalName
 * @param options
 */
export async function uploadImage(
  file: File | Buffer,
  originalName: string,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  const {
    folder = "images",
    generateThumbnail: shouldGenerateThumbnail = true,
    convertToWebP: shouldConvertToWebP = true,
    sizes = [],
  } = options;

  // Convert File to Buffer if needed
  let buffer: Buffer;
  if (file instanceof Buffer) {
    buffer = file;
  } else {
    // file is File type
    const arrayBuffer = await (file as File).arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  // Validate file size
  if (buffer.length > IMAGE_CONFIG.maxFileSize) {
    throw new Error(
      `File size exceeds maximum allowed size of ${IMAGE_CONFIG.maxFileSize / 1024 / 1024}MB`
    );
  }

  // Get image metadata
  const metadata = await sharp(buffer).metadata();

  if (!metadata.format || !IMAGE_CONFIG.allowedFormats.includes(metadata.format as any)) {
    throw new Error(`Invalid image format. Allowed: ${IMAGE_CONFIG.allowedFormats.join(", ")}`);
  }

  // Generate hash for deduplication
  const hash = generateHash(buffer);

  // Ensure upload directory exists
  const uploadPath = path.join(IMAGE_CONFIG.uploadDir, folder);
  await ensureDir(uploadPath);

  // Save original image
  const originalFilename = generateFilename(originalName, hash);
  const originalPath = path.join(uploadPath, originalFilename);
  await writeFile(originalPath, buffer);

  const result: ImageUploadResult = {
    originalUrl: `/uploads/${folder}/${originalFilename}`,
    metadata: {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format,
      size: buffer.length,
      hash,
    },
  };

  // Generate WebP version
  if (shouldConvertToWebP && metadata.format !== "webp") {
    const webpBuffer = await convertToWebP(buffer);
    const webpFilename = generateFilename(originalName, hash, "webp").replace(/\.[^.]+$/, ".webp");
    const webpPath = path.join(uploadPath, webpFilename);
    await writeFile(webpPath, webpBuffer);
    result.webpUrl = `/uploads/${folder}/${webpFilename}`;
  }

  // Generate thumbnail
  if (shouldGenerateThumbnail) {
    const thumbnailBuffer = await generateThumbnail(buffer);
    const thumbnailFilename = generateFilename(originalName, hash, "thumb").replace(
      /\.[^.]+$/,
      ".webp"
    );
    const thumbnailPath = path.join(uploadPath, thumbnailFilename);
    await writeFile(thumbnailPath, thumbnailBuffer);
    result.thumbnailUrl = `/uploads/${folder}/${thumbnailFilename}`;
  }

  // Generate size variants
  if (sizes.length > 0) {
    result.variants = {};

    for (const size of sizes) {
      const sizeConfig = IMAGE_CONFIG.sizes[size];
      const variantBuffer = await processImage(buffer, {
        width: sizeConfig.width,
        height: sizeConfig.height,
        format: "webp",
      });

      const variantFilename = generateFilename(originalName, hash, size).replace(
        /\.[^.]+$/,
        ".webp"
      );
      const variantPath = path.join(uploadPath, variantFilename);
      await writeFile(variantPath, variantBuffer);

      result.variants[size] = `/uploads/${folder}/${variantFilename}`;
    }
  }

  return result;
}

/**
 * Delete image and all its variants
 * @param imagePath
 */
export async function deleteImage(imagePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), "public", imagePath);

  if (existsSync(fullPath)) {
    await unlink(fullPath);
  }

  // Delete variants (webp, thumbnail, sizes)
  const dir = path.dirname(fullPath);
  const basename = path.basename(fullPath, path.extname(fullPath));

  // Try to delete common variants
  const variants = [
    `${basename}-webp.webp`,
    `${basename}-thumb.webp`,
    `${basename}-thumbnail.webp`,
    `${basename}-small.webp`,
    `${basename}-medium.webp`,
    `${basename}-large.webp`,
  ];

  for (const variant of variants) {
    const variantPath = path.join(dir, variant);
    if (existsSync(variantPath)) {
      await unlink(variantPath);
    }
  }
}

/**
 * Get optimized image URL
 * Returns WebP version if available, otherwise original
 * @param originalUrl
 */
export function getOptimizedImageUrl(originalUrl: string): string {
  const webpUrl = originalUrl.replace(/\.[^.]+$/, "-webp.webp");
  // In production, check if WebP exists, for now return original
  return originalUrl;
}

/**
 * Bulk image optimization
 * Process multiple images in parallel
 * @param files
 * @param options
 */
export async function bulkOptimizeImages(
  files: Array<{ file: File | Buffer; name: string }>,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult[]> {
  const results = await Promise.all(
    files.map(({ file, name }) => uploadImage(file, name, options))
  );

  return results;
}

// ═══════════════════════════════════════════════════
// UTILITY EXPORTS
// ═══════════════════════════════════════════════════

export { IMAGE_CONFIG };
export default {
  uploadImage,
  deleteImage,
  getOptimizedImageUrl,
  bulkOptimizeImages,
};
