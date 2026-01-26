import type { Comic } from "@/types/database";

import type { CacheOptions } from "@/lib/cache";
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

/**
 * Comic Caching Service
 * Provides high-level caching for comics with automatic invalidation
 */
export class ComicCacheService {
  /**
   * Get comic by ID from cache or fetch
   * param comicId
   * param fetchFn
   * param fetchFunction
   * @param comicId
   * @param fetchFunction
   */
  async getComic(
    comicId: number,
    fetchFunction: () => Promise<Comic | null>
  ): Promise<Comic | null> {
    const key = `${CACHE_KEYS.COMIC}${comicId}`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: CACHE_TTL.LONG,
      tags: ["comic", `comic:${comicId}`],
    });
  }

  /**
   * Get comic by slug from cache or fetch
   * param slug
   * param fetchFn
   * param fetchFunction
   * @param slug
   * @param fetchFunction
   */
  async getComicBySlug(
    slug: string,
    fetchFunction: () => Promise<Comic | null>
  ): Promise<Comic | null> {
    const key = `${CACHE_KEYS.COMIC}slug:${slug}`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: CACHE_TTL.LONG,
      tags: ["comic", `comic:slug:${slug}`],
    });
  }

  /**
   * Get comics list with filters from cache or fetch
   * param cacheKey
   * param fetchFn
   * param fetchFunction
   * param options
   * @param cacheKey
   * @param fetchFunction
   * @param options
   */
  async getComicsList<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const key = `${CACHE_KEYS.COMICS_LIST}${cacheKey}`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: options?.ttl || CACHE_TTL.MEDIUM,
      tags: ["comics", ...(options?.tags || [])],
    });
  }

  /**
   * Get comic chapters from cache or fetch
   * param comicId
   * param fetchFn
   * param fetchFunction
   * @param comicId
   * @param fetchFunction
   */
  async getComicChapters<T>(comicId: number, fetchFunction: () => Promise<T>): Promise<T> {
    const key = `${CACHE_KEYS.COMIC_CHAPTERS}${comicId}`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: CACHE_TTL.MEDIUM,
      tags: ["chapters", `comic:${comicId}`],
    });
  }

  /**
   * Get chapter by ID from cache or fetch
   * param chapterId
   * param fetchFn
   * param fetchFunction
   * @param chapterId
   * @param fetchFunction
   */
  async getChapter<T>(chapterId: number, fetchFunction: () => Promise<T>): Promise<T> {
    const key = `${CACHE_KEYS.CHAPTER}${chapterId}`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: CACHE_TTL.LONG,
      tags: ["chapter", `chapter:${chapterId}`],
    });
  }

  /**
   * Cache search results
   * param searchKey
   * param fetchFn
   * param fetchFunction
   * @param searchKey
   * @param fetchFunction
   */
  async getSearchResults<T>(searchKey: string, fetchFunction: () => Promise<T>): Promise<T> {
    const key = `${CACHE_KEYS.SEARCH}${searchKey}`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: CACHE_TTL.SHORT, // Search results expire quickly
      tags: ["search"],
    });
  }

  /**
   * Get trending comics from cache or fetch
   * param fetchFn
   * param fetchFunction
   * @param fetchFunction
   */
  async getTrendingComics<T>(fetchFunction: () => Promise<T>): Promise<T> {
    const key = `${CACHE_KEYS.TRENDING}comics`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: CACHE_TTL.MEDIUM,
      tags: ["trending"],
    });
  }

  /**
   * Get popular comics from cache or fetch
   * param fetchFn
   * param fetchFunction
   * @param fetchFunction
   */
  async getPopularComics<T>(fetchFunction: () => Promise<T>): Promise<T> {
    const key = `${CACHE_KEYS.POPULAR}comics`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: CACHE_TTL.LONG,
      tags: ["popular"],
    });
  }

  /**
   * Get genres list from cache or fetch
   * param fetchFn
   * param fetchFunction
   * @param fetchFunction
   */
  async getGenres<T>(fetchFunction: () => Promise<T>): Promise<T> {
    const key = `${CACHE_KEYS.GENRES_LIST}all`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: CACHE_TTL.VERY_LONG, // Genres rarely change
      tags: ["genres"],
    });
  }

  /**
   * Invalidate specific comic cache
   * param comicId
   * @param comicId
   */
  async invalidateComic(comicId: number): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.COMIC}${comicId}`,
      `${CACHE_KEYS.COMIC}slug:*`, // Invalidate slug lookups too
      `${CACHE_KEYS.COMIC_CHAPTERS}${comicId}`,
    ];

    await Promise.all(patterns.map((pattern) => cache.deletePattern(pattern)));

    // Invalidate by tag
    await cache.invalidateByTag(`comic:${comicId}`);
  }

  /**
   * Invalidate comics list cache
   */
  async invalidateComicsList(): Promise<void> {
    await cache.deletePattern(`${CACHE_KEYS.COMICS_LIST}*`);
    await cache.invalidateByTag("comics");
  }

  /**
   * Invalidate chapter cache
   * param chapterId
   * param comicId
   * @param chapterId
   * @param comicId
   */
  async invalidateChapter(chapterId: number, comicId?: number): Promise<void> {
    await cache.delete(`${CACHE_KEYS.CHAPTER}${chapterId}`);
    await cache.invalidateByTag(`chapter:${chapterId}`);

    // Also invalidate comic's chapters list if comicId provided
    if (comicId) {
      await cache.delete(`${CACHE_KEYS.COMIC_CHAPTERS}${comicId}`);
      await cache.invalidateByTag(`comic:${comicId}`);
    }
  }

  /**
   * Invalidate all search cache
   */
  async invalidateSearch(): Promise<void> {
    await cache.deletePattern(`${CACHE_KEYS.SEARCH}*`);
    await cache.invalidateByTag("search");
  }

  /**
   * Invalidate trending cache
   */
  async invalidateTrending(): Promise<void> {
    await cache.deletePattern(`${CACHE_KEYS.TRENDING}*`);
    await cache.invalidateByTag("trending");
  }

  /**
   * Invalidate popular cache
   */
  async invalidatePopular(): Promise<void> {
    await cache.deletePattern(`${CACHE_KEYS.POPULAR}*`);
    await cache.invalidateByTag("popular");
  }

  /**
   * Invalidate genres cache
   */
  async invalidateGenres(): Promise<void> {
    await cache.deletePattern(`${CACHE_KEYS.GENRES_LIST}*`);
    await cache.invalidateByTag("genres");
  }

  /**
   * Track comic view (increment counter)
   * param comicId
   * param amount
   * @param comicId
   * @param amount
   */
  async incrementViews(comicId: number, amount = 1): Promise<number> {
    const key = `${CACHE_KEYS.VIEW_COUNT}comic:${comicId}`;
    return cache.increment(key, amount);
  }

  /**
   * Get comic view count from cache
   * param comicId
   * @param comicId
   */
  async getViewCount(comicId: number): Promise<number> {
    const key = `${CACHE_KEYS.VIEW_COUNT}comic:${comicId}`;
    const count = await cache.get<number>(key);
    return count ?? 0;
  }

  /**
   * Track chapter view
   * param chapterId
   * param amount
   * @param chapterId
   * @param amount
   */
  async incrementChapterViews(chapterId: number, amount = 1): Promise<number> {
    const key = `${CACHE_KEYS.VIEW_COUNT}chapter:${chapterId}`;
    return cache.increment(key, amount);
  }

  /**
   * Add comic to trending sorted set (by views)
   * param comicId
   * param views
   * @param comicId
   * @param views
   */
  async addToTrending(comicId: number, views: number): Promise<void> {
    const key = `${CACHE_KEYS.TRENDING}sorted`;
    await cache.addToSortedSet(key, views, comicId.toString());

    // Set expiry for trending data (7 days)
    await cache.setTTL(key, CACHE_TTL.WEEKLY);
  }

  /**
   * Get top trending comics from sorted set
   * param limit
   * @param limit
   */
  async getTopTrending(limit = 10): Promise<number[]> {
    const key = `${CACHE_KEYS.TRENDING}sorted`;
    const results = await cache.getTopFromSortedSet(key, limit);
    return results.map((item) => Number.parseInt(item.member));
  }

  /**
   * Cache user bookmarks
   * param userId
   * param fetchFn
   * param fetchFunction
   * @param userId
   * @param fetchFunction
   */
  async getUserBookmarks<T>(userId: string, fetchFunction: () => Promise<T>): Promise<T> {
    const key = `${CACHE_KEYS.USER_BOOKMARKS}${userId}`;
    return cache.getOrSet(key, fetchFunction, {
      ttl: CACHE_TTL.SHORT,
      tags: [`user:${userId}`, "bookmarks"],
    });
  }

  /**
   * Invalidate user bookmarks cache
   * param userId
   * @param userId
   */
  async invalidateUserBookmarks(userId: string): Promise<void> {
    await cache.delete(`${CACHE_KEYS.USER_BOOKMARKS}${userId}`);
    await cache.invalidateByTag(`user:${userId}`);
  }

  /**
   * Get comment count for a comic
   * param comicId
   * @param comicId
   */
  async getCommentCount(comicId: number): Promise<number> {
    const key = `${CACHE_KEYS.COMMENT_COUNT}${comicId}`;
    const count = await cache.get<number>(key);
    return count ?? 0;
  }

  /**
   * Set comment count for a comic
   * param comicId
   * param count
   * @param comicId
   * @param count
   */
  async setCommentCount(comicId: number, count: number): Promise<void> {
    const key = `${CACHE_KEYS.COMMENT_COUNT}${comicId}`;
    await cache.set(key, count, { ttl: CACHE_TTL.SHORT });
  }

  /**
   * Increment comment count
   * param comicId
   * @param comicId
   */
  async incrementCommentCount(comicId: number): Promise<number> {
    const key = `${CACHE_KEYS.COMMENT_COUNT}${comicId}`;
    return cache.increment(key, 1);
  }

  /**
   * Decrement comment count
   * param comicId
   * @param comicId
   */
  async decrementCommentCount(comicId: number): Promise<number> {
    const key = `${CACHE_KEYS.COMMENT_COUNT}${comicId}`;
    return cache.decrement(key, 1);
  }

  /**
   * Warm cache with popular comics (pre-populate)
   * param popularComics
   * @param popularComics
   */
  async warmCache(popularComics: Comic[]): Promise<void> {
    console.log(`🔥 Warming cache with ${popularComics.length} popular comics...`);

    const promises = popularComics.map((comic) => {
      const key = `${CACHE_KEYS.COMIC}${comic.id}`;
      return cache.set(key, comic, {
        ttl: CACHE_TTL.VERY_LONG,
        tags: ["comic", `comic:${comic.id}`, "popular"],
      });
    });

    await Promise.all(promises);
    console.log("✅ Cache warming completed");
  }

  /**
   * Get cache statistics for comics
   */
  async getComicCacheStats(): Promise<{
    comicsCached: number;
    chaptersCached: number;
    searchesCached: number;
  }> {
    const [comics, chapters, searches] = await Promise.all([
      cache.getKeys(`${CACHE_KEYS.COMIC}*`),
      cache.getKeys(`${CACHE_KEYS.CHAPTER}*`),
      cache.getKeys(`${CACHE_KEYS.SEARCH}*`),
    ]);

    return {
      comicsCached: comics.length,
      chaptersCached: chapters.length,
      searchesCached: searches.length,
    };
  }
}

// Export singleton instance
export const comicCache = new ComicCacheService();
