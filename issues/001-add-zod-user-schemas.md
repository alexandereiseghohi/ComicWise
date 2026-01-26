# Ticket 001 — HIGH: Add Zod user schemas and server actions for profile pages

## Description

Implement server-side validation and server-actions for profile edit and
change-password flows used by existing profile pages.

## Files to create / edit

- Create: `src/lib/schemas/userSchema.ts`
- Create: `src/actions/user.server.ts` (or `src/app/(root)/profile/actions.ts`
  matching repo convention)
- Edit: `src/app/(root)/profile/edit/page.tsx`
- Edit: `src/app/(root)/profile/change-password/page.tsx`
- Add tests: `src/tests/unit/actions/user.server.test.ts` (or extend
  `src/tests/lib/actions/users.test.ts`)

## Acceptance criteria

- Client and server use Zod schemas for validation.
- Server actions update user in DB and return clear errors.
- `pnpm type-check` succeeds and unit tests for actions pass.

## Commands

```bash
pnpm type-check
pnpm test:unit
pnpm dev
```

## Estimate

8–12 hours
