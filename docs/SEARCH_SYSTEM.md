# Search & Filtering System Documentation

## Overview

ComicWise implements an advanced search system using **PostgreSQL Full-Text
Search** with `tsvector` and GIN indexes for fast, scalable search capabilities.
This system provides powerful search functionality including autocomplete,
suggestions, trending comics, and advanced filtering.

## Table of Contents

1. [Architecture](#architecture)
2. [Database Setup](#database-setup)
3. [Search Features](#search-features)
4. [API Reference](#api-reference)
5. [Client-Side Integration](#client-side-integration)
6. [Performance Optimization](#performance-optimization)
7. [Best Practices](#best-practices)

---

## Architecture

### System Components

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Client/Browser │────▶│   Search API    │────▶│  Search Service │
│                 │     │  /api/search    │     │   (lib/search)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   PostgreSQL    │
                                              │   Full-Text     │
                                              │   Search (FTS)  │
                                              └─────────────────┘
```

### Key Features

- **Full-Text Search**: PostgreSQL `tsvector` with GIN indexes
- **Relevance Ranking**: `ts_rank` for result scoring
- **Multiple Search Modes**: Simple, phrase, and websearch
- **Advanced Filtering**: By genre, status, rating, views, dates
- **Autocomplete**: Real-time search suggestions
- **Trending**: Track and display trending comics
- **Performance**: Optimized indexes for fast queries

---

## Database Setup

### Running the Migration

```bash
# Apply the full-text search migration
pnpm db:migrate

# Or manually apply the SQL file
psql $DATABASE_URL -f drizzle/0001_add_fulltext_search.sql
```

### What the Migration Does

1. **Adds `search_vector` columns** to `comic`, `author`, and `artist` tables
2. **Creates triggers** to automatically update search vectors on INSERT/UPDATE
3. **Creates GIN indexes** for fast full-text search
4. **Adds composite indexes** for common query patterns
5. **Updates existing data** with search vectors

### Verifying the Setup

```sql
-- Check if search_vector column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'comic' AND column_name = 'search_vector';

-- Check if GIN index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'comic' AND indexname LIKE '%search%';

-- Test full-text search
SELECT title, ts_rank(search_vector, to_tsquery('english', 'action')) as rank
FROM comic
WHERE search_vector @@ to_tsquery('english', 'action')
ORDER BY rank DESC
LIMIT 5;
```

---

## Search Features

### 1. Full-Text Search

**Basic Search**

```typescript
import { searchComics } from "@/lib/search";

const results = await searchComics({
  query: "naruto",
  page: 1,
  limit: 12,
});
```

**Search Modes**

- **websearch** (default): Natural language, OR by default

  ```typescript
  query: "action adventure"; // Finds comics with "action" OR "adventure"
  ```

- **phrase**: Exact phrase matching

  ```typescript
  query: "one piece",
  searchMode: "phrase" // Finds "one piece" as exact phrase
  ```

- **simple**: All terms must match (AND)
  ```typescript
  query: "action adventure",
  searchMode: "simple" // Finds comics with "action" AND "adventure"
  ```

### 2. Advanced Filtering

```typescript
const results = await searchComics({
  query: "naruto",
  status: "Ongoing",
  minRating: 4.0,
  genreNames: ["Action", "Adventure"],
  authorName: "kishimoto",
  publicationYearFrom: 2020,
  publicationYearTo: 2024,
  minViews: 1000,
  sortBy: "popularity",
  page: 1,
  limit: 20,
});
```

**Available Filters**

| Filter                | Type                                | Description                             |
| --------------------- | ----------------------------------- | --------------------------------------- |
| `query`               | string                              | Full-text search query                  |
| `searchMode`          | "simple" \| "phrase" \| "websearch" | Search mode                             |
| `status`              | string                              | Comic status (Ongoing, Completed, etc.) |
| `typeId`              | number                              | Comic type ID                           |
| `genreIds`            | number[]                            | Array of genre IDs                      |
| `genreNames`          | string[]                            | Array of genre names                    |
| `minRating`           | number                              | Minimum rating (0-5)                    |
| `authorName`          | string                              | Author name (partial match)             |
| `artistName`          | string                              | Artist name (partial match)             |
| `publicationYearFrom` | number                              | Start year                              |
| `publicationYearTo`   | number                              | End year                                |
| `minViews`            | number                              | Minimum view count                      |
| `maxViews`            | number                              | Maximum view count                      |
| `sortBy`              | string                              | Sort field (see below)                  |
| `sortOrder`           | "asc" \| "desc"                     | Sort direction                          |
| `page`                | number                              | Page number (default: 1)                |
| `limit`               | number                              | Results per page (default: 12)          |

**Sort Options**

- `relevance`: Search relevance score (only with query)
- `rating`: Comic rating
- `views`: View count
- `title`: Alphabetical
- `latest`: Recently added
- `popularity`: Calculated score (views × 0.7 + rating × 100 × 0.3)

### 3. Autocomplete / Suggestions

```typescript
import { getSearchSuggestions } from "@/lib/search";

const suggestions = await getSearchSuggestions("nar", 5);
// Returns:
// {
//   comics: ["Naruto", "Naruto Shippuden"],
//   authors: ["Masashi Kishimoto"],
//   artists: ["Masashi Kishimoto"]
// }
```

### 4. Trending Comics

```typescript
import { getTrendingComics } from "@/lib/search";

// Get trending comics from last 7 days
const trending = await getTrendingComics(7, 10);
```

### 5. Popular Searches

```typescript
import { getPopularSearches } from "@/lib/search";

const popular = await getPopularSearches(10);
// Returns: ["One Piece", "Naruto", "Dragon Ball", ...]
```

---

## API Reference

### Main Search Endpoint

**Endpoint**: `GET /api/search`

**Query Parameters**

| Parameter   | Type   | Description                            |
| ----------- | ------ | -------------------------------------- |
| `q`         | string | Search query                           |
| `mode`      | string | Search mode: simple, phrase, websearch |
| `status`    | string | Filter by status                       |
| `typeId`    | number | Filter by type ID                      |
| `genres`    | string | Comma-separated genre names            |
| `genreIds`  | string | Comma-separated genre IDs              |
| `author`    | string | Filter by author name                  |
| `artist`    | string | Filter by artist name                  |
| `minRating` | number | Minimum rating                         |
| `yearFrom`  | number | Publication year from                  |
| `yearTo`    | number | Publication year to                    |
| `minViews`  | number | Minimum views                          |
| `maxViews`  | number | Maximum views                          |
| `sortBy`    | string | Sort field                             |
| `sortOrder` | string | Sort direction (asc/desc)              |
| `page`      | number | Page number                            |
| `limit`     | number | Results per page                       |

**Example Request**

```
GET /api/search?q=action&status=Ongoing&minRating=4.0&sortBy=popularity&page=1&limit=12
```

**Response Format**

```json
{
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  },
  "results": [
    {
      "id": 1,
      "title": "Action Comic",
      "description": "Description...",
      "coverImage": "https://...",
      "status": "Ongoing",
      "rating": "4.5",
      "views": 10000,
      "authorName": "Author Name",
      "artistName": "Artist Name",
      "typeName": "Manga",
      "genres": ["Action", "Adventure"],
      "relevanceScore": 0.75,
      "publicationDate": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Suggestions Endpoint

**Endpoint**: `GET /api/search?action=suggest&q={query}`

**Example Request**

```
GET /api/search?action=suggest&q=nar&limit=5
```

**Response**

```json
{
  "artists": ["Masashi Kishimoto"],
  "authors": ["Masashi Kishimoto"],
  "comics": ["Naruto", "Naruto Shippuden"]
}
```

### Trending Endpoint

**Endpoint**: `GET /api/search?action=trending&days={days}&limit={limit}`

**Example Request**

```
GET /api/search?action=trending&days=7&limit=10
```

### Popular Searches Endpoint

**Endpoint**: `GET /api/search?action=popular&limit={limit}`

**Example Request**

```
GET /api/search?action=popular&limit=10
```

---

## Client-Side Integration

### React Search Component

```typescript
"use client";

import { useState, useEffect } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Debounced suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions(null);
      return;
    }

    const timer = setTimeout(async () => {
      const response = await fetch(
        `/api/search?action=suggest&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=12`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search comics..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Suggestions */}
      {suggestions && (
        <div className="suggestions">
          {suggestions.comics.length > 0 && (
            <div>
              <h4>Comics</h4>
              {suggestions.comics.map((comic: string) => (
                <div key={comic} onClick={() => setQuery(comic)}>
                  {comic}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="results">
          {results.results.map((comic: any) => (
            <div key={comic.id}>
              <h3>{comic.title}</h3>
              <p>{comic.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Advanced Search with Filters

```typescript
"use client";

import { useState } from "react";

export function AdvancedSearch() {
  const [filters, setFilters] = useState({
    query: "",
    status: "",
    minRating: 0,
    genres: [] as string[],
    sortBy: "relevance",
  });

  async function search() {
    const params = new URLSearchParams();
    params.append("q", filters.query);
    if (filters.status) params.append("status", filters.status);
    if (filters.minRating > 0) params.append("minRating", filters.minRating.toString());
    if (filters.genres.length > 0) params.append("genres", filters.genres.join(","));
    params.append("sortBy", filters.sortBy);

    const response = await fetch(`/api/search?${params.toString()}`);
    const data = await response.json();
    return data;
  }

  return (
    <div>
      <input
        type="text"
        value={filters.query}
        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        placeholder="Search..."
      />

      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        <option value="">All Status</option>
        <option value="Ongoing">Ongoing</option>
        <option value="Completed">Completed</option>
      </select>

      <input
        type="number"
        min="0"
        max="5"
        step="0.1"
        value={filters.minRating}
        onChange={(e) =>
          setFilters({ ...filters, minRating: parseFloat(e.target.value) })
        }
        placeholder="Min Rating"
      />

      <button onClick={search}>Search</button>
    </div>
  );
}
```

---

## Performance Optimization

### Indexes Created

The migration creates the following indexes for optimal performance:

```sql
-- Full-text search indexes
CREATE INDEX comic_search_vector_idx ON comic USING GIN (search_vector);
CREATE INDEX author_search_vector_idx ON author USING GIN (search_vector);
CREATE INDEX artist_search_vector_idx ON artist USING GIN (search_vector);

-- Filter indexes
CREATE INDEX comic_status_idx ON comic (status);
CREATE INDEX comic_rating_idx ON comic (rating DESC);
CREATE INDEX comic_views_idx ON comic (views DESC);
CREATE INDEX comic_created_at_idx ON comic (created_at DESC);

-- Composite indexes for common patterns
CREATE INDEX comic_status_rating_idx ON comic (status, rating DESC);
CREATE INDEX comic_status_views_idx ON comic (status, views DESC);
```

### Query Performance

- **Full-text search**: O(log n) with GIN index
- **Filter queries**: O(log n) with B-tree indexes
- **Pagination**: Efficient with LIMIT/OFFSET
- **Relevance ranking**: Computed on-demand with `ts_rank`

### Monitoring Performance

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'comic';

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM comic
WHERE search_vector @@ to_tsquery('english', 'action')
ORDER BY ts_rank(search_vector, to_tsquery('english', 'action')) DESC
LIMIT 10;
```

---

## Best Practices

### 1. Search Query Optimization

✅ **Do**:

- Use specific search terms
- Combine with filters for better results
- Use phrase search for exact matches
- Implement debouncing for autocomplete (300ms)

❌ **Don't**:

- Search with single characters
- Use special characters in queries
- Make too many concurrent requests

### 2. Indexing Best Practices

✅ **Maintain Indexes**:

```sql
-- Vacuum and analyze regularly
VACUUM ANALYZE comic;
ANALYZE comic;

-- Reindex if needed
REINDEX INDEX comic_search_vector_idx;
```

### 3. Caching Strategy

- Cache popular searches (Redis/CDN)
- Cache trending comics (TTL: 1 hour)
- Cache autocomplete suggestions (TTL: 15 minutes)
- Invalidate cache on content updates

### 4. Error Handling

```typescript
try {
  const results = await searchComics({ query: userInput });
  return results;
} catch (error) {
  if (error instanceof Error) {
    console.error("Search error:", error.message);
  }
  // Return empty results or show error to user
  return {
    results: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
  };
}
```

---

## Troubleshooting

### Issue: Slow Search Performance

**Solution**:

1. Check if indexes are being used:
   ```sql
   EXPLAIN SELECT * FROM comic WHERE search_vector @@ to_tsquery('english', 'test');
   ```
2. Vacuum and analyze tables:
   ```sql
   VACUUM ANALYZE comic;
   ```
3. Rebuild indexes if corrupted:
   ```sql
   REINDEX INDEX comic_search_vector_idx;
   ```

### Issue: Search Returns No Results

**Solution**:

1. Check if search_vector is populated:
   ```sql
   SELECT title, search_vector FROM comic LIMIT 5;
   ```
2. Update search vectors manually:
   ```sql
   UPDATE comic SET search_vector =
     setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
     setweight(to_tsvector('english', COALESCE(description, '')), 'B');
   ```

### Issue: Incorrect Relevance Ranking

**Solution**:

- Adjust weights in search_vector calculation
- Use different text search configurations (english, simple, etc.)
- Consider implementing custom ranking algorithms

---

## Additional Resources

- [PostgreSQL Full-Text Search Documentation](https://www.postgresql.org/docs/current/textsearch.html)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [ts_rank Function](https://www.postgresql.org/docs/current/textsearch-controls.html#TEXTSEARCH-RANKING)

---

**Last Updated**: 2024 **Version**: 1.0.0
