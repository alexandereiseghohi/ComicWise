# Ticket 009 — LOW: Production readiness — Sentry & deployment vars

## Description
Prepare production env checklist and verify Sentry init and production build readiness.

## Files to edit / create
- Edit: `next.config.ts` (verify settings)
- Verify/Edit: sentry config files (`sentry.client.config.ts`, `sentry.server.config.ts`)
- Update: `.env.production.template` with `SENTRY_DSN`, `DATABASE_URL`, `REDIS` and OAuth secrets
- Update CI/CD docs

## Acceptance criteria
- `pnpm build` succeeds with documented production envs.
- Sentry DSN usage documented and configurable.

## Commands
```bash
pnpm build
```

## Estimate
4–8 hours
