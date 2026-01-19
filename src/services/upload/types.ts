// ═══════════════════════════════════════════════════════════════════════════
// UPLOAD SERVICE TYPES - Unified type definitions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Supported upload providers
 */
export type UploadProviderType = "local" | "imagekit" | "cloudinary";

/**
 * Upload types for categorizing images
 */
export type UploadType = "comic-cover" | "chapter-image" | "avatar" | "general";

/**
 * File upload configuration options
 */
export interface UploadOptions {
  /** Folder path in storage (e.g., "comicwise/comics") */
  folder?: string;
  /** Custom filename without extension */
  filename?: string;
  /** Image transformation options (provider-specific) */
  transformation?: Record<string, unknown>;
  /** Tags for organizing/filtering uploads */
  tags?: string[];
}

/**
 * Result of a successful upload operation
 */
export interface UploadResult {
  /** Public URL to access the uploaded file */
  url: string;
  /** Provider-specific public ID for file identification */
  publicId: string;
  /** Image width in pixels (if available) */
  width?: number;
  /** Image height in pixels (if available) */
  height?: number;
  /** File format/extension */
  format?: string;
  /** File size in bytes */
  size: number;
  /** Thumbnail URL (if provider supports) */
  thumbnail?: string;
  /** Whether upload was successful */
  success?: boolean;
  /** Error message if upload failed */
  error?: string;
}

/**
 * Provider interface for different storage backends
 * Each provider must implement these methods
 */
export interface UploadProvider {
  /**
   * Upload a file to the storage backend
   * param file - File or Buffer to upload
   * param options - Upload configuration
   * returns Upload result with URL and metadata
   */
  upload(file: File | Buffer, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Delete a file from storage
   * param publicId - File ID returned from upload
   * returns true if deletion was successful
   */
  delete(publicId: string): Promise<boolean>;

  /**
   * Get public URL for a file with optional transformations
   * param publicId - File ID
   * param transformation - Transform options (provider-specific)
   * returns Public URL with transformations applied
   */
  getUrl(publicId: string, transformation?: Record<string, unknown>): string;
}

/**
 * Configuration for a specific provider
 */
export interface ProviderConfig {
  /** Provider type */
  provider: UploadProviderType;
  /** Whether this provider is enabled */
  enabled: boolean;
  /** Provider-specific configuration */
  config?: Record<string, string | boolean | number>;
}

/**
 * Validation result for file uploads
 */
export interface FileValidationResult {
  /** Whether the file is valid */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Image transformation options
 */
export interface ImageTransformation {
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Image quality (1-100) */
  quality?: number;
  /** Output format (jpeg, png, webp, etc.) */
  format?: string;
  /** Crop mode (fill, scale, etc.) */
  crop?: string;
}

/**
 * File upload constraints
 */
export interface UploadConstraints {
  /** Maximum file size in MB */
  maxSizeMB: number;
  /** Allowed MIME types */
  allowedMimeTypes: string[];
  /** Whether multiple files can be uploaded at once */
  allowMultiple: boolean;
}

/**
 * Default upload constraints by type
 */
export const UPLOAD_CONSTRAINTS: Record<UploadType, UploadConstraints> = {
  "comic-cover": {
    maxSizeMB: 10,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowMultiple: false,
  },
  "chapter-image": {
    maxSizeMB: 10,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowMultiple: true,
  },
  avatar: {
    maxSizeMB: 5,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowMultiple: false,
  },
  general: {
    maxSizeMB: 10,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowMultiple: true,
  },
};

/**
 * Get upload constraints for a specific upload type
 * param type - Upload type
 * returns Upload constraints
 * @param type
 */
export function getUploadConstraints(type: UploadType): UploadConstraints {
  return UPLOAD_CONSTRAINTS[type] || UPLOAD_CONSTRAINTS.general;
}
