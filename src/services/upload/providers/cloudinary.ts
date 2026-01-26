// ═══════════════════════════════════════════════════
// CLOUDINARY UPLOAD PROVIDER
// Next.js 16.0.7 + Cloudinary Integration
// ═══════════════════════════════════════════════════

import { env } from "@/appConfig";
import { v2 as cloudinary } from "cloudinary";

import type { UploadOptions, UploadProvider, UploadResult } from "@/services/upload/types";

// Validate Cloudinary configuration
if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
  throw new Error(
    "Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
  );
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Type assertion for cloudinary.url (SDK types incomplete)
type CloudinaryUrlFunction = (publicId: string, options: Record<string, unknown>) => string;
const getCloudinaryUrl = (cloudinary as unknown as { url: CloudinaryUrlFunction }).url.bind(
  cloudinary
);

export class CloudinaryProvider implements UploadProvider {
  /**
   * Upload file to Cloudinary
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

      // Convert buffer to base64 data URI
      const base64 = buffer.toString("base64");
      const dataURI = `data:image/jpeg;base64,${base64}`;

      // Prepare transformation options
      // const transformation = options.transformation || {};
      // Cloudinary expects an array of transformation objects
      // const transformationArr =
      //   transformation && Object.keys(transformation).length > 0 ? [transformation] : [];

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: options.folder ?? "comicwise",
        public_id: options.filename,
        tags: options.tags || [],
        resource_type: "auto",
        // transformation: transformationArr,
      });

      // Generate thumbnail URL
      const thumbnailUrl = getCloudinaryUrl(result.public_id, {
        transformation: [{ width: 300, height: 300, crop: "fill", quality: "auto" }],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        thumbnail: thumbnailUrl,
        success: true,
      };
    } catch (error) {
      return {
        url: "",
        publicId: "",
        size: 0,
        format: "",
        success: false,
        error: error instanceof Error ? error.message : "Cloudinary upload failed",
      };
    }
  }

  /**
   * Delete file from Cloudinary
   * @param publicId
   */
  async delete(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      return false;
    }
  }

  /**
   * Get optimized URL with transformations
   * @param publicId
   * @param transformation
   */
  getUrl(publicId: string, transformation?: Record<string, unknown>): string {
    return getCloudinaryUrl(publicId, {
      transformation: [
        {
          quality: "auto:good",
          fetch_format: "auto",
        },
        ...(transformation ? [transformation] : []),
      ],
    });
  }

  /**
   * Get thumbnail URL
   * @param publicId
   * @param width
   * @param height
   */
  getThumbnailUrl(publicId: string, width = 300, height = 300): string {
    return this.getUrl(publicId, {
      width,
      height,
      crop: "fill",
      gravity: "auto",
    });
  }

  /**
   * Get responsive image URLs
   * @param publicId
   */
  getResponsiveUrls(publicId: string): Record<string, string> {
    return {
      small: this.getUrl(publicId, { width: 640, crop: "scale" }),
      medium: this.getUrl(publicId, { width: 1024, crop: "scale" }),
      large: this.getUrl(publicId, { width: 1920, crop: "scale" }),
      thumbnail: this.getThumbnailUrl(publicId),
    };
  }
}
