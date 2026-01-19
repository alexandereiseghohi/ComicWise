# Advanced Search Implementation Guide

## Overview

ComicWise implements a sophisticated search system with:

- Full-text search using PostgreSQL
- Autocomplete suggestions
- Search analytics
- Trending detection
- Performance optimization with indexes

## 1. Database Setup

### Apply Search Migrations

```bash
# The migration creates:
# - Full-text search indexes
# - Trigram indexes for fuzzy matching
# - Search suggestions table
# - Search analytics tracking

# Apply manually if needed:
psql -U postgres -d comicwise < src/database/migrations/search-optimization.sql
```

### Key Features

**Full-Text Search Index:**

```sql
CREATE INDEX idx_comics_search_vector ON comics USING GIN(search_vector);
```

**Trigram Index (Fuzzy Matching):**

```sql
CREATE INDEX idx_comics_title_trigram ON comics USING GIN(title gin_trgm_ops);
```

**Performance Indexes:**

```sql
CREATE INDEX idx_comics_published ON comics(published);
CREATE INDEX idx_comics_author_id ON comics(author_id);
CREATE INDEX idx_comics_slug ON comics(slug);
```

## 2. Search API Routes

### Main Search Endpoint

`GET /api/search?q=<query>&limit=20&offset=0`

```typescript
// Example request
fetch('/api/search?q=action&limit=10')
  .then(r => r.json())
  .then(data => console.log(data));

// Response
{
  "data": [
    {
      "id": 1,
      "title": "Action Comic",
      "slug": "action-comic",
      "description": "An epic action story"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Suggestions Endpoint

`GET /api/search?action=suggest&q=<partial_query>&limit=5`

```typescript
fetch('/api/search?action=suggest&q=act')
  .then(r => r.json())
  .then(data => console.log(data));

// Response
{
  "suggestions": [
    { "query": "action", "count": 234, "trending": true },
    { "query": "actors", "count": 45, "trending": false }
  ]
}
```

### Trending Comics Endpoint

`GET /api/search?action=trending&days=7&limit=10`

```typescript
fetch('/api/search?action=trending&days=7&limit=10')
  .then(r => r.json());

// Response
{
  "comics": [
    { "id": 1, "title": "...", "trend_score": 2.5 }
  ]
}
```

### Popular Searches Endpoint

`GET /api/search?action=popular&limit=10`

```typescript
fetch('/api/search?action=popular&limit=10')
  .then(r => r.json());

// Response
{
  "searches": [
    { "term": "action", "frequency": 1250 },
    { "term": "romance", "frequency": 892 }
  ]
}
```

## 3. Frontend Components

### Autocomplete Component

```tsx
import { ComicSearchAutocomplete } from "@/components/search/comic-search";

export default function SearchBar() {
  return <ComicSearchAutocomplete />;
}
```

Features:

- Real-time suggestions as user types
- Recent searches from localStorage
- Search result previews
- Keyboard navigation
- Debounced API calls (300ms)

### Simple Search Box

```tsx
import { ComicSearchBox } from "@/components/search/comic-search";

export default function Header() {
  return (
    <header>
      <ComicSearchBox />
    </header>
  );
}
```

## 4. Query Syntax

### Basic Search

```
"action manga"
```

Searches for comics with both "action" and "manga".

### Phrase Search

```
"slice of life"
```

Exact phrase matching.

### Filters

```
action status:ongoing
```

Supported filters:

- `status:ongoing|completed|hiatus|dropped`
- `author:name`
- `rating:4|4.5|5`
- `year:2023|2024`

### Examples

```
# Popular action comics
action

# Completed romance series
romance status:completed

# Comics by specific author
author:John Doe

# High-rated titles
rating:4.5 rating:5
```

## 5. Search Analytics

### Track Searches

Searches are automatically tracked when users submit queries.

### View Analytics

```sql
-- Most popular searches (last 30 days)
SELECT search_query, COUNT(*) as frequency
FROM search_analytics
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY search_query
ORDER BY frequency DESC
LIMIT 20;

-- Trending searches (7-day trend)
SELECT search_query,
  COUNT(*) as frequency_7d,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::float /
  COUNT(*) FILTER (WHERE created_at <= NOW() - INTERVAL '7 days')::float as trend_ratio
FROM search_analytics
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY search_query
ORDER BY trend_ratio DESC;

-- Search suggestions view
SELECT * FROM popular_searches;
```

## 6. Performance Optimization

### Query Performance

**Good Query Execution:**

```
Bitmap Index Scan on idx_comics_search_vector  (cost=20.00..100.00 rows=50)
```

**Monitor with EXPLAIN:**

```sql
EXPLAIN ANALYZE
SELECT * FROM comics
WHERE search_vector @@ plainto_tsquery('english', 'action')
AND published = true
LIMIT 10;
```

### Caching

Search results are cached in memory:

```typescript
const cacheKey = `search:${query}:${limit}:${offset}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// ... perform search ...

await redis.setex(cacheKey, 3600, JSON.stringify(results)); // 1 hour
```

### Index Maintenance

```bash
# Analyze query plans
ANALYZE comics;

# Reindex if needed
REINDEX INDEX idx_comics_search_vector;

# Vacuum for cleanup
VACUUM ANALYZE comics;
```

## 7. Integration Examples

### Search Page

```tsx
// app/search/page.tsx
import { Suspense } from "react";
import { searchComics } from "@/lib/search";
import { ComicCard } from "@/components/comic-card";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page = "1" } = await searchParams;

  if (q.length < 2) {
    return <div>Enter at least 2 characters to search</div>;
  }

  const results = await searchComics({
    query: q,
    page: parseInt(page),
  });

  return (
    <div>
      <h1>Search Results for "{q}"</h1>
      <div className="grid gap-4">
        {results.data.map(comic => (
          <ComicCard key={comic.id} comic={comic} />
        ))}
      </div>

      {/* Pagination */}
      {results.pagination.hasMore && (
        <button onClick={() => /* load next page */}>
          Load More
        </button>
      )}
    </div>
  );
}
```

### Home Page Featured Searches

```tsx
import { getTrendingComics, getPopularSearches } from "@/lib/search";

export default async function HomePage() {
  const trending = await getTrendingComics(7, 5);
  const popular = await getPopularSearches(10);

  return (
    <section>
      <h2>Trending Now</h2>
      {/* Display trending comics */}

      <h2>Popular Searches</h2>
      <ul>
        {popular.map((search) => (
          <li key={search.term}>
            <a href={`/search?q=${search.term}`}>
              {search.term} ({search.frequency})
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

## 8. Testing

### Search API Tests

```typescript
// tests/api/search.test.ts
describe("Search API", () => {
  it("should return search results", async () => {
    const response = await fetch("/api/search?q=action");
    const data = await response.json();

    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("pagination");
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should return suggestions", async () => {
    const response = await fetch("/api/search?action=suggest&q=act");
    const data = await response.json();

    expect(Array.isArray(data.suggestions)).toBe(true);
  });

  it("should reject short queries", async () => {
    const response = await fetch("/api/search?q=a");
    expect(response.status).toBe(400);
  });
});
```

## 9. Troubleshooting

### No Results Found

**Issue:** Searches return empty results.

**Solutions:**

1. Check if comics are marked as `published = true`
2. Verify search_vector index exists:
   `SELECT * FROM pg_indexes WHERE tablename = 'comics';`
3. Rebuild index: `REINDEX INDEX idx_comics_search_vector;`

### Slow Searches

**Issue:** Searches take > 1 second.

**Solutions:**

1. Check query plan: `EXPLAIN ANALYZE SELECT ...`
2. Verify indexes are used in query plan
3. Run `VACUUM ANALYZE comics;`
4. Increase `work_mem` in PostgreSQL config

### Suggestions Not Appearing

**Issue:** Autocomplete suggestions are empty.

**Solutions:**

1. Check `search_suggestions` table is populated
2. Run: `SELECT update_search_suggestions('test');`
3. Verify `idx_search_suggestions_term` index exists

## 10. Commands

```bash
# Run search-related tests
pnpm test search

# Analyze bundle impact of search features
pnpm build:analyze

# Check database query performance
psql comicwise -c "ANALYZE comics;"

# View search analytics
psql comicwise -c "SELECT * FROM popular_searches LIMIT 10;"

# Clean up old analytics (30+ days)
psql comicwise -c "DELETE FROM search_analytics WHERE created_at < NOW() - INTERVAL '30 days';"
```

## 11. Advanced Features

### Custom Search Filters

Add custom filters in `src/lib/search.ts`:

```typescript
export interface AdvancedSearchFilters {
  status?: "Ongoing" | "Completed" | "Hiatus";
  minRating?: number;
  genreNames?: string[];
  authorName?: string;
}
```

### Real-time Search Suggestions

Update suggestions as user types:

```typescript
async function onSearchChange(query: string) {
  if (query.length < 2) return;

  const suggestions = await fetch(
    `/api/search?action=suggest&q=${encodeURIComponent(query)}`
  ).then((r) => r.json());

  setSuggestions(suggestions);
}
```

### Search Result Ranking

Results are ranked by relevance:

1. Title matches (highest weight)
2. Description matches
3. Recent/updated first

## 12. Resources

- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Trigram Similarity](https://www.postgresql.org/docs/current/pgtrgm.html)
- [Search Engine Best Practices](https://www.elastic.co/blog/found-elasticsearch-from-the-bottom-up)
