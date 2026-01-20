/**
 * Comics Gallery Page
 *
 * Displays a paginated gallery of all comics with filtering, search, and sorting options.
 * Users can browse comics, view details, and bookmark favorites.
 *
 * @route GET /comics
 * @searchParams
 *   - page: Current page number (default: 1)
 *   - sort: Sort order (newest, popular, trending, rating)
 *   - genre: Filter by genre
 *   - status: Filter by status (ongoing, completed, hiatus)
 *   - search: Search query
 *
 * @returns Comic gallery page with filters and pagination
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const COMICS_PER_PAGE = 12;

interface Comic {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  rating: number;
  coverImage: string | null;
  genres: Array<{ name: string }>;
  chapters: Array<{ id: string }>;
}

interface ComicsResponse {
  comics: Comic[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Fetch comics from API
 */
async function fetchComics(
  page: number = 1,
  sort: string = "newest",
  genre?: string,
  status?: string,
  search?: string
): Promise<ComicsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(COMICS_PER_PAGE),
    sort,
    ...(genre && { genre }),
    ...(status && { status }),
    ...(search && { search }),
  });

  const response = await fetch(`/api/comics?${params}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) throw new Error("Failed to fetch comics");
  return response.json();
}

/**
 * Comics Gallery Component
 */
function ComicsGallery() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "newest";
  const genre = searchParams.get("genre");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const [selectedGenre, setSelectedGenre] = useState(genre || "");
  const [selectedStatus, setSelectedStatus] = useState(status || "");
  const [searchQuery, setSearchQuery] = useState(search || "");

  const { data, isLoading, error } = useQuery({
    queryKey: ["comics", page, sort, selectedGenre, selectedStatus, searchQuery],
    queryFn: () => fetchComics(page, sort, selectedGenre, selectedStatus, searchQuery),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL search params
    const params = new URLSearchParams({
      ...(searchQuery && { search: searchQuery }),
      ...(selectedGenre && { genre: selectedGenre }),
      ...(selectedStatus && { status: selectedStatus }),
    });
    window.location.href = `/comics?${params}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">Error loading comics</p>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Comics</h1>
        <p className="text-gray-600">Discover amazing web comics</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <Input
                placeholder="Search comics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Genre Filter */}
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genres</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="comedy">Comedy</SelectItem>
                  <SelectItem value="drama">Drama</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                  <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                  <SelectItem value="horror">Horror</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="hiatus">Hiatus</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select defaultValue={sort}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              Apply Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Comics Grid */}
      {data && data.comics.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data.comics.map((comic) => (
              <Link key={comic.id} href={`/comics/${comic.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {/* Cover Image */}
                  <div className="relative w-full h-48 bg-gray-200">
                    {comic.coverImage ? (
                      <Image
                        src={comic.coverImage}
                        alt={comic.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-400 to-pink-600">
                        <span className="text-white text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2">{comic.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{comic.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Genres */}
                    <div className="flex flex-wrap gap-2">
                      {comic.genres.slice(0, 2).map((genre) => (
                        <Badge key={genre.name} variant="secondary" className="text-xs">
                          {genre.name}
                        </Badge>
                      ))}
                      {comic.genres.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{comic.genres.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between text-sm">
                      <Badge
                        variant={
                          comic.status === "ongoing"
                            ? "default"
                            : comic.status === "completed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {comic.status.charAt(0).toUpperCase() + comic.status.slice(1)}
                      </Badge>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{comic.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Chapter Count */}
                    <p className="text-sm text-gray-600">
                      {comic.chapters.length} chapter{comic.chapters.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/comics?page=${page - 1}${selectedGenre ? `&genre=${selectedGenre}` : ""}${selectedStatus ? `&status=${selectedStatus}` : ""}`}
                    />
                  </PaginationItem>
                )}

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                  const pageNum = Math.max(1, page - 2) + i;
                  if (pageNum <= data.pages) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href={`/comics?page=${pageNum}${selectedGenre ? `&genre=${selectedGenre}` : ""}${selectedStatus ? `&status=${selectedStatus}` : ""}`}
                          isActive={pageNum === page}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                {data.pages > 5 && page < data.pages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {page < data.pages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/comics?page=${page + 1}${selectedGenre ? `&genre=${selectedGenre}` : ""}${selectedStatus ? `&status=${selectedStatus}` : ""}`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* No Results */}
      {data && data.comics.length === 0 && !isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-600">No comics found</p>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main Comics Page
 */
export default function ComicsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <ComicsGallery />
    </Suspense>
  );
}
