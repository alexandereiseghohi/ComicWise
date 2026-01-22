// ═══════════════════════════════════════════════════
// LOCAL UPLOAD PROVIDER
// Next.js 16.0.7 + Local File System Storage
// ═══════════════════════════════════════════════════

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import type { UploadOptions, UploadProvider, UploadResult } from "@/services/upload/types";

export interface LocalTransformationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp" | "avif";
}

export class LocalProvider implements UploadProvider {
  private readonly uploadDir: string;
  private readonly publicPath: string;

  constructor() {
    this.uploadDir = `${process.cwd()}${path.sep}public${path.sep}uploads`;
    this.publicPath = "/uploads";
  }

  /**
   * Upload file to local file system
   * @param file
   * @param options
   */
  async upload(
    file: File | Buffer,
    options: UploadOptions & { transformation?: LocalTransformationOptions } = {}
  ): Promise<UploadResult> {
    try {
      let buffer: Buffer;
      let originalName = "image";

      // Convert File to Buffer if needed
      if (typeof File !== "undefined" && file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        originalName = file.name;
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

      // Apply transformations if specified
      if (options.transformation) {
        let sharpInstance = sharp(buffer);
        const { width, height, quality, format } = options.transformation;
        if (width ?? height) {
          sharpInstance = sharpInstance.resize(width, height);
        }
        if (format) {
          sharpInstance = sharpInstance.toFormat(format, { quality });
        } else if (quality) {
          sharpInstance = sharpInstance.jpeg({ quality });
        }
        buffer = await sharpInstance.toBuffer();
      }

      // Generate unique filename
      const hash = crypto.randomBytes(16).toString("hex");
      const extension = options.transformation?.format
        ? `.${options.transformation.format}`
        : (path.extname(originalName) ?? ".jpg");
      // If filename already has extension, use as-is; otherwise append extension
      const filename = options.filename
        ? path.extname(options.filename)
          ? options.filename
          : `${options.filename}${extension}`
        : `${hash}${extension}`;

      // Create directory structure
      const folder = options.folder ?? "general";
      const uploadPath = `${this.uploadDir}${path.sep}${folder}`;
      await fs.mkdir(uploadPath, { recursive: true });

      // Save file
      const filePath = `${uploadPath}${path.sep}${filename}`;
      await fs.writeFile(filePath, buffer);

      // Get file stats
      const stats = await fs.stat(filePath);

      // Construct public URL with forward slashes (relative path)
      const publicId = `${folder}/${filename}`;
      const url = `${this.publicPath}/${publicId}`;

      return {
        url,
        publicId,
        size: stats.size,
        format: extension.replace(".", ""),
        success: true,
      };
    } catch (error) {
      return {
        url: "",
        publicId: "",
        size: 0,
        format: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete file from local file system
   * @param publicId
   */
  async delete(publicId: string): Promise<boolean> {
    try {
      const filePath = `${this.uploadDir}${path.sep}${publicId.replaceAll("/", path.sep)}`;
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Local delete error:", error);
      return false;
    }
  }

  /**
   * Get URL for local file
   * @param publicId
   * @param transformation
   */
  getUrl(publicId: string, transformation?: Record<string, unknown>): string {
    console.log(`${transformation}`);
    return `${this.publicPath}/${publicId}`;
  }

  /**
   * Get thumbnail URL (local provider doesn't generate thumbnails)
   * @param publicId
   */
  getThumbnailUrl(publicId: string): string {
    return this.getUrl(publicId);
  }

  /**
   * List files in directory
   * @param folder
   */
  async listFiles(folder = "general"): Promise<string[]> {
    try {
      const uploadPath = `${this.uploadDir}${path.sep}${folder}`;
      const files = await fs.readdir(uploadPath);
      return files;
    } catch (error) {
      console.error("Local list error:", error);
      return [];
    }
  }

  /**
   * Get file stats
   * @param publicId
   */
  async getFileStats(publicId: string): Promise<{
    size: number;
    createdAt: Date;
    modifiedAt: Date;
  } | null> {
    try {
      const filePath = `${this.uploadDir}${path.sep}${publicId.replaceAll("/", path.sep)}`;
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      console.error("Local stats error:", error);
      return null;
    }
  }
}
