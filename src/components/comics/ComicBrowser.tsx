"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { ComicCard } from "./ComicCard";

interface Comic {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  status: string;
  rating: string | null;
  views: number;
}

interface Type {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface ComicBrowserProps {
  initialComics: Comic[];
  types: Type[];
  genres: Genre[];
  totalCount: number;
}

const ITEMS_PER_PAGE = 24;

/**
 * ComicBrowser Component
 *
 * Provides comprehensive comic browsing with:
 * - Search functionality
 * - Filter by type, status, genre
 * - Sort options (latest, popular, rating)
 * - Pagination controls
 * - Responsive grid layout
 *
 * @component
 */
export function ComicBrowser({ initialComics, types, genres, totalCount }: ComicBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State management
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "latest");
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get("page") || "1"));

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  /**
   * Build URL query string from current filters
   */
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (selectedType) params.set("type", selectedType);
    if (selectedGenre) params.set("genre", selectedGenre);
    if (selectedStatus) params.set("status", selectedStatus);
    if (sortBy !== "latest") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage.toString());

    return params.toString();
  }, [searchQuery, selectedType, selectedGenre, selectedStatus, sortBy, currentPage]);

  /**
   * Navigate to new filter state
   */
  const applyFilters = useCallback(() => {
    startTransition(() => {
      setCurrentPage(1); // Reset to first page
      const query = buildQueryString();
      router.push(`/comics?${query}`);
    });
  }, [buildQueryString, router]);

  /**
   * Clear all filters and search
   */
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedGenre("");
    setSelectedStatus("");
    setSortBy("latest");
    setCurrentPage(1);
    startTransition(() => {
      router.push("/comics");
    });
  }, [router]);

  /**
   * Handle pagination
   */
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        startTransition(() => {
          const params = new URLSearchParams();
          if (searchQuery) params.set("search", searchQuery);
          if (selectedType) params.set("type", selectedType);
          if (selectedGenre) params.set("genre", selectedGenre);
          if (selectedStatus) params.set("status", selectedStatus);
          if (sortBy !== "latest") params.set("sort", sortBy);
          params.set("page", page.toString());

          router.push(`/comics?${params.toString()}`);
        });
      }
    },
    [router, searchQuery, selectedType, selectedGenre, selectedStatus, sortBy, totalPages]
  );

  // Memoize filtered comics to prevent unnecessary re-renders
  const displayComics = useMemo(() => {
    return initialComics.slice(offset, offset + ITEMS_PER_PAGE);
  }, [initialComics, offset]);

  return (
    <div className="w-full space-y-8 py-8">
      {/* Search & Filters Section */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search comics by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={applyFilters} disabled={isPending} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Genre Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Genre</label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="All genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="hiatus">Hiatus</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Option */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={applyFilters} disabled={isPending}>
              Apply Filters
            </Button>
            {(searchQuery || selectedType || selectedGenre || selectedStatus) && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} disabled={isPending}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + ITEMS_PER_PAGE, totalCount)} of {totalCount}{" "}
            comics
          </div>
        </div>
      </Card>

      {/* Comics Grid */}
      {displayComics.length > 0 ? (
        <>
          <div
            className={`
              grid grid-cols-2 gap-4
              md:grid-cols-3 md:gap-6
              lg:grid-cols-4
              xl:grid-cols-6
            `}
          >
            {displayComics.map((comic) => (
              <ComicCard key={comic.slug} comic={comic} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Card className="flex items-center justify-center gap-2 p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      disabled={isPending}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Current Page Indicator */}
              <span className="ml-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
            </Card>
          )}
        </>
      ) : (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">
            No comics found. Try adjusting your filters or search query.
          </p>
          <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
