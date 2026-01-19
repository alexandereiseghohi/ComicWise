// ═══════════════════════════════════════════════════
// IMAGE UPLOAD SERVICE - Universal Provider Interface
// Next.js 16.0.7 Optimized
// ═══════════════════════════════════════════════════

import { getUploadProvider } from "@/services/upload/factory";

export interface UploadOptions {
  folder?: string;
  filename?: string;
  transformation?: Record<string, unknown>;
  tags?: string[];
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  size: number;
  thumbnail?: string;
  success?: boolean;
  error?: string;
}

export interface UploadProvider {
  upload(file: File | Buffer, options?: UploadOptions): Promise<UploadResult>;
  delete(publicId: string): Promise<boolean>;
  getUrl(publicId: string, transformation?: Record<string, unknown>): string;
}

// ═══════════════════════════════════════════════════
// PROVIDER FACTORY & IMPORTS
// ═══════════════════════════════════════════════════

export {
  getAvailableProviders,
  getConfiguredProvider,
  getUploadProvider,
  isProviderAvailable,
} from "@/services/upload/factory";

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 *
 * param file
 * param options
 * @param file
 * @param options
 */
export async function uploadImage(
  file: File | Buffer,
  options?: UploadOptions
): Promise<UploadResult> {
  const provider = await getUploadProvider();
  return provider.upload(file, options);
}

/**
 *
 * param publicId
 * @param publicId
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  const provider = await getUploadProvider();
  return provider.delete(publicId);
}

/**
 *
 * param publicId
 * param transformation
 * @param publicId
 * @param transformation
 */
export async function getImageUrl(
  publicId: string,
  transformation?: Record<string, unknown>
): Promise<string> {
  const provider = await getUploadProvider();
  return provider.getUrl(publicId, transformation);
}

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS - Make types available from main export
// ═══════════════════════════════════════════════════════════════════════════

export type {
  FileValidationResult,
  ImageTransformation,
  UploadConstraints,
  UploadProviderType,
  UploadType,
} from "@/services/upload/types";
