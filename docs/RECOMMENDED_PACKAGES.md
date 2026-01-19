# Recommended Packages for ComicWise

Generated: 2025-12-09

This document lists recommended production and dev packages, and a short
rationale for each. Use this as a checklist before scaffolding components, DB
wiring, auth, and image upload.

## Production

- `next@16.0.8` — Supported Next.js version used by the project. Keeps Turbopack
  compatibility.
- `react@19.2.1`, `react-dom@19.2.1` — React matching the Next.js version.
- `drizzle-orm` + `drizzle-kit` — ORM and migration tooling already used by the
  project.
- `postgres` — Node Postgres client for Drizzle (already present).
- `next-auth@5.0.0-beta.30` — Authentication (already present); follow v5
  patterns.
- `zod` — Runtime input validation for server actions and config parsing.
- `cloudinary` or `@cloudinary/url-gen` — Image CDN and transformation helpers
  (choose one if using Cloudinary).
- `@aws-sdk/client-s3` — For S3-backed image uploads and storage.
- `imagekit` / `imagekitio-next` — Alternative image CDN & upload client.
- `sharp` — High-performance image processing (already present).

## Development / Tooling

- `eslint` + `@typescript-eslint/*` — Linting and TypeScript-specific lint
  rules.
- `prettier` + `prettier-plugin-tailwindcss` — Formatting with Tailwind plugin
  to keep class ordering.
- `playwright` + `vitest` — E2E and unit testing frameworks already configured.
- `ts-node` / `tsx` — Executing TypeScript scripts such as seeds locally
  (project uses `tsx`).
- `dotenv-safe` — Validates presence of required env vars at startup (used in
  app-config).
- `ts-morph` — AST-based source transformations useful for rewriting imports to
  alias paths.
- `ts-prune` — Find unused exported types or functions.

## Install suggestions

Minimal quick install (examples):

```pwsh
pnpm add @aws-sdk/client-s3 cloudinary
pnpm add -D ts-morph
```

## Notes

- Only install the image provider packages you plan to use (Cloudinary vs S3 vs
  ImageKit).
- `ts-morph` is recommended only if you plan to run automated import rewrites;
  otherwise manual edits are fine.
