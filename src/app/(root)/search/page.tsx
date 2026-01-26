import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface SearchParams {
  q?: string;
  genre?: string;
  type?: string;
  status?: string;
}

async function searchComics(params: SearchParams): Promise<{ comics: any[]; query?: string }> {
  const { q, genre: genreParam, type: typeParam, status } = params;

  if (!q || q.trim().length < 2) {
    return { comics: [], query: q };
  }

  const searchTerm = q.trim();

  let query = db
    .select({
      id: comic.id,
      title: comic.title,
      slug: comic.slug,
      description: comic.description,
      coverImage: comic.coverImage,
      status: comic.status,
      rating: comic.rating,
      views: comic.views,
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

  // Build search conditions
  const conditions = [
    // Use full-text search if available
    sql`${comic.searchVector} @@ plainto_tsquery('english', ${searchTerm})`,
    // Fallback to pattern matching
    or(ilike(comic.title, `%${searchTerm}%`), ilike(comic.description, `%${searchTerm}%`)),
  ];

  // Apply additional filters
  const filterConditions = [];

  if (genreParam) {
    const genreIds = (await db
      .select({ comicId: comicToGenre.comicId })
      .from(comicToGenre)
      .leftJoin(genre, eq(comicToGenre.genreId, genre.id))
      .where(eq(genre.name, genreParam))) as Array<{ comicId: number }>;

    if (genreIds.length > 0) {
      filterConditions.push(
        inArray(
          comic.id,
          genreIds.map((g: { comicId: number }) => g.comicId)
        )
      );
    }
  }

  if (typeParam) {
    const typeRecord = await db.select().from(type).where(eq(type.name, typeParam)).limit(1);
    if (typeRecord[0]) {
      filterConditions.push(eq(comic.typeId, typeRecord[0].id));
    }
  }

  if (status) {
    filterConditions.push(eq(comic.status, status as any));
  }

  // Combine search and filter conditions
  const allConditions =
    filterConditions.length > 0 ? and(or(...conditions), ...filterConditions) : or(...conditions);

  query = query.where(allConditions);

  // Order by relevance (using ts_rank for full-text search)
  query = query.orderBy(
    sql`ts_rank(${comic.searchVector}, plainto_tsquery('english', ${searchTerm})) DESC`,
    desc(comic.views)
  );

  const comics = await query.limit(50);

  return { comics, query: searchTerm };
}

async function getFilterOptions() {
  const [genres, types] = (await Promise.all([
    db.select().from(genre).orderBy(genre.name),
    db.select().from(type).orderBy(type.name),
  ])) as [Array<{ id: number; name: string }>, Array<{ id: number; name: string }>];

  return { genres, types };
}

function ComicCard({ comic }: { comic: any }) {
  return (
    <Link href={`/comics/${comic.slug}`}>
      <Card className="group flex overflow-hidden transition-all hover:shadow-lg">
        <div className="relative h-32 w-24 shrink-0 overflow-hidden">
          {comic.coverImage ? (
            <Image
              src={normalizeImagePath(comic.coverImage) ?? comic.coverImage}
              alt={comic.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground">No Image</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold">{comic.title}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {comic.status}
            </Badge>
          </div>
          {comic.type && (
            <Badge variant="outline" className="mb-2 w-fit text-xs">
              {comic.type.name}
            </Badge>
          )}
          <p className="mb-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {comic.description}
          </p>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>⭐ {comic.rating ?? "N/A"}</span>
            <span>👁 {comic.views?.toLocaleString() ?? 0}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i} className="flex overflow-hidden">
          <Skeleton className="h-32 w-24" />
          <div className="flex flex-1 flex-col p-3">
            <Skeleton className="mb-2 h-5 w-3/4" />
            <Skeleton className="mb-2 h-4 w-1/3" />
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-5/6" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { genres, types } = await getFilterOptions();
  const { comics, query } = await searchComics(params);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Search Comics</h1>
        <p className="text-muted-foreground">
          Find your next favorite comic by title, description, or author
        </p>
      </div>

      {/* Search Form */}
      <form method="get" className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={params.q}
            placeholder="Search by title, description, or author..."
            className="pl-10"
            autoFocus
          />
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3">
          <Select name="genre" defaultValue={params.genre ?? "all"}>
            <SelectTrigger>
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((g: { id: number; name: string }) => (
                <SelectItem key={g.id} value={g.name}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="type" defaultValue={params.type ?? "all"}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((t: { id: number; name: string }) => (
                <SelectItem key={t.id} value={t.name}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="status" defaultValue={params.status ?? "all"}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Hiatus">Hiatus</SelectItem>
              <SelectItem value="Dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>

      {/* Search Results */}
      <Suspense fallback={<SearchResultsSkeleton />}>
        {!query ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
              <p className="text-lg font-semibold">Start searching</p>
              <p className="text-muted-foreground">Enter a search term to find comics</p>
            </div>
          </div>
        ) : comics.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold">No results found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">
              Found {comics.length} result{comics.length !== 1 ? "s" : ""} for &quot;{query}&quot;
            </p>
            <div className="space-y-3">
              {comics.map((comic: any) => (
                <ComicCard key={comic.id} comic={comic} />
              ))}
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
}
