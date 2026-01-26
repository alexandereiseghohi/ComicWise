# Ticket 007 — MEDIUM: Expand test coverage & CI integration

## Description

Raise coverage for critical modules and ensure CI runs unit tests, E2E tests and
linting.

## Files to create / edit

- Create/Edit CI workflow: `.github/workflows/ci.yml` (if absent)
- Expand tests in `src/tests/*`
- Ensure `package.json` scripts include `test:unit`, `test:e2e`, `validate`

## Acceptance criteria

- CI runs `pnpm install`, `pnpm test:unit`, `pnpm test`, and `pnpm lint`.
- Coverage for core DAL/actions reaches agreed threshold.

## Commands

```bash
pnpm install
pnpm test:unit
pnpm test
pnpm lint
```

## Estimate

8–16 hours
