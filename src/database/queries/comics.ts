import { db as database } from "@/database/db";
import {
  artist,
  author,
  bookmark,
  chapter,
  comic,
  comicToGenre,
  genre,
  type,
} from "@/database/schema";
import type { ComicFilters, ComicWithDetails, Genre, PaginatedResponse } from "@/types";
import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, gte, inArray, like, or, sql } from "drizzle-orm";

/**
 *
 * param title
 * @param title
 */
export async function getComicByTitle(title: string) {
  return await database.query.comic.findFirst({
    where: eq(comic.title, title),
  });
}

/**
 *
 * param filters
 * @param filters
 */
export async function getAllComics(
  filters: ComicFilters = {}
): Promise<PaginatedResponse<ComicWithDetails>> {
  const {
    search,
    typeId,
    genreIds,
    status,
    minRating,
    sortBy = "latest",
    page = 1,
    limit = 12,
  } = filters;

  let query = database
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
    })
    .from(comic)
    .leftJoin(author, eq(comic.authorId, author.id))
    .leftJoin(artist, eq(comic.artistId, artist.id))
    .leftJoin(type, eq(comic.typeId, type.id))
    .$dynamic();

  const conditions: SQL<unknown>[] = [];

  if (search) {
    conditions.push(
      or(
        like(comic.title, `%${search}%`),
        like(author.name, `%${search}%`),
        like(artist.name, `%${search}%`)
      ) as SQL<unknown>
    );
  }

  if (typeId) {
    conditions.push(eq(comic.typeId, typeId));
  }

  if (status) {
    conditions.push(eq(comic.status, status));
  }

  if (minRating) {
    conditions.push(gte(comic.rating, minRating.toString()));
  }

  if (genreIds && genreIds.length > 0) {
    const comicsWithGenres = (await database
      .selectDistinct({ comicId: comicToGenre.comicId })
      .from(comicToGenre)
      .where(inArray(comicToGenre.genreId, genreIds))) as Array<{ comicId: number }>;

    const comicIds = comicsWithGenres.map((c) => c.comicId);
    if (comicIds.length > 0) {
      conditions.push(inArray(comic.id, comicIds));
    }
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  switch (sortBy) {
    case "rating":
      query = query.orderBy(desc(comic.rating));
      break;
    case "title":
      query = query.orderBy(asc(comic.title));
      break;
    case "views":
      query = query.orderBy(desc(comic.views));
      break;
    case "latest":
    default:
      query = query.orderBy(desc(comic.createdAt));
      break;
  }

  const offset = (page - 1) * limit;
  const results = await query.limit(limit).offset(offset);

  const totalQuery = database
    .select({ count: sql<number>`count(*)::int` })
    .from(comic)
    .$dynamic();

  if (conditions.length > 0) {
    totalQuery.where(and(...conditions));
  }

  const totalResult = await totalQuery;
  const total = Number(totalResult[0]?.count ?? 0);

  return {
    items: results as unknown as ComicWithDetails[],
    data: results as unknown as ComicWithDetails[],
    total,
    page,
    limit,
    pagination: { total, page, limit },
  };
}

/**
 *
 * param comicSlug
 * @param comicSlug
 */
export async function getComic(comicSlug: string): Promise<ComicWithDetails | null> {
  const result = await database
    .select({
      comic: comic,
      author: author,
      artist: artist,
      type: type,
    })
    .from(comic)
    .leftJoin(author, eq(comic.authorId, author.id))
    .leftJoin(artist, eq(comic.artistId, artist.id))
    .leftJoin(type, eq(comic.typeId, type.id))
    .where(eq(comic.slug, comicSlug))
    .limit(1);

  if (!result[0]) return null;

  const chapters = await database
    .select()
    .from(chapter)
    .where(eq(chapter.comicId, result[0].comic.id))
    .orderBy(asc(chapter.chapterNumber));

  const genresResult = await database
    .select({ genre })
    .from(comicToGenre)
    .leftJoin(genre, eq(comicToGenre.genreId, genre.id))
    .where(eq(comicToGenre.comicId, result[0].comic.id));

  const genres = (genresResult as any[]).map((g: any) => g.genre as Genre).filter(Boolean);

  // Fetch bookmarks for this comic
  const bookmarks = await database
    .select()
    .from(bookmark)
    .where(eq(bookmark.comicId, result[0].comic.id));

  return {
    ...result[0].comic,
    author: result[0].author,
    artist: result[0].artist,
    type: result[0].type,
    genres,
    chapters,
    bookmarks,
  } as ComicWithDetails;
}

/**
 *
 * param comicId
 * param limit
 * @param comicId
 * @param comicSlug
 * @param limit
 */
export async function getRecommendedComics(comicSlug: string, limit: number = 6) {
  const currentComic = await database
    .select()
    .from(comic)
    .where(eq(comic.slug, comicSlug))
    .limit(1);

  if (!currentComic[0]) return [];

  const recommended = await database
    .select({
      slug: comic.slug,
      title: comic.title,
      coverImage: comic.coverImage,
      rating: comic.rating,
      status: comic.status,
      typeName: type.name,
    })
    .from(comic)
    .leftJoin(type, eq(comic.typeId, type.id))
    .where(and(eq(comic.typeId, currentComic[0].typeId!), sql`${comic.slug} != ${comicSlug}`))
    .orderBy(desc(comic.rating))
    .limit(limit);

  return recommended;
}

/**
 *
 * param query
 * param limit
 * @param query
 * @param limit
 */
export async function searchComics(query: string, limit: number = 10) {
  if (!query || query.trim().length === 0) return [];

  const searchTerm = `%${query.trim()}%`;

  const results = await database
    .select({
      id: comic.id,
      title: comic.title,
      coverImage: comic.coverImage,
      authorName: author.name,
      typeName: type.name,
    })
    .from(comic)
    .leftJoin(author, eq(comic.authorId, author.id))
    .leftJoin(type, eq(comic.typeId, type.id))
    .where(
      or(
        like(comic.title, searchTerm),
        like(author.name, searchTerm),
        like(comic.description, searchTerm)
      )
    )
    .orderBy(desc(comic.views))
    .limit(limit);

  return results;
}

/**
 *
 * param typeId
 * param limit
 * @param typeId
 * @param limit
 */
export async function getComicsByType(typeId: number, limit: number = 12) {
  return await database
    .select()
    .from(comic)
    .where(eq(comic.typeId, typeId))
    .orderBy(desc(comic.createdAt))
    .limit(limit);
}

/**
 *
 * param limit
 * @param limit
 */
export async function getLatestComics(limit: number = 12): Promise<
  Array<{
    slug: string;
    title: string;
    coverImage: string | null;
    rating: number | null;
    status: string;
    createdAt: Date | null;
  }>
> {
  return await database
    .select({
      slug: comic.slug,
      title: comic.title,
      coverImage: comic.coverImage,
      rating: comic.rating,
      status: comic.status,
      createdAt: comic.createdAt,
    })
    .from(comic)
    .orderBy(desc(comic.createdAt))
    .limit(limit);
}

/**
 *
 * param limit
 * @param limit
 */
export async function getPopularComics(limit: number = 12): Promise<
  Array<{
    slug: string;
    title: string;
    coverImage: string | null;
    rating: number | null;
    views: number | null;
  }>
> {
  return await database
    .select({
      slug: comic.slug,
      title: comic.title,
      coverImage: comic.coverImage,
      rating: comic.rating,
      views: comic.views,
    })
    .from(comic)
    .orderBy(desc(comic.views), desc(comic.rating))
    .limit(limit);
}
