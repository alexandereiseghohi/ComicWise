# Redis Caching System Documentation

## Overview

ComicWise implements a comprehensive Redis caching system for improved
performance, reduced database load, and faster response times. The caching
system uses **ioredis** client with support for various caching patterns
including cache-aside, cache warming, tag-based invalidation, and rate limiting.

## Table of Contents

1. [Architecture](#architecture)
2. [Setup & Configuration](#setup--configuration)
3. [Core Components](#core-components)
4. [Usage Examples](#usage-examples)
5. [Caching Strategies](#caching-strategies)
6. [Cache Invalidation](#cache-invalidation)
7. [API Route Caching](#api-route-caching)
8. [Rate Limiting](#rate-limiting)
9. [Performance Monitoring](#performance-monitoring)
10. [Best Practices](#best-practices)

---

## Architecture

### System Overview

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
       ▼
┌──────────────┐     Cache Miss     ┌──────────────┐
│  API Route   │◄──────────────────▶│    Redis     │
│  (Cached)    │     Cache Hit      │    Cache     │
└──────┬───────┘                    └──────────────┘
       │
       │ Cache Miss
       ▼
┌──────────────┐
│  Database    │
│  PostgreSQL  │
└──────────────┘
```

### Key Components

- **RedisCache**: Low-level caching operations
- **ComicCacheService**: High-level comic-specific caching
- **Cache Middleware**: Automatic API route caching
- **Rate Limiting**: Request throttling with Redis

---

## Setup & Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here  # Optional
REDIS_DB=0                        # Default database
REDIS_TLS_ENABLED=false           # true for production

# Queue Configuration (for BullMQ)
REDIS_URL=redis://localhost:6379
```

### Starting Redis

**Using Docker** (Recommended):

```bash
# Start Redis container
docker run -d \
  --name comicwise-redis \
  -p 6379:6379 \
  redis:7-alpine

# Or use docker-compose (already configured)
docker-compose up -d redis
```

**Using Local Installation**:

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows (WSL or native)
# Download from https://redis.io/download
redis-server
```

### Verify Redis Connection

```bash
# Test connection
redis-cli ping
# Expected output: PONG

# Check Redis info
redis-cli info
```

---

## Core Components

### 1. RedisCache (Low-Level)

**Location**: `src/lib/cache.ts`

Basic caching operations:

```typescript
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

// Set value
await cache.set("mykey", { data: "value" }, { ttl: CACHE_TTL.MEDIUM });

// Get value
const value = await cache.get<{ data: string }>("mykey");

// Delete value
await cache.delete("mykey");

// Delete pattern
await cache.deletePattern("comic:*");

// Check exists
const exists = await cache.exists("mykey");

// Get TTL
const ttl = await cache.getTTL("mykey");
```

### 2. ComicCacheService (High-Level)

**Location**: `src/lib/comicCache.ts`

Comic-specific caching with automatic invalidation:

```typescript
import { comicCache } from "@/lib/comicCache";

// Get comic with caching
const comic = await comicCache.getComic(comicId, async () => {
  return await db.query.comic.findFirst({
    where: eq(comic.id, comicId),
  });
});

// Invalidate comic cache
await comicCache.invalidateComic(comicId);

// Cache comics list
const comics = await comicCache.getComicsList(
  "homepage:latest",
  async () => {
    return await getAllComics({ sortBy: "latest" });
  },
  { ttl: CACHE_TTL.SHORT }
);
```

### 3. Cache Middleware

**Location**: `src/lib/cacheMiddleware.ts`

Automatic API route caching:

```typescript
import { withCache, CACHE_TTL } from "@/lib/cacheMiddleware";

export const GET = withCache(
  async (request: NextRequest) => {
    const data = await fetchData();
    return NextResponse.json(data);
  },
  {
    ttl: CACHE_TTL.MEDIUM,
    prefix: "api:comics",
    includeQuery: true,
  }
);
```

---

## Usage Examples

### Basic Caching

```typescript
import { cache, CACHE_TTL } from "@/lib/cache";

// Simple get/set
async function getUserData(userId: string) {
  const cacheKey = `user:${userId}`;

  // Try cache first
  const cached = await cache.get<UserData>(cacheKey);
  if (cached) return cached;

  // Fetch from database
  const user = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  // Store in cache
  await cache.set(cacheKey, user, { ttl: CACHE_TTL.MEDIUM });

  return user;
}
```

### Cache-Aside Pattern

```typescript
import { cache } from "@/lib/cache";

// Automatic cache-aside with getOrSet
const comic = await cache.getOrSet(
  `comic:${comicId}`,
  async () => {
    return await db.query.comic.findFirst({
      where: eq(comic.id, comicId),
    });
  },
  { ttl: CACHE_TTL.LONG, tags: ["comic", `comic:${comicId}`] }
);
```

### List Caching with Filters

```typescript
import { comicCache } from "@/lib/comicCache";

// Generate unique cache key based on filters
const cacheKey = `status:${status}:genre:${genreId}:page:${page}`;

const comics = await comicCache.getComicsList(
  cacheKey,
  async () => {
    return await getAllComics({
      status,
      genreIds: [genreId],
      page,
      limit: 12,
    });
  },
  { ttl: CACHE_TTL.SHORT, tags: ["comics", `genre:${genreId}`] }
);
```

### Chapter Caching

```typescript
import { comicCache } from "@/lib/comicCache";

// Cache comic chapters
const chapters = await comicCache.getComicChapters(comicId, async () => {
  return await db.query.chapter.findMany({
    where: eq(chapter.comicId, comicId),
    orderBy: desc(chapter.chapterNumber),
  });
});

// Cache specific chapter
const chapterData = await comicCache.getChapter(chapterId, async () => {
  return await db.query.chapter.findFirst({
    where: eq(chapter.id, chapterId),
    with: {
      comic: true,
      images: true,
    },
  });
});
```

### Search Result Caching

```typescript
import { comicCache } from "@/lib/comicCache";
import { createHash } from "crypto";

// Generate cache key from search params
const searchKey = createHash("md5")
  .update(
    JSON.stringify({
      query,
      status,
      genres,
      sortBy,
      page,
    })
  )
  .digest("hex");

const results = await comicCache.getSearchResults(searchKey, async () => {
  return await searchComics({
    query,
    status,
    genreNames: genres,
    sortBy,
    page,
  });
});
```

---

## Caching Strategies

### 1. Cache-Aside (Lazy Loading)

Best for: Frequently accessed data

```typescript
async function getComic(comicId: number) {
  const key = `comic:${comicId}`;

  // Check cache
  const cached = await cache.get(key);
  if (cached) return cached;

  // Load from DB
  const comic = await loadFromDB(comicId);

  // Store in cache
  await cache.set(key, comic, { ttl: CACHE_TTL.LONG });

  return comic;
}
```

### 2. Cache Warming

Best for: Popular content that's always needed

```typescript
import { comicCache } from "@/lib/comicCache";

// Warm cache on startup
async function warmCache() {
  // Get top 100 popular comics
  const popularComics = await db.query.comic.findMany({
    orderBy: desc(comic.views),
    limit: 100,
  });

  // Pre-populate cache
  await comicCache.warmCache(popularComics);

  console.log("✅ Cache warmed with popular comics");
}

// Call on application startup
warmCache();
```

### 3. Write-Through Cache

Best for: Data that needs consistency

```typescript
async function updateComic(comicId: number, data: UpdateData) {
  // Update database
  await db.update(comic).set(data).where(eq(comic.id, comicId));

  // Update cache immediately
  const updated = await db.query.comic.findFirst({
    where: eq(comic.id, comicId),
  });

  await cache.set(`comic:${comicId}`, updated, { ttl: CACHE_TTL.LONG });

  // Invalidate related caches
  await comicCache.invalidateComicsList();
}
```

### 4. Time-Based Expiration

Best for: Data that changes periodically

```typescript
// Trending comics - refresh every hour
const trending = await cache.getOrSet(
  "trending:comics",
  async () => getTrendingComics(),
  { ttl: CACHE_TTL.MEDIUM } // 30 minutes
);

// Genres - rarely change
const genres = await cache.getOrSet(
  "genres:all",
  async () => getAllGenres(),
  { ttl: CACHE_TTL.VERY_LONG } // 12 hours
);
```

---

## Cache Invalidation

### Single Item Invalidation

```typescript
import { comicCache } from "@/lib/comicCache";

// After updating a comic
await comicCache.invalidateComic(comicId);

// After updating a chapter
await comicCache.invalidateChapter(chapterId, comicId);
```

### Pattern-Based Invalidation

```typescript
import { cache } from "@/lib/cache";

// Invalidate all comics
await cache.deletePattern("comic:*");

// Invalidate specific status
await cache.deletePattern("comics:list:status:Ongoing:*");

// Invalidate search results
await cache.deletePattern("search:*");
```

### Tag-Based Invalidation

```typescript
import { cache } from "@/lib/cache";

// Set cache with tags
await cache.set("comic:123", comicData, {
  ttl: CACHE_TTL.LONG,
  tags: ["comic", "comic:123", "genre:action"],
});

// Invalidate by tag (invalidates all comics with this genre)
await cache.invalidateByTag("genre:action");

// Invalidate specific comic's all caches
await cache.invalidateByTag("comic:123");
```

### Automatic Invalidation on Mutations

```typescript
import { withCacheInvalidation } from "@/lib/cacheMiddleware";

export const PUT = withCacheInvalidation(
  async (request: NextRequest) => {
    const comicId = await updateComic(data);
    return NextResponse.json({ success: true, comicId });
  },
  {
    patterns: ["comic:*", "comics:list:*"],
    tags: ["comics"],
  }
);
```

---

## API Route Caching

### Basic API Caching

```typescript
import { withCache, CACHE_TTL } from "@/lib/cacheMiddleware";
import { NextRequest, NextResponse } from "next/server";

// Cache GET requests
export const GET = withCache(
  async (request: NextRequest) => {
    const comics = await getAllComics();
    return NextResponse.json(comics);
  },
  {
    ttl: CACHE_TTL.MEDIUM,
    prefix: "api:comics",
    includeQuery: true,
  }
);
```

### Advanced API Caching with Invalidation

```typescript
import { withSmartCache, CACHE_TTL } from "@/lib/cacheMiddleware";

// GET with caching
export const GET = withSmartCache(
  async (request: NextRequest) => {
    const comics = await getAllComics();
    return NextResponse.json(comics);
  },
  {
    cache: {
      ttl: CACHE_TTL.MEDIUM,
      prefix: "api:comics",
      includeQuery: true,
      tags: ["comics"],
    },
  }
);

// POST with automatic invalidation
export const POST = withSmartCache(
  async (request: NextRequest) => {
    const data = await request.json();
    const comic = await createComic(data);
    return NextResponse.json(comic);
  },
  {
    invalidate: {
      patterns: ["api:comics:*"],
      tags: ["comics"],
    },
  }
);
```

### User-Specific Caching

```typescript
import { withCache, CACHE_TTL } from "@/lib/cacheMiddleware";

export const GET = withCache(
  async (request: NextRequest) => {
    const userId = request.headers.get("x-user-id");
    const bookmarks = await getUserBookmarks(userId);
    return NextResponse.json(bookmarks);
  },
  {
    ttl: CACHE_TTL.SHORT,
    prefix: "api:bookmarks",
    userSpecific: true, // Cache per user
  }
);
```

### Conditional Caching

```typescript
import { withCache, CACHE_TTL } from "@/lib/cacheMiddleware";

export const GET = withCache(
  async (request: NextRequest) => {
    const data = await fetchData();
    return NextResponse.json(data);
  },
  {
    ttl: CACHE_TTL.MEDIUM,
    skipCache: async (request) => {
      // Skip cache for admin users
      const isAdmin = request.headers.get("x-user-role") === "admin";
      return isAdmin;
    },
    revalidate: async (request) => {
      // Force revalidation if refresh param is present
      const url = new URL(request.url);
      return url.searchParams.has("refresh");
    },
  }
);
```

---

## Rate Limiting

### Basic Rate Limiting

```typescript
import { withRateLimit } from "@/lib/cacheMiddleware";
import { NextRequest, NextResponse } from "next/server";

// Limit to 100 requests per minute per IP
export const GET = withRateLimit(
  async (request: NextRequest) => {
    const data = await fetchData();
    return NextResponse.json(data);
  },
  {
    window: 60, // seconds
    max: 100, // requests
  }
);
```

### User-Based Rate Limiting

```typescript
import { withRateLimit } from "@/lib/cacheMiddleware";

export const POST = withRateLimit(
  async (request: NextRequest) => {
    const result = await createComment(data);
    return NextResponse.json(result);
  },
  {
    window: 60,
    max: 10, // 10 comments per minute
    keyGenerator: (request) => {
      // Rate limit by user ID
      return `user:${request.headers.get("x-user-id")}`;
    },
  }
);
```

### Combined Caching + Rate Limiting

```typescript
import { withCache, withRateLimit, CACHE_TTL } from "@/lib/cacheMiddleware";

// Apply both middlewares
export const GET = withRateLimit(
  withCache(
    async (request: NextRequest) => {
      const data = await expensiveOperation();
      return NextResponse.json(data);
    },
    { ttl: CACHE_TTL.LONG }
  ),
  { window: 60, max: 100 }
);
```

---

## Performance Monitoring

### Cache Statistics

```typescript
import { cache } from "@/lib/cache";
import { comicCache } from "@/lib/comicCache";

// Get overall cache stats
const stats = await cache.getStats();
console.log(`
  Keys: ${stats.keys}
  Memory: ${stats.memory}
  Hits: ${stats.hits}
  Misses: ${stats.misses}
  Hit Rate: ${stats.hitRate.toFixed(2)}%
`);

// Get comic-specific stats
const comicStats = await comicCache.getComicCacheStats();
console.log(`
  Comics Cached: ${comicStats.comicsCached}
  Chapters Cached: ${comicStats.chaptersCached}
  Searches Cached: ${comicStats.searchesCached}
`);
```

### Health Check

```typescript
import { cache } from "@/lib/cache";

// API route for health check
export async function GET() {
  const isHealthy = await cache.healthCheck();

  if (!isHealthy) {
    return NextResponse.json(
      { status: "unhealthy", message: "Redis connection failed" },
      { status: 503 }
    );
  }

  return NextResponse.json({ status: "healthy" });
}
```

### Monitoring Dashboard API

```typescript
import { cache } from "@/lib/cache";
import { comicCache } from "@/lib/comicCache";

export async function GET() {
  const [stats, comicStats, keys] = await Promise.all([
    cache.getStats(),
    comicCache.getComicCacheStats(),
    cache.getKeys("*"),
  ]);

  return NextResponse.json({
    redis: {
      ...stats,
      totalKeys: keys.length,
    },
    comics: comicStats,
    timestamp: new Date().toISOString(),
  });
}
```

---

## Best Practices

### 1. Choose Appropriate TTL

```typescript
// Frequently changing data - SHORT (5 minutes)
await cache.set("trending:now", data, { ttl: CACHE_TTL.SHORT });

// Semi-static data - MEDIUM (30 minutes)
await cache.set("comics:homepage", data, { ttl: CACHE_TTL.MEDIUM });

// Rarely changing data - VERY_LONG (12 hours)
await cache.set("genres:all", data, { ttl: CACHE_TTL.VERY_LONG });
```

### 2. Use Consistent Key Naming

```typescript
// Good: Hierarchical and predictable
const key = `comic:${comicId}:chapters`;
const key = `user:${userId}:bookmarks:page:${page}`;
const key = `search:${query}:filters:${JSON.stringify(filters)}`;

// Bad: Inconsistent and unpredictable
const key = `${comicId}_chapters`;
const key = `bookmarks_${userId}_${page}`;
```

### 3. Tag Important Caches

```typescript
// Tag for easy invalidation
await cache.set("comic:123", data, {
  ttl: CACHE_TTL.LONG,
  tags: ["comic", "comic:123", "genre:action", "status:ongoing"],
});

// Invalidate all action comics at once
await cache.invalidateByTag("genre:action");
```

### 4. Handle Cache Failures Gracefully

```typescript
async function getComic(comicId: number) {
  try {
    const cached = await cache.get(`comic:${comicId}`);
    if (cached) return cached;
  } catch (error) {
    console.error("Cache error, falling back to DB:", error);
  }

  // Always have fallback to database
  return await db.query.comic.findFirst({
    where: eq(comic.id, comicId),
  });
}
```

### 5. Avoid Caching Large Objects

```typescript
// Bad: Caching huge payloads
await cache.set("all:comics", hugeArray); // Too large!

// Good: Cache with pagination
await cache.set("comics:page:1", page1Data);
await cache.set("comics:page:2", page2Data);

// Or cache IDs only
await cache.set("popular:comic:ids", [1, 2, 3, 4, 5]);
```

### 6. Monitor Cache Performance

```typescript
// Log cache hits/misses
const cached = await cache.get(key);
if (cached) {
  console.log(`✅ Cache HIT: ${key}`);
} else {
  console.log(`❌ Cache MISS: ${key}`);
}

// Track cache statistics periodically
setInterval(async () => {
  const stats = await cache.getStats();
  console.log(`Hit Rate: ${stats.hitRate.toFixed(2)}%`);
}, 60000); // Every minute
```

### 7. Invalidate on Mutations

```typescript
// Always invalidate related caches after updates
async function updateComic(comicId: number, data: UpdateData) {
  // Update database
  await db.update(comic).set(data).where(eq(comic.id, comicId));

  // Invalidate caches
  await comicCache.invalidateComic(comicId);
  await comicCache.invalidateComicsList();
  await comicCache.invalidateSearch();

  return { success: true };
}
```

---

## Troubleshooting

### Issue: Redis Connection Failed

**Solution**:

```bash
# Check if Redis is running
redis-cli ping

# Check Redis logs
docker logs comicwise-redis

# Verify environment variables
echo $REDIS_HOST
echo $REDIS_PORT
```

### Issue: High Memory Usage

**Solution**:

```bash
# Check memory usage
redis-cli info memory

# Clear specific pattern
redis-cli --scan --pattern "old:*" | xargs redis-cli del

# Set max memory policy
redis-cli config set maxmemory-policy allkeys-lru
redis-cli config set maxmemory 256mb
```

### Issue: Low Cache Hit Rate

**Solution**:

- Increase TTL for frequently accessed data
- Implement cache warming for popular content
- Review cache invalidation strategy (might be too aggressive)
- Check if cache keys are consistent

### Issue: Stale Cache Data

**Solution**:

- Reduce TTL for frequently changing data
- Implement tag-based invalidation
- Add cache revalidation logic
- Use write-through caching for critical data

---

## Additional Resources

- [Redis Documentation](https://redis.io/docs/)
- [ioredis GitHub](https://github.com/redis/ioredis)
- [Cache-Aside Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

---

**Last Updated**: 2024 **Version**: 1.0.0
