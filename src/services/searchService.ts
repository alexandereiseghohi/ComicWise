// ═══════════════════════════════════════════════════
// FULL-TEXT SEARCH SERVICE - PostgreSQL FTS Implementation
// ═══════════════════════════════════════════════════

import { db } from "@/database/db";
import { artist, author, comic, comicToGenre, type as comicType } from "@/database/schema";
import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
// ═══════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════

export interface SearchOptions {
  query?: string;
  filters?: {
    status?: string[];
    genres?: number[];
    typeId?: number;
    authorId?: number;
    artistId?: number;
    minRating?: number;
  };
  sort?: "relevance" | "title" | "rating" | "views" | "date";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SearchResult {
  success: boolean;
  data?: {
    results: unknown[];
    total: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}

// ═══════════════════════════════════════════════════
// FULL-TEXT SEARCH
// ═══════════════════════════════════════════════════

/**
 * Full-text search using PostgreSQL tsvector
 * @param searchQuery
 * @param options
 */
export async function fullTextSearch(
  searchQuery: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  try {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Convert search query to tsquery format
    const tsQuery = searchQuery
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => `${word}:*`)
      .join(" & ");

    // Build WHERE conditions
    const conditions: SQL<unknown>[] = [];

    // Full-text search condition
    if (tsQuery) {
      conditions.push(sql`searchVector  to_tsquery('english', ${tsQuery})`);
    }

    // Status filter
    if (options.filters?.status && options.filters.status.length > 0) {
      conditions.push(sql`${comic.status} = ANY(${options.filters.status})`);
    }

    // Rating filter
    if (options.filters?.minRating) {
      conditions.push(sql`${comic.rating} >= ${options.filters.minRating}`);
    }

    // Type filter
    if (options.filters?.typeId) {
      conditions.push(eq(comic.typeId, options.filters.typeId));
    }

    // Author filter
    if (options.filters?.authorId) {
      conditions.push(eq(comic.authorId, options.filters.authorId));
    }

    // Artist filter
    if (options.filters?.artistId) {
      conditions.push(eq(comic.artistId, options.filters.artistId));
    }

    // Genre filter
    if (options.filters?.genres && options.filters.genres.length > 0) {
      const genreIds = options.filters.genres;
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${comicToGenre}
          WHERE ${comicToGenre.comicId} = ${comic.id}
          AND ${comicToGenre.genreId} = ANY(${genreIds})
        )`
      );
    }

    // Build ORDER BY
    let orderBy;
    const sortOrder = options.order === "asc" ? asc : desc;

    switch (options.sort) {
      case "title":
        orderBy = sortOrder(comic.title);
        break;
      case "rating":
        orderBy = sortOrder(comic.rating);
        break;
      case "views":
        orderBy = sortOrder(comic.views);
        break;
      case "date":
        orderBy = sortOrder(comic.createdAt);
        break;
      case "relevance":
      default:
        // Rank by relevance if search query provided
        orderBy = tsQuery
          ? sql`ts_rank(searchVector, to_tsquery('english', ${tsQuery})) DESC`
          : desc(comic.createdAt);
    }

    // Execute search query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select({
        id: comic.id,
        title: comic.title,
        description: comic.description,
        coverImage: comic.coverImage,
        status: comic.status,
        rating: comic.rating,
        views: comic.views,
        publicationDate: comic.publicationDate,
        // Include relevance rank if searching
        rank: tsQuery
          ? sql<number>`ts_rank(searchVector, to_tsquery('english', ${tsQuery}))`
          : sql<number>`0`,
        author: {
          id: author.id,
          name: author.name,
        },
        artist: {
          id: artist.id,
          name: artist.name,
        },
        type: {
          id: comicType.id,
          name: comicType.name,
        },
      })
      .from(comic)
      .leftJoin(author, eq(comic.authorId, author.id))
      .leftJoin(artist, eq(comic.artistId, artist.id))
      .leftJoin(comicType, eq(comic.typeId, comicType.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(comic)
      .where(whereClause);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        results,
        total,
        page,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Full-text search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

/**
 * Simple search (fallback for basic database/queries)
 * @param searchQuery
 * @param options
 */
export async function simpleSearch(
  searchQuery: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  try {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: SQL<unknown>[] = [];

    // Basic ILIKE search on title and description
    if (searchQuery && searchQuery.trim()) {
      const query = `%${searchQuery.trim()}%`;
      conditions.push(
        or(ilike(comic.title, query), ilike(comic.description, query)) as SQL<unknown>
      );
    }

    // Apply filters (same as full-text search)
    if (options.filters?.status && options.filters.status.length > 0) {
      conditions.push(sql`${comic.status} = ANY(${options.filters.status})`);
    }

    if (options.filters?.minRating) {
      conditions.push(sql`${comic.rating} >= ${options.filters.minRating}`);
    }

    if (options.filters?.typeId) {
      conditions.push(eq(comic.typeId, options.filters.typeId));
    }

    if (options.filters?.authorId) {
      conditions.push(eq(comic.authorId, options.filters.authorId));
    }

    if (options.filters?.artistId) {
      conditions.push(eq(comic.artistId, options.filters.artistId));
    }

    // Build ORDER BY
    let orderBy;
    const sortOrder = options.order === "asc" ? asc : desc;

    switch (options.sort) {
      case "title":
        orderBy = sortOrder(comic.title);
        break;
      case "rating":
        orderBy = sortOrder(comic.rating);
        break;
      case "views":
        orderBy = sortOrder(comic.views);
        break;
      case "date":
      default:
        orderBy = sortOrder(comic.createdAt);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select({
        id: comic.id,
        title: comic.title,
        description: comic.description,
        coverImage: comic.coverImage,
        status: comic.status,
        rating: comic.rating,
        views: comic.views,
        publicationDate: comic.publicationDate,
        author: {
          id: author.id,
          name: author.name,
        },
        artist: {
          id: artist.id,
          name: artist.name,
        },
        type: {
          id: comicType.id,
          name: comicType.name,
        },
      })
      .from(comic)
      .leftJoin(author, eq(comic.authorId, author.id))
      .leftJoin(artist, eq(comic.artistId, artist.id))
      .leftJoin(comicType, eq(comic.typeId, comicType.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(comic)
      .where(whereClause);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        results,
        total,
        page,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Simple search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

/**
 * Smart search - automatically chooses between full-text and simple search
 * @param searchQuery
 * @param options
 */
export async function smartSearch(
  searchQuery: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  // Use full-text search for complex database/queries, simple search for basic ones
  const useFullText = searchQuery.split(/\s+/).length > 1 || searchQuery.length > 3;

  return useFullText ? fullTextSearch(searchQuery, options) : simpleSearch(searchQuery, options);
}

/**
 * Autocomplete suggestions
 * @param query
 * @param limit
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 10
): Promise<{ success: boolean; suggestions?: unknown[]; error?: string }> {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, suggestions: [] };
    }

    const searchPattern = `%${query.trim()}%`;

    const results = await db
      .select({
        title: comic.title,
      })
      .from(comic)
      .where(ilike(comic.title, searchPattern))
      .limit(limit);

    const suggestions = results.map((r: { title: unknown }) => r.title);

    return {
      success: true,
      suggestions,
    };
  } catch (error) {
    console.error("Autocomplete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Autocomplete failed",
    };
  }
}

/**
 * Search by author
 * @param authorName
 * @param options
 */
export async function searchByAuthor(
  authorName: string,
  options: Omit<SearchOptions, "filters"> = {}
): Promise<SearchResult> {
  try {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    const searchPattern = `%${authorName.trim()}%`;

    const results = await db
      .select({
        id: comic.id,
        title: comic.title,
        description: comic.description,
        coverImage: comic.coverImage,
        status: comic.status,
        rating: comic.rating,
        views: comic.views,
        author: {
          id: author.id,
          name: author.name,
        },
      })
      .from(comic)
      .innerJoin(author, eq(comic.authorId, author.id))
      .where(ilike(author.name, searchPattern))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(comic)
      .innerJoin(author, eq(comic.authorId, author.id))
      .where(ilike(author.name, searchPattern));

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        results,
        total,
        page,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Author search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Author search failed",
    };
  }
}

/**
 * Search by genre
 * @param genreId
 * @param options
 */
export async function searchByGenre(
  genreId: number,
  options: Omit<SearchOptions, "filters"> = {}
): Promise<SearchResult> {
  try {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    const results = await db
      .select({
        id: comic.id,
        title: comic.title,
        description: comic.description,
        coverImage: comic.coverImage,
        status: comic.status,
        rating: comic.rating,
        views: comic.views,
      })
      .from(comic)
      .innerJoin(comicToGenre, eq(comic.id, comicToGenre.comicId))
      .where(eq(comicToGenre.genreId, genreId))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(comic)
      .innerJoin(comicToGenre, eq(comic.id, comicToGenre.comicId))
      .where(eq(comicToGenre.genreId, genreId));

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        results,
        total,
        page,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Genre search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Genre search failed",
    };
  }
}

/**
 * Advanced multi-field search
 * @param options
 */
export async function advancedSearch(options: SearchOptions): Promise<SearchResult> {
  return fullTextSearch(options.query || "", options);
}
