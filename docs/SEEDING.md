# Dynamic Seeding Guide

This document explains how to use the dynamic seeding system implemented in
`src/database/seed/seed-dynamic.ts`.

## Features

- Loads JSON from: `users.json`, `comics.json`, `comicsdata*.json`,
  `chapters.json`, `chaptersdata*.json`.
- Normalizes many JSON shapes (object-shaped images, alias keys, nested arrays).
- Downloads and stores remote images under `public/` using
  `src/lib/imageHelper.ts`.
- Supports dry-run, selective seeding, and guarded clearing.

## CLI Flags

- `--dry-run` — simulate seeding without performing DB writes or saving images
  (images will be logged as would-download).
- `--users` — only seed users.
- `--comics` — only seed comics.
- `--chapters` — only seed chapters.
- `--clear` — truncate selected tables before seeding. Requires
  `SEED_ALLOW_CLEAR=1` and must not be a dry-run.

Default: when none of `--users`, `--comics`, `--chapters` are provided, the
runner will execute all three.

## Required environment variables (for full run)

- `DATABASE_URL` — Postgres connection string used by Drizzle.
- `CUSTOM_PASSWORD` — password used for seeded users (will be hashed).
- `SEED_BCRYPT_ROUNDS` — bcrypt salt rounds (default 10).
- `SEED_ALLOW_CLEAR` — set to `1` to permit `--clear` to actually truncate
  tables (safety guard).

## Examples

Dry-run (safe, recommended when iterating):

```bash
pnpm run seed:dynamic -- --dry-run
```

Run only comics and chapters (non-dry-run):

```bash
DATABASE_URL="postgres://..." CUSTOM_PASSWORD="secret" SEED_BCRYPT_ROUNDS=10 pnpm run seed:dynamic -- --comics --chapters
```

Clear comics and chapters then seed them (destructive):

```bash
SEED_ALLOW_CLEAR=1 DATABASE_URL="postgres://..." CUSTOM_PASSWORD="secret" SEED_BCRYPT_ROUNDS=10 pnpm run seed:dynamic -- --clear --comics --chapters
```

## Notes & Safety

- `--clear` is intentionally guarded: it will not truncate tables during a
  dry-run and requires `SEED_ALLOW_CLEAR=1` to execute.
- The image helper caches downloaded images under `public/` by SHA256 of the URL
  to avoid duplicates.
- If you want me to run a full seed for you, provide the environment values or
  run the commands locally — I won't perform destructive operations without
  explicit env enabling clear.

## Where to look in code

- Runner: `src/database/seed/seed-dynamic.ts`
- Loaders: `src/lib/seedHelpers.ts`
- Validators: `src/lib/validations/seed.ts`
- Image handling: `src/lib/imageHelper.ts`
