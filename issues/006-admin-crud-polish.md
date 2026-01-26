# Ticket 006 — MEDIUM: Admin polishing & CRUD test coverage

## Description
Polish admin flows (comics/genres/authors/chapters), add server-side validation consistency and integration tests.

## Files to edit / create
- Edit: admin pages under `src/app/admin/*` (forms, error handling)
- Add tests: `src/tests/integration/admin.comics.test.ts`, unit tests for `src/app/admin/.../actions.ts`

## Acceptance criteria
- Admin CRUD flows have integration tests passing locally.
- Forms validate and surface server errors consistently.

## Commands
```bash
pnpm test:unit
pnpm test
```

## Estimate
6–10 hours
