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
import { desc, eq, inArray, sql } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
  }>;
}

// Generate static params for all genres
export async function generateStaticParams() {
  const genres = await db.select({ slug: genre.slug }).from(genre);
  return genres.map((g) => ({ slug: g.slug }));
}

async function getGenre(slug: string) {
  const [genreData] = await db.select().from(genre).where(eq(genre.slug, slug)).limit(1);

  return genreData;
}

async function getGenreComics(genreId: number, sort: string = "newest", page: number = 1) {
  const ITEMS_PER_PAGE = 24;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Get comic IDs for this genre
  const comicIds = await db
    .select({ comicId: comicToGenre.comicId })
    .from(comicToGenre)
    .where(eq(comicToGenre.genreId, genreId));

  if (comicIds.length === 0) {
    return { comics: [], totalPages: 0, currentPage: page };
  }

  const comicIdList = comicIds.map((c) => c.comicId);

  // Build query
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
    .where(inArray(comic.id, comicIdList))
    .$dynamic();

  // Apply sorting
  switch (sort) {
    case "popular":
      query = query.orderBy(desc(comic.views));
      break;
    case "rating":
      query = query.orderBy(desc(comic.rating));
      break;
    case "title":
      query = query.orderBy(comic.title);
      break;
    case "oldest":
      query = query.orderBy(comic.createdAt);
      break;
    case "newest":
    default:
      query = query.orderBy(desc(comic.createdAt));
      break;
  }

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(comic)
    .where(inArray(comic.id, comicIdList));

  const count = countResult[0]?.count || 0;
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  // Apply pagination
  const comics = await query.limit(ITEMS_PER_PAGE).offset(offset);

  return { comics, totalPages, currentPage: page };
}

function ComicCard({ comic }: { comic: any }) {
  return (
    <Link href={`/comics/${comic.slug}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="relative aspect-2/3 overflow-hidden">
            {comic.coverImage ? (
              <Image
                src={comic.coverImage}
                alt={comic.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <span className="text-sm text-muted-foreground">No Image</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 leading-tight font-semibold">{comic.title}</h3>
          </div>
          <div className="mb-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {comic.status}
            </Badge>
            {comic.type && (
              <Badge variant="outline" className="text-xs">
                {comic.type.name}
              </Badge>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{comic.description}</p>
        </CardContent>
        <CardFooter className="flex gap-3 p-3 pt-0 text-xs text-muted-foreground">
          <span>⭐ {comic.rating || "N/A"}</span>
          <span>👁 {comic.views?.toLocaleString() || 0}</span>
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
          <div className="p-3">
            <Skeleton className="mb-2 h-5 w-full" />
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-5/6" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sort = "newest", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam, 10));

  const genreData = await getGenre(slug);

  if (!genreData) {
    notFound();
  }

  const { comics, totalPages, currentPage } = await getGenreComics(genreData.id, sort, page);

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/browse" className="hover:text-foreground">
          Browse
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{genreData.name}</span>
      </nav>

      {/* Genre Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{genreData.name}</h1>
        {genreData.description && <p className="text-muted-foreground">{genreData.description}</p>}
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {comics.length > 0 && (
            <>
              Showing {(currentPage - 1) * 24 + 1}-
              {Math.min(currentPage * 24, (currentPage - 1) * 24 + comics.length)} comics
            </>
          )}
        </p>

        <form method="get" className="flex items-center gap-2">
          <input type="hidden" name="page" value="1" />
          <label htmlFor="sort" className="text-sm font-medium">
            Sort by:
          </label>
          <Select name="sort" defaultValue={sort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </form>
      </div>

      {/* Comics Grid */}
      <Suspense fallback={<ComicGridSkeleton />}>
        {comics.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold">No comics found</p>
              <p className="text-muted-foreground">There are no comics in this genre yet.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {comics.map((comic) => (
                <ComicCard key={comic.id} comic={comic} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
                  <Link
                    href={`/genres/${slug}?sort=${sort}&page=${currentPage - 1}`}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  >
                    <ChevronLeft className="mr-1 size-4" />
                    Previous
                  </Link>
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>

                <Button variant="outline" size="sm" asChild disabled={currentPage >= totalPages}>
                  <Link
                    href={`/genres/${slug}?sort=${sort}&page=${currentPage + 1}`}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  >
                    Next
                    <ChevronRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}
