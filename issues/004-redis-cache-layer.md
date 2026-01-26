# Ticket 004 — MEDIUM: Add Redis caching utility and integrate into DAL

## Description

Add a Redis cache layer supporting Upstash or local Redis and integrate caching
into heavy DAL queries (comics list, top comics, comic details).

## Files to create / edit

- Create: `src/lib/cache/redis.ts`
- Edit: `src/dal/comic-dal.ts` / `src/database/queries/comics.ts` to use cache
- Update: `.env.example` docs for `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN`
- Add tests: `src/tests/unit/cache.redis.test.ts` (mocked)

## Acceptance criteria

- Cache util respects env config and falls back to no-op if missing.
- At least one endpoint caches responses; cache hits are observable via logs.
- Unit tests cover caching logic.

## Commands

```bash
pnpm type-check
pnpm test:unit
```

## Estimate

6–12 hours
