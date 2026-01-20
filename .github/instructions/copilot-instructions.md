# GitHub Copilot Instructions for ComicWise

A modern, high-performance web comic platform built with **Next.js 16**, **PostgreSQL**, **Drizzle ORM**, and **Redis**.

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 16 (App Router), TypeScript 5, Tailwind CSS 4.1, Zustand/Jotai (state)
- **Backend**: Node.js 20+, Server Actions, API routes
- **Database**: PostgreSQL 16 + Drizzle ORM (type-safe queries)
- **Cache**: Redis (ioredis + Upstash support)
- **Auth**: NextAuth v5 (Google, GitHub providers)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Package Manager**: pnpm 9+

### Project Structure
```
src/
├── app/              # Next.js App Router (layout, pages, layouts)
├── components/       # React components (ui/, shared/, admin/, comics/)
├── database/         # DB schema, queries, mutations
│   ├── schema.ts    # Drizzle schema (user, comic, chapter, etc.)
│   ├── db.ts        # Postgres client + Drizzle instance
│   ├── queries/     # Read operations (comics.ts, users.ts)
│   ├── mutations/   # Write operations
│   └── seed/        # Database seeding scripts
├── lib/              # Business logic
│   ├── actions/      # Server Actions (use server)
│   ├── auth.ts       # NextAuth configuration
│   ├── cache.ts      # Redis caching layer
│   ├── validations/  # Zod schemas
│   └── env.ts        # T3 Env validation
├── services/         # Service layer
├── stores/           # Zustand stores (auth, ui, comics)
├── types/            # TypeScript types
└── dto/              # Data Transfer Objects
```

## Critical Developer Workflows

### Database Operations
```bash
pnpm db:push              # Apply schema changes to database
pnpm db:seed              # Seed with test data
pnpm db:reset             # Drop + recreate + seed
pnpm db:studio            # Open Drizzle Studio (web UI)
```
**Pattern**: Always use typed queries from `src/database/queries/` and mutations from `src/database/mutations/`. Leverage Drizzle's type-safety instead of raw SQL.

### Server Actions & Data Flow
- **Server Actions** (`"use server"`) in `src/lib/actions/` handle mutations
- Use **DTO** pattern: validation → business logic → DB mutation → revalidation
- Always call `revalidatePath()` or `revalidateTag()` after mutations (enables ISR)
- **Example**: `src/lib/actions/users.ts` shows password hashing, rate limiting, email sending pattern

### State Management
- **Client**: Zustand stores in `src/stores/` with persist middleware
- **Server**: Session via NextAuth, caching via Redis
- **Pattern**: Stores hydrate from server-rendered initial state, no API calls in stores

### Build & Validation
```bash
pnpm validate         # Full CI check (type-check + lint + format)
pnpm build            # Compile with React Compiler enabled
pnpm dev              # Start with hot reload + Turbopack
```

### Testing
```bash
pnpm test:unit:run    # Vitest (src/tests/unit/**/*.test.ts)
pnpm test             # Playwright E2E (src/tests/e2e/**/*.spec.ts)
pnpm test:ui          # Interactive Playwright UI
```

## Project-Specific Conventions

### Path Aliases (Critical)
Use these **always** instead of relative imports:
```typescript
import { db } from "db";                    // src/database/db.ts
import * as queries from "database/queries"; // All query functions
import * as mutations from "mutations";     // All mutation functions
import { useAuthStore } from "stores";      // Zustand stores
import { ActionResult } from "dto";         // DTOs & types
import { env } from "@/appConfig";          // Validated env
import { cache } from "lib/cache";          // Redis client
```

### Server Actions Pattern
```typescript
"use server";
import { ActionResult } from "@/dto";

export async function myAction(input: FormData): Promise<ActionResult<T>> {
  try {
    // 1. Validate input
    const data = mySchema.parse({ /* extract from input */ });

    // 2. Auth check if needed
    const session = await auth();
    if (!session?.user?.id) return error("Unauthorized");

    // 3. Rate limiting (checkRateLimit from appConfig)

    // 4. Database mutation
    const result = await mutations.create(data);

    // 5. Cache invalidation
    revalidatePath("/comics");

    return success(result);
  } catch (err) {
    return error(error instanceof Error ? err.message : "Operation failed");
  }
}
```

### Caching Strategy
- **Redis TTL patterns**: 30s (dynamic), 180s (static)
- **ISR revalidation**: `revalidatePath()` on mutation, `revalidateTag()` for granular control
- Check [src/lib/cache.ts](src/lib/cache.ts) for `CacheClient` interface and TTL helpers

### Environment Variables
- Located in `src/lib/env.ts` (T3 Env with Zod validation)
- Access via `import { env } from "@/appConfig"`
- Never reference process.env directly
- Separate `server` and `client` (prefixed `NEXT_PUBLIC_`) schemas

### Authentication
- NextAuth v5 in `src/lib/authConfig.ts`
- Session available via `const session = await auth()`
- Protected routes checked in middleware
- Role-based access: `user`, `admin`, `moderator` (defined in DB schema)

### Database Schema (Drizzle)
- PostgreSQL enums: `userRole`, `comicStatus`
- Relationships defined via foreign keys in schema
- Full-text search: tsvector type for PostgreSQL FTS (see schema.ts line 23)
- Indexes on frequently queried fields (email, role, status)

### Validation
- Use Zod schemas in `src/lib/validations/`
- Reuse schemas: `signUpSchema`, `comicSchema`, etc.
- Parse input immediately, fail fast with validation errors

## Integration Points & Communication

### API Routes
- REST APIs in `src/app/api/` follow standard Next.js patterns
- Use middleware for auth/rate-limiting
- Return consistent response format (success/error with data)

### Database Transactions
- Drizzle doesn't auto-transaction; use `db.transaction()` for multi-operation atomicity
- Example: Create comic + seed chapters in single transaction

### Rate Limiting
- Middleware applies to all API routes (see `src/middleware.ts` line 33)
- Per-action limits available via `checkRateLimit()` (appConfig)
- Configurable window and thresholds

### Cache Invalidation
- After any mutation, call `revalidatePath()` with affected routes
- Use `revalidateTag()` for granular cache purging
- Redis handles session/user data caching

## Common Patterns & Examples

### Reading Data (Queries)
```typescript
import * as queries from "database/queries";

// From src/database/queries/comics.ts
const comic = await queries.getComicBySlug("spider-man");
const searchResults = await queries.searchComics("dragon", limit: 10);
```

### Writing Data (Mutations)
```typescript
import * as mutations from "mutations";

const newComic = await mutations.createComic({ title, status, chapters: [] });
await mutations.updateComicStatus(comicId, "Ongoing");
```

### Component Pattern (Client)
```typescript
"use client";
import { useAuthStore } from "stores";
import { myAction } from "@/lib/actions/comics";

export function MyComponent() {
  const { user } = useAuthStore();

  async function handleSubmit(formData: FormData) {
    const result = await myAction(formData);
    if (!result.success) toast.error(result.message);
  }

  return <form action={handleSubmit}>...</form>;
}
```

## Testing Approach

### Unit Tests (Vitest)
- Test utilities, hooks, schemas in isolation
- Mock external dependencies (auth, DB, Redis)
- Location: `src/tests/unit/**/*.test.ts`

### E2E Tests (Playwright)
- Test critical user flows (auth, CRUD, bookmarking)
- Use `await page.goto()` and Playwright locators
- Location: `src/tests/e2e/**/*.spec.ts`
- Run via `pnpm test` or `pnpm test:ui` for debugging

## Known Patterns & Anti-Patterns

### ✅ DO
- Use typed Drizzle queries instead of raw SQL
- Call `revalidatePath()` after mutations
- Check `session?.user` before accessing protected data
- Use Server Actions for all mutations (no direct API calls from client)
- Validate input with Zod before processing

### ❌ DON'T
- Import relative paths when path aliases exist
- Direct `process.env` access (use `env` from appConfig)
- Forget cache invalidation after mutations
- Mix client and server logic in same file (use `"use client"` / `"use server"`)
- Create raw API endpoints when Server Actions suffice

## Commands Cheat Sheet
```bash
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm validate         # Full validation (type + lint + format)
pnpm db:push          # Update schema in DB
pnpm db:seed          # Seed test data
pnpm test             # E2E tests
pnpm test:unit        # Unit tests (watch)
pnpm type-check       # TypeScript check only
pnpm lint:fix         # Auto-fix linting issues
```

---

**Last Updated**: January 2026 | **Next.js**: 16 | **Node**: 20+ | **PostgreSQL**: 16
