/**
 * 🖼️ Image Path Helper - Centralized image path management
 * ═══════════════════════════════════════════════════════════════════════════
 * Handles intelligent image path construction following DRY principle
 * - Comic images: /public/comics/${slug}/
 * - Chapter images: /public/comics/${comicSlug}/chapters/${chapterSlug}/
 * - Fallback images: /placeholder-comic.jpg, /shadcn.jpg
 */

import path from "path";

// Fallback images
export const FALLBACK_COMIC_IMAGE = "/placeholder-comic.jpg";
export const FALLBACK_CHAPTER_IMAGE = "/shadcn.jpg";

/**
 * Get the directory path for comic images
 * @param comicSlug - Comic slug identifier
 * @returns Path relative to public folder
 */
export function getComicImageDir(comicSlug: string): string {
  return `/comics/${comicSlug.toLowerCase()}`;
}

/**
 * Get the directory path for chapter images
 * @param comicSlug - Comic slug identifier
 * @param chapterSlug - Chapter slug identifier
 * @returns Path relative to public folder
 */
export function getChapterImageDir(comicSlug: string, chapterSlug: string): string {
  return `/comics/${comicSlug.toLowerCase()}/chapters/${chapterSlug.toLowerCase()}`;
}

/**
 * Construct full file system path for comic images
 * @param comicSlug - Comic slug
 * @returns Full file system path
 */
export function getComicImageFsPath(comicSlug: string): string {
  return path.join(process.cwd(), "public", "comics", comicSlug.toLowerCase());
}

/**
 * Construct full file system path for chapter images
 * @param comicSlug - Comic slug
 * @param chapterSlug - Chapter slug
 * @returns Full file system path
 */
export function getChapterImageFsPath(comicSlug: string, chapterSlug: string): string {
  return path.join(
    process.cwd(),
    "public",
    "comics",
    comicSlug.toLowerCase(),
    "chapters",
    chapterSlug.toLowerCase()
  );
}

/**
 * Normalize image URL for storage consistency
 * Returns fallback if URL is invalid or empty
 * @param imageUrl - Image URL to normalize
 * @param fallback - Fallback image path
 * @returns Normalized image URL or fallback
 */
export function normalizeImageUrl(
  imageUrl: string | undefined | null,
  fallback: string = FALLBACK_COMIC_IMAGE
): string {
  if (!imageUrl || typeof imageUrl !== "string") {
    return fallback;
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return fallback;
  }

  // If it's already a local path or placeholder, return as-is
  if (trimmed.startsWith("/") || trimmed.includes("placeholder")) {
    return trimmed;
  }

  // Return URL if valid, otherwise fallback
  try {
    new URL(trimmed); // Validate URL format
    return trimmed;
  } catch {
    return fallback;
  }
}

/**
 * Check if image URL is a remote URL (needs downloading)
 * @param imageUrl - Image URL to check
 * @returns True if URL is remote and needs downloading
 */
export function isRemoteImage(imageUrl: string | undefined): boolean {
  if (!imageUrl || typeof imageUrl !== "string") {
    return false;
  }

  return imageUrl.startsWith("http://") || imageUrl.startsWith("https://");
}

/**
 * Extract filename from image URL
 * @param imageUrl - Image URL
 * @returns Filename or empty string
 */
export function extractFilenameFromUrl(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    return path.basename(pathname) ?? "image";
  } catch {
    return "image";
  }
}

/**
 * Generate standardized filename for stored images
 * @param comicSlug - Comic slug
 * @param chapterSlug - Optional chapter slug
 * @param index - Optional image index/page number
 * @returns Standardized filename
 */
export function generateImageFilename(
  comicSlug: string,
  chapterSlug?: string,
  index?: number
): string {
  const base = chapterSlug ? `${comicSlug}-${chapterSlug}` : comicSlug;

  const filename = index !== undefined ? `${base}-${index.toString().padStart(3, "0")}` : base;
  return `${filename}.webp`;
}
