# Ticket 002 — HIGH: Comic utilities + stabilize DAL usage & tests

## Description

Add utility helpers for comics (slug generation, pagination, image helpers),
ensure DAL functions are unified and covered by unit tests, and verify comic
list/details/chapters rendering.

## Files to create / edit

- Create: `src/lib/utils/comic-utils.ts`
- Edit/Verify: `src/dal/comic-dal.ts`, `src/dal/chapter-dal.ts`
- Edit: `src/app/(root)/comics/page.tsx`,
  `src/app/(root)/comics/[slug]/page.tsx`,
  `src/app/(root)/comics/[slug]/chapters/[chapter-id]/page.tsx`
- Add tests: `src/tests/unit/comic-utils.test.ts` and extend
  `src/tests/unit/actions/comic.test.ts`

## Acceptance criteria

- Utilities implemented and unit-tested.
- Pages render seeded data and are type-safe.
- No regressions in existing comic tests.

## Commands

```bash
pnpm db:push
pnpm db:seed
pnpm type-check
pnpm test:unit
pnpm dev
```

## Estimate

12–20 hours
