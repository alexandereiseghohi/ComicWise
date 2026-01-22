"use client";

import { Button } from "@/components/ui/button";
import { useComics } from "@/hooks/useStores";
import type { Comic, Genre, Type } from "@/types/database";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { ComicCard } from "./ComicCard";
import { ComicFilters } from "./ComicFilters";

interface ComicsListProps {
  comics: Comic[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  types: Type[];
  genres: Genre[];
}

export function ComicsList({
  comics,
  totalCount,
  currentPage,
  pageSize,
  types,
  genres,
}: ComicsListProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const { setComics, filteredComics } = useComics();

  useEffect(() => {
    setComics(comics);
  }, [comics, setComics]);

  const displayComics = (filteredComics.length > 0 ? filteredComics : comics);

  return (
    <div className="space-y-8">
      <ComicFilters types={types} genres={genres} />

      {displayComics.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No comics found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {displayComics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Link
                href={`/comics?page=${currentPage - 1}`}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" size="icon" disabled={currentPage <= 1}>
                  <ChevronLeft className="size-4" />
                </Button>
              </Link>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Link
                href={`/comics?page=${currentPage + 1}`}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" size="icon" disabled={currentPage >= totalPages}>
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
