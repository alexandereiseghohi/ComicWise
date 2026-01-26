# Ticket 005 — MEDIUM: Migrate hero images to `next/image` + placeholders

## Description
Replace critical `<img>` usages with `next/image` and implement blurred or low-res placeholders for list and reader components.

## Files to edit / create
- Edit: `src/components/comics/comics-list.tsx`
- Edit: reader component under `src/app/(root)/comics/.../chapters/*`
- Create (optional): `src/lib/image/placeholders.ts`
- Update `next.config.ts` if missing image domains or formats

## Acceptance criteria
- Critical images use `next/image` with lazy loading and placeholders.
- Build succeeds and no console errors.
- Local checks show improved image load UX.

## Commands
```bash
pnpm type-check
pnpm dev
pnpm build
```

## Estimate
4–8 hours
