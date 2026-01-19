/**
 * Comic Search Autocomplete Component
 * Full-featured search with suggestions, recent searches, and trending
 */

"use client";

import { Clock, SearchIcon, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "utils";

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  description?: string;
}

interface SearchSuggestion {
  query: string;
  count?: number;
  trending?: boolean;
}

export function ComicSearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setResults([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?action=suggest&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);

        // Also fetch initial results
        const searchResponse = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
        const searchData = await searchResponse.json();
        setResults(searchData.data || []);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    // Navigate to search results
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <SearchIcon
          className={`
            absolute top-1/2 left-3 size-4 -translate-y-1/2
            text-muted-foreground
          `}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search comics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            `
              w-full rounded-lg border border-input bg-background py-2 pr-4
              pl-10
            `,
            "placeholder:text-muted-foreground",
            `
              focus:border-transparent focus:ring-2 focus:ring-primary
              focus:outline-none
            `
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`
            absolute top-full z-50 mt-2 w-full rounded-lg border border-input
            bg-popover shadow-md
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div
                className={`
                  size-4 animate-spin rounded-full border-2 border-primary
                  border-r-transparent
                `}
              />
            </div>
          ) : (
            <>
              {/* Search Results */}
              {query.length >= 2 && results.length > 0 && (
                <div className="border-b">
                  <div
                    className={`
                      px-3 py-2 text-xs font-semibold tracking-wide
                      text-muted-foreground uppercase
                    `}
                  >
                    Results
                  </div>
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearch(result.title)}
                      className={cn(
                        `
                          w-full px-3 py-2 text-left transition-colors
                          hover:bg-accent
                        `,
                        "truncate text-sm"
                      )}
                    >
                      <div className="font-medium">{result.title}</div>
                      {result.description && (
                        <div
                          className={`
                            line-clamp-1 text-xs text-muted-foreground
                          `}
                        >
                          {result.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="border-b">
                  <div
                    className={`
                      px-3 py-2 text-xs font-semibold tracking-wide
                      text-muted-foreground uppercase
                    `}
                  >
                    Suggestions
                  </div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.query}
                      onClick={() => handleSearch(suggestion.query)}
                      className={cn(
                        `
                          w-full px-3 py-2 text-left transition-colors
                          hover:bg-accent
                        `,
                        "flex items-center justify-between"
                      )}
                    >
                      <span className="text-sm">{suggestion.query}</span>
                      {suggestion.trending && <TrendingUp className={`size-3 text-orange-500`} />}
                      {suggestion.count && (
                        <span className="text-xs text-muted-foreground">{suggestion.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {query.length < 2 && recentSearches.length > 0 && (
                <div>
                  <div
                    className={`
                      px-3 py-2 text-xs font-semibold tracking-wide
                      text-muted-foreground uppercase
                    `}
                  >
                    Recent Searches
                  </div>
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleSearch(search)}
                      className={cn(
                        `
                          w-full px-3 py-2 text-left transition-colors
                          hover:bg-accent
                        `,
                        "flex items-center gap-2 text-sm"
                      )}
                    >
                      <Clock className="size-3 text-muted-foreground" />
                      {search}
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {query.length >= 2 && results.length === 0 && suggestions.length === 0 && (
                <div
                  className={`
                    px-3 py-8 text-center text-sm text-muted-foreground
                  `}
                >
                  No results found for "{query}"
                </div>
              )}

              {query.length < 2 && recentSearches.length === 0 && (
                <div
                  className={`
                    px-3 py-4 text-center text-sm text-muted-foreground
                  `}
                >
                  Type at least 2 characters to search
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simplified search box for headers
 */
export function ComicSearchBox() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md">
      <div className="relative">
        <SearchIcon
          className={`
            pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2
            text-muted-foreground
          `}
        />
        <input
          type="search"
          placeholder="Search comics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            `
              w-full rounded-lg border border-input bg-background py-2 pr-4
              pl-10
            `,
            "placeholder:text-muted-foreground",
            `
              focus:border-transparent focus:ring-2 focus:ring-primary
              focus:outline-none
            `
          )}
        />
      </div>
    </form>
  );
}
