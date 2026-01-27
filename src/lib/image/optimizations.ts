/**
 * Image optimization and placeholder utilities
 * For next/image integration and blurred placeholders
 */

/**
 * Image blur placeholder data
 */
export interface ImagePlaceholder {
  src: string;
  blurDataURL: string;
  height: number;
  width: number;
}

/**
 * Simple LQIP (Low Quality Image Placeholder) generator
 * @param width
 * @param height
 */
export function generateLQIP(width: number = 10, height: number = 10): string {
  // Generate a simple SVG-based LQIP
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"%3E%3Crect fill="%23e5e7eb" width="${width}" height="${height}"/%3E%3C/svg%3E`;
}

/**
 * Color-based LQIP generator
 * @param color
 */
export function generateColorLQIP(color: string = "#e5e7eb"): string {
  const encoded = encodeURIComponent(color);
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"%3E%3Crect fill="${encoded}" width="10" height="10"/%3E%3C/svg%3E`;
}

/**
 * Gradient LQIP generator for more realistic placeholders
 * @param fromColor
 * @param toColor
 */
export function generateGradientLQIP(
  fromColor: string = "#e5e7eb",
  toColor: string = "#f3f4f6"
): string {
  const fromEncoded = encodeURIComponent(fromColor);
  const toEncoded = encodeURIComponent(toColor);

  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" y1="0" x2="10" y2="10"%3E%3Cstop offset="0" stop-color="${fromEncoded}"/%3E%3Cstop offset="100" stop-color="${toEncoded}"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g)" width="10" height="10"/%3E%3C/svg%3E`;
}

/**
 * Validate image URL format
 * @param url
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
  const lowerUrl = url.toLowerCase();

  // If it's a URL (http/https), require a known image extension
  try {
    if (/^https?:\/\//.test(lowerUrl)) {
      return imageExtensions.some((ext) => lowerUrl.endsWith(ext));
    }
  } catch {
    // fall through
  }

  // If it's a path (starting with / or relative), require a known extension
  if (lowerUrl.startsWith("/")) {
    return imageExtensions.some((ext) => lowerUrl.endsWith(ext));
  }

  // Finally, check for simple filenames with extensions
  return imageExtensions.some((ext) => lowerUrl.endsWith(ext));
}

/**
 * Get optimal image size for responsive display
 */
export interface ResponsiveImageSizes {
  small: number; // Mobile
  medium: number; // Tablet
  large: number; // Desktop
}

export function getResponsiveImageSizes(maxWidth: number = 1200): ResponsiveImageSizes {
  return {
    small: Math.min(400, maxWidth),
    medium: Math.min(800, maxWidth),
    large: Math.min(1200, maxWidth),
  };
}

/**
 * Default placeholder for missing images
 */
export const defaultImagePlaceholder = {
  src: "/images/placeholder.png",
  alt: "Placeholder image",
  width: 400,
  height: 600,
  blurDataURL: generateLQIP(400, 600),
};

/**
 * Image optimization presets
 */
export const imagePresets = {
  // Comic cover/thumbnail
  comicCover: {
    width: 300,
    height: 450,
    quality: 80,
    format: "webp" as const,
  },
  // Comic list thumbnail (smaller)
  comicThumbnail: {
    width: 200,
    height: 300,
    quality: 75,
    format: "webp" as const,
  },
  // Hero/featured image
  hero: {
    width: 1200,
    height: 600,
    quality: 85,
    format: "webp" as const,
  },
  // Chapter page image
  chapterPage: {
    width: 800,
    height: 1200,
    quality: 85,
    format: "webp" as const,
  },
  // Avatar/profile picture
  avatar: {
    width: 100,
    height: 100,
    quality: 80,
    format: "webp" as const,
  },
  // Background pattern
  background: {
    width: 1600,
    height: 1600,
    quality: 70,
    format: "webp" as const,
  },
};

/**
 * Image quality settings for different contexts
 */
export const imageQualitySettings = {
  thumbnail: 60, // Very compressed
  list: 75, // Compressed
  detail: 80, // Good quality
  hero: 85, // High quality
  print: 95, // Very high quality
};

/**
 * Cache-friendly image optimization
 */
export interface OptimizedImageConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "scale-down";
  objectPosition?: string;
}

/**
 * Format bytes to human-readable size
 * @param bytes
 */
export function formatImageSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  // Prefer KB as the smallest displayed unit (so 512 bytes shows as 0.5 KB)
  const i = Math.max(1, Math.round(Math.log(bytes) / Math.log(k)));
  const value = bytes / Math.pow(k, i);
  const display = Number(value.toFixed(2));
  // Remove unnecessary decimals for integers
  const formatted = Number.isInteger(display) ? display.toString() : display.toString();
  return `${formatted} ${sizes[i]}`;
}

/**
 * Estimate image loading time
 * @param imageSizeBytes
 * @param connectionSpeedKbps
 */
export function estimateImageLoadTime(
  imageSizeBytes: number,
  connectionSpeedKbps: number = 5000 // Average 5 Mbps
): number {
  const kilobytes = imageSizeBytes / 1024;
  const seconds = (kilobytes / (connectionSpeedKbps / 8)) * 1000; // milliseconds
  return Math.max(100, seconds); // Minimum 100ms
}

/**
 * Generate srcSet string for responsive images
 * @param baseUrl
 * @param sizes
 */
export function generateSrcSet(baseUrl: string, sizes: ResponsiveImageSizes): string {
  const srcsets: string[] = [];

  for (const [, size] of Object.entries(sizes)) {
    srcsets.push(`${baseUrl}?w=${size} ${size}w`);
  }

  return srcsets.join(", ");
}
