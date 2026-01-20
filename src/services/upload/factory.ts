// ═══════════════════════════════════════════════════════════════════════════
// UPLOAD PROVIDER FACTORY - Provider selection and instantiation (Server-only)
// Use dynamic imports to avoid bundling all providers into client bundles
// ═══════════════════════════════════════════════════════════════════════════

import type { UploadProvider } from "@/services/upload/types";

/**
 * Get the upload provider instance based on environment configuration
 * Dynamically imports and instantiates the appropriate provider
 * IMPORTANT: Only call from server contexts (API routes, Server Actions, seeders)
 *
 * @returns UploadProvider instance
 * @throws Error if provider is not configured or unknown
 *
 * @example
 * ```typescript
 * const provider = await getUploadProvider();
 * const result = await provider.upload(file);
 * ```
 */
export async function getUploadProvider(): Promise<UploadProvider> {
  // Dynamically import env only in server context
  const { env } = await import("appConfig");
  const providerType: string = env.UPLOAD_PROVIDER;

  switch (providerType) {
    case "cloudinary": {
      const { CloudinaryProvider } = await import("./providers/cloudinary");
      return new CloudinaryProvider();
    }

    case "imagekit": {
      const { ImageKitProvider } = await import("./providers/imagekit");
      return new ImageKitProvider();
    }

    case "local": {
      const { LocalProvider } = await import("./providers/local");
      return new LocalProvider();
    }

    default:
      throw new Error(`Unknown upload provider: ${providerType}`);
  }
}

/**
 * Get the currently configured provider type
 * returns The provider type from environment
 */
export function getConfiguredProvider(): UploadProviderType {
  return (env.UPLOAD_PROVIDER || "local") as UploadProviderType;
}

/**
 * Check if a provider is available
 * param providerType - Provider to check
 * returns true if provider credentials are configured
 * @param providerType
 */
export function isProviderAvailable(providerType: UploadProviderType): boolean {
  switch (providerType) {
    case "cloudinary":
      return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

    case "imagekit":
      return !!(env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT);

    case "local":
      return true; // Always available

    default:
      return false;
  }
}

/**
 * Get all available providers
 * returns Array of available provider types
 */
export function getAvailableProviders(): UploadProviderType[] {
  const allProviders: UploadProviderType[] = ["local", "imagekit", "cloudinary"];
  return allProviders.filter(isProviderAvailable);
}
