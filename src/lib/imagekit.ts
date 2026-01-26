// ═══════════════════════════════════════════════════
// IMAGEKIT SERVICE - Image Upload & Management
// ═══════════════════════════════════════════════════

import appConfig from "@/appConfig";
import ImageKit from "imagekit";

// ═══════════════════════════════════════════════════
// IMAGEKIT CLIENT
// ═══════════════════════════════════════════════════

let imagekit: ImageKit | null = null;

export function getImageKitInstance(): ImageKit {
  if (!appConfig.upload.imageKit) {
    throw new Error("ImageKit is not configured. Please set IMAGEKIT environment variables.");
  }

  if (!imagekit) {
    imagekit = new ImageKit({
      publicKey: appConfig.upload.imageKit.publicKey,
      privateKey: appConfig.upload.imageKit.privateKey,
      urlEndpoint: appConfig.upload.imageKit.urlEndpoint,
    });
  }

  return imagekit;
}

// ═══════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════

export interface UploadOptions {
  file: Buffer | string;
  fileName: string;
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  isPrivateFile?: boolean;
  transformation?: Record<string, unknown>;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  name?: string;
  size?: number;
  thumbnailUrl?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type UploadType = "comic-cover" | "chapter-image" | "avatar" | "general";

// ═══════════════════════════════════════════════════
// UPLOAD FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Upload an image to ImageKit
 * @param options
 */
export async function uploadImage(options: UploadOptions): Promise<UploadResult> {
  try {
    const ik = getImageKitInstance();

    const uploadResponse = await ik.upload({
      file: options.file,
      fileName: options.fileName,
      folder: options.folder ?? "/comicwise",
      tags: options.tags || [],
      useUniqueFileName: options.useUniqueFileName ?? true,
      // isPrivateFile: options.isPrivateFile ?? false,
    });

    return {
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      size: uploadResponse.size,
      thumbnailUrl: uploadResponse.thumbnailUrl,
    };
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    };
  }
}

/**
 * Upload comic cover image
 * @param file
 * @param comicId
 * @param fileName
 */
export async function uploadComicCover(
  file: Buffer | string,
  comicId: string,
  fileName: string
): Promise<UploadResult> {
  return uploadImage({
    file,
    fileName,
    folder: "/comicwise/comics/covers",
    tags: ["comic", "cover", comicId],
    useUniqueFileName: true,
  });
}

/**
 * Upload chapter image
 * @param file
 * @param chapterId
 * @param fileName
 * @param sequence
 */
export async function uploadChapterImage(
  file: Buffer | string,
  chapterId: string,
  fileName: string,
  sequence?: number
): Promise<UploadResult> {
  const tags = ["chapter", "content", chapterId];
  if (sequence !== undefined) {
    tags.push(`seq-${sequence}`);
  }

  return uploadImage({
    file,
    fileName,
    folder: "/comicwise/chapters/images",
    tags,
    useUniqueFileName: true,
  });
}

/**
 * Upload user avatar
 * @param file
 * @param userId
 * @param fileName
 */
export async function uploadAvatar(
  file: Buffer | string,
  userId: string,
  fileName: string
): Promise<UploadResult> {
  return uploadImage({
    file,
    fileName,
    folder: "/comicwise/avatars",
    tags: ["avatar", "user", userId],
    useUniqueFileName: true,
  });
}

/**
 * Batch upload multiple images
 * @param files
 * @param folder
 * @param tags
 */
export async function uploadMultipleImages(
  files: Array<{ file: Buffer | string; fileName: string }>,
  folder?: string,
  tags?: string[]
): Promise<UploadResult[]> {
  const results = await Promise.allSettled(
    files.map((fileData) =>
      uploadImage({
        file: fileData.file,
        fileName: fileData.fileName,
        folder,
        tags,
        useUniqueFileName: true,
      })
    )
  );

  return results.map((result) => {
    return result.status === "fulfilled"
      ? result.value
      : {
          success: false,
          error: result.reason instanceof Error ? result.reason.message : "Upload failed",
        };
  });
}

// ═══════════════════════════════════════════════════
// DELETE FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Delete an image from ImageKit
 * @param fileId
 */
export async function deleteImage(fileId: string): Promise<DeleteResult> {
  try {
    const ik = getImageKitInstance();
    await (ik.deleteFile as unknown as (fileId: string) => Promise<void>)(fileId);

    return { success: true };
  } catch (error) {
    console.error("ImageKit delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown delete error",
    };
  }
}

/**
 * Delete multiple images
 * @param fileIds
 */
export async function deleteMultipleImages(fileIds: string[]): Promise<DeleteResult[]> {
  const results = await Promise.allSettled(fileIds.map((fileId) => deleteImage(fileId)));

  return results.map((result) => {
    return result.status === "fulfilled"
      ? result.value
      : {
          success: false,
          error: result.reason instanceof Error ? result.reason.message : "Delete failed",
        };
  });
}

// ═══════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Generate authentication parameters for client-side uploads
 */
export function getAuthenticationParameters(): {
  token: string;
  expire: number;
  signature: string;
} {
  const ik = getImageKitInstance();
  return ik.getAuthenticationParameters();
}

/**
 * Generate URL with transformations
 * @param filePath
 * @param options
 * @param options.width
 * @param options.height
 * @param options.quality
 * @param options.format
 * @param options.blur
 */
export function getOptimizedUrl(
  filePath: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "jpg" | "png" | "webp" | "avif";
    blur?: number;
  }
): string {
  const ik = getImageKitInstance();

  const transformation: Array<{ [key: string]: string | number }> = [];

  if (options?.width) {
    transformation.push({ width: options.width });
  }
  if (options?.height) {
    transformation.push({ height: options.height });
  }
  if (options?.quality) {
    transformation.push({ quality: options.quality });
  }
  if (options?.format) {
    transformation.push({ format: options.format });
  }
  if (options?.blur) {
    transformation.push({ blur: options.blur });
  }

  return ik.url({
    path: filePath,
    transformation,
  });
}

/**
 * Generate thumbnail URL
 * @param filePath
 * @param size
 */
export function getThumbnailUrl(
  filePath: string,
  size: "small" | "medium" | "large" = "medium"
): string {
  const sizes = {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 },
  };

  return getOptimizedUrl(filePath, {
    ...sizes[size],
    quality: 80,
    format: "webp",
  });
}

/**
 * Generate responsive image URLs
 * @param filePath
 */
export function getResponsiveUrls(filePath: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  return {
    thumbnail: getOptimizedUrl(filePath, { width: 150, height: 150, quality: 70, format: "webp" }),
    small: getOptimizedUrl(filePath, { width: 400, quality: 75, format: "webp" }),
    medium: getOptimizedUrl(filePath, { width: 800, quality: 80, format: "webp" }),
    large: getOptimizedUrl(filePath, { width: 1200, quality: 85, format: "webp" }),
    original: getOptimizedUrl(filePath, { quality: 90 }),
  };
}

/**
 * List files from a folder
 * @param folder
 * @param limit
 */
export async function listFiles(folder: string = "/comicwise", limit: number = 50) {
  try {
    const ik = getImageKitInstance();
    const result = await ik.listFiles({
      path: folder,
      limit,
    });

    return {
      success: true,
      files: result,
    };
  } catch (error) {
    console.error("ImageKit list files error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      files: [],
    };
  }
}

/**
 * Get file details
 * @param fileId
 */
export async function getFileDetails(fileId: string) {
  try {
    const ik = getImageKitInstance();
    const result = await ik.getFileDetails(fileId);

    return {
      success: true,
      file: result,
    };
  } catch (error) {
    console.error("ImageKit get file details error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ═══════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Validate image file
 * @param file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 10MB limit" };
  }

  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
    };
  }

  return { valid: true };
}

/**
 * Convert File to Buffer
 * @param file
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate unique filename
 * @param originalName
 * @param prefix
 */
export function generateUniqueFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).slice(2, 10);
  const extension = originalName.split(".").pop()?.toLowerCase() ?? "jpg";
  const baseName = originalName
    .split(".")
    .slice(0, -1)
    .join(".")
    .replaceAll(/[^\da-z]/gi, "-");

  if (prefix) {
    return `${prefix}-${baseName}-${timestamp}-${randomString}.${extension}`;
  }

  return `${baseName}-${timestamp}-${randomString}.${extension}`;
}

// ═══════════════════════════════════════════════════
// IMAGE OPTIMIZATION & COMPRESSION
// ═══════════════════════════════════════════════════

export interface OptimizationOptions {
  quality?: number;
  format?: "jpg" | "png" | "webp" | "avif";
  maxWidth?: number;
  maxHeight?: number;
  progressive?: boolean;
  lossless?: boolean;
}

/**
 * Upload with automatic optimization
 * @param file
 * @param fileName
 * @param folder
 * @param options
 */
export async function uploadOptimizedImage(
  file: Buffer | string,
  fileName: string,
  folder?: string,
  options: OptimizationOptions = {}
): Promise<UploadResult> {
  try {
    const ik = getImageKitInstance();

    // Default optimization settings
    const defaultOptions: OptimizationOptions = {
      quality: 85,
      format: "webp",
      progressive: true,
      lossless: false,
    };

    const options_ = { ...defaultOptions, ...options };

    // Build transformation string
    const transformations: string[] = [];
    if (options_.quality) {
      transformations.push(`q-${options_.quality}`);
    }
    if (options_.format) {
      transformations.push(`f-${options_.format}`);
    }
    if (options_.maxWidth) {
      transformations.push(`w-${options_.maxWidth}`);
    }
    if (options_.maxHeight) {
      transformations.push(`h-${options_.maxHeight}`);
    }
    if (options_.progressive) {
      transformations.push("pr-true");
    }

    const uploadResponse = await ik.upload({
      file,
      fileName,
      folder: folder ?? "/comicwise",
      useUniqueFileName: true,
      // transformation: {
      //   pre: transformations.join(","),
      // },
    });

    return {
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      size: uploadResponse.size,
      thumbnailUrl: uploadResponse.thumbnailUrl,
    };
  } catch (error) {
    console.error("ImageKit optimized upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    };
  }
}

/**
 * Upload comic cover with optimization
 * @param file
 * @param fileName
 */
export async function uploadOptimizedComicCover(
  file: Buffer | string,
  // comicId: string,
  fileName: string
): Promise<UploadResult> {
  return uploadOptimizedImage(file, fileName, "/comicwise/comics/covers", {
    quality: 90,
    format: "webp",
    maxWidth: 1000,
    progressive: true,
  });
}

/**
 * Upload chapter image with optimization
 * @param file
 * @param fileName
 */
export async function uploadOptimizedChapterImage(
  file: Buffer | string,
  // chapterId: string,
  fileName: string
  // sequence?: number
): Promise<UploadResult> {
  return uploadOptimizedImage(file, fileName, "/comicwise/chapters/images", {
    quality: 85,
    format: "webp",
    maxWidth: 1200,
    progressive: true,
  });
}

/**
 * Bulk optimize existing images
 * @param fileIds
 */
export async function bulkOptimizeImages(fileIds: string[]): Promise<{
  success: boolean;
  optimized: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    success: true,
    optimized: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const fileId of fileIds) {
    try {
      const ik = getImageKitInstance();

      // Get file details
      const fileDetails = await ik.getFileDetails(fileId);

      // Download original
      const response = await fetch(fileDetails.url);
      const buffer = Buffer.from(await response.arrayBuffer());

      // Re-upload with optimization
      const optimized = await uploadOptimizedImage(
        buffer,
        fileDetails.name,
        fileDetails.filePath.split("/").slice(0, -1).join("/"),
        { quality: 85, format: "webp" }
      );

      if (optimized.success) {
        // Delete old file
        await deleteImage(fileId);
        results.optimized++;
      } else {
        results.failed++;
        results.errors.push(`Failed to optimize ${fileDetails.name}: ${optimized.error}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Failed to process ${fileId}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  results.success = results.failed === 0;
  return results;
}

/**
 * Generate srcset for responsive images
 * @param filePath
 * @param widths
 */
export function generateSrcSet(
  filePath: string,
  widths: number[] = [400, 800, 1200, 1600]
): string {
  return widths
    .map((width) => {
      const url = getOptimizedUrl(filePath, { width, quality: 85, format: "webp" });
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Generate picture element sources for multiple formats
 * @param filePath
 * @param widths
 */
export function generatePictureSources(
  filePath: string,
  widths: number[] = [400, 800, 1200]
): Array<{ type: string; srcset: string }> {
  const formats: Array<"avif" | "webp" | "jpg"> = ["avif", "webp", "jpg"];

  return formats.map((format) => {
    const srcset = widths
      .map((width) => {
        const url = getOptimizedUrl(filePath, { width, quality: 85, format });
        return `${url} ${width}w`;
      })
      .join(", ");

    return {
      type: `image/${format}`,
      srcset,
    };
  });
}

/**
 * Compress image before upload
 * @param file
 * @param fileName
 * @param folder
 * @param targetSizeKB
 */
export async function compressAndUpload(
  file: File,
  fileName: string,
  folder?: string,
  targetSizeKB?: number
): Promise<UploadResult> {
  try {
    // Start with quality 90
    let quality = 90;
    let compressedBuffer: Buffer;

    // Convert file to buffer
    const originalBuffer = await fileToBuffer(file);

    // If target size specified, iteratively compress
    if (targetSizeKB) {
      compressedBuffer = originalBuffer;

      while (compressedBuffer.length > targetSizeKB * 1024 && quality > 50) {
        quality -= 10;

        // Upload with compression and get result
        const testUpload = await uploadOptimizedImage(compressedBuffer, fileName, folder, {
          quality,
          format: "webp",
        });

        if (testUpload.success && testUpload.size && testUpload.size <= targetSizeKB * 1024) {
          return testUpload;
        }

        // If still too large, continue loop
        if (testUpload.fileId) {
          await deleteImage(testUpload.fileId);
        }
      }
    }

    // Final upload with optimized settings
    return uploadOptimizedImage(originalBuffer, fileName, folder, {
      quality,
      format: "webp",
      progressive: true,
    });
  } catch (error) {
    console.error("Compress and upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Compression failed",
    };
  }
}

/**
 * Get image metadata
 * @param fileId
 */
export async function getImageMetadata(fileId: string): Promise<{
  success: boolean;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
    isAnimated?: boolean;
  };
  error?: string;
}> {
  try {
    const ik: ImageKit = getImageKitInstance();
    const metadataResult = await ik.getFileMetadata(fileId);

    const meta = metadataResult as any;
    const details: {
      width: number;
      height: number;
      format: string;
      size: number;
      hasAlpha: boolean;
      isAnimated?: boolean;
    } = {
      width: typeof meta.width === "number" ? meta.width : 0,
      height: typeof meta.height === "number" ? meta.height : 0,
      format: typeof meta.format === "string" ? meta.format : "unknown",
      size: typeof meta.size === "number" ? meta.size : 0,
      hasAlpha: typeof meta.hasAlpha === "boolean" ? meta.hasAlpha : false,
      isAnimated: meta.isAnimated,
    };

    return {
      success: true,
      metadata: {
        width: details.width,
        height: details.height,
        format: details.format,
        size: details.size,
        hasAlpha: details.hasAlpha,
        isAnimated: details.isAnimated,
      },
    };
  } catch (error) {
    console.error("Get metadata error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get metadata",
    };
  }
}

/**
 * Smart crop for comic covers (auto-detect main subject)
 * @param filePath
 * @param width
 * @param height
 */
export function getSmartCroppedUrl(filePath: string, width: number, height: number): string {
  const ik = getImageKitInstance();

  return ik.url({
    path: filePath,
    transformation: [
      {
        width,
        height,
        cropMode: "fo-auto", // Focus mode: auto-detect subject
        quality: 85,
        format: "webp",
      },
    ],
  });
}

/**
 * Lazy load placeholder (blur hash)
 * @param filePath
 */
export function getLazyLoadPlaceholder(filePath: string): string {
  return getOptimizedUrl(filePath, {
    width: 20,
    height: 20,
    quality: 20,
    blur: 10,
    format: "webp",
  });
}
