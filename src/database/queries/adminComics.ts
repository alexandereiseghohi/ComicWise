import { db as database } from "@/database/db";
import { artist, author, comic, type as typeTable } from "@/database/schema";
import { desc, eq, like } from "drizzle-orm";

const COMICS_PER_PAGE = 25;

export async function getComicsWithPagination() {
  const baseQuery = database
    .select({
      id: comic.id,
      title: comic.title,
      slug: comic.slug,
      coverImage: comic.coverImage,
      status: comic.status,
      views: comic.views,
      createdAt: comic.createdAt,
      updatedAt: comic.updatedAt,
      authorName: author.name,
      artistName: artist.name,
      typeName: typeTable.name,
    })
    .from(comic)
    .leftJoin(author, eq(comic.authorId, author.id))
    .leftJoin(artist, eq(comic.artistId, artist.id))
    .leftJoin(typeTable, eq(comic.typeId, typeTable.id))
    .orderBy(desc(comic.createdAt));

  const items = await baseQuery.limit(COMICS_PER_PAGE + 1);

  const hasNextPage = items.length > COMICS_PER_PAGE;
  const data = items.slice(0, COMICS_PER_PAGE);

  return {
    data,
    hasNextPage,
    nextCursor: hasNextPage ? data[data.length - 1]?.id || null : null,
  };
}

export async function getComicById(id: number) {
  const [result] = await database
    .select({
      id: comic.id,
      title: comic.title,
      slug: comic.slug,
      description: comic.description,
      coverImage: comic.coverImage,
      status: comic.status,
      publicationDate: comic.publicationDate,
      views: comic.views,
      rating: comic.rating,
      authorId: comic.authorId,
      artistId: comic.artistId,
      typeId: comic.typeId,
      createdAt: comic.createdAt,
      updatedAt: comic.updatedAt,
    })
    .from(comic)
    .where(eq(comic.id, id));

  return result || null;
}

export async function searchComics(query: string) {
  const searchTerm = `%${query}%`;
  const results = await database
    .select({
      id: comic.id,
      title: comic.title,
      slug: comic.slug,
      coverImage: comic.coverImage,
      status: comic.status,
      views: comic.views,
      createdAt: comic.createdAt,
      updatedAt: comic.updatedAt,
      authorName: author.name,
      artistName: artist.name,
      typeName: typeTable.name,
    })
    .from(comic)
    .leftJoin(author, eq(comic.authorId, author.id))
    .leftJoin(artist, eq(comic.artistId, artist.id))
    .leftJoin(typeTable, eq(comic.typeId, typeTable.id))
    .where(like(comic.title, searchTerm))
    .orderBy(desc(comic.createdAt))
    .limit(25);

  return results;
}
