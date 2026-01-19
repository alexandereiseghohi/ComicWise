# Phase 3: Advanced Features & Optimization (Setup Guide)

**Status:** 🚀 Ready for Implementation  
**Duration:** 2-3 weeks  
**Priority:** Production-Ready Features

---

## Overview

Phase 3 focuses on implementing advanced features, optimization, and production
readiness. This guide provides a roadmap for completing critical Phase 3 tasks.

## Tasks (Priority Order)

### 1. **Image Service Implementation** ✅ READY

**Status:** Template created at `src/services/imageService.ts`  
**Estimated Effort:** 4 hours

**What to do:**

- [ ] Implement ImageKit upload provider class
- [ ] Add Cloudinary provider support
- [ ] Test fallback mechanisms
- [ ] Optimize image formats (WebP, AVIF)

**Files involved:**

- `src/services/imageService.ts`
- `src/services/upload/factory.ts`
- `.env.local` (add image provider keys)

**Quick Start:**

```typescript
// In server action or API route
const url = await imageService.uploadComicCover(fileBuffer, comicSlug);
```

---

### 2. **Rate Limiting Middleware** ✅ READY

**Status:** Skeleton created at `src/middleware/rateLimiter.ts`  
**Estimated Effort:** 3 hours

**What to do:**

- [ ] Integrate rate limiter into server actions
- [ ] Configure limits per endpoint
- [ ] Add Redis support for distributed rate limiting
- [ ] Implement retry-after headers

**Files involved:**

- `src/middleware/rateLimiter.ts`
- `src/lib/actions/*.ts` (add middleware calls)
- `.env.local` (Redis configuration)

**Quick Start:**

```typescript
// In server action
import { rateLimitMiddleware } from "@/middleware/rateLimiter";

export async function createComic(input: CreateComicInput) {
  const userId = await getCurrentUserId();
  const limit = await rateLimitMiddleware(userId, "create:comic");

  if (!limit.allowed) {
    throw new Error(`Rate limit exceeded. Retry in ${limit.retryAfter}s`);
  }
  // ... proceed with action
}
```

---

### 3. **CI/CD Pipeline** ✅ READY

**Status:** GitHub Actions workflow at `.github/workflows/ci.yml`  
**Estimated Effort:** 2 hours

**What to do:**

- [ ] Configure secret keys in GitHub repository
- [ ] Test workflow locally with act
- [ ] Setup Vercel integration (if deploying)
- [ ] Configure branch protection rules

**Environment Secrets to Add:**

- `VERCEL_TOKEN` (if using Vercel)
- `SNYK_TOKEN` (for security scanning)
- `DATABASE_URL` (staging database)

**Verify workflow:**

```bash
# Install act (GitHub Actions local runner)
brew install act

# Run CI workflow locally
act push --secret-file .env.local
```

---

### 4. **Database Query Optimization** 📋 NEXT

**Estimated Effort:** 6 hours

**What to do:**

- [ ] Add indexes to frequently queried columns
- [ ] Optimize N+1 query problems
- [ ] Implement query result caching
- [ ] Monitor query performance

**Columns to index:**

```sql
CREATE INDEX idx_comic_slug ON comic(slug);
CREATE INDEX idx_chapter_comic_id ON chapter(comicId);
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_comment_comic_id ON comment(comicId);
CREATE INDEX idx_bookmark_user_id ON bookmark(userId);
```

**In Drizzle schema:**

```typescript
export const comic = pgTable(
  "comic",
  {
    // ...
  },
  (table) => ({
    slugIdx: index("idx_comic_slug").on(table.slug),
    // ... other indexes
  })
);
```

---

### 5. **Caching Strategy** 📋 NEXT

**Estimated Effort:** 5 hours

**What to do:**

- [ ] Implement Redis caching for listings
- [ ] Add cache invalidation logic
- [ ] Cache database query results
- [ ] Monitor cache hit rates

**Recommended TTLs:**

```typescript
const CACHE_TIMES = {
  COMIC_LIST: 3600, // 1 hour
  CHAPTER_LIST: 21600, // 6 hours
  GENRES: 86400, // 24 hours
  USER_PROFILE: 7200, // 2 hours
};
```

---

### 6. **Testing Framework** 📋 NEXT

**Estimated Effort:** 8 hours

**What to do:**

- [ ] Create unit tests for Zod schemas
- [ ] Write integration tests for server actions
- [ ] Setup Playwright E2E tests
- [ ] Achieve 80%+ code coverage

**Test structure:**

```
src/tests/
├── unit/
│  ├── schemas/ (Zod schema tests)
│  └── utils/ (utility function tests)
├── integration/
│  └── actions/ (server action tests)
└── e2e/
   └── critical/ (user flow tests)
```

**Quick Start:**

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test schemas.test.ts

# Generate coverage report
pnpm test:coverage
```

---

### 7. **Performance Monitoring** 📋 PHASE 4

**Estimated Effort:** 4 hours

**What to do:**

- [ ] Setup Sentry for error tracking
- [ ] Configure Google Analytics
- [ ] Add performance monitoring (Lighthouse)
- [ ] Setup log aggregation

**Environment variables:**

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

### 8. **Documentation** 📋 PHASE 4

**Estimated Effort:** 6 hours

**What to do:**

- [ ] Create comprehensive README
- [ ] Generate API documentation
- [ ] Write deployment guide
- [ ] Document architecture decisions

---

## Quick Setup Checklist

### Pre-Deployment (Before Phase 3 start)

- [ ] Run `pnpm validate` - all errors fixed
- [ ] Run `pnpm build` - successful build
- [ ] Run `pnpm lint:fix` - linting clean
- [ ] Database migrations applied
- [ ] All backup files created

### Phase 3 Start

- [ ] Image service configured
- [ ] Rate limiting integrated
- [ ] GitHub Actions secrets configured
- [ ] Database indexes added
- [ ] Redis cache configured

### Before Production

- [ ] 80%+ test coverage
- [ ] All E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete

---

## Environment Variables Needed

```env
# Image Upload
UPLOAD_PROVIDER=imagekit
IMAGEKIT_PUBLIC_KEY=xxx
IMAGEKIT_PRIVATE_KEY=xxx
IMAGEKIT_URL_ENDPOINT=https://xxx.imagekit.io

# Caching
REDIS_URL=redis://localhost:6379
# or
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# CI/CD (GitHub Secrets)
VERCEL_TOKEN=xxx
SNYK_TOKEN=xxx

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxx
NEXT_PUBLIC_GA_ID=G-xxx
```

---

## Success Metrics

### Code Quality

- [ ] 100% TypeScript compilation
- [ ] 0 ESLint warnings
- [ ] 80%+ test coverage
- [ ] < 100ms Lighthouse LCP

### Performance

- [ ] Lighthouse score: 90+
- [ ] Time to interactive: < 2s
- [ ] Database p95: < 100ms
- [ ] API response: < 200ms

### Security

- [ ] OWASP Top 10 compliant
- [ ] No critical vulnerabilities
- [ ] Rate limiting: 100 req/min per IP
- [ ] CSRF protection enabled

### Reliability

- [ ] 99.9% uptime
- [ ] Zero data loss incidents
- [ ] Daily automated backups
- [ ] Error rate: < 0.1%

---

## Common Tasks

### Add Rate Limit to Server Action

```typescript
"use server";
import { rateLimitMiddleware } from "@/middleware/rateLimiter";
import { getCurrentUserId } from "@/lib/auth";

export async function myAction(input: MyInput) {
  const userId = await getCurrentUserId();
  const limit = await rateLimitMiddleware(userId, "action:name");

  if (!limit.allowed) {
    throw new Error(`Rate limited. Retry in ${limit.retryAfter}s`);
  }

  // Your action logic
}
```

### Add Database Index

```typescript
// In src/database/schema.ts
export const myTable = pgTable(
  "my_table",
  {
    // fields...
  },
  (table) => ({
    myIndex: index("idx_my_column").on(table.myColumn),
  })
);
```

### Cache Query Result

```typescript
import { redis } from "@/lib/redis";

async function getComics() {
  const cacheKey = "comics:list";

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // If miss, fetch and cache
  const comics = await db.query.comic.findMany();
  await redis.setex(cacheKey, 3600, JSON.stringify(comics));

  return comics;
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All Phase 1-2 validations passing
- [ ] Phase 3 features implemented and tested
- [ ] Database backups configured
- [ ] Monitoring & logging setup
- [ ] Environment variables all configured
- [ ] SSL/TLS certificates valid
- [ ] CDN configured (if using)
- [ ] API rate limits configured
- [ ] Security headers set
- [ ] Compliance checks passed (GDPR, etc.)

---

## Getting Help

**For implementation questions:**

1. Check existing code patterns in `src/lib/actions/`
2. Review documentation in `docs/` folder
3. Look at test files for usage examples
4. Refer to framework documentation:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Drizzle ORM](https://orm.drizzle.team)
   - [Zod Validation](https://zod.dev)

**For errors:**

1. Check error logs: `tail -f logs/error.log`
2. Run with verbose flag: `pnpm db:seed --verbose`
3. Check GitHub Issues for similar problems
4. File detailed issue with steps to reproduce

---

## Timeline Estimate

| Phase             | Duration     | Status      |
| ----------------- | ------------ | ----------- |
| Phase 1: Setup    | ✅ 1 week    | DONE        |
| Phase 2: Database | ✅ 1 week    | DONE        |
| Phase 3: Features | ⏳ 2-3 weeks | IN PROGRESS |
| Phase 4: Polish   | 1 week       | PLANNED     |
| Production        | 1 week       | PLANNED     |

**Total:** ~6-7 weeks from start to production

---

## Support & Questions

For questions about Phase 3 implementation:

- Review the setup guide in this file
- Check inline code comments
- Refer to architecture decision records in `docs/adr/`

**Generated:** 2026-01-18  
**Last Updated:** 2026-01-18  
**Next Review:** 2026-02-01
