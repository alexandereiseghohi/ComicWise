# Ticket 003 — HIGH: Verify & improve search (backend + UI)

## Description

Ensure search query functions and UI return relevant results; add debounce,
pagination and accessibility improvements.

## Files to edit / create

- Edit: `src/database/queries/comics.ts` (tune search)
- Edit: `src/app/(root)/search/page.tsx` (debounce, accessibility)
- Add tests: `src/tests/integration/search.test.tsx`

## Acceptance criteria

- Search returns relevant title/author results with pagination.
- UI is debounced and accessible.
- Integration tests verify expected search behavior.

## Commands

```bash
pnpm type-check
pnpm test:unit
pnpm test   # optional Playwright E2E
```

## Estimate

4–6 hours
