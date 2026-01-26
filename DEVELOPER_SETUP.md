# Developer setup & handoff — ComicWise

TL;DR — Follow the quick commands to bootstrap, then configure your IDE (VS Code recommended). After IDE and env are ready, run validation and start the dev server. Implementation tasks are prioritized below for handoff.

## Quick bootstrap (copy/paste)
1. Install Node 20.x and pnpm (pnpm >= 10).
2. From repo root:
```bash
pnpm install
pnpm type-check
pnpm lint
pnpm format:check
pnpm db:push    # if using the project's drizzle/migration scripts
pnpm db:seed    # seed DB if seeds exist
pnpm dev
```

## Prerequisites
- Node 20.x (LTS)
- pnpm (repo uses pnpm)
- Git
- Postgres (local Docker container or cloud); Redis (local or Upstash) if using caching
- Optional: Playwright browsers: `npx playwright install --with-deps`

---

## VS Code setup (recommended)
Do these steps in VS Code workspace mode.

1. Install recommended extensions (or use `.vscode/extensions.json` if present):
   - dbaeumer.vscode-eslint (ESLint)
   - esbenp.prettier-vscode (Prettier)
   - ms-vscode.vscode-typescript-next (TypeScript)
   - bradlc.vscode-tailwindcss (Tailwind)
   - ms-playwright.playwright (Playwright)
   - vitest.explorer (Vitest)
   - cweijan.vscode-postgresql-client2 or similar (Postgres)
   - redis.redis-for-vscode (Redis)
   - github.copilot (optional)

2. Workspace settings (add to `.vscode/settings.json` or enable in workspace):
   - `editor.tabSize = 2`
   - `editor.formatOnSave = true`
   - `editor.defaultFormatter = "esbenp.prettier-vscode"`
   - `"eslint.codeActionsOnSave": { "source.fixAll": true }`
   - `typescript.tsdk = ./node_modules/typescript/lib`

3. Launch & Tasks
   - Ensure `.vscode/launch.json` contains configs for:
     - Next dev (runs `pnpm dev`)
     - Node attach (port 9229 for debug)
     - Vitest runs/debug
     - Playwright runs
   - Ensure `.vscode/tasks.json` has tasks for Dev, Build, Type Check, Lint, Unit tests, E2E tests, DB push/seed

4. Env handling
   - Copy `.env.example` → `.env.local` and fill values (do not commit secrets).
   - Confirm `.env.local` is in `.gitignore`.

5. Validation
```bash
pnpm validate   # if available
pnpm test:unit
pnpm test       # Playwright E2E (if configured)
```

---

## WebStorm setup (short)
1. Configure Node interpreter to Node 20 and set pnpm as package manager.
2. TypeScript: use `node_modules/typescript`.
3. Create Run/Debug configurations for `dev`, `dev:debug`, `build`, `type-check`, `lint`, `test:unit`, `test`.
4. Enable ESLint & Prettier integrations, and "Run eslint --fix" on save or format on save.
5. Add Database connection in Database tool using `DATABASE_URL`.
6. Optional: configure Playwright plugin or run config.

---

## .env.example (template)
Create `.env.example` in repo root with these placeholders (do not commit real secrets):

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/comicwise

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=replace_with_32_characters_minimum

# Redis (Upstash or local)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
# or local
REDIS_URL=redis://localhost:6379

# Email (if used)
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=

# OAuth (if used)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Sentry
SENTRY_DSN=
```

---

## How to run locally
- Dev server: `pnpm dev`
- Type check: `pnpm type-check`
- Lint: `pnpm lint`
- Unit tests: `pnpm test:unit`
- E2E tests: `pnpm test` (Playwright)
- Build: `pnpm build`

---

## Prioritized implementation task list (handoff-ready)
High priority (Sprint 1)

1) User Profile pages & server actions
- Files:
  - `src/app/profile/page.tsx`  (exists)
  - `src/app/profile/edit/page.tsx` (exists)
  - `src/app/profile/change-password/page.tsx` (exists)
  - `src/lib/schemas/userSchema.ts` (MISSING)
  - `src/actions/user.server.ts` (MISSING)
- Commands:
```
pnpm type-check
pnpm dev
pnpm test:unit
```
- Acceptance: pages reachable and server-side validation with Zod; DB updates work.

2) Comics listing, details, chapter reader & DAL
- Files:
  - `src/app/comics/page.tsx` (exists)
  - `src/app/comics/[slug]/page.tsx` (exists)
  - `src/app/comics/[slug]/chapters/[chapter-id]/page.tsx` (exists)
  - `src/dal/comic-dal.ts` (exists)
  - `src/lib/utils/comic-utils.ts` (MISSING)
- Commands:
```
pnpm db:push
pnpm db:seed
pnpm type-check
pnpm test:unit
pnpm dev
```
- Acceptance: listing and detail pages render seeded data, chapter reader works.

3) Search
- Files:
  - `src/app/search/page.tsx` (exists)
  - search queries exist under `src/database/queries/comics.ts`
- Acceptance: Search returns relevant results and is debounced.

Medium priority (Sprint 2)

4) Admin CRUD & polishing
- Many admin pages exist under `src/app/admin/*` — verify and add tests.

5) Caching & image performance
- Add `src/lib/cache/redis.ts` (MISSING)
- Migrate images to `next/image` (components under `src/components/*`)

6) Tests & QA
- Tests exist under `src/tests/*`. Expand coverage for DAL and actions.

Lower priority (Sprint 3)

7) Docs & deployment
- Add `DEVELOPER_SETUP.md` to repo root (content available)
- Update README and docs/

8) Monitoring & Sentry
- Verify sentry config files and `.env.production.template` entries

---

## Acceptance checklist for handoff
- [ ] `pnpm install` runs cleanly
- [ ] `.env.local` example exists and documented
- [ ] Dev server starts with no TS errors
- [ ] Profile pages implemented and DB updates working
- [ ] Comic listing/details/reader implemented and seeded data loads
- [ ] Unit tests for new modules added and passing
- [ ] Playwright E2E flows pass locally
- [ ] README updated with setup/env instructions

---

## Blockers & required inputs
- `DATABASE_URL` (local Postgres or cloud)
- `AUTH_SECRET` / NextAuth keys
- Redis/Upstash credentials (for caching)
- OAuth credentials (if social login required)
- CI secrets (Sentry DSN, DB, Redis) for deployment

---

## Recommended sprint plan & timebox
- Initial dev setup and IDE config: 1 day
- Sprint 1 (Profiles + Comics core pages + DAL + basic tests): 1–2 weeks
- Sprint 2 (Admin, caching, image perf, expanded tests): 1–2 weeks
- Sprint 3 (Docs, monitoring, deploy): 3–5 days

---

## Next actions
- Create `DEVELOPER_SETUP.md` in repo (this file)
- Create `.env.local` from `.env.example` and fill secrets locally (do not commit real secrets)
- Run `pnpm install` and `pnpm dev` to verify
