// ═══════════════════════════════════════════════════
// ADVANCED SEARCH SERVICE - Full-Text Search with PostgreSQL (REFACTORED)
// ═══════════════════════════════════════════════════

import { db } from "@/database/db";
import { artist, author, comic, comicToGenre, genre, type } from "@/database/schema";
import { and, asc, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface AdvancedSearchFilters {
  // Search
  query?: string;
  searchMode?: "simple" | "phrase" | "websearch";
  search?: string;

  // Filters
  genres?: string[];
  genreIds?: number[];
  genreNames?: string[];
  types?: string[];
  typeId?: number;
  status?: "ongoing" | "completed" | "hiatus" | "cancelled";

  // Author/Artist
  authorName?: string;
  artistName?: string;

  // Date/Year
  publicationYear?: number;
  publicationYearFrom?: number;
  publicationYearTo?: number;

  // Rating/Views
  minRating?: number;
  minViews?: number;
  maxViews?: number;

  // Sorting & Pagination
  sortBy?: "title" | "rating" | "views" | "latest" | "createdAt" | "publicationDate" | "relevance";
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
  typeName: string | null;
  genres: string[];
  relevanceScore?: number;
  publicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
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
    types: { type: string; count: number }[];
  };
}

// ═══════════════════════════════════════════════════
// HELPER TYPES & CONSTANTS
// ═══════════════════════════════════════════════════

interface SearchConditions {
  textSearch: unknown[];
  filters: unknown[];
  all: unknown[];
}

// ═══════════════════════════════════════════════════
// FULL-TEXT SEARCH IMPLEMENTATION
// ═══════════════════════════════════════════════════

/**
 *
 * param filters
 * @param filters
 */
export async function searchComics(filters: AdvancedSearchFilters = {}): Promise<SearchResponse> {
  const {
    query: searchQuery,
    searchMode = "websearch",
    search,
    typeId,
    genreIds,
    status,
    minRating,
    authorName,
    artistName,
    genreNames,
    publicationYearFrom,
    publicationYearTo,
    minViews,
    maxViews,
    sortBy = "relevance",
    sortOrder = "desc",
    page = 1,
    limit = 12,
  } = filters;

  const searchText = searchQuery || search;
  const conditions = await buildSearchConditions({
    searchText,
    searchMode,
    typeId,
    genreIds,
    status,
    minRating,
    authorName,
    artistName,
    genreNames,
    publicationYearFrom,
    publicationYearTo,
    minViews,
    maxViews,
  });

  // Early exit if genre filter returns no results
  if (conditions === null) {
    return {
      results: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  const baseQuery = buildBaseQuery(searchText, searchMode);
  let query = baseQuery.$dynamic();

  if (conditions.all.length > 0) {
    query = query.where(and(...(conditions.all as Parameters<typeof and>)));
  }

  const sortedQuery = applySorting(query, sortBy, sortOrder, !!searchText);
  const offset = (page - 1) * limit;

  const results = await (sortedQuery as any).limit(limit).offset(offset);

  const total = await getSearchTotalCount(conditions.all);
  const comicIds = results.map((r: { id: number }) => r.id);
  const genresMap = await getComicGenres(comicIds);

  const enrichedResults = results.map((result: unknown) => enrichSearchResult(result, genresMap));

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

// ═══════════════════════════════════════════════════
// CONDITION BUILDERS
// ═══════════════════════════════════════════════════

interface ConditionFilters {
  searchText?: string;
  searchMode?: string;
  typeId?: number;
  genreIds?: number[];
  status?: string;
  minRating?: number | string;
  authorName?: string;
  artistName?: string;
  genreNames?: string[];
  publicationYearFrom?: number;
  publicationYearTo?: number;
  minViews?: number;
  maxViews?: number;
}

async function buildSearchConditions(filters: ConditionFilters): Promise<SearchConditions | null> {
  const conditions: SearchConditions = {
    textSearch: [],
    filters: [],
    all: [],
  };

  addTextSearchCondition(conditions, filters.searchText, filters.searchMode);
  addMetadataConditions(conditions, filters);
  addFilterConditions(conditions, filters);

  const genreCondition = await addGenreCondition(conditions, filters.genreIds, filters.genreNames);
  if (genreCondition === null) {
    return null; // No matching genres
  }

  conditions.all = [...conditions.textSearch, ...conditions.filters];
  return conditions;
}

function addTextSearchCondition(
  conditions: SearchConditions,
  searchText?: string,
  searchMode?: string
): void {
  if (!searchText) return;

  const tsquery = buildSearchQuery(searchText, searchMode || "websearch");
  conditions.textSearch.push(
    or(
      sql`${comic.searchVector}  to_tsquery('english', ${tsquery})`,
      sql`${author.searchVector}  to_tsquery('english', ${tsquery})`,
      sql`${artist.searchVector}  to_tsquery('english', ${tsquery})`
    )
  );
}

function addMetadataConditions(conditions: SearchConditions, filters: ConditionFilters): void {
  if (filters.typeId) {
    conditions.filters.push(eq(comic.typeId, filters.typeId));
  }

  if (filters.status) {
    conditions.filters.push(
      eq(comic.status, filters.status as (typeof comic.status.enumValues)[number])
    );
  }

  if (filters.minRating) {
    conditions.filters.push(gte(comic.rating, String(filters.minRating)));
  }

  if (filters.authorName) {
    conditions.filters.push(
      sql`LOWER(${author.name}) LIKE LOWER(${"%" + filters.authorName + "%"})`
    );
  }

  if (filters.artistName) {
    conditions.filters.push(
      sql`LOWER(${artist.name}) LIKE LOWER(${"%" + filters.artistName + "%"})`
    );
  }
}

function addFilterConditions(conditions: SearchConditions, filters: ConditionFilters): void {
  if (filters.minViews) {
    conditions.filters.push(gte(comic.views, filters.minViews));
  }

  if (filters.maxViews) {
    conditions.filters.push(lte(comic.views, filters.maxViews));
  }

  if (filters.publicationYearFrom) {
    conditions.filters.push(
      gte(comic.publicationDate, new Date(`${filters.publicationYearFrom}-01-01`))
    );
  }

  if (filters.publicationYearTo) {
    conditions.filters.push(
      lte(comic.publicationDate, new Date(`${filters.publicationYearTo}-12-31`))
    );
  }
}

async function addGenreCondition(
  conditions: SearchConditions,
  genreIds?: number[],
  genreNames?: string[]
): Promise<boolean | null> {
  if (!((genreIds && genreIds.length > 0) || (genreNames && genreNames.length > 0))) {
    return true;
  }

  const resolvedGenreIds = await resolveGenreIds(genreIds, genreNames);

  if (resolvedGenreIds.length === 0) {
    return null; // No matching genres
  }

  const genreComics = await db
    .selectDistinct({ comicId: comicToGenre.comicId })
    .from(comicToGenre)
    .where(inArray(comicToGenre.genreId, resolvedGenreIds));

  if (genreComics.length === 0) {
    return null; // No comics with these genres
  }

  conditions.filters.push(
    inArray(
      comic.id,
      genreComics.map((c) => c.comicId)
    )
  );
  return true;
}

async function resolveGenreIds(genreIds?: number[], genreNames?: string[]): Promise<number[]> {
  const ids: number[] = [];

  if (genreIds && genreIds.length > 0) {
    ids.push(...genreIds);
  }

  if (genreNames && genreNames.length > 0) {
    const genresResult = await db
      .select({ id: genre.id })
      .from(genre)
      .where(or(...genreNames.map((name) => sql`LOWER(${genre.name}) = LOWER(${name})`)));

    ids.push(...genresResult.map((g) => g.id));
  }

  return [...new Set(ids)]; // Deduplicate
}

// ═══════════════════════════════════════════════════
// QUERY BUILDERS
// ═══════════════════════════════════════════════════

function buildBaseQuery(searchText?: string, searchMode?: string) {
  const relevanceScore =
    searchText && searchMode
      ? sql<number>`ts_rank(${comic.searchVector}, to_tsquery('english', ${buildSearchQuery(searchText, searchMode)}))`
      : sql<number>`1`;

  return db
    .select({
      id: comic.id,
      title: comic.title,
      description: comic.description,
      coverImage: comic.coverImage,
      status: comic.status,
      publicationDate: comic.publicationDate,
      rating: comic.rating,
      views: comic.views,
      authorId: comic.authorId,
      artistId: comic.artistId,
      typeId: comic.typeId,
      createdAt: comic.createdAt,
      updatedAt: comic.updatedAt,
      authorName: author.name,
      artistName: artist.name,
      typeName: type.name,
      relevanceScore,
    })
    .from(comic)
    .leftJoin(author, eq(comic.authorId, author.id))
    .leftJoin(artist, eq(comic.artistId, artist.id))
    .leftJoin(type, eq(comic.typeId, type.id));
}

function applySorting(
  query: unknown,
  sortBy: string,
  sortOrder: string,
  hasSearchQuery: boolean
): unknown {
  const isDesc = sortOrder === "desc";

  const q = query as any;

  switch (sortBy) {
    case "relevance":
      return hasSearchQuery
        ? q.orderBy(isDesc ? desc(sql`relevance_score`) : asc(sql`relevance_score`))
        : q.orderBy(desc(comic.rating));

    case "rating":
      return q.orderBy(isDesc ? desc(comic.rating) : asc(comic.rating));

    case "views":
      return q.orderBy(isDesc ? desc(comic.views) : asc(comic.views));

    case "title":
      return q.orderBy(isDesc ? desc(comic.title) : asc(comic.title));

    case "popularity":
      return q.orderBy(
        isDesc
          ? desc(sql`(${comic.views} * 0.7 + CAST(${comic.rating} AS INTEGER) * 100 * 0.3)`)
          : asc(sql`(${comic.views} * 0.7 + CAST(${comic.rating} AS INTEGER) * 100 * 0.3)`)
      );

    case "latest":
    default:
      return q.orderBy(isDesc ? desc(comic.createdAt) : asc(comic.createdAt));
  }
}

// ═══════════════════════════════════════════════════
// RESULT ENRICHMENT
// ═══════════════════════════════════════════════════

function enrichSearchResult(result: unknown, genresMap: Record<number, string[]>): SearchResult {
  const r = result as any;
  return {
    id: Number(r.id) || 0,
    title: (r.title as string) || "",
    description: (r.description as string) || "",
    coverImage: (r.coverImage as string) || "",
    status: (r.status as string) || "",
    rating: (r.rating as string) || "",
    views: typeof r.views === "number" ? r.views : Number(r.views) || 0,
    authorName: (r.authorName as string | null) || null,
    artistName: (r.artistName as string | null) || null,
    typeName: (r.typeName as string | null) || null,
    genres: genresMap[Number(r.id)] || [],
    relevanceScore: (r.relevanceScore as number) || undefined,
    publicationDate: parseDate(r.publicationDate),
    createdAt: parseDate(r.createdAt),
    updatedAt: parseDate(r.updatedAt),
  };
}

function parseDate(date: unknown): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  return new Date(date as string | number);
}

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

function buildSearchQuery(query: string, mode: string): string {
  const cleanQuery = query.trim().replaceAll(/[^\s\w]/g, " ");

  switch (mode) {
    case "phrase":
      return cleanQuery.split(" ").filter(Boolean).join(" <-> ");

    case "simple":
      return cleanQuery.split(" ").filter(Boolean).join(" & ");

    case "websearch":
    default:
      return cleanQuery
        .split(" ")
        .filter(Boolean)
        .map((word) => `${word}:*`)
        .join(" | ");
  }
}

async function getSearchTotalCount(conditions: unknown[]): Promise<number> {
  let countQuery = db
    .select({ count: sql<number>`count(DISTINCT ${comic.id})::int` })
    .from(comic)
    .leftJoin(author, eq(comic.authorId, author.id))
    .leftJoin(artist, eq(comic.artistId, artist.id))
    .$dynamic();

  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...(conditions as any)));
  }

  const result = await countQuery;
  return result[0]?.count || 0;
}

async function getComicGenres(comicIds: number[]): Promise<Record<number, string[]>> {
  if (comicIds.length === 0) {
    return {};
  }

  const genresResult = await db
    .select({
      comicId: comicToGenre.comicId,
      genreName: genre.name,
    })
    .from(comicToGenre)
    .innerJoin(genre, eq(comicToGenre.genreId, genre.id))
    .where(inArray(comicToGenre.comicId, comicIds));

  const genresMap: Record<number, string[]> = {};
  for (const row of genresResult) {
    if (!genresMap[row.comicId]) {
      genresMap[row.comicId] = [];
    }
    if (row.genreName) {
      genresMap[row.comicId]?.push(row.genreName);
    }
  }

  return genresMap;
}

// ═══════════════════════════════════════════════════
// SEARCH SUGGESTIONS & AUTOCOMPLETE
// ═══════════════════════════════════════════════════

/**
 *
 * param query
 * param limit
 * @param query
 * @param limit
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<{ comics: string[]; authors: string[]; artists: string[] }> {
  if (!query || query.length < 2) {
    return { comics: [], authors: [], artists: [] };
  }

  const tsquery = buildSearchQuery(query, "websearch");

  const [comicSuggestions, authorSuggestions, artistSuggestions] = await Promise.all([
    db
      .select({ title: comic.title })
      .from(comic)
      .where(sql`${comic.searchVector}  to_tsquery('english', ${tsquery})`)
      .orderBy(desc(sql`ts_rank(${comic.searchVector}, to_tsquery('english', ${tsquery}))`))
      .limit(limit),

    db
      .select({ name: author.name })
      .from(author)
      .where(sql`${author.searchVector}  to_tsquery('english', ${tsquery})`)
      .orderBy(desc(sql`ts_rank(${author.searchVector}, to_tsquery('english', ${tsquery}))`))
      .limit(limit),

    db
      .select({ name: artist.name })
      .from(artist)
      .where(sql`${artist.searchVector}  to_tsquery('english', ${tsquery})`)
      .orderBy(desc(sql`ts_rank(${artist.searchVector}, to_tsquery('english', ${tsquery}))`))
      .limit(limit),
  ]);

  return {
    comics: comicSuggestions.map((s: { title: string }) => s.title),
    authors: authorSuggestions
      .map((s: { name: string | null }) => s.name)
      .filter((n: string | null): n is string => n !== null),
    artists: artistSuggestions
      .map((s: { name: string | null }) => s.name)
      .filter((n: string | null): n is string => n !== null),
  };
}

/**
 *
 * param limit
 * @param limit
 */
export async function getPopularSearches(limit: number = 10): Promise<string[]> {
  const topComics = await db
    .select({ title: comic.title })
    .from(comic)
    .orderBy(desc(comic.rating), desc(comic.views))
    .limit(limit);

  return topComics.map((c: { title: string }) => c.title);
}

/**
 *
 * param days
 * param limit
 * @param days
 * @param limit
 */
export async function getTrendingComics(
  days: number = 7,
  limit: number = 10
): Promise<SearchResult[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await db
    .select({
      id: comic.id,
      title: comic.title,
      description: comic.description,
      coverImage: comic.coverImage,
      status: comic.status,
      publicationDate: comic.publicationDate,
      rating: comic.rating,
      views: comic.views,
      authorName: author.name,
      artistName: artist.name,
      typeName: type.name,
      createdAt: comic.createdAt,
      updatedAt: comic.updatedAt,
    })
    .from(comic)
    .leftJoin(author, eq(comic.authorId, author.id))
    .leftJoin(artist, eq(comic.artistId, artist.id))
    .leftJoin(type, eq(comic.typeId, type.id))
    .where(gte(comic.updatedAt, since))
    .orderBy(desc(comic.views))
    .limit(limit);

  const comicIds = results.map((r) => r.id);
  const genresMap = await getComicGenres(comicIds);

  return results.map((result) => enrichSearchResult(result, genresMap));
}
