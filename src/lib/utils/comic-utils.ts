/**
 * Comic Utilities
 * Helper functions for comics: slug generation, pagination, filtering, and image helpers
 */

import type { chapter, comic } from "@/database/schema";
import type { InferSelectModel } from "drizzle-orm";

type ComicType = InferSelectModel<typeof comic>;
type ChapterType = InferSelectModel<typeof chapter>;

/**
 * Generate a URL-safe slug from a title
 * @param title - The title to convert to slug
 * @returns URL-safe slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replaceAll(/[^\s\w-]/g, "") // Remove special characters
    .replaceAll(/\s+/g, "-") // Replace spaces with hyphens
    .replaceAll(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replaceAll(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validate slug format
 * @param slug - The slug to validate
 * @returns true if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[\da-z]+(?:-[\da-z]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Calculate reading progress percentage
 * @param currentChapter - Current chapter number
 * @param totalChapters - Total number of chapters
 * @returns Progress percentage (0-100)
 */
export function calculateReadingProgress(currentChapter: number, totalChapters: number): number {
  if (totalChapters === 0) return 0;
  return Math.round((currentChapter / totalChapters) * 100);
}

/**
 * Format comic status for display
 * @param status - Comic status (ongoing, completed, hiatus)
 * @returns Human-readable status
 */
export function formatComicStatus(status: string): string {
  const statusMap: Record<string, string> = {
    ongoing: "Ongoing",
    completed: "Completed",
    hiatus: "On Hiatus",
    dropped: "Dropped",
    upcoming: "Upcoming",
  };
  return statusMap[status] || status;
}

/**
 * Get status badge color
 * @param status - Comic status
 * @returns CSS color class
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    ongoing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    hiatus: "bg-yellow-100 text-yellow-800",
    dropped: "bg-red-100 text-red-800",
    upcoming: "bg-gray-100 text-gray-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}

/**
 * Sort comics by various criteria
 * @param comics - Array of comics to sort
 * @param sortBy - Sort criteria (rating, views, recent, alphabetical)
 * @returns Sorted comics array
 */
export function sortComics(
  comics: ComicType[],
  sortBy: "rating" | "views" | "recent" | "alphabetical" = "recent"
): ComicType[] {
  const sorted = [...comics];

  switch (sortBy) {
    case "rating":
      return sorted.sort(
        (a, b) => (b.rating ? Number(b.rating) : 0) - (a.rating ? Number(a.rating) : 0)
      );
    case "views":
      return sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    case "alphabetical":
      return sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    case "recent":
    default:
      return sorted.sort(
        (a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
      );
  }
}

/**
 * Filter comics by genres
 * @param comics - Array of comics to filter
 * @param genres - Genre IDs to filter by
 * @returns Filtered comics array
 */
export function filterComicsByGenre(comics: ComicType[], genres: string[]): ComicType[] {
  if (genres.length === 0) return comics;

  return comics.filter((comicItem) => {
    // Note: requires genres relation to be loaded
    // Adjust based on actual schema and loaded relations
    return true; // Placeholder - implement based on actual data structure
  });
}

/**
 * Filter comics by status
 * @param comics - Array of comics to filter
 * @param statuses - Statuses to filter by
 * @returns Filtered comics array
 */
export function filterComicsByStatus(comics: ComicType[], statuses: string[]): ComicType[] {
  if (statuses.length === 0) return comics;
  return comics.filter((comicItem) => statuses.includes(comicItem.status ?? ""));
}

/**
 * Calculate chapters per page for pagination
 * @param totalChapters - Total number of chapters
 * @returns Optimized chapters per page
 */
export function calculateChaptersPerPage(totalChapters: number): number {
  if (totalChapters <= 50) return 10;
  if (totalChapters <= 100) return 20;
  if (totalChapters <= 500) return 50;
  return 100;
}

/**
 * Paginate array items
 * @param items - Array of items to paginate
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Paginated result with items and metadata
 */
export function paginateItems<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 20
): {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    page: currentPage,
    pageSize,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Generate image alt text
 * @param title - Comic title
 * @param type - Image type (cover, chapter, etc.)
 * @returns Alt text for accessibility
 */
export function generateImageAlt(title: string, type: string = "cover"): string {
  return `${type === "cover" ? "Comic cover" : "Chapter image"} for ${title}`;
}

/**
 * Get image dimensions for responsive loading
 * @param type - Image type (cover, thumbnail, etc.)
 * @returns Object with width, height, and aspect ratio
 */
export function getImageDimensions(type: "cover" | "thumbnail" | "hero" | "chapter" = "cover"): {
  width: number;
  height: number;
  aspectRatio: number;
} {
  const dimensions: Record<string, { width: number; height: number; aspectRatio: number }> = {
    cover: { width: 300, height: 450, aspectRatio: 2 / 3 },
    thumbnail: { width: 200, height: 300, aspectRatio: 2 / 3 },
    hero: { width: 1200, height: 400, aspectRatio: 3 / 1 },
    chapter: { width: 800, height: 1200, aspectRatio: 2 / 3 },
  };

  return dimensions[type] ?? dimensions["cover"]!;
}

/**
 * Generate optimized image source set for next/image
 * @param url - Original image URL
 * @param type - Image type
 * @returns Object suitable for next/image component
 */
export function getOptimizedImageUrl(
  url: string,
  type: "cover" | "thumbnail" | "hero" | "chapter" = "cover"
): string {
  // Add image optimization parameters based on your image service
  // This is a placeholder - customize based on your image CDN
  const dimensions = getImageDimensions(type);

  // Example for ImageKit or similar service:
  // return `${url}?tr=w-${dimensions.width},h-${dimensions.height},q-80`;

  return url;
}

/**
 * Calculate reading time estimate
 * @param chapters - Array of chapters
 * @returns Estimated reading time in hours
 */
export function calculateReadingTime(chapters: ChapterType[]): number {
  // Estimate based on chapter count and average content length
  const MINUTES_PER_CHAPTER = 10; // Average read time per chapter
  const totalMinutes = chapters.length * MINUTES_PER_CHAPTER;
  return Math.ceil(totalMinutes / 60);
}

/**
 * Format rating for display
 * @param rating - Numeric rating (0-10)
 * @returns Formatted rating string
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return "No rating";
  return `${rating.toFixed(1)}/10`;
}

/**
 * Get rating badge color
 * @param rating - Numeric rating (0-10)
 * @returns CSS color class
 */
export function getRatingColor(rating: number | null | undefined): string {
  if (!rating) return "text-gray-500";
  if (rating >= 8) return "text-green-600";
  if (rating >= 6) return "text-blue-600";
  if (rating >= 4) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Extract unique genres from comics array
 * @param comics - Array of comics
 * @returns Array of unique genre objects
 */
export function extractUniqueGenres(
  comics: Array<ComicType & { genres?: Array<{ id: number; name: string }> }>
): Array<{ id: number; name: string }> {
  const genreMap = new Map<number, { id: number; name: string }>();

  comics.forEach((comicItem) => {
    comicItem.genres?.forEach((genre) => {
      if (!genreMap.has(genre.id)) {
        genreMap.set(genre.id, genre);
      }
    });
  });

  return [...genreMap.values()];
}

/**
 * Check if comic is recently updated
 * @param comicItem - Comic object
 * @param days - Number of days to check (default 7)
 * @returns true if updated within specified days
 */
export function isRecentlyUpdated(comicItem: ComicType, days: number = 7): boolean {
  const lastUpdate = new Date(comicItem.updatedAt ?? 0);
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);
  return lastUpdate > daysAgo;
}
