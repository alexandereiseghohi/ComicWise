import { ComicCard } from "@/components/layout/ComicCard";
import { Filters } from "@/components/layout/Filters";
import { Pagination } from "@/components/layout/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllComics } from "@/database/queries/comics";
import { getAllGenres, getAllTypes } from "@/dto/genresTypesDto";
import { Suspense } from "react";

import type { ComicFilters, ComicStatus } from "@/types/database";
import type { Metadata } from "next";

interface Type {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

export const metadata: Metadata = {
  title: "Browse Comics - ComicWise",
  description: "Browse our extensive collection of comics",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ComicsGrid({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sortByParameter = (searchParams["sort"] as string) || "latest";

  const filters: ComicFilters = {
    search: typeof searchParams["search"] === "string" ? searchParams["search"] : undefined,
    typeId: searchParams["type"] ? Number(searchParams["type"]) : undefined,
    status:
      typeof searchParams["status"] === "string"
        ? (searchParams["status"] as ComicStatus)
        : undefined,
    sortBy: sortByParameter as "latest" | "rating" | "title" | "views",
    page: searchParams["page"] ? Number(searchParams["page"]) : 1,
    limit: 12,
  };

  const { data: comics, pagination } = await getAllComics(filters);

  if (comics.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="mb-2 text-2xl font-semibold">No comics found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`
          grid grid-cols-2 gap-4
          md:grid-cols-3 md:gap-6
          lg:grid-cols-4
        `}
      >
        {comics.map((comic) => (
          <ComicCard
            key={comic.id}
            comic={comic}
            authorName={comic.authorName}
            typeName={comic.typeName}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            baseUrl="/comics"
          />
        </div>
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className={`
        grid grid-cols-2 gap-4
        md:grid-cols-3 md:gap-6
        lg:grid-cols-4
      `}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-2/3 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function ComicsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const [typesResult, genresResult] = await Promise.all([getAllTypes(), getAllGenres()]);

  const types = (typesResult.success ? typesResult.data : []) as Type[];
  const genres = (genresResult.success ? genresResult.data : []) as Genre[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className={`
            mb-2 text-3xl font-bold
            md:text-4xl
          `}
        >
          Browse Comics
        </h1>
        <p className="text-muted-foreground">Discover your next favorite story</p>
      </div>

      <Filters types={types} genres={genres} />

      <Suspense fallback={<LoadingSkeleton />}>
        <ComicsGrid searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
