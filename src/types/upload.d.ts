// ═══════════════════════════════════════════════════
// UPLOAD TYPES - Multi-Cloud Upload System
// ═══════════════════════════════════════════════════

/**
 * Upload provider type
 */
export type UploadProvider = "imagekit" | "cloudinary" | "aws" | "local";

/**
 * Upload options
 */
export interface UploadOptions {
  provider?: UploadProvider;
  folder?: string;
  filename?: string;
  public?: boolean;
  transformation?: ImageTransformation;
  tags?: string[];
  metadata?: Record<string, string>;
}

/**
 * Image transformation options
 */
export interface ImageTransformation {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "crop" | "pad";
  quality?: number;
  format?: "jpg" | "png" | "webp" | "avif";
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
}

/**
 * Upload result
 */
export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  size: number;
  provider: UploadProvider;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Bulk upload options
 */
export interface BulkUploadOptions extends UploadOptions {
  concurrency?: number;
  onProgress?(current: number, total: number, filename: string): void;
  onError?(filename: string, error: Error): void;
  skipExisting?: boolean;
}

/**
 * Bulk upload result
 */
export interface BulkUploadResult {
  successful: UploadResult[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
  total: number;
  successCount: number;
  failedCount: number;
  duration: number;
}

/**
 * Upload progress
 */
export interface UploadProgress {
  filename: string;
  current: number;
  total: number;
  percent: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
}

/**
 * Cloud storage configuration
 */
export interface CloudStorageConfig {
  provider: UploadProvider;
  credentials: Record<string, string>;
  defaults?: UploadOptions;
}

/**
 * Send email options
 */
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    encoding?: string;
    contentType?: string;
  }>;
}
