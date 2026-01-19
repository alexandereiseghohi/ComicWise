/**
 * Unified Search Service - Consolidated from searchService.ts and searchRefactored.ts
 * Eliminates duplicate implementations and reduces cognitive complexity
 * Supports both PostgreSQL full-text search and advanced filtering
 */

import { db } from "@/database/db";
import { artist, author, comic, comicToGenre, genre } from "@/database/schema";
import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";

// ═══════════════════════════════════════════════════
// TYPE DEFINITIONS - Unified
// ═══════════════════════════════════════════════════

export interface SearchFilters {
  query?: string;
  searchMode?: "simple" | "phrase" | "websearch";
  genres?: string[];
  genreIds?: number[];
  typeId?: number;
  status?: string;
  minRating?: number;
  maxRating?: number;
  authorName?: string;
  artistName?: string;
  minViews?: number;
  maxViews?: number;
  yearFrom?: number;
  yearTo?: number;
  sortBy?: "title" | "rating" | "views" | "latest" | "relevance";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  status: string;
  rating: string;
  views: number;
  authorName: string | null;
  artistName: string | null;
  genres: string[];
  publicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  relevanceScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  facets?: {
    statuses: { status: string; count: number }[];
    genres: { genre: string; count: number }[];
  };
}

// ═══════════════════════════════════════════════════
// INTERNAL TYPES
// ═══════════════════════════════════════════════════

interface QueryConditions {
  textSearch: SQL[];
  filters: SQL[];
  all: SQL[];
}

// ═══════════════════════════════════════════════════
// SEARCH QUERY BUILDERS
// ═══════════════════════════════════════════════════

/**
 * Build PostgreSQL full-text search query from user input
 * Reduces complexity by extracting query normalization logic
 * @param searchText
 * @param searchMode
 */
function buildFullTextQuery(searchText: string, searchMode: string): string {
  const normalized = searchText.trim();
  if (!normalized) return "";

  switch (searchMode) {
    case "phrase":
      return `"${normalized.replaceAll('"', '\\"')}"`;

    case "simple":
      return normalized
        .split(/\s+/)
        .filter((w) => w.length > 0)
        .join(" & ");

    case "websearch":
    default:
      // PostgreSQL websearch mode automatically handles common keywords
      return normalized;
  }
}

/**
 * Add text search conditions for multiple fields
 * Reduces cyclomatic complexity by consolidating search logic
 * @param conditions
 * @param searchText
 */
function addTextSearchConditions(conditions: QueryConditions, searchText?: string): void {
  if (!searchText) return;

  const tsquery = buildFullTextQuery(searchText, "websearch");
  if (!tsquery) return;

  const searchCondition = or(
    sql`${comic.searchVector}  to_tsquery('english', ${tsquery})`,
    sql`LOWER(${comic.title}) LIKE LOWER(${"%" + searchText + "%"})`,
    sql`LOWER(${comic.description}) LIKE LOWER(${"%" + searchText + "%"})`
  );

  if (searchCondition) {
    conditions.textSearch.push(searchCondition);
  }
}

/**
 * Add filter conditions for metadata fields
 * Extracts filter building logic to reduce main function complexity
 * @param conditions
 * @param filters
 */
function addMetadataFilters(conditions: QueryConditions, filters: SearchFilters): void {
  const { typeId, status, minRating, maxRating, authorName, artistName, minViews, maxViews } =
    filters;

  if (typeId) {
    conditions.filters.push(eq(comic.typeId, typeId));
  }

  if (status) {
    conditions.filters.push(eq(comic.status, status as any));
  }

  if (minRating) {
    conditions.filters.push(gte(comic.rating, String(minRating)));
  }

  if (maxRating) {
    conditions.filters.push(lte(comic.rating, String(maxRating)));
  }

  if (minViews) {
    conditions.filters.push(gte(comic.views, minViews));
  }

  if (maxViews) {
    conditions.filters.push(lte(comic.views, maxViews));
  }

  if (authorName) {
    conditions.filters.push(sql`LOWER(${author.name}) LIKE LOWER(${"%" + authorName + "%"})`);
  }

  if (artistName) {
    conditions.filters.push(sql`LOWER(${artist.name}) LIKE LOWER(${"%" + artistName + "%"})`);
  }
}

/**
 * Add date range filters
 * Separates date logic to improve readability
 * @param conditions
 * @param filters
 */
function addDateFilters(conditions: QueryConditions, filters: SearchFilters): void {
  const { yearFrom, yearTo } = filters;

  if (yearFrom) {
    conditions.filters.push(gte(comic.publicationDate, new Date(`${yearFrom}-01-01`)));
  }

  if (yearTo) {
    conditions.filters.push(lte(comic.publicationDate, new Date(`${yearTo}-12-31`)));
  }
}

/**
 * Resolve genre names to IDs and add genre filter
 * Returns null if no matching genres found (early exit optimization)
 * @param conditions
 * @param genreIds
 * @param genreNames
 */
async function addGenreFilters(
  conditions: QueryConditions,
  genreIds?: number[],
  genreNames?: string[]
): Promise<boolean | null> {
  const ids = [...(genreIds ?? [])];

  // Resolve genre names to IDs
  if (genreNames && genreNames.length > 0) {
    const resolved = await db
      .select({ id: genre.id })
      .from(genre)
      .where(inArray(genre.name, genreNames));

    ids.push(...resolved.map((g) => g.id));
  }

  if (ids.length === 0) {
    return true; // No genre filter needed
  }

  // Get comics with these genres
  const comicIds = await db
    .selectDistinct({ comicId: comicToGenre.comicId })
    .from(comicToGenre)
    .where(inArray(comicToGenre.genreId, ids));

  if (comicIds.length === 0) {
    return null; // No matching comics
  }

  conditions.filters.push(
    inArray(
      comic.id,
      comicIds.map((c) => c.comicId)
    )
  );
  return true;
}

/**
 * Build complete query conditions
 * Orchestrates all filter building functions
 * @param filters
 */
async function buildQueryConditions(filters: SearchFilters): Promise<QueryConditions | null> {
  const conditions: QueryConditions = {
    textSearch: [],
    filters: [],
    all: [],
  };

  // Add text search
  addTextSearchConditions(conditions, filters.query);

  // Add metadata filters
  addMetadataFilters(conditions, filters);

  // Add date filters
  addDateFilters(conditions, filters);

  // Add genre filters (may return null for early exit)
  const genreResult = await addGenreFilters(conditions, filters.genreIds, filters.genres);
  if (genreResult === null) {
    return null;
  }

  // Combine all conditions
  conditions.all = [...conditions.textSearch, ...conditions.filters];
  return conditions;
}

/**
 * Apply sorting to query
 * Reduces complexity by extracting sort logic
 * @param query
 * @param sortBy
 * @param sortOrder
 * @param hasSearchQuery
 */
function applySorting(
  query: any,
  sortBy: string = "relevance",
  sortOrder: string = "desc",
  hasSearchQuery: boolean = false
): any {
  const sortDirection = sortOrder === "asc" ? asc : desc;

  switch (sortBy) {
    case "title":
      return query.orderBy(sortDirection(comic.title));
    case "rating":
      return query.orderBy(sortDirection(comic.rating));
    case "views":
      return query.orderBy(sortDirection(comic.views));
    case "latest":
      return query.orderBy(sortDirection(comic.createdAt));
    case "relevance":
    default:
      // Use creation date if no search query
      return query.orderBy(sortDirection(hasSearchQuery ? comic.createdAt : comic.createdAt));
  }
}

/**
 * Enrich search results with additional data
 * Reduces main function complexity by extracting post-processing
 * @param results
 */
async function enrichSearchResults(results: SearchResult[]): Promise<SearchResult[]> {
  if (results.length === 0) {
    return [];
  }

  const comicIds = results.map((r) => r.id);
  const genres = await db
    .select({
      comicId: comicToGenre.comicId,
      genreName: genre.name,
    })
    .from(comicToGenre)
    .innerJoin(genre, eq(comicToGenre.genreId, genre.id))
    .where(inArray(comicToGenre.comicId, comicIds));

  const genreMap = new Map<number, string[]>();
  for (const { comicId, genreName } of genres) {
    if (!genreMap.has(comicId)) {
      genreMap.set(comicId, []);
    }
    genreMap.get(comicId)?.push(genreName);
  }

  return results.map((result) => ({
    ...result,
    genres: genreMap.get(result.id) ?? [],
  }));
}

// ═══════════════════════════════════════════════════
// MAIN SEARCH FUNCTION
// ═══════════════════════════════════════════════════

/**
 * Unified search function supporting full-text and advanced filtering
 * @param filters - Search and filter parameters
 * @returns SearchResponse with results and pagination
 */
export async function searchComics(filters: SearchFilters = {}): Promise<SearchResponse> {
  const { page = 1, limit = 12, sortBy = "relevance", sortOrder = "desc" } = filters;

  // Build conditions (may return null for early exit)
  const conditions = await buildQueryConditions(filters);
  if (!conditions) {
    return {
      results: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  // Build base query
  let baseQuery = db
    .select({
      id: comic.id,
      title: comic.title,
      description: comic.description,
      coverImage: comic.coverImage,
      status: comic.status,
      rating: comic.rating,
      views: comic.views,
      authorName: author.name,
      artistName: artist.name,
      publicationDate: comic.publicationDate,
      createdAt: comic.createdAt,
      updatedAt: comic.updatedAt,
    })
    .from(comic)
    .leftJoin(author, eq(comic.authorId, author.id))
    .leftJoin(artist, eq(comic.artistId, artist.id))
    .$dynamic();

  // Apply conditions
  if (conditions.all.length > 0) {
    baseQuery = baseQuery.where(and(...(conditions.all as Parameters<typeof and>)));
  }

  // Apply sorting
  const sortedQuery = applySorting(baseQuery, sortBy, sortOrder, !!filters.query);

  // Get total count before pagination
  const countResult = await baseQuery;
  const total = countResult.length;

  // Apply pagination and execute
  const offset = (page - 1) * limit;
  const results = await sortedQuery.limit(limit).offset(offset);

  // Enrich results with genres
  const enrichedResults = await enrichSearchResults(results);

  return {
    results: enrichedResults,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Simple search shorthand - searches across all fields
 * @param query - Simple search query string
 * @param limit - Results limit
 */
export async function search(query: string, limit: number = 20): Promise<SearchResult[]> {
  const response = await searchComics({
    query,
    limit,
    sortBy: "relevance",
  });

  return response.results;
}
