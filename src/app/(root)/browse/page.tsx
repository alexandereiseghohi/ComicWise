import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/database";
import { author, comic, comicToGenre, genre, type } from "@/database/schema";
import { normalizeImagePath } from "@/lib/image-path";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface SearchParams {
  genre?: string;
  type?: string;
  status?: string;
  sort?: string;
  page?: string;
}

interface Comic {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  status: string;
  rating: number | null;
  views: number | null;
  createdAt: Date | null;
  type: {
    id: number;
    name: string;
  } | null;
  author: {
    id: number;
    name: string;
  } | null;
}

async function getComics(params: SearchParams) {
  const { genre: genreParam, type: typeParam, status, sort = "newest", page = "1" } = params;
  const limit = 24;
  const offset = (Number.parseInt(page) - 1) * limit;

  let query = db
    .select({
      id: comic.id,
      title: comic.title,
      slug: comic.slug,
      description: comic.description,
      coverImage: comic.coverImage,
      status: comic.status,
      rating: sql<number | null>`CAST(${comic.rating} AS DECIMAL(3,1))`,
      views: comic.views,
      createdAt: comic.createdAt,
      type: {
        id: type.id,
        name: type.name,
      },
      author: {
        id: author.id,
        name: author.name,
      },
    })
    .from(comic)
    .leftJoin(type, eq(comic.typeId, type.id))
    .leftJoin(author, eq(comic.authorId, author.id))
    .$dynamic();

  // Apply filters
  const conditions = [];

  if (genreParam) {
    const genreIds = await db
      .select({ comicId: comicToGenre.comicId })
      .from(comicToGenre)
      .leftJoin(genre, eq(comicToGenre.genreId, genre.id))
      .where(eq(genre.name, genreParam));

    const comicIds = genreIds.map((g) => g.comicId).filter((id): id is number => id !== null);

    if (comicIds.length > 0) {
      conditions.push(inArray(comic.id, comicIds));
    } else if (genreParam !== "all") {
      // If genre filter is active but no comics match, return empty results
      conditions.push(eq(comic.id, -1));
    }
  }

  if (typeParam) {
    const typeRecord = await db.select().from(type).where(eq(type.name, typeParam)).limit(1);
    if (typeRecord[0]) {
      conditions.push(eq(comic.typeId, typeRecord[0].id));
    }
  }

  if (status) {
    conditions.push(eq(comic.status, status as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  switch (sort) {
    case "popular":
      query = query.orderBy(desc(comic.views));
      break;
    case "rating":
      query = query.orderBy(desc(comic.rating));
      break;
    case "oldest":
      query = query.orderBy(asc(comic.createdAt));
      break;
    case "title":
      query = query.orderBy(asc(comic.title));
      break;
    default: // newest
      query = query.orderBy(desc(comic.createdAt));
  }

  const comics = await query.limit(limit).offset(offset);

  // Get total count for pagination
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(comic);
  const count = countResult[0]?.count ?? 0;

  return {
    comics,
    totalPages: Math.ceil(Number(count) / limit),
    currentPage: Number.parseInt(page),
  };
}

async function getFilterOptions() {
  const [genres, types] = await Promise.all([
    db.select().from(genre).orderBy(asc(genre.name)),
    db.select().from(type).orderBy(asc(type.name)),
  ]);

  return { genres, types };
}

function ComicCard({ comic }: { comic: Comic }) {
  return (
    <Link href={`/comics/${comic.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-2/3 overflow-hidden">
          {comic.coverImage ? (
            <Image
              src={normalizeImagePath(comic.coverImage) ?? comic.coverImage}
              alt={comic.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {comic.status}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <h3 className="line-clamp-1 font-semibold">{comic.title}</h3>
          {comic.type && (
            <Badge variant="outline" className="w-fit">
              {comic.type.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="pb-2">
          <p className="line-clamp-2 text-sm text-muted-foreground">{comic.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-muted-foreground">
          <span>⭐ {comic.rating ?? "N/A"}</span>
          <span>👁 {comic.views?.toLocaleString() ?? 0}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}

function ComicGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 24 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-2/3 w-full" />
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="pb-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { genres, types } = await getFilterOptions();
  const { comics, totalPages, currentPage } = await getComics(params);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Browse Comics</h1>
        <p className="text-muted-foreground">
          Discover your next favorite comic from our collection
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Link
          href={`/browse?${new URLSearchParams({ ...params, genre: "all" }).toString().replace("genre=all&", "").replace("&genre=all", "").replace("genre=all", "")}`}
          className="contents"
        >
          <Select name="genre" defaultValue={params.genre ?? "all"}>
            <SelectTrigger>
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((g) => (
                <Link
                  key={g.id}
                  href={`/browse?${new URLSearchParams({ ...params, genre: g.name, page: "1" }).toString()}`}
                  className="contents"
                >
                  <SelectItem value={g.name}>{g.name}</SelectItem>
                </Link>
              ))}
            </SelectContent>
          </Select>
        </Link>

        <Link
          href={`/browse?${new URLSearchParams({ ...params, type: "all" }).toString().replace("type=all&", "").replace("&type=all", "").replace("type=all", "")}`}
          className="contents"
        >
          <Select name="type" defaultValue={params.type ?? "all"}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((t) => (
                <Link
                  key={t.id}
                  href={`/browse?${new URLSearchParams({ ...params, type: t.name, page: "1" }).toString()}`}
                  className="contents"
                >
                  <SelectItem value={t.name}>{t.name}</SelectItem>
                </Link>
              ))}
            </SelectContent>
          </Select>
        </Link>

        <Link
          href={`/browse?${new URLSearchParams({ ...params, status: "all" }).toString().replace("status=all&", "").replace("&status=all", "").replace("status=all", "")}`}
          className="contents"
        >
          <Select name="status" defaultValue={params.status ?? "all"}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {["Ongoing", "Completed", "Hiatus", "Dropped"].map((status) => (
                <Link
                  key={status}
                  href={`/browse?${new URLSearchParams({ ...params, status, page: "1" }).toString()}`}
                  className="contents"
                >
                  <SelectItem value={status}>{status}</SelectItem>
                </Link>
              ))}
            </SelectContent>
          </Select>
        </Link>

        <Link
          href={`/browse?${new URLSearchParams({ ...params, sort: "newest" }).toString()}`}
          className="contents"
        >
          <Select name="sort" defaultValue={params.sort ?? "newest"}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {["newest", "popular", "rating", "title", "oldest"].map((sortOption) => (
                <Link
                  key={sortOption}
                  href={`/browse?${new URLSearchParams({ ...params, sort: sortOption, page: "1" }).toString()}`}
                  className="contents"
                >
                  <SelectItem value={sortOption}>
                    {sortOption === "newest" && "Newest"}
                    {sortOption === "popular" && "Most Popular"}
                    {sortOption === "rating" && "Highest Rated"}
                    {sortOption === "title" && "Title (A-Z)"}
                    {sortOption === "oldest" && "Oldest"}
                  </SelectItem>
                </Link>
              ))}
            </SelectContent>
          </Select>
        </Link>
      </div>

      {/* Comics Grid */}
      <Suspense fallback={<ComicGridSkeleton />}>
        {comics.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold">No comics found</p>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {comics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        )}
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {currentPage > 1 && (
            <Button variant="outline" asChild>
              <Link
                href={`/browse?${new URLSearchParams({ ...params, page: String(currentPage - 1) }).toString()}`}
              >
                Previous
              </Link>
            </Button>
          )}

          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages && (
            <Button variant="outline" asChild>
              <Link
                href={`/browse?${new URLSearchParams({ ...params, page: String(currentPage + 1) }).toString()}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
