// ═══════════════════════════════════════════════════
// SEARCH API ROUTE - Advanced Comic Search
// ═══════════════════════════════════════════════════

import type { SearchFilters } from "@/lib/search";
import { searchComics } from "@/lib/search";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// MAIN SEARCH ENDPOINT
// ═══════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    // Use `request.nextUrl` instead of `request.url` to avoid forcing a
    // prerender bailout. `request.nextUrl.searchParams` is safe to read
    // during static prerendering and in app-route handlers.
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    // Handle different search actions
    switch (action) {
      case "search":
        return handleSearch(searchParams);

      default:
        return handleSearch(searchParams);
    }
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform search",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
// ═══════════════════════════════════════════════════
// SEARCH HANDLERS
// ═══════════════════════════════════════════════════

/**
 * Handle main search functionality
 * @param searchParams
 */
async function handleSearch(searchParams: URLSearchParams) {
  const filters: SearchFilters = {
    query: searchParams.get("q") || undefined,
    searchMode: (searchParams.get("mode") as "simple" | "phrase" | "websearch") || "websearch",
    typeId: searchParams.get("typeId") ? Number.parseInt(searchParams.get("typeId")!) : undefined,
    status: searchParams.get("status") || undefined,
    minRating: searchParams.get("minRating")
      ? Number.parseFloat(searchParams.get("minRating")!)
      : undefined,
    maxRating: searchParams.get("maxRating")
      ? Number.parseFloat(searchParams.get("maxRating")!)
      : undefined,
    authorName: searchParams.get("author") || undefined,
    artistName: searchParams.get("artist") || undefined,
    genres: searchParams.get("genres")?.split(",").filter(Boolean),
    genreIds: searchParams
      .get("genreIds")
      ?.split(",")
      .map((id) => Number.parseInt(id))
      .filter((id) => !isNaN(id)),
    yearFrom: searchParams.get("yearFrom")
      ? Number.parseInt(searchParams.get("yearFrom")!)
      : undefined,
    yearTo: searchParams.get("yearTo") ? Number.parseInt(searchParams.get("yearTo")!) : undefined,
    minViews: searchParams.get("minViews")
      ? Number.parseInt(searchParams.get("minViews")!)
      : undefined,
    maxViews: searchParams.get("maxViews")
      ? Number.parseInt(searchParams.get("maxViews")!)
      : undefined,
    sortBy:
      (searchParams.get("sortBy") as "title" | "rating" | "views" | "latest" | "relevance") ||
      "relevance",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1,
    limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 12,
  };

  const results = await searchComics(filters);
  return NextResponse.json(results);
}
