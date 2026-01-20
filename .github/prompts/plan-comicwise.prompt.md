# ComicWise: Comprehensive Setup & Implementation Plan

**Project**: ComicWise (Next.js 16, PostgreSQL, Redis, AI-enhanced web comic platform)
**Status**: 95% infrastructure complete → Completing final 5% features & optimization
**Created**: January 20, 2026

---

## Executive Summary

This plan consolidates all prerequisites, context, recommendations, and tasks from reference files (samp.txt, Prompts.prompt.txt, recommendations-list.md, sample.txt) into **14 actionable phases**. The ComicWise project has solid infrastructure (auth, database schema, stores, admin panels, 70+ scripts); this plan focuses on:

1. **Consolidating configuration** into [SetupPrompt.md](SetupPrompt.md)
2. **Creating/validating VS Code setup** (.vscode/* files + CLI verification)
3. **Optimizing root configs** (next.config.ts, tsconfig.json, package.json, etc.) per Next.js 16 best practices
4. **Finalizing environment setup** (.env.local + env.ts + appConfig.ts)
5. **Completing database seeding** with dynamic JSON loading, image caching, Zod validation
6. **Building user-facing pages** (profiles, comics listing, chapter reader, bookmarks)
7. **Creating form infrastructure** (generic components + auth/admin forms + Zod schemas)
8. **Setting up state management** (Zustand stores with persistence)
9. **Building unified CLI tool** (dev, database, testing, deployment, maintenance commands)
10. **Fixing all type/lint errors** (pnpm type-check + pnpm lint:fix)
11. **Verifying & documenting** (validation suite, final checklist)

**All code** includes comprehensive JSDoc comments on functions, interfaces, types, modules, classes, components, and routes.

---

## Phase 1: Consolidate SetupPrompt.md

### Objective
Create a master [SetupPrompt.md](SetupPrompt.md) document containing all prerequisites, context, phases, tasks, and recommendations from reference files.

### Inputs
- [samp.txt](samp.txt) — Next.js 16 setup guide
- [Prompts.prompt.txt](Prompts.prompt.txt) — Setup prompts & initial config tasks
- [recommendations-list.md](recommendations-list.md) — Comprehensive infrastructure & feature recommendations (537 lines)
- [sample.txt](sample.txt) — Optimized setup guide v3.0.0 (1362 lines)
- All existing .md/.txt files in root

### Outputs
- **[SetupPrompt.md](SetupPrompt.md)** (2000+ lines) with:
  - Prerequisites & system requirements
  - Tech stack overview
  - 16-phase implementation guide with tasks & subtasks
  - All recommendations (HIGH, MEDIUM, LOW priority)
  - Configuration file checklists
  - Database & seeding instructions
  - Testing & CI/CD guidelines
  - All JSDoc formatting examples

### Pseudo-Code
```typescript
/**
 * Generate master SetupPrompt.md by:
 * 1. Extract all prerequisites from samp.txt, sample.txt
 * 2. Extract all recommendations from recommendations-list.md (HIGH/MEDIUM/LOW priority)
 * 3. Extract all tasks/prompts from Prompts.prompt.txt
 * 4. Structure as 16 phases with clear objectives, inputs, outputs, and success criteria
 * 5. Add JSDoc comment examples for all code sections
 * 6. Include quick reference checklists for each phase
 */
```

---

## Phase 2: Create & Validate .vscode Configuration Suite

### Objective
Build/optimize 5 VS Code configuration files + verification script to enable AI development, debugging, and MCP server integration.

### Outputs

#### 2.1 [.vscode/mcp.json](.vscode/mcp.json)
- Configurations for: **This Project (ComicWise), Next.js, TypeScript, PostgreSQL, Redis, AI development**
- MCP servers: Postgres adapter, Redis client, TypeScript language server
- Model configurations: Claude Haiku 4.5 for code, GPT-4 for planning
- Tool definitions: Git, file ops, database queries, seeding
- Example:
```json
{
  "mcpServers": {
    "postgres": {
      "command": "node",
      "args": ["./scripts/mcp/postgres-mcp-server.ts"],
      "env": {
        "DATABASE_URL": "${env:DATABASE_URL}",
        "LOG_LEVEL": "debug"
      },
      "disabled": false
    },
    "redis": {
      "command": "node",
      "args": ["./scripts/mcp/redis-mcp-server.ts"],
      "env": {
        "REDIS_URL": "${env:REDIS_URL}"
      }
    }
  },
  "aiSettings": {
    "model": "claude-haiku-4.5",
    "temperature": 0.5,
    "maxTokens": 4096,
    "codegenModel": "gpt-4",
    "planningModel": "claude-opus"
  }
}
```

#### 2.2 [.vscode/extensions.json](.vscode/extensions.json)
- **Recommended extensions** for ComicWise (Next.js, TypeScript, PostgreSQL, Redis, AI):
  - GitHub Copilot + Copilot Chat
  - ESLint, Prettier, TypeScript Vue Plugin
  - PostgreSQL, Thunder Client / REST Client
  - Redis Explorer
  - Playwright Test for VS Code
  - Tailwind CSS IntelliSense
  - prisma / Drizzle ORM support
  - Thunder Client (API testing)
  - Postman (API documentation)

#### 2.3 [.vscode/launch.json](.vscode/launch.json)
- Debug configurations for:
  - **Next.js Application** (with TypeScript source maps)
  - **Node.js Server** (API routes, server actions)
  - **Playwright E2E Tests**
  - **PostgreSQL Debugger** (via psql integration)
  - **Redis Debugger** (via redis-cli)
- Example:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Playwright Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/playwright",
      "args": ["test", "--debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

#### 2.4 [.vscode/tasks.json](.vscode/tasks.json)
- Build, test, deploy tasks for Next.js + TypeScript + PostgreSQL + Redis + AI:
  - `pnpm dev` — Development server
  - `pnpm build` — Production build
  - `pnpm type-check` — TypeScript validation
  - `pnpm lint:fix` — Linting
  - `pnpm test:unit:run` — Unit tests
  - `pnpm test` — E2E tests
  - `pnpm db:push` — Database schema sync
  - `pnpm db:seed` — Database seeding
  - `pnpm validate` — Full CI check

#### 2.5 [.vscode/settings.json](.vscode/settings.json)
- Workspace settings optimized for ComicWise:
  - TypeScript strict mode
  - ESLint + Prettier auto-fix on save
  - Tailwind CSS IntelliSense
  - Path aliases for autocompletion
  - Redis connection settings
  - PostgreSQL formatting
  - Vitest + Playwright integration
  - Editor settings: tab size (2), trim whitespace, end-of-line LF
  - AI settings: GitHub Copilot context length, model selection

#### 2.6 [scripts/verify-mcp-setup.ts](scripts/verify-mcp-setup.ts)
- **Verification Script** to:
  - Check MCP servers startup (Postgres, Redis)
  - Validate database connections
  - Verify Redis connectivity
  - Test VS Code Cli integration
  - Report all MCP server statuses
- Example pseudo-code:
```typescript
/**
 * Verify all MCP servers are correctly configured and running
 * - Check Postgres adapter connection
 * - Check Redis client connection
 * - Validate environment variables
 * - Test VS Code CLI availability
 * - Return status report with green/red indicators
 */
async function verifymcpSetup() {
  const checks = [
    checkPostgres(),
    checkRedis(),
    checkEnvironment(),
    checkVSCodeCli()
  ];
  const results = await Promise.all(checks);
  return generateReport(results);
}
```

#### 2.7 [scripts/start-mcp-servers.sh](scripts/start-mcp-servers.sh) + [scripts/start-mcp-servers.ps1](scripts/start-mcp-servers.ps1)
- **Platform-specific scripts** to start all MCP servers
- Bash version (Linux/macOS) + PowerShell version (Windows)

---

## Phase 3: Optimize Root Configuration Files

### Objective
Review and enhance all root configuration files per Next.js 16 best practices.

### Files to Create/Optimize

#### 3.1 [next.config.ts](next.config.ts)
- ✅ **Existing**: React Compiler enabled, Turbopack caching
- **Enhancements**:
  - Optimize redirects & rewrites for API routes
  - Configure image optimization (next/image)
  - Add security headers (CSP, X-Frame-Options)
  - Enable experimental features (ppr, dynamicIO)
  - Configure bundleAnalyzer for performance insights
  - Add module aliases validation

#### 3.2 [tsconfig.json](tsconfig.json)
- ✅ **Existing**: Strict mode, 20+ path aliases
- **Enhancements**:
  - Verify `skipLibCheck: true` for faster builds
  - Validate `moduleResolution: "bundler"` for Next.js
  - Check `resolveJsonModule: true` for JSON imports
  - Ensure `noUnusedLocals: true` and `noUnusedParameters: true`

#### 3.3 [package.json](package.json)
- ✅ **Existing**: 100+ scripts, all dependencies
- **Enhancements**:
  - Verify all dependencies are pinned to stable versions
  - Add `pnpm audit` script
  - Add `pnpm why <package>` for dependency analysis
  - Validate all 100+ scripts are documented in [PACKAGE_SCRIPTS_DOCUMENTATION.md](PACKAGE_SCRIPTS_DOCUMENTATION.md)
  - Ensure pnpm v9+ is specified in `engines`

#### 3.4 [postcss.config.mjs](postcss.config.mjs)
- ✅ **Existing**: Tailwind CSS 4.1 configured
- **Enhancements**:
  - Ensure `cssnano` plugin for production builds
  - Verify autoprefixer configuration
  - Validate Tailwind CSS v4 nesting support

#### 3.5 [eslint.config.ts](eslint.config.ts)
- ✅ **Existing**: TypeScript/React rules
- **Enhancements**:
  - Add Next.js plugin rules
  - Configure JSDoc validation rules
  - Add accessibility (a11y) rules
  - Ensure type-aware linting

#### 3.6 [.prettierrc.ts](.prettierrc.ts)
- **Create/Optimize**:
  - Semicolons: true
  - Trailing commas: "all"
  - Print width: 100
  - Arrow parens: "always"
  - JSX quote props: "as-needed"

#### 3.7 [.prettierignore](.prettierignore)
- **Ensure ignores**: node_modules, .next, dist, build, .env*, *.lock, seed data files

#### 3.8 [.gitignore](.gitignore)
- ✅ **Existing**: Comprehensive (190 lines)
- **Verify**: All generated files (.next, dist), environment files, seed caches, image caches

#### 3.9 [.dockerignore](.dockerignore)
- ✅ **Existing**: Docker build exclusions
- **Verify**: Excludes pnpm-lock.yaml, .git, tests, docs

---

## Phase 4: Finalize Environment Configuration

### Objective
Create comprehensive environment setup (.env.local, src/lib/env.ts, appConfig.ts) with all production-ready variables and proper imports across project.

### Outputs

#### 4.1 [.env.local](.env.local)
- **Create/Update** with all server-side variables:
  - **Database**: DATABASE_URL, NEON_DATABASE_URL
  - **Auth**: AUTH_SECRET, AUTH_TRUST_HOST, GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET
  - **Email**: RESEND_API_KEY, EMAIL_FROM, SMTP_HOST/PORT/USER/PASSWORD
  - **Redis**: REDIS_URL, REDIS_HOST/PORT/PASSWORD/DB/TLS_ENABLED, UPSTASH_REDIS_REST_URL/TOKEN
  - **Storage**: IMAGEKIT_*, CLOUDINARY_*, AWS_S3_*
  - **Seed**: CUSTOM_PASSWORD
  - **Build**: NODE_ENV, PORT, LOG_LEVEL, DEBUG, VERBOSE_LOGGING
  - **Cache**: CACHE_ENABLED, CACHE_TTL, CACHE_MAX_SIZE, CACHE_PREFIX
  - **Queue**: QUEUE_ENABLED, QUEUE_CONCURRENCY, QUEUE_MAX_RETRIES

#### 4.2 [src/lib/env.ts](src/lib/env.ts)
- ✅ **Existing**: T3 Env validation (226 lines)
- **Ensure**:
  - All server variables are defined
  - All client variables (NEXT_PUBLIC_*) are defined
  - All validation is strict (Zod)
  - Helper functions exist: isEnvSet(), isProduction(), isDevelopment(), isTest()
  - No direct `process.env` references outside this file

#### 4.3 [appConfig.ts](appConfig.ts) [UPDATE]
- ✅ **Existing**: (286 lines)
- **Modifications**:
  - Import ALL variables from `src/lib/env.ts` instead of direct process.env
  - Export as immutable objects
  - Add JSDoc for all config objects
  - Verify all config is used across project
  - Update imports in all files that currently use it

#### 4.4 Verify Imports Across Project
- **Search** for all usages of `process.env` (should find 0 outside src/lib/env.ts)
- **Search** for all imports of `appConfig` (should use `import { env } from "@/lib/env"` instead)
- **Update** any files still using old patterns

### Pseudo-Code (env.ts structure)
```typescript
/**
 * src/lib/env.ts - Environment variable validation using T3 Env + Zod
 *
 * Server-side variables (DATABASE_URL, AUTH_SECRET, etc.)
 * Client-side variables (NEXT_PUBLIC_* prefixed)
 * Validation ensures all required variables are set at build/runtime
 *
 * Export:
 * - env object with all typed variables
 * - Helper functions: isEnvSet(), isProduction(), isDevelopment(), isTest()
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    REDIS_URL: z.string().url().optional(),
    // ... all server vars
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    // ... all client vars
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    // ...
  },
});

export const isProduction = () => process.env.NODE_ENV === "production";
export const isDevelopment = () => process.env.NODE_ENV === "development";
export const isTest = () => process.env.NODE_ENV === "test";
```

---

## Phase 5: Optimize Database Seeding System

### Objective
Refactor [src/database/seed/](src/database/seed/) to dynamically load JSON files, validate data with Zod, cache/download images, encrypt passwords, and provide comprehensive logging.

### Inputs
- [users.json](users.json)
- [comics.json](comics.json)
- [comicsdata1.json](comicsdata1.json)
- [comicsdata2.json](comicsdata2.json)
- [chapters.json](chapters.json)
- [chaptersdata1.json](chaptersdata1.json)
- [chaptersdata2.json](chaptersdata2.json)

### Outputs

#### 5.1 [src/database/seed/schemas.ts](src/database/seed/schemas.ts) [UPDATE]
- **Zod schemas** for all entity types:
  - UserSeedSchema, ComicSeedSchema, ChapterSeedSchema, etc.
  - Validation on load, with clear error messages

#### 5.2 [src/database/seed/imageManager.ts](src/database/seed/imageManager.ts)
- **Image download & cache manager**:
```typescript
/**
 * ImageManager - Handles image downloading and caching for seed data
 *
 * Features:
 * - Check if image already exists in filesystem or database before downloading
 * - Download images only once
 * - Save with original filename + extension
 * - Fallback to placeholder if download fails
 * - Generate thumbnails (if needed)
 * - Log all operations
 *
 * Methods:
 * - downloadComicCover(url: string, slug: string): Promise<string> — Save to public/comics/covers/${slug}/
 * - downloadChapterImage(url: string, slug: string, chapterNumber: number): Promise<string> — Save to public/comics/chapters/${slug}/${chapterNumber}/
 * - downloadUserAvatar(url: string, userId: string): Promise<string> — Save to public/users/${userId}/
 * - checkImageExists(path: string, url: string): Promise<boolean>
 * - getPlaceholder(type: 'comic' | 'chapter' | 'user'): string
 */
export class ImageManager {
  async downloadComicCover(url: string, comicSlug: string): Promise<string> {
    // Implementation
  }

  async downloadChapterImage(
    url: string,
    comicSlug: string,
    chapterNumber: number
  ): Promise<string> {
    // Implementation
  }
}
```

#### 5.3 [src/database/seed/helpers/passwordEncryption.ts](src/database/seed/helpers/passwordEncryption.ts)
- **Password encryption helper**:
```typescript
/**
 * Encrypt user password using bcryptjs
 * - Use CUSTOM_PASSWORD env var if provided
 * - Apply bcryptjs with salt rounds 10
 *
 * @param password - Plain text password (or env var)
 * @returns Promise<string> — Encrypted hash
 */
import bcryptjs from "bcryptjs";

export async function encryptPassword(password?: string): Promise<string> {
  const pwd = password || process.env.CUSTOM_PASSWORD || "default_password";
  return bcryptjs.hash(pwd, 10);
}
```

#### 5.4 [src/database/seed/helpers/dataLoader.ts](src/database/seed/helpers/dataLoader.ts) [UPDATE]
- **Dynamic JSON file loader**:
```typescript
/**
 * Load seed data from JSON files dynamically
 *
 * @param filePattern - Glob pattern (e.g., 'users.json', 'comics*.json')
 * @returns Promise<T[]> — Merged array of all matching files
 *
 * Features:
 * - Merge multiple files (comics.json + comicsdata1.json + comicsdata2.json)
 * - Deduplicate by ID or slug
 * - Validate with Zod schema
 * - Log stats: loaded X from Y files
 */
export async function loadSeedData<T>(
  filePattern: string,
  schema: z.ZodSchema
): Promise<T[]> {
  // Implementation
}
```

#### 5.5 [src/database/seed/seeders/userSeeder.ts](src/database/seed/seeders/userSeeder.ts) [UPDATE]
- **User seeding with enhancements**:
```typescript
/**
 * Seed users from users.json
 *
 * Process:
 * 1. Load users.json with loadSeedData()
 * 2. Validate each user with UserSeedSchema
 * 3. Encrypt password with encryptPassword()
 * 4. Download avatar image with ImageManager
 * 5. Insert with onConflictDoUpdate (upsert by email)
 * 6. Log: Inserted X new, Updated Y existing, Failed Z
 *
 * @returns Promise<{ inserted: number; updated: number; failed: number }>
 */
export async function seedUsers(): Promise<SeedResult> {
  // Implementation
}
```

#### 5.6 [src/database/seed/seeders/comicSeeder.ts](src/database/seed/seeders/comicSeeder.ts) [UPDATE]
- **Comic seeding with image handling**:
```typescript
/**
 * Seed comics from comics.json + comicsdata*.json
 *
 * Process:
 * 1. Load all comic files with loadSeedData()
 * 2. Merge duplicates by slug
 * 3. Download covers to public/comics/covers/${slug}/ using ImageManager
 * 4. Validate with ComicSeedSchema
 * 5. Insert with onConflictDoUpdate (upsert by slug)
 * 6. Log: Downloaded X images, Inserted Y, Updated Z
 *
 * @returns Promise<{ inserted: number; updated: number; imagesDownloaded: number; failed: number }>
 */
export async function seedComics(): Promise<SeedResult> {
  // Implementation
}
```

#### 5.7 [src/database/seed/seeders/chapterSeeder.ts](src/database/seed/seeders/chapterSeeder.ts) [UPDATE]
- **Chapter seeding with image gallery**:
```typescript
/**
 * Seed chapters from chapters.json + chaptersdata*.json
 *
 * Process:
 * 1. Load all chapter files with loadSeedData()
 * 2. For each chapter, download all image URLs
 * 3. Save to public/comics/chapters/${comic.slug}/${chapter.slug}/
 * 4. Validate with ChapterSeedSchema
 * 5. Insert with onConflictDoUpdate (upsert by comicId + number)
 * 6. Log: Downloaded X image galleries, Inserted Y, Updated Z
 *
 * @returns Promise<{ inserted: number; updated: number; imagesDownloaded: number; failed: number }>
 */
export async function seedChapters(): Promise<SeedResult> {
  // Implementation
}
```

#### 5.8 [src/database/seed/run.ts](src/database/seed/run.ts) [UPDATE]
- **Main seeding orchestrator with logging**:
```typescript
/**
 * Orchestrate all seeding operations
 *
 * Process:
 * 1. Connect to database
 * 2. Run seeders in sequence: users → comics → chapters → genres → etc.
 * 3. Log all operations with timestamps
 * 4. Track success/fail counts
 * 5. Report final summary
 *
 * Logging:
 * - [INFO] Starting seed process
 * - [LOAD] Loading 150 users from users.json
 * - [VALIDATE] Validating 150 users
 * - [INSERT] Inserted 150 users (100 new, 50 updated, 0 failed)
 * - [IMAGES] Downloaded 30 comic covers to public/comics/covers/
 * - [COMPLETE] Seed completed in 45.2s
 *
 * @returns Promise<SeedSummary>
 */
export async function runSeed(): Promise<SeedSummary> {
  // Implementation
}
```

#### 5.9 [src/database/seed/types.ts](src/database/seed/types.ts) [CREATE]
- **Type definitions**:
```typescript
/**
 * Seed data types and result interfaces
 */

interface SeedResult {
  inserted: number;
  updated: number;
  failed: number;
  duration: number; // ms
}

interface ImageDownloadResult {
  url: string;
  localPath: string;
  size: number; // bytes
  duration: number; // ms
}

interface SeedSummary {
  users: SeedResult;
  comics: SeedResult & { imagesDownloaded: number };
  chapters: SeedResult & { imagesDownloaded: number };
  genres: SeedResult;
  authors: SeedResult;
  artists: SeedResult;
  totalDuration: number;
  status: "success" | "partial_failure" | "failed";
}
```

---

## Phase 6: Implement User-Facing Pages

### Objective
Create all user-facing pages with responsive design, 3D Cards, carousels, and proper state management integration.

### 6.1 Profile Pages: [src/app/(root)/profile/](src/app/(root)/profile/)

#### Pages to Create:
```
src/app/(root)/profile/
├── page.tsx                  # View profile (read-only)
├── layout.tsx                # Shared layout
├── edit/
│   ├── page.tsx             # Edit profile form
│   └── layout.tsx
├── password/
│   ├── page.tsx             # Change password form
│   └── layout.tsx
└── settings/
    ├── page.tsx             # User settings (theme, notifications)
    └── layout.tsx
```

#### Components:

**[src/components/profile/ProfileCard.tsx](src/components/profile/ProfileCard.tsx)**
```typescript
/**
 * ProfileCard - Display user profile information
 *
 * Props:
 * - user: User object
 * - isOwner: boolean (show edit button if owner)
 *
 * Features:
 * - Avatar image with fallback
 * - User bio, email, role
 * - Stats: Comics read, Bookmarks, Comments
 * - Join date
 * - Edit button (if owner)
 */
export function ProfileCard({ user, isOwner }: ProfileCardProps) {
  // Implementation with shadcn/ui Card component
}
```

**[src/components/profile/EditProfileForm.tsx](src/components/profile/EditProfileForm.tsx)**
```typescript
/**
 * EditProfileForm - Form to edit user profile
 *
 * Form Fields:
 * - Full name
 * - Bio (textarea)
 * - Avatar (file upload)
 * - Email (read-only display)
 *
 * Validation: Zod schema (ProfileUpdateSchema)
 * Integration: React Hook Form + Server Action
 */
```

**[src/components/profile/ChangePasswordForm.tsx](src/components/profile/ChangePasswordForm.tsx)**
```typescript
/**
 * ChangePasswordForm - Form to change password
 *
 * Form Fields:
 * - Current password
 * - New password
 * - Confirm new password
 *
 * Validation:
 * - Current password must be correct
 * - New password requirements (8+ chars, uppercase, numbers)
 * - Passwords must match
 */
```

**[src/components/profile/UserSettings.tsx](src/components/profile/UserSettings.tsx)**
```typescript
/**
 * UserSettings - User preference settings
 *
 * Settings:
 * - Theme (light/dark/auto)
 * - Email notifications (bookmarks, new chapters, comments)
 * - Privacy (profile visibility, read history)
 *
 * Integration: useUiStore() for theme, useAuthStore() for settings
 */
```

### 6.2 Comics Listing: [src/app/(root)/comics/](src/app/(root)/comics/)

```
src/app/(root)/comics/
├── page.tsx                 # Comics listing with filters
├── layout.tsx
└── components/
    ├── ComicCard.tsx        # 3D card component (shadows, hover effects)
    ├── ComicsGrid.tsx       # Responsive grid layout
    ├── FilterSidebar.tsx    # Filter panel (status, genre, rating)
    ├── SortDropdown.tsx     # Sort by (popularity, newest, rating, A-Z)
    └── SearchBar.tsx        # Search by title/author
```

**[src/components/comics/ComicCard.tsx](src/components/comics/ComicCard.tsx) - 3D Card**
```typescript
/**
 * ComicCard - 3D card display for comics
 *
 * Features:
 * - 3D perspective transform (hover effect)
 * - Cover image with shadow
 * - Title, author, rating
 * - Status badge (Ongoing, Completed, etc.)
 * - Quick actions: View, Bookmark
 * - Responsive: Stack on mobile, grid on desktop
 *
 * Props:
 * - comic: Comic object
 * - onBookmark?: () => void
 *
 * Uses: Tailwind CSS transforms, group-hover states
 */
export function ComicCard({ comic, onBookmark }: ComicCardProps) {
  // Implementation with 3D perspective
}
```

**[src/components/comics/ComicsGrid.tsx](src/components/comics/ComicsGrid.tsx)**
```typescript
/**
 * ComicsGrid - Responsive grid of ComicCard components
 *
 * Props:
 * - comics: Comic[]
 * - isLoading: boolean
 * - onBookmark: (comicId: string) => void
 *
 * Features:
 * - Responsive columns: 1 (mobile), 2 (tablet), 3-4 (desktop)
 * - Loading skeleton
 * - Empty state
 */
```

**[src/components/comics/FilterSidebar.tsx](src/components/comics/FilterSidebar.tsx)**
```typescript
/**
 * FilterSidebar - Filterable options for comics
 *
 * Filters:
 * - Status (Ongoing, Completed, Dropped, Hiatus)
 * - Genre (multi-select checkboxes)
 * - Rating (slider 1-5)
 * - Sort by (popularity, newest, rating, A-Z)
 *
 * Integration: useComicStore() for filter state
 * Update URL search params on filter change (SSR-friendly)
 */
```

**[src/app/(root)/comics/page.tsx](src/app/(root)/comics/page.tsx)**
```typescript
/**
 * Comics Listing Page
 *
 * Server Component:
 * - Fetch comics from database based on filters
 * - Pass to client components
 *
 * URL Params:
 * - ?status=Ongoing&genre=Action&sort=popularity
 *
 * Render:
 * - SearchBar + FilterSidebar (client)
 * - ComicsGrid (client) with fetched data
 */
```

### 6.3 Comic Details: [src/app/(root)/comics/[slug]/](src/app/(root)/comics/[slug]/)

```
src/app/(root)/comics/[slug]/
├── page.tsx                 # Comic detail page
├── layout.tsx
└── components/
    ├── ComicHeader.tsx      # Cover + Title + Rating
    ├── ComicInfo.tsx        # Author, Genre, Status, Description
    ├── ChaptersCarousel.tsx # Carousel of latest chapters
    ├── AddBookmarkButton.tsx
    └── RemoveBookmarkButton.tsx
```

**[src/components/comics/ComicHeader.tsx](src/components/comics/ComicHeader.tsx)**
```typescript
/**
 * ComicHeader - Display comic cover and basic info
 *
 * Props:
 * - comic: Comic
 * - isBookmarked: boolean
 *
 * Features:
 * - Cover image (large)
 * - Title
 * - Author name
 * - Rating stars
 * - Bookmark button (toggle add/remove)
 */
```

**[src/components/comics/ChaptersCarousel.tsx](src/components/comics/ChaptersCarousel.tsx)**
```typescript
/**
 * ChaptersCarousel - Carousel of latest chapters
 *
 * Features:
 * - Swipeable carousel (Embla Carousel or Swiper)
 * - Chapter number, title, release date
 * - Click to navigate to chapter reader
 * - Show 3-4 chapters at a time
 */
```

**[src/components/comics/AddBookmarkButton.tsx](src/components/comics/AddBookmarkButton.tsx)**
```typescript
/**
 * AddBookmarkButton - Button to add comic to bookmarks
 *
 * Action:
 * - Call server action: addBookmark(comicId)
 * - Update bookmarkStore
 * - Show toast notification
 * - Change button state to "Added"
 */
```

**[src/components/comics/RemoveBookmarkButton.tsx](src/components/comics/RemoveBookmarkButton.tsx)**
```typescript
/**
 * RemoveBookmarkButton - Button to remove from bookmarks
 *
 * Action:
 * - Call server action: removeBookmark(comicId)
 * - Update bookmarkStore
 * - Show toast notification
 * - Change button state to "Add to Bookmarks"
 */
```

**[src/app/(root)/comics/[slug]/page.tsx](src/app/(root)/comics/[slug]/page.tsx)**
```typescript
/**
 * Comic Detail Page
 *
 * Params:
 * - slug: string (comic slug)
 *
 * Server Component:
 * - Fetch comic details from DB
 * - Fetch chapters for this comic
 * - Check if user has bookmarked (from session)
 *
 * Render:
 * - ComicHeader
 * - ComicInfo (description, genres, author)
 * - ChaptersCarousel
 * - "Start Reading" button → navigate to first chapter
 */
```

### 6.4 Chapter Reader: [src/app/(root)/comics/[slug]/[chapterNumber]/](src/app/(root)/comics/[slug]/[chapterNumber]/)

```
src/app/(root)/comics/[slug]/[chapterNumber]/
├── page.tsx                 # Chapter reader page
├── layout.tsx
└── components/
    ├── ImageGallery.tsx     # Full-page image gallery
    ├── ReaderNav.tsx        # Next/Previous chapter buttons
    ├── ChapterInfo.tsx      # Title, release date, author notes
    ├── CommentsSection.tsx  # Comments on chapter
    └── ReaderSettings.tsx   # Page scroll vs click navigation
```

**[src/components/reader/ImageGallery.tsx](src/components/reader/ImageGallery.tsx)**
```typescript
/**
 * ImageGallery - Display chapter images in full-page gallery
 *
 * Props:
 * - images: string[] (image URLs)
 * - chapterTitle: string
 *
 * Features:
 * - Full-page image display
 * - Swipe/arrow key navigation
 * - Zoom in/out (pinch on mobile)
 * - Thumbnail preview strip at bottom
 * - Share image button
 * - Download image button (if enabled)
 *
 * Library: Lightbox or react-medium-image-zoom
 */
```

**[src/components/reader/ReaderNav.tsx](src/components/reader/ReaderNav.tsx)**
```typescript
/**
 * ReaderNav - Navigation between chapters
 *
 * Components:
 * - Previous Chapter button
 * - Chapter selector dropdown
 * - Next Chapter button
 * - Go to Comics button
 *
 * Features:
 * - Prefetch next/previous chapter
 * - Keyboard shortcuts (← →)
 */
```

**[src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx](src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx)**
```typescript
/**
 * Chapter Reader Page
 *
 * Params:
 * - slug: string (comic slug)
 * - chapterNumber: number (chapter number)
 *
 * Server Component:
 * - Fetch comic + chapter from DB
 * - Fetch chapter images from public/comics/chapters/${slug}/${chapterNumber}/
 * - Fetch next/previous chapters for navigation
 * - Update user reading history (server action)
 *
 * Render:
 * - ChapterInfo (header)
 * - ImageGallery (main content)
 * - ReaderNav (footer)
 * - CommentsSection (below)
 */
```

### 6.5 Bookmarks: [src/app/(root)/bookmarks/](src/app/(root)/bookmarks/)

```
src/app/(root)/bookmarks/
├── page.tsx                 # Bookmarks listing
├── layout.tsx
└── components/
    ├── BookmarkItem.tsx     # Individual bookmark row
    ├── BookmarksList.tsx    # List view
    └── RemoveBookmarkButton.tsx
```

**[src/components/bookmarks/BookmarkItem.tsx](src/components/bookmarks/BookmarkItem.tsx)**
```typescript
/**
 * BookmarkItem - Single bookmark in list
 *
 * Display:
 * - Comic cover thumbnail
 * - Comic title
 * - Author
 * - Last read chapter
 * - Last read date
 * - Remove button
 *
 * Actions:
 * - Click to view comic
 * - Click "Continue Reading" to go to last chapter
 * - Click "Remove" to delete bookmark
 */
```

**[src/app/(root)/bookmarks/page.tsx](src/app/(root)/bookmarks/page.tsx)**
```typescript
/**
 * Bookmarks Page
 *
 * Server Component:
 * - Fetch user's bookmarks from DB
 * - Show empty state if no bookmarks
 *
 * Client Render:
 * - BookmarksList with all bookmarks
 * - Each BookmarkItem with remove action
 * - Integration with bookmarkStore
 */
```

---

## Phase 7: Build Form Infrastructure

### Objective
Create generic, reusable form components + auth/admin forms with Zod validation + React Hook Form integration.

### 7.1 Generic Form Components: [src/components/shared/form/](src/components/shared/form/)

**[src/components/shared/form/FormField.tsx](src/components/shared/form/FormField.tsx)**
```typescript
/**
 * FormField - Wrapper for controlled form inputs (uses React Hook Form Controller)
 *
 * Props:
 * - control: Control (from useForm)
 * - name: string (field name)
 * - render: (field: ControllerRenderProps) => ReactNode
 * - rules?: Partial<RegisterOptions>
 *
 * Usage:
 * <FormField
 *   control={control}
 *   name="email"
 *   rules={{ required: "Email is required" }}
 *   render={({ field }) => <input {...field} />}
 * />
 */
export function FormField<T>({ control, name, render, rules }: FormFieldProps<T>) {
  // Implementation
}
```

**[src/components/shared/form/FormInput.tsx](src/components/shared/form/FormInput.tsx)**
```typescript
/**
 * FormInput - Controlled text input with error display
 *
 * Props:
 * - field: ControllerRenderProps
 * - label?: string
 * - placeholder?: string
 * - type?: "text" | "email" | "password" | "number"
 * - error?: FieldError
 * - helperText?: string
 *
 * Features:
 * - Label + input + error message
 * - Clear error styling
 * - Icon support (email, password icons)
 */
```

**[src/components/shared/form/FormSelect.tsx](src/components/shared/form/FormSelect.tsx)**
```typescript
/**
 * FormSelect - Controlled select dropdown
 *
 * Props:
 * - field: ControllerRenderProps
 * - label?: string
 * - options: Array<{ value: string; label: string }>
 * - placeholder?: string
 * - error?: FieldError
 */
```

**[src/components/shared/form/FormCheckbox.tsx](src/components/shared/form/FormCheckbox.tsx)**
```typescript
/**
 * FormCheckbox - Controlled checkbox
 *
 * Props:
 * - field: ControllerRenderProps
 * - label: string
 * - helperText?: string
 */
```

**[src/components/shared/form/FormTextarea.tsx](src/components/shared/form/FormTextarea.tsx)**
```typescript
/**
 * FormTextarea - Controlled textarea
 *
 * Props:
 * - field: ControllerRenderProps
 * - label: string
 * - placeholder?: string
 * - rows?: number
 * - error?: FieldError
 */
```

**[src/components/shared/form/FormFileUpload.tsx](src/components/shared/form/FormFileUpload.tsx)**
```typescript
/**
 * FormFileUpload - Controlled file input with preview
 *
 * Props:
 * - field: ControllerRenderProps
 * - label: string
 * - accept?: string (e.g., "image/*")
 * - maxSize?: number (bytes)
 * - error?: FieldError
 *
 * Features:
 * - Image preview
 * - File size validation
 * - Drag & drop support
 */
```

### 7.2 Authentication Forms: [src/app/(auth)/](src/app/(auth)/)

**[src/lib/validations/authSchemas.ts](src/lib/validations/authSchemas.ts)**
```typescript
/**
 * Authentication Zod schemas
 */

export const signUpSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Password must be 8+ chars")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});
```

**[src/app/(auth)/sign-up/SignUpForm.tsx](src/app/(auth)/sign-up/SignUpForm.tsx)**
```typescript
/**
 * SignUpForm - User registration form
 *
 * Form Fields:
 * - Email (FormInput type="email")
 * - Password (FormInput type="password")
 * - Confirm Password (FormInput type="password")
 *
 * Validation: signUpSchema
 * Action: signUpAction (server action)
 *
 * Features:
 * - Password strength indicator
 * - Show/hide password toggle
 * - Submit button with loading state
 * - Link to sign-in page
 * - Display errors from server action
 */
export function SignUpForm() {
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: SignUpFormData) {
    const result = await signUpAction(data);
    if (!result.success) {
      toast.error(result.message);
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

**[src/app/(auth)/sign-in/SignInForm.tsx](src/app/(auth)/sign-in/SignInForm.tsx)**
```typescript
/**
 * SignInForm - User login form
 *
 * Form Fields:
 * - Email (FormInput type="email")
 * - Password (FormInput type="password")
 * - Remember me (FormCheckbox)
 *
 * Validation: signInSchema
 * Action: signInAction (server action)
 *
 * OAuth:
 * - Sign in with Google button
 * - Sign in with GitHub button
 */
```

**[src/lib/actions/auth.ts](src/lib/actions/auth.ts)**
```typescript
/**
 * Server Actions for authentication
 */

/**
 * Sign up action
 *
 * @param data - { email, password }
 * @returns ActionResult<{ user: User }>
 *
 * Process:
 * 1. Validate input with signUpSchema
 * 2. Check if user already exists
 * 3. Hash password with bcryptjs
 * 4. Create user in database
 * 5. Send verification email
 * 6. Return success or error
 */
export async function signUpAction(
  data: SignUpFormData
): Promise<ActionResult<{ user: User }>> {
  try {
    const validated = signUpSchema.parse(data);
    // Implementation
  } catch (err) {
    return error("Sign up failed");
  }
}

/**
 * Sign in action
 *
 * @param data - { email, password }
 * @returns ActionResult<{ user: User }>
 */
export async function signInAction(
  data: SignInFormData
): Promise<ActionResult<{ user: User }>> {
  // Implementation
}
```

### 7.3 Admin Forms: [src/app/admin/](src/app/admin/)

**Generic admin form structure for all CRUD operations**:

```
src/app/admin/
├── users/
│   ├── page.tsx           # Users list
│   ├── [id]/
│   │   ├── page.tsx       # User detail (read-only)
│   │   └── edit.tsx       # User edit form
│   └── new.tsx            # Create new user form
├── comics/
│   ├── page.tsx           # Comics list
│   ├── [id]/edit.tsx      # Edit comic
│   └── new.tsx            # Create comic
├── chapters/
├── genres/
├── authors/
└── artists/
```

**[src/app/admin/comics/new/AdminComicForm.tsx](src/app/admin/comics/new/AdminComicForm.tsx)**
```typescript
/**
 * AdminComicForm - Generic form for creating/editing comics
 *
 * Form Fields:
 * - Title (FormInput)
 * - Slug (FormInput, auto-generated from title)
 * - Description (FormTextarea)
 * - Cover image (FormFileUpload)
 * - Status (FormSelect: Ongoing, Completed, etc.)
 * - Genres (FormCheckbox, multi-select)
 * - Author (FormSelect, searchable)
 * - Artists (FormCheckbox, multi-select)
 *
 * Validation: comicAdminSchema (Zod)
 * Action: createComicAction or updateComicAction
 */
```

---

## Phase 8: Configure Zustand State Management

### Objective
Ensure all Zustand stores are properly configured with persistence and hydration.

### Outputs

#### 8.1 [src/stores/authStore.ts](src/stores/authStore.ts)
```typescript
/**
 * Auth Store - User authentication state
 *
 * State:
 * - user: User | null
 * - session: Session | null
 * - isAuthenticated: boolean
 * - isLoading: boolean
 *
 * Actions:
 * - setUser(user: User)
 * - setSession(session: Session)
 * - logout()
 * - resetAuth()
 *
 * Persistence:
 * - Persist to localStorage (exclude sensitive data)
 * - Hydrate on app startup
 *
 * @example
 * const { user, logout } = useAuthStore();
 */
export const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      logout: () => set({ user: null, session: null, isAuthenticated: false }),
    }),
    { name: "auth-store" }
  )
);
```

#### 8.2 [src/stores/bookmarkStore.ts](src/stores/bookmarkStore.ts)
```typescript
/**
 * Bookmark Store - User's bookmarked comics
 *
 * State:
 * - bookmarks: Comic[] | ComicId[]
 * - isLoading: boolean
 * - lastUpdated: Date
 *
 * Actions:
 * - addBookmark(comic: Comic)
 * - removeBookmark(comicId: string)
 * - setBookmarks(bookmarks: Comic[])
 * - isBookmarked(comicId: string): boolean
 *
 * Persistence:
 * - Persist to localStorage
 * - Sync from server on auth
 */
```

#### 8.3 [src/stores/comicStore.ts](src/stores/comicStore.ts)
```typescript
/**
 * Comic Store - Comics listing & filtering state
 *
 * State:
 * - comics: Comic[]
 * - filters: { status?, genre?, sort?, search? }
 * - page: number
 * - pageSize: number
 * - total: number
 * - isLoading: boolean
 *
 * Actions:
 * - setComics(comics: Comic[])
 * - setFilter(key: string, value: any)
 * - clearFilters()
 * - setPage(page: number)
 * - setSort(sort: SortOption)
 *
 * Computed:
 * - filteredComics: Comic[]
 * - totalPages: number
 */
```

#### 8.4 [src/stores/uiStore.ts](src/stores/uiStore.ts)
```typescript
/**
 * UI Store - UI state (theme, modals, sidebar)
 *
 * State:
 * - theme: "light" | "dark" | "auto"
 * - sidebarOpen: boolean
 * - modals: Record<string, boolean>
 *
 * Actions:
 * - setTheme(theme)
 * - toggleSidebar()
 * - openModal(name: string)
 * - closeModal(name: string)
 *
 * Persistence:
 * - Persist theme to localStorage
 */
```

#### 8.5 [src/stores/readerStore.ts](src/stores/readerStore.ts)
```typescript
/**
 * Reader Store - Chapter reader state
 *
 * State:
 * - currentComic: Comic | null
 * - currentChapter: Chapter | null
 * - readingHistory: { comicId, chapterId, timestamp }[]
 * - scrollMode: "scroll" | "click"
 *
 * Actions:
 * - setCurrentComic(comic: Comic)
 * - setCurrentChapter(chapter: Chapter)
 * - addToReadingHistory(...)
 * - setScrollMode(mode)
 */
```

#### 8.6 [src/stores/notificationStore.ts](src/stores/notificationStore.ts)
```typescript
/**
 * Notification Store - Toast/notification state
 *
 * State:
 * - notifications: Notification[]
 *
 * Actions:
 * - addNotification(message, type, duration)
 * - removeNotification(id)
 */
```

#### 8.7 [src/stores/index.ts](src/stores/index.ts)
```typescript
/**
 * Export all stores
 */
export { useAuthStore } from "./authStore";
export { useBookmarkStore } from "./bookmarkStore";
export { useComicStore } from "./comicStore";
export { useReaderStore } from "./readerStore";
export { useNotificationStore } from "./notificationStore";
export { useUiStore } from "./uiStore";
```

---

## Phase 9: Build Unified CLI Tool

### Objective
Create a comprehensive CLI for managing all ComicWise development, database, testing, and deployment operations.

### Outputs

#### 9.1 [scripts/cli.ts](scripts/cli.ts) or [scripts/cw/index.ts](scripts/cw/index.ts)
```typescript
/**
 * ComicWise CLI - Unified command-line interface
 *
 * Usage:
 * $ pnpm cw <command> [options]
 * $ cw dev
 * $ cw db:seed
 * $ cw test:run
 * $ cw build:prod
 *
 * Commands:
 * - dev                    Start development server
 * - build                  Build for production
 * - type-check             Run TypeScript type checking
 * - lint:fix               Fix linting issues
 * - format                 Format code with Prettier
 * - test:unit              Run unit tests (Vitest)
 * - test:e2e               Run E2E tests (Playwright)
 * - db:push                Apply schema changes
 * - db:seed                Seed database
 * - db:reset               Reset database
 * - db:studio              Open Drizzle Studio
 * - cache:clear            Clear Redis cache
 * - validate               Run full CI checks
 * - generate:dto           Generate DTOs from schema
 * - scaffold:page          Create new page structure
 * - scaffold:component     Create new component
 * - deploy:vercel          Deploy to Vercel
 *
 * @example
 * $ pnpm cw dev
 * $ pnpm cw db:seed --reset
 * $ pnpm cw test:e2e --headless
 * $ pnpm cw scaffold:page --name=new-feature
 */

import { Command } from "commander";

const program = new Command();

program
  .name("cw")
  .description("ComicWise CLI - Development, database, and deployment")
  .version("1.0.0");

program
  .command("dev")
  .description("Start development server")
  .action(async () => {
    // Run: pnpm dev
  });

program
  .command("db:seed")
  .description("Seed database from JSON files")
  .option("--reset", "Reset database before seeding")
  .action(async (options) => {
    // Run seed with optional reset
  });

program
  .command("scaffold:page")
  .description("Create new page with boilerplate")
  .option("--name <name>", "Page name")
  .action(async (options) => {
    // Generate page structure
  });

program.parse(process.argv);
```

#### 9.2 [scripts/cw/commands/dev.ts](scripts/cw/commands/dev.ts)
```typescript
/**
 * Dev command - Start development server
 *
 * Runs:
 * - pnpm dev (Next.js dev server)
 * - Optional: Start Redis, PostgreSQL containers
 *
 * Features:
 * - Watch for file changes
 * - Hot reload
 * - Display logs with timestamps
 */
```

#### 9.3 [scripts/cw/commands/scaffold.ts](scripts/cw/commands/scaffold.ts)
```typescript
/**
 * Scaffold commands - Generate boilerplate code
 *
 * $ cw scaffold:page --name=user-profile
 * Creates:
 * - src/app/(root)/user-profile/page.tsx
 * - src/app/(root)/user-profile/layout.tsx
 * - src/components/user-profile/UserProfileCard.tsx
 * - src/stores/userProfileStore.ts (if needed)
 *
 * $ cw scaffold:component --name=UserAvatar
 * Creates:
 * - src/components/shared/UserAvatar.tsx
 * - src/components/shared/__tests__/UserAvatar.test.ts
 *
 * Boilerplate includes:
 * - JSDoc comments
 * - TypeScript types
 * - Props interface
 * - Example usage
 */
```

#### 9.4 [scripts/cw/templates/](scripts/cw/templates/)
```
scripts/cw/templates/
├── page.template.tsx      # Next.js page boilerplate
├── component.template.tsx # React component boilerplate
├── store.template.ts      # Zustand store boilerplate
├── action.template.ts     # Server action boilerplate
├── schema.template.ts     # Zod schema boilerplate
└── test.template.ts       # Vitest test boilerplate
```

---

## Phase 10: Fix All Type & Lint Errors

### Objective
Run full validation suite and fix all remaining TypeScript and ESLint issues.

### Steps

1. **Type Check**:
   ```bash
   pnpm type-check
   ```
   - Fix all TypeScript errors
   - Remove `@ts-ignore` comments
   - Replace `unknown` types with proper types
   - Ensure all function parameters have type annotations

2. **Lint Fix**:
   ```bash
   pnpm lint:fix
   ```
   - Fix all ESLint violations
   - Ensure all imports are sorted
   - Remove unused variables
   - Ensure all exports are documented with JSDoc

3. **Format**:
   ```bash
   pnpm format
   ```
   - Run Prettier on all files
   - Ensure consistent formatting

4. **Verify**:
   ```bash
   pnpm validate
   ```
   - Run all checks together
   - Confirm no errors remain

### JSDoc Standards

All functions, classes, interfaces, and components must have JSDoc comments:

```typescript
/**
 * Brief description of what this function does
 *
 * Longer explanation if needed. Can span multiple lines.
 * Describe the algorithm or key behaviors.
 *
 * @param paramName - Description of parameter
 * @param anotherParam - Description with type info
 * @returns Description of return value
 *
 * @example
 * const result = myFunction("input");
 * console.log(result); // Output: ...
 *
 * @throws Error if X condition
 *
 * @see {@link relatedFunction} for similar functionality
 */
export function myFunction(paramName: string): string {
  // Implementation
}
```

---

## Phase 11: Complete Optimized Setup

### Objective
Run full validation, database seeding, and verify all systems are operational.

### Steps

1. **Verify Environment**:
   - Check NODE_ENV is set
   - Verify DATABASE_URL is accessible
   - Verify REDIS_URL is accessible (if configured)
   - Check all required env vars are set

2. **Database Setup**:
   ```bash
   pnpm db:push            # Apply schema
   pnpm db:seed            # Seed with sample data
   pnpm db:studio          # Verify data in Drizzle Studio
   ```

3. **Run Tests**:
   ```bash
   pnpm test:unit:run      # Unit tests
   pnpm test               # E2E tests (if configured)
   ```

4. **Build Verification**:
   ```bash
   pnpm build              # Production build
   pnpm start              # Start production server
   ```

5. **Create Final Checklist**:
   - ✅ All configuration files optimized
   - ✅ Environment variables set
   - ✅ Database seeded
   - ✅ All pages rendering
   - ✅ Auth flow working
   - ✅ Bookmarks functional
   - ✅ Profile pages complete
   - ✅ Comic listing complete
   - ✅ Chapter reader complete
   - ✅ No type errors
   - ✅ No lint errors
   - ✅ Tests passing

---

## Summary of Deliverables

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | [SetupPrompt.md](SetupPrompt.md) — Master setup guide | Create |
| 2 | .vscode/* config files + verification script | Create/Optimize |
| 3 | Root config files (next.config.ts, tsconfig.json, etc.) | Optimize |
| 4 | .env.local + src/lib/env.ts + appConfig.ts | Finalize |
| 5 | Database seeding system + image management | Refactor |
| 6 | User-facing pages (profiles, comics, chapters, bookmarks) | Create |
| 7 | Form components + auth/admin forms | Create |
| 8 | Zustand stores with persistence | Configure |
| 9 | Unified CLI tool with scaffolds | Create |
| 10 | Fix all type/lint errors | Execute |
| 11 | Complete validation & verification | Execute |

---

## Success Criteria

- ✅ All 14 phases completed
- ✅ 0 TypeScript errors
- ✅ 0 ESLint violations
- ✅ All pages rendering correctly
- ✅ Database seeding working with JSON files + image caching
- ✅ User auth, profiles, comics listing, chapter reader all functional
- ✅ Bookmarks add/remove working
- ✅ All code documented with JSDoc
- ✅ CLI tool fully operational
- ✅ Full test suite passing (unit + E2E)
- ✅ Project ready for deployment

---

## Notes

- **Reference Files**: All content from samp.txt, Prompts.prompt.txt, recommendations-list.md, sample.txt is integrated into SetupPrompt.md
- **Code Quality**: All code includes comprehensive JSDoc comments
- **Best Practices**: All implementations follow Next.js 16, TypeScript 5, and React 19 best practices
- **DRY Principle**: Reusable components, stores, and utilities to minimize code duplication
- **State Management**: Zustand for client-side, NextAuth + Redis for server-side
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **CI/CD**: Configure GitHub Actions for automated testing and deployment
- **Monitoring**: Add Sentry for error tracking, LogRocket for session replay (optional)
- **Performance**: Implement Next.js Image Optimization, dynamic imports, code splitting
- **SEO**: Add metadata, Open Graph tags, structured data (optional)

---

**This plan is ready for implementation. All phases are actionable and specific.**
