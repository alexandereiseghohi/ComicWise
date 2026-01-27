# Seeder — Usage

This project provides two seeding entry points:

- The primary, fully-featured seeder: `pnpm seed` (uses the project's optimized V4 runner and Drizzle wiring)
- A lightweight, file-based CLI for quick runs: `pnpm run seed:cli`

Lightweight CLI (scripts/seed.js)

Usage:

```bash
# run with no DB client (writes .seeder-output.json)
pnpm run seed:cli

# dry-run (report counts only)
pnpm run seed:cli -- --dry-run

# only seed a single entity (users|comics|chapters)
pnpm run seed:cli -- --only=users

# write output to a custom file
pnpm run seed:cli -- --out=./artifacts/seed.json
```

Auto-detect Drizzle client

If you have a Drizzle/DB client exported from the project (common locations: `src/database/db.ts`, `src/lib/db.ts`, `src/database/index.ts`), the lightweight CLI will attempt to auto-import it and use its `insert(table, rows)` API. You can override and provide an explicit module with the `DRIZZLE_CLIENT_PATH` environment variable.

Advanced runner

`pnpm seed` uses the project's optimized seeding runner and should be preferred for production-like runs (it supports upserts, validation, image downloads, and more).

Admin UI

From the admin setup page in the app you can run the seeder and view progress; the UI polls the server status endpoint to display intermediate progress.
