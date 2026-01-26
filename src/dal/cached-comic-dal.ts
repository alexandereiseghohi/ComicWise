/**
 * Comic Data Access Layer with Redis Caching
 * Integrates caching for improved performance
 */

import { db as database } from "@/database/db";
import { artist, author, comic, comicToGenre, type } from "@/database/schema";
import { cache, cacheKeys, defaultTTLs } from "@/lib/cache/redis";
import type { ComicWithDetails } from "@/types";
import type { Artist, Author, Comic, Type as ComicType } from "@/types/database";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, gte, inArray, like, or, sql } from "drizzle-orm";

/**
 * Cached comic queries
 */
export const cachedComicQueries = {
  /**
   * Get featured comics (top rated recent comics)
   * @param limit
   */
  async getFeaturedComics(limit: number = 6): Promise<ComicWithDetails[]> {
    const cacheKey = cacheKeys.featured(limit);

    return cache.getOrCompute(
      cacheKey,
      async () => {
        const results: Array<{
          comic: Comic;
          author?: Author | null;
          artist?: Artist | null;
          type?: ComicType | null;
        }> = await database
          .select()
          .from(comic)
          .leftJoin(author, eq(comic.authorId, author.id))
          .leftJoin(artist, eq(comic.artistId, artist.id))
          .leftJoin(type, eq(comic.typeId, type.id))
          .orderBy(desc(comic.rating), desc(comic.views), desc(comic.updatedAt))
          .limit(limit);

        return results.map((row: any) => ({
          ...row.comic,
          author: row.author || undefined,
          artist: row.artist || undefined,
          type: row.type || undefined,
        })) as ComicWithDetails[];
      },
      defaultTTLs.mediumLived
    );
  },

  /**
   * Get trending comics (most viewed recently)
   * @param limit
   */
  async getTrendingComics(limit: number = 6): Promise<ComicWithDetails[]> {
    const cacheKey = cacheKeys.trending(limit);

    return cache.getOrCompute(
      cacheKey,
      async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const results: Array<{
          comic: Comic;
          author?: Author | null;
          artist?: Artist | null;
          type?: ComicType | null;
        }> = await database
          .select()
          .from(comic)
          .leftJoin(author, eq(comic.authorId, author.id))
          .leftJoin(artist, eq(comic.artistId, artist.id))
          .leftJoin(type, eq(comic.typeId, type.id))
          .where(gte(comic.updatedAt, thirtyDaysAgo))
          .orderBy(desc(comic.views), desc(comic.updatedAt))
          .limit(limit);

        return results.map((row: any) => ({
          ...row.comic,
          author: row.author || undefined,
          artist: row.artist || undefined,
          type: row.type || undefined,
        })) as ComicWithDetails[];
      },
      defaultTTLs.shortLived
    );
  },

  /**
   * Get comic by ID with full details
   * @param id
   */
  async getComicById(id: number): Promise<ComicWithDetails | null> {
    const cacheKey = cacheKeys.comicId(id);

    return cache.getOrCompute(
      cacheKey,
      async () => {
        const results: Array<{
          comic: Comic;
          author?: Author | null;
          artist?: Artist | null;
          type?: ComicType | null;
        }> = await database
          .select()
          .from(comic)
          .leftJoin(author, eq(comic.authorId, author.id))
          .leftJoin(artist, eq(comic.artistId, artist.id))
          .leftJoin(type, eq(comic.typeId, type.id))
          .where(eq(comic.id, id));

        if (!results[0]) return null;

        return {
          ...results[0].comic,
          author: results[0].author || undefined,
          artist: results[0].artist || undefined,
          type: results[0].type || undefined,
        } as ComicWithDetails;
      },
      defaultTTLs.longLived
    );
  },

  /**
   * Get comic by slug with full details
   * @param slug
   */
  async getComicBySlug(slug: string): Promise<ComicWithDetails | null> {
    const cacheKey = cacheKeys.comicSlug(slug);

    return cache.getOrCompute(
      cacheKey,
      async () => {
        const results = await database
          .select()
          .from(comic)
          .leftJoin(author, eq(comic.authorId, author.id))
          .leftJoin(artist, eq(comic.artistId, artist.id))
          .leftJoin(type, eq(comic.typeId, type.id))
          .where(eq(comic.slug, slug));

        if (!results[0]) return null;

        return {
          ...results[0].comic,
          author: results[0].author || undefined,
          artist: results[0].artist || undefined,
          type: results[0].type || undefined,
        } as ComicWithDetails;
      },
      defaultTTLs.longLived
    );
  },

  /**
   * List all comics with pagination and filtering
   * @param page
   * @param limit
   * @param filters
   * @param filters.status
   * @param filters.typeId
   * @param filters.genreIds
   * @param filters.search
   * @param filters.minRating
   * @param filters.sortBy
   */
  async listComics(
    page: number = 1,
    limit: number = 12,
    filters?: {
      status?: string;
      typeId?: number;
      genreIds?: number[];
      search?: string;
      minRating?: string | number;
      sortBy?: "latest" | "popular" | "rating";
    }
  ): Promise<{ comics: ComicWithDetails[]; total: number }> {
    // Create cache key from filters
    const cacheKey = cacheKeys.comicList(page, limit, filters);

    return cache.getOrCompute(
      cacheKey,
      async () => {
        let query = database
          .select()
          .from(comic)
          .leftJoin(author, eq(comic.authorId, author.id))
          .leftJoin(artist, eq(comic.artistId, artist.id))
          .leftJoin(type, eq(comic.typeId, type.id))
          .$dynamic();

        const conditions: SQL<unknown>[] = [];

        // Apply search
        if (filters?.search) {
          conditions.push(
            or(
              like(comic.title, `%${filters.search}%`),
              like(comic.description, `%${filters.search}%`),
              like(author.name, `%${filters.search}%`)
            ) as SQL<unknown>
          );
        }

        // Apply status filter (use literal value)
        if (filters?.status && typeof filters.status === "string") {
          conditions.push(sql`${comic.status} = ${filters.status}`);
        }

        // Apply type filter
        if (filters?.typeId && typeof filters.typeId === "number") {
          conditions.push(eq(comic.typeId, filters.typeId));
        }

        // Apply rating filter
        if (filters?.minRating !== undefined && filters.minRating !== null) {
          const minRatingNum =
            typeof filters.minRating === "string"
              ? parseFloat(filters.minRating)
              : filters.minRating;
          if (!isNaN(minRatingNum)) {
            conditions.push(sql`${comic.rating}::numeric >= ${minRatingNum}`);
          }
        }

        // Apply genre filter
        if (filters?.genreIds && filters.genreIds.length > 0) {
          const comicsWithGenres = (await database
            .selectDistinct({ comicId: comicToGenre.comicId })
            .from(comicToGenre)
            .where(inArray(comicToGenre.genreId, filters.genreIds))) as Array<{ comicId: number }>;

          const comicIds = comicsWithGenres.map((c: { comicId: number }) => c.comicId);
          if (comicIds.length > 0) {
            conditions.push(inArray(comic.id, comicIds));
          }
        }

        // Apply conditions
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }

        // Apply sorting
        const sortBy = filters?.sortBy || "latest";
        switch (sortBy) {
          case "popular":
            query = query.orderBy(desc(comic.views));
            break;
          case "rating":
            query = query.orderBy(desc(comic.rating));
            break;
          case "latest":
          default:
            query = query.orderBy(desc(comic.updatedAt));
        }

        // Get total count
        const countResult = await database
          .select({ count: sql<number>`count(*)` })
          .from(comic)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = parseInt(countResult[0]?.count?.toString() || "0", 10);

        // Apply pagination
        const offset = (page - 1) * limit;
        const results = (await query.limit(limit).offset(offset)) as Array<{
          comic: Comic;
          author?: Author | null;
          artist?: Artist | null;
          type?: ComicType | null;
        }>;

        const comics = results.map((row: any) => ({
          ...row.comic,
          author: row.author || undefined,
          artist: row.artist || undefined,
          type: row.type || undefined,
        })) as ComicWithDetails[];

        return { comics, total };
      },
      defaultTTLs.mediumLived
    );
  },

  /**
   * Get comics by author
   * @param authorId
   * @param limit
   */
  async getComicsByAuthor(authorId: number, limit: number = 10): Promise<ComicWithDetails[]> {
    const cacheKey = cacheKeys.authorComics(authorId, limit);

    return cache.getOrCompute(
      cacheKey,
      async () => {
        const results = await database
          .select()
          .from(comic)
          .leftJoin(author, eq(comic.authorId, author.id))
          .leftJoin(artist, eq(comic.artistId, artist.id))
          .leftJoin(type, eq(comic.typeId, type.id))
          .where(eq(comic.authorId, authorId))
          .orderBy(desc(comic.updatedAt))
          .limit(limit);

        return results.map((row: any) => ({
          ...row.comic,
          author: row.author || undefined,
          artist: row.artist || undefined,
          type: row.type || undefined,
        })) as ComicWithDetails[];
      },
      defaultTTLs.mediumLived
    );
  },

  /**
   * Get comics by genre
   * @param genreId
   * @param limit
   */
  async getComicsByGenre(genreId: number, limit: number = 10): Promise<ComicWithDetails[]> {
    const cacheKey = cacheKeys.genreComics(genreId, limit);

    return cache.getOrCompute(
      cacheKey,
      async () => {
        const comicsWithGenre = (await database
          .selectDistinct({ comicId: comicToGenre.comicId })
          .from(comicToGenre)
          .where(eq(comicToGenre.genreId, genreId))) as Array<{ comicId: number }>;

        if (comicsWithGenre.length === 0) {
          return [];
        }

        const results = await database
          .select()
          .from(comic)
          .leftJoin(author, eq(comic.authorId, author.id))
          .leftJoin(artist, eq(comic.artistId, artist.id))
          .leftJoin(type, eq(comic.typeId, type.id))
          .where(
            inArray(
              comic.id,
              comicsWithGenre.map((c: { comicId: number }) => c.comicId)
            )
          )
          .orderBy(desc(comic.rating), desc(comic.views))
          .limit(limit);

        return results.map((row: any) => ({
          ...row.comic,
          author: row.author || undefined,
          artist: row.artist || undefined,
          type: row.type || undefined,
        })) as ComicWithDetails[];
      },
      defaultTTLs.mediumLived
    );
  },

  /**
   * Clear cache for a specific comic
   * @param id
   * @param slug
   */
  async invalidateComicCache(id: number, slug: string): Promise<void> {
    await cache.delete(cacheKeys.comicId(id));
    await cache.delete(cacheKeys.comicSlug(slug));
    // Invalidate common list caches
    await cache.delete(cacheKeys.featured());
    await cache.delete(cacheKeys.trending());
  },

  /**
   * Clear all comic caches
   */
  async invalidateAllComicCaches(): Promise<void> {
    // Clear featured and trending caches
    const limits = [6, 10, 12, 20];
    for (const limit of limits) {
      await cache.delete(cacheKeys.featured(limit));
      await cache.delete(cacheKeys.trending(limit));
    }
  },

  /**
   * Warm up cache with popular comics
   */
  async warmUpCache(): Promise<void> {
    console.log("Warming up comic cache...");
    try {
      await Promise.all([
        this.getFeaturedComics(10),
        this.getTrendingComics(10),
        this.listComics(1, 12),
      ]);
      console.log("Cache warm-up complete");
    } catch (error) {
      console.error("Cache warm-up failed:", error);
    }
  },
};
