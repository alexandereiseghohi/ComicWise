// ═══════════════════════════════════════════════════════════════════════════
// IMAGE UTILITIES - CDN URL generation, responsive srcsets, transformations
// ═══════════════════════════════════════════════════════════════════════════

import { env } from "@/appConfig";

/**
 * Generate responsive image srcset for different screen sizes
 * param url - Original image URL
 * param widths - Array of widths to generate (default: [320, 640, 1024, 1920])
 * returns srcset string for use in img tag
 * @param url
 * @param widths
 */
export function getResponsiveSrcSet(
  url: string,
  widths: number[] = [320, 640, 1024, 1920]
): string {
  return widths.map((width) => `${transformImage(url, width)} ${width}w`).join(", ");
}

/**
 * Get full CDN URL for an image path
 * param path - Image path or URL
 * returns Full URL with app base
 * @param path
 */
export function getImageUrl(path: string): string {
  if (!path) return "";

  // If already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // If it's a local path starting with /, prepend app URL
  if (path.startsWith("/")) {
    return `${env.NEXT_PUBLIC_APP_URL}${path}`;
  }

  // Otherwise assume it's a relative path
  return `${env.NEXT_PUBLIC_APP_URL}/${path}`;
}

/**
 * Transform image URL with width, height, and quality parameters
 * param url - Original image URL
 * param width - Image width in pixels
 * param height - Optional image height
 * param quality - Image quality (1-100, default 80)
 * returns Transformed image URL
 * @param url
 * @param width
 * @param height
 * @param quality
 */
export function transformImage(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!url) return "";

  // If it's a local URL, we can't transform it client-side
  // Return as-is, transformations would need to be done server-side
  if (
    (env.NEXT_PUBLIC_APP_URL && url.startsWith(env.NEXT_PUBLIC_APP_URL)) ||
    url.startsWith("/uploads")
  ) {
    return getImageUrl(url);
  }

  // For CDN URLs (ImageKit, Cloudinary, etc.), add transformation parameters
  // This is a generic approach - specific CDN APIs may vary
  const params = new URLSearchParams();
  if (width) params.append("w", width.toString());
  if (height) params.append("h", height.toString());
  params.append("q", quality.toString());

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.toString()}`;
}

/**
 * Delete image from storage
 * Note: Actual deletion should be handled via API endpoint
 * param url - Image URL to delete
 * returns Promise resolving to success boolean
 * @param url
 */
export async function deleteImage(url: string): Promise<boolean> {
  if (!url) return false;

  try {
    const response = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to delete image:", error);
    return false;
  }
}

/**
 * Get thumbnail URL with predefined dimensions
 * param url - Original image URL
 * param width - Thumbnail width (default: 300)
 * param height - Thumbnail height (default: 300)
 * returns Thumbnail URL
 * @param url
 * @param width
 * @param height
 */
export function getThumbnailUrl(url: string, width: number = 300, height: number = 300): string {
  return transformImage(url, width, height, 80);
}

/**
 * Extract public ID from image URL
 * Works with local paths and CDN URLs
 * param url - Image URL
 * returns Public ID or filename
 * @param url
 */
export function getPublicIdFromUrl(url: string): string {
  if (!url) return "";

  // For local uploads: /uploads/folder/filename.ext
  if (url.includes("/uploads/")) {
    const parts = url.split("/uploads/");
    return parts[1] ?? "";
  }

  // For CDN URLs, extract the last path segment
  try {
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split("/").filter((s) => s);
    return pathSegments[pathSegments.length - 1] ?? "";
  } catch {
    // If not a valid URL, return the last segment
    return url.split("/").pop() || url;
  }
}

/**
 * Validate if a URL is a valid image URL
 * param url - URL to validate
 * returns true if URL appears to be an image
 * @param url
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"];
  const lowerUrl = url.toLowerCase();

  return imageExtensions.some((extension) => lowerUrl.includes(extension));
}

/**
 * Get responsive image sizes attribute for Next.js Image component
 * returns sizes string for responsive images
 */
export function getResponsiveImageSizes(): string {
  return "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, (max-width: 1920px) 50vw, 33vw";
}

interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Calculate aspect-ratio from dimensions
 * param width - Image width
 * param height - Image height
 * returns Aspect ratio as decimal
 * @param width
 * @param height
 */
export function getAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Get optimized dimensions maintaining aspect ratio
 * param originalWidth - Original image width
 * param originalHeight - Original image height
 * param targetWidth - Target width
 * returns Dimensions maintaining aspect ratio
 * @param originalWidth
 * @param originalHeight
 * @param targetWidth
 */
export function getOptimizedDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number
): ImageDimensions {
  const aspectRatio = getAspectRatio(originalWidth, originalHeight);
  return {
    width: targetWidth,
    height: Math.round(targetWidth / aspectRatio),
  };
}
