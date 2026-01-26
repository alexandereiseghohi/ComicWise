"use client";

import { Badge } from "@/components/ui/badge";
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
import { normalizeImagePath } from "@/lib/image-path";
import {
  cachedSearchComicsApi,
  createSearchDebounce,
  generateSearchAnnouncement,
  validateSearchInput,
} from "@/lib/search-enhanced";
import type { ComicWithDetails } from "@/types";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Advanced search component with debounce and accessibility
 */
export function AdvancedSearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ComicWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");

  // Genre and type filters
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "all");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "relevance");

  // Perform search with debounce
  const performSearch = useCallback(
    async (searchQuery: string, page: number = 1) => {
      setIsLoading(true);
      setError(null);

      const validation = validateSearchInput(searchQuery);
      if (!validation.valid) {
        if (searchQuery.trim().length > 0) {
          setError(validation.message || "Invalid search query");
        }
        setResults([]);
        setTotalPages(0);
        setTotalResults(0);
        setIsLoading(false);
        return;
      }

      try {
        const response = await cachedSearchComicsApi({
          query: searchQuery,
          page,
          limit: 12,
          genres: selectedGenre !== "all" ? [selectedGenre] : undefined,
          type: selectedType !== "all" ? selectedType : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          sortBy: sortBy as "relevance" | "rating" | "views" | "latest",
        });

        setResults(response.results);
        setTotalPages(response.totalPages);
        setTotalResults(response.total);
        setCurrentPage(page);
        setAnnouncement(generateSearchAnnouncement(response.total, searchQuery));

        // Update URL
        const params = new URLSearchParams();
        params.set("q", searchQuery);
        params.set("page", page.toString());
        if (selectedGenre !== "all") params.set("genre", selectedGenre);
        if (selectedType !== "all") params.set("type", selectedType);
        if (selectedStatus !== "all") params.set("status", selectedStatus);
        if (sortBy !== "relevance") params.set("sortBy", sortBy);

        router.push(`/search?${params.toString()}`);
      } catch (error_) {
        const errorMsg = error_ instanceof Error ? error_.message : "Search failed";
        setError(errorMsg);
        setAnnouncement(`Search error: ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedGenre, selectedType, selectedStatus, sortBy, router]
  );

  // Create debounced search
  const debouncedSearch = useCallback(
    createSearchDebounce((q: string) => performSearch(q, 1)),
    [performSearch]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setCurrentPage(1);
    debouncedSearch(value);
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: "genre" | "type" | "status" | "sortBy",
    value: string
  ) => {
    switch (filterType) {
      case "genre":
        setSelectedGenre(value);
        break;
      case "type":
        setSelectedType(value);
        break;
      case "status":
        setSelectedStatus(value);
        break;
      case "sortBy":
        setSortBy(value);
        break;
    }
    setCurrentPage(1);
    debouncedSearch(query);
  };

  // Initial search on mount
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, initialPage);
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Search Comics</h1>
        <p className="text-muted-foreground">
          Find your next favorite comic by title, description, or author
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          performSearch(query, 1);
        }}
        className="mb-6 space-y-4"
      >
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search by title, description, or author... (min 2 characters)"
            className="pl-10"
            autoFocus
            aria-label="Search comics"
            aria-describedby="search-help"
          />
        </div>
        <p id="search-help" className="text-xs text-muted-foreground">
          Type at least 2 characters to search. Results update automatically as you type.
        </p>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4">
          <Select value={selectedGenre} onValueChange={(v) => handleFilterChange("genre", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="Action">Action</SelectItem>
              <SelectItem value="Adventure">Adventure</SelectItem>
              <SelectItem value="Comedy">Comedy</SelectItem>
              <SelectItem value="Drama">Drama</SelectItem>
              <SelectItem value="Fantasy">Fantasy</SelectItem>
              <SelectItem value="Horror">Horror</SelectItem>
              <SelectItem value="Romance">Romance</SelectItem>
              <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
              <SelectItem value="Slice of Life">Slice of Life</SelectItem>
              <SelectItem value="Supernatural">Supernatural</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={(v) => handleFilterChange("type", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Manga">Manga</SelectItem>
              <SelectItem value="Manhua">Manhua</SelectItem>
              <SelectItem value="Manhwa">Manhwa</SelectItem>
              <SelectItem value="Comics">Comics</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={(v) => handleFilterChange("status", v)}>
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

          <Select value={sortBy} onValueChange={(v) => handleFilterChange("sortBy", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="views">Views</SelectItem>
              <SelectItem value="latest">Latest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>

      {/* Accessibility Announcement */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Error State */}
      {error && (
        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          role="alert"
        >
          <p className="font-semibold">Search Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block">
              <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
            <p className="text-muted-foreground">Searching...</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && (
        <>
          {query.trim().length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
                <p className="text-lg font-semibold">Start searching</p>
                <p className="text-muted-foreground">Enter at least 2 characters to find comics</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
                <p className="text-lg font-semibold">No results found</p>
                <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Found {totalResults} result{totalResults !== 1 ? "s" : ""} for &quot;{query}&quot;
              </p>

              {/* Results Grid */}
              <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((comic) => (
                  <ComicSearchCard key={comic.id} comic={comic} query={query} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(query, currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                      return pageNum <= totalPages ? (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => performSearch(query, pageNum)}
                          aria-current={currentPage === pageNum ? "page" : undefined}
                        >
                          {pageNum}
                        </Button>
                      ) : null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(query, currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Comic search result card component
 * @param root0
 * @param root0.comic
 * @param root0.query
 */
function ComicSearchCard({ comic, query }: { comic: ComicWithDetails; query: string }) {
  return (
    <Link href={`/comics/${comic.slug}`}>
      <Card className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {comic.coverImage ? (
            <Image
              src={normalizeImagePath(comic.coverImage) ?? comic.coverImage}
              alt={comic.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground">No Image</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold">{comic.title}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {comic.status}
            </Badge>
          </div>
          {comic.typeName && (
            <Badge variant="outline" className="mb-2 w-fit text-xs">
              {comic.typeName}
            </Badge>
          )}
          <p className="mb-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
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
