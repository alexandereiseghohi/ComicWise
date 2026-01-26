"use client";

import type { ComicWithDetails } from "@/types";

/**
 * Enhanced search utilities with debouncing, pagination, and accessibility
 */

const DEBOUNCE_DELAY = 300; // milliseconds
const MAX_RESULTS_PER_PAGE = 12;
const MIN_SEARCH_LENGTH = 2;

/**
 * Debounce search queries
 * @param onSearch
 * @param delay
 */
export function createSearchDebounce(
  onSearch: (query: string) => Promise<void>,
  delay: number = DEBOUNCE_DELAY
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(query: string) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (query.length < MIN_SEARCH_LENGTH) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      timeoutId = setTimeout(() => {
        onSearch(query).then(resolve);
        timeoutId = null;
      }, delay);
    });
  };
}

/**
 * Search interface for API calls
 */
export interface SearchOptions {
  query: string;
  page?: number;
  limit?: number;
  genres?: string[];
  type?: string;
  status?: string;
  sortBy?: "relevance" | "rating" | "views" | "latest";
}

/**
 * Search response interface
 */
export interface SearchResponse {
  results: ComicWithDetails[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}

/**
 * Perform comic search via API
 * @param options
 */
export async function searchComicsApi(options: SearchOptions): Promise<SearchResponse> {
  const {
    query,
    page = 1,
    limit = MAX_RESULTS_PER_PAGE,
    genres,
    type,
    status,
    sortBy = "relevance",
  } = options;

  if (!query || query.trim().length < MIN_SEARCH_LENGTH) {
    return {
      results: [],
      total: 0,
      page,
      limit,
      hasMore: false,
      totalPages: 0,
    };
  }

  const params = new URLSearchParams({
    q: query.trim(),
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
  });

  if (genres && genres.length > 0) {
    params.append("genres", genres.join(","));
  }

  if (type) {
    params.append("type", type);
  }

  if (status) {
    params.append("status", status);
  }

  const response = await fetch(`/api/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Pagination helpers
 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function calculatePagination(
  currentPage: number,
  totalResults: number,
  resultsPerPage: number = MAX_RESULTS_PER_PAGE
): PaginationState {
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return {
    currentPage,
    totalPages,
    totalResults,
    resultsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Get page offset for pagination
 * @param page
 * @param limit
 */
export function getPageOffset(page: number, limit: number = MAX_RESULTS_PER_PAGE): number {
  return (Math.max(1, page) - 1) * limit;
}

/**
 * Accessibility helpers for search results
 */

/**
 * Generate ARIA live region announcement for search results
 * @param total
 * @param query
 */
export function generateSearchAnnouncement(total: number, query: string): string {
  if (total === 0) {
    return `No results found for ${query}`;
  }

  if (total === 1) {
    return `Found 1 result for ${query}`;
  }

  return `Found ${total} results for ${query}`;
}

/**
 * Validate search input for accessibility
 * @param input
 */
export function validateSearchInput(input: string): {
  valid: boolean;
  message?: string;
} {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: "Search query cannot be empty" };
  }

  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return {
      valid: false,
      message: `Search query must be at least ${MIN_SEARCH_LENGTH} characters`,
    };
  }

  if (trimmed.length > 100) {
    return { valid: false, message: "Search query must be less than 100 characters" };
  }

  return { valid: true };
}

/**
 * Highlight search query in text (for accessibility and UX)
 * @param text
 * @param query
 */
export function highlightSearchQuery(
  text: string,
  query: string
): Array<{
  text: string;
  highlighted: boolean;
}> {
  if (!query || query.length === 0) {
    return [{ text, highlighted: false }];
  }

  const parts: Array<{ text: string; highlighted: boolean }> = [];
  const regex = new RegExp(`(${query.replaceAll(/[$()*+.?[\\\]^{|}]/g, "\\$&")})`, "gi");
  const split = text.split(regex);

  for (const part of split) {
    if (part.toLowerCase() === query.toLowerCase()) {
      parts.push({ text: part, highlighted: true });
    } else if (part.length > 0) {
      parts.push({ text: part, highlighted: false });
    }
  }

  return parts;
}

/**
 * Get relevant snippet from text based on query
 * @param text
 * @param query
 * @param length
 */
export function getSearchSnippet(text: string, query: string, length: number = 150): string {
  if (!query || query.length === 0) {
    return text.slice(0, Math.max(0, length));
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return text.slice(0, Math.max(0, length));
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, start + length);
  const snippet = text.substring(start, end).trim();

  return `${start > 0 ? "..." : ""}${snippet}${end < text.length ? "..." : ""}`;
}

/**
 * Search result caching (simple in-memory cache)
 */
interface CacheEntry {
  data: SearchResponse;
  timestamp: number;
}

class SearchCache {
  private cache = new Map<string, CacheEntry>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: SearchResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): SearchResponse | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  getCacheKey(options: SearchOptions): string {
    return `search:${JSON.stringify(options)}`;
  }
}

export const searchCache = new SearchCache();

/**
 * Cached search with fallback
 * @param options
 */
export async function cachedSearchComicsApi(options: SearchOptions): Promise<SearchResponse> {
  const cacheKey = searchCache.getCacheKey(options);
  const cached = searchCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const results = await searchComicsApi(options);
  searchCache.set(cacheKey, results);

  return results;
}
