/**
 * 🖼️ Image Path Configuration - Centralized image storage paths
 * ═══════════════════════════════════════════════════════════════════════════
 * Defines standardized paths for all image storage locations
 * - Comic covers: /public/comics/covers/
 * - Chapter images: /public/comics/chapters/${comic.slug}/${chapter.slug}/
 * - Fallbacks: /placeholder-comic.jpg, /shadcn.jpg
 */

import path from "path";

/** Fallback image for comics when primary image is unavailable */
export const FALLBACK_COMIC_IMAGE = "/placeholder-comic.jpg";

/** Fallback image for chapters when primary image is unavailable */
export const FALLBACK_CHAPTER_IMAGE = "/shadcn.jpg";

/** Base directory for all comic-related images */
const COMICS_DIR = "comics";

/** Subdirectory for comic cover images */
const COVERS_SUBDIR = "covers";

/** Subdirectory for chapter images */
const CHAPTERS_SUBDIR = "chapters";

/**
 * Get the public path for comic cover images
 * @param filename - Optional filename to append
 * @returns Public path relative to /public
 */
export function getComicCoversPath(filename?: string): string {
  const basePath = `/${COMICS_DIR}/${COVERS_SUBDIR}`;
  return filename ? `${basePath}/${filename}` : basePath;
}

/**
 * Get the public path for chapter images
 * @param comicSlug - Comic slug identifier
 * @param chapterSlug - Chapter slug identifier
 * @param filename - Optional filename to append
 * @returns Public path relative to /public
 */
export function getChapterImagesPath(
  comicSlug: string,
  chapterSlug: string,
  filename?: string
): string {
  const basePath = `/${COMICS_DIR}/${CHAPTERS_SUBDIR}/${comicSlug.toLowerCase()}/${chapterSlug.toLowerCase()}`;
  return filename ? `${basePath}/${filename}` : basePath;
}

/**
 * Get the full file system path for comic cover images
 * @returns Absolute file system path
 */
export function getComicCoversFsPath(): string {
  return path.join(process.cwd(), "public", COMICS_DIR, COVERS_SUBDIR);
}

/**
 * Get the full file system path for chapter images
 * @param comicSlug - Comic slug
 * @param chapterSlug - Chapter slug
 * @returns Absolute file system path
 */
export function getChapterImagesFsPath(comicSlug: string, chapterSlug: string): string {
  return path.join(
    process.cwd(),
    "public",
    COMICS_DIR,
    CHAPTERS_SUBDIR,
    comicSlug.toLowerCase(),
    chapterSlug.toLowerCase()
  );
}

/**
 * Normalize image URL - returns fallback if invalid
 * @param imageUrl - Image URL to validate
 * @param fallback - Fallback image path
 * @returns Valid image URL or fallback
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

  // If it's already a local path, return as-is
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Validate URL format
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return fallback;
  }
}

/**
 * Check if image URL is remote (needs downloading)
 * @param imageUrl - Image URL
 * @returns True if URL is http/https
 */
export function isRemoteImage(imageUrl: string | undefined): boolean {
  if (!imageUrl || typeof imageUrl !== "string") {
    return false;
  }

  return imageUrl.startsWith("http://") || imageUrl.startsWith("https://");
}

/**
 * Extract filename from URL
 * @param imageUrl - Image URL
 * @returns Filename with extension
 */
export function extractFilenameFromUrl(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    return path.basename(pathname) ?? "image.webp";
  } catch {
    return "image.webp";
  }
}

/**
 * Generate standardized filename for stored images
 * @param comicSlug - Comic slug
 * @param chapterSlug - Optional chapter slug
 * @param pageNumber - Optional page number
 * @returns Standardized .webp filename
 */
export function generateImageFilename(
  comicSlug: string,
  chapterSlug?: string,
  pageNumber?: number
): string {
  let filename = comicSlug.toLowerCase().replaceAll(/[^\da-z-]/g, "");

  if (chapterSlug) {
    const cleanChapterSlug = chapterSlug.toLowerCase().replaceAll(/[^\da-z-]/g, "");
    filename = `${filename}-${cleanChapterSlug}`;
  }

  if (pageNumber !== undefined) {
    filename = `${filename}-${pageNumber.toString().padStart(3, "0")}`;
  }

  return `${filename}.webp`;
}
