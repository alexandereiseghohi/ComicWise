// ═══════════════════════════════════════════════════════════════════════════
// IMAGE UPLOAD SERVICE - Universal Provider Interface
// Next.js 16.0.7 Optimized
//
// IMPORTANT: Factory/Provider functions are NOT exported here.
// Import directly from @/services/upload/factory in server contexts only.
// This prevents circular dependencies and overly broad bundling.
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS ONLY - No runtime imports to prevent circular deps
// ═══════════════════════════════════════════════════════════════════════════

export type {
  FileValidationResult,
  ImageTransformation,
  UploadConstraints,
  UploadOptions,
  UploadProvider,
  UploadProviderType,
  UploadResult,
  UploadType,
} from "@/services/upload/types";

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS - Use dynamic imports in server contexts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Upload an image file
 * @param file - File or Buffer to upload
 * @param options - Upload options
 * @returns Upload result with URL and metadata
 *
 * @example
 * ```typescript
 * const result = await uploadImage(file, { folder: "avatars" });
 * ```
 */
export async function uploadImage(file: File | Buffer, options?: any): Promise<any> {
  const { getUploadProvider } = await import("@/services/upload/factory");
  const provider = await getUploadProvider();
  return provider.upload(file, options);
}

/**
 * Delete an uploaded image
 * @param publicId - Provider-specific public ID
 * @returns Success status
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  const { getUploadProvider } = await import("@/services/upload/factory");
  const provider = await getUploadProvider();
  return provider.delete(publicId);
}

/**
 * Get URL for an uploaded image with optional transformations
 * @param publicId - Provider-specific public ID
 * @param transformation - Transformation options (provider-specific)
 * @returns Public URL to the image
 */
export async function getImageUrl(
  publicId: string,
  transformation?: Record<string, unknown>
): Promise<string> {
  const { getUploadProvider } = await import("@/services/upload/factory");
  const provider = await getUploadProvider();
  return provider.getUrl(publicId, transformation);
}
