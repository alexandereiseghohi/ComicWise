# Performance Optimization Guide

## Overview

This guide covers performance improvements implemented in the ComicWise
application, including:

- Image optimization with next/image
- Code splitting and dynamic imports
- Database query optimization
- Bundle size analysis
- Caching strategies

## 1. Image Optimization

### Next.js Image Component

All images should use the `next/image` component for automatic optimization:

```tsx
import Image from "next/image";

export function ComicCard({ comic }) {
  return (
    <Image
      src={comic.coverImage}
      alt={comic.title}
      width={300}
      height={400}
      placeholder="blur"
      blurDataURL={comic.blurhash}
      priority={false}
      quality={75}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
}
```

### WebP Support

Images are automatically served in WebP format when supported. Fallback to JPEG
for older browsers.

### Responsive Images

Configure `next.config.ts` for responsive image sizes:

```typescript
images: {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  formats: ['image/webp', 'image/avif'],
}
```

### Lazy Loading

Images below the fold are automatically lazy loaded:

```tsx
// Automatic lazy loading for non-critical images
<Image src={image} alt="Comic" loading="lazy" decoding="async" />
```

## 2. Code Splitting

### Dynamic Imports

Split heavy components into separate chunks:

```tsx
import dynamic from "next/dynamic";

// Lazy load admin panel
const AdminPanel = dynamic(() => import("@/components/admin-panel"), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

// Route-based code splitting
export default function Page() {
  return <AdminPanel />;
}
```

### Route-Based Splitting

Next.js automatically creates separate bundles for each route.

### Vendor Code Splitting

Use `next.config.ts`:

```typescript
webpack: (config) => {
  config.optimization.splitChunks.cacheGroups = {
    default: false,
    vendors: false,
    // Vendor code
    vendor: {
      filename: "chunks/vendor.js",
      chunks: "all",
      test: /node_modules/,
    },
    // React-related
    react: {
      filename: "chunks/react.js",
      chunks: "all",
      test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
      priority: 10,
    },
  };
  return config;
};
```

## 3. Database Optimization

### Indexes

Key indexes for performance:

```sql
-- Title search
CREATE INDEX idx_comics_title_trigram ON comics USING GIN(title gin_trgm_ops);

-- Full-text search
CREATE INDEX idx_comics_search_vector ON comics USING GIN(search_vector);

-- Published filter
CREATE INDEX idx_comics_published ON comics(published) WHERE published = true;

-- Author lookups
CREATE INDEX idx_comics_author_id ON comics(author_id) WHERE published = true;

-- Slug lookups
CREATE INDEX idx_comics_slug ON comics(slug) WHERE published = true;
```

### Query Optimization

Use prepared statements and eager loading:

```typescript
// ✅ Good - Use joins to avoid N+1
const comics = await db
  .select()
  .from(comics)
  .leftJoin(users, eq(comics.authorId, users.id))
  .where(eq(comics.published, true));

// ❌ Bad - N+1 query problem
const comics = await db.select().from(comics);
const authorsMap = new Map();
for (const comic of comics) {
  const author = await db
    .select()
    .from(users)
    .where(eq(users.id, comic.authorId));
  authorsMap.set(comic.id, author);
}
```

### Caching

Implement Redis caching for frequent queries:

```typescript
import { redis } from "@/lib/redis";

export async function getPopularComics() {
  const cached = await redis.get("popular-comics");
  if (cached) {
    return JSON.parse(cached);
  }

  const comics = await db
    .select()
    .from(comics)
    .where(eq(comics.published, true))
    .orderBy(desc(comics.views))
    .limit(20);

  // Cache for 1 hour
  await redis.setex("popular-comics", 3600, JSON.stringify(comics));
  return comics;
}
```

## 4. Build Optimization

### Bundle Analysis

Analyze bundle size:

```bash
# Generates bundle analysis
pnpm build:analyze

# View in browser
open .next/static/report.html
```

### Remove Unused Dependencies

```bash
# Find unused dependencies
pnpm find-deadcode

# Check for outdated packages
pnpm check-updates
```

### Tree Shaking

Ensure exports are properly structured:

```typescript
// ✅ Good - Named exports (tree-shakeable)
export function utilA() {}
export function utilB() {}

// ❌ Bad - Default export (not tree-shakeable)
export default { utilA, utilB };
```

## 5. Runtime Optimization

### HTTP Compression

Enable gzip/brotli in `next.config.ts`:

```typescript
compress: true, // Automatic gzip/brotli
```

### Cache Headers

Set proper cache headers in `next.config.ts`:

```typescript
headers: async () => [
  {
    source: "/static/:path*",
    headers: [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ],
  },
  {
    source: "/:path*",
    headers: [
      {
        key: "Cache-Control",
        value: "public, max-age=3600, s-maxage=86400",
      },
    ],
  },
];
```

### Service Worker

Implement offline support:

```typescript
// public/sw.js
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(["/", "/about"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## 6. Web Vitals Monitoring

### Metrics to Track

- **LCP** (Largest Contentful Paint): < 2.5s ✅
- **FID** (First Input Delay): < 100ms ✅
- **CLS** (Cumulative Layout Shift): < 0.1 ✅

### Measurement

```typescript
// pages/_app.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

function handleMetrics(metric: Metric) {
  console.log(metric.name, metric.value);

  // Send to analytics
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify(metric),
  });
}

getCLS(handleMetrics);
getFID(handleMetrics);
getFCP(handleMetrics);
getLCP(handleMetrics);
getTTFB(handleMetrics);
```

### Lighthouse Audit

```bash
# Run Lighthouse audit
pnpm lighthouse

# View report
open lighthouse-*.html
```

## 7. Performance Checklist

### Before Deployment

- [ ] Run `pnpm build:analyze` - Check bundle size
- [ ] Run `pnpm lighthouse` - Verify Core Web Vitals
- [ ] Run `pnpm test:unit:coverage` - Maintain > 60% coverage
- [ ] Check image sizes - Use next/image for all images
- [ ] Verify database indexes - Run slow query log
- [ ] Test Cache headers - Use DevTools Network tab
- [ ] Check Service Worker - Test offline functionality

### Ongoing Monitoring

- [ ] Monitor Core Web Vitals with analytics
- [ ] Track database query performance
- [ ] Review bundle size trends
- [ ] Monitor error rates
- [ ] Track page load times by route

## 8. Performance Commands

```bash
# Build and analyze
pnpm build:analyze

# Type check
pnpm type-check

# Lint and format
pnpm lint && pnpm format

# Run tests
pnpm test:unit:coverage

# Run Lighthouse audit
pnpm lighthouse

# Find dead code
pnpm find-deadcode

# Database optimization
pnpm db:push  # Apply migrations
VACUUM ANALYZE;  # Optimize PostgreSQL

# Bundle analysis
pnpm bundle-size
```

## 9. Resources

- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Bundle Analysis](https://nextjs.org/docs/advanced-features/bundle-analysis)

## 10. Quick Wins

1. **Image Optimization** - Use `next/image` for all images
2. **Code Splitting** - Use dynamic imports for heavy components
3. **Caching** - Implement Redis for frequently accessed data
4. **Compression** - Enable gzip/brotli (automatic in Next.js)
5. **Lazy Loading** - Load components and images on demand
6. **Tree Shaking** - Use named exports instead of default exports
7. **Minification** - Enabled by default in production builds
8. **Database Indexes** - Add indexes for filtered/sorted columns

## Support

For performance issues:

1. Check Web Vitals with `pnpm lighthouse`
2. Analyze bundle with `pnpm build:analyze`
3. Review database slow query log
4. Check DevTools Network tab for waterfall
