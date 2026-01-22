# ComicWise - GitHub Copilot Setup Prompts

> **Version**: 2.0.0 **Updated**: January 22, 2026 **Package Manager**: pnpm
> **Framework**: Next.js 16 (App Router, React 19, Turbopack) **Platform**:
> Windows (PowerShell)

---

## 📋 Prerequisites & Context

### Project Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Cache**: Redis (Upstash), ioredis
- **Auth**: NextAuth.js v5
- **Image Storage**: ImageKit CDN
- **Validation**: Zod schemas
- **State Management**: Zustand
- **Testing**: Vitest (unit), Playwright (E2E)

### Global Rules (Apply to ALL tasks)

1. **DRY Principle**: No code duplication - create reusable utilities
2. **Type Safety**: Strict TypeScript, no `any` types in source code
3. **Performance**: Optimize for Core Web Vitals and bundle size
4. **Logging**: Comprehensive structured logging with Pino
5. **Error Handling**: Try-catch with proper error messages
6. **Validation**: Zod schemas for all input validation
7. **Path Aliases**: Use configured aliases (never relative paths)
8. **JSDoc**: Document all functions, interfaces, types, classes
9. **Backup**: Copy existing files to `.backup` before modifications
10. **PowerShell**: All scripts use PowerShell syntax

### Path Aliases Reference

```typescript
import { db } from "db"; // Database client
import { auth } from "auth"; // NextAuth session
import { env } from "env"; // T3 Env validation
import { SomeComponent } from "components/ui/some-component";
import { someAction } from "actions/some-action";
import { someDal } from "dal/someDal";
import { SomeDto } from "dto"; // All DTOs
import { Comic } from "types"; // Database types
```

---

## 🎯 Prompt Templates (Reusable)

### Template 1: VSCode Configuration

```prompt
Create/modify `.vscode/{filename}` for ComicWise with:
- Next.js 16 App Router support
- TypeScript strict mode
- PostgreSQL/Drizzle integration
- Redis caching support
- AI development tools
- Production + development configs
- All recommended extensions enabled

Follow: Latest VSCode best practices, performance optimization
Validate: Configuration syntax and compatibility
Document: All settings with inline comments
```

### Template 2: Next.js Configuration

```prompt
Optimize `{filename}` for Next.js 16 with:
- App Router best practices
- Turbopack configuration
- Production optimizations
- Type safety enhancements
- Performance metrics
- Security headers
- Environment variable handling

Follow: Next.js 16 documentation, React 19 patterns
Validate: Build success and type checking
Document: All options with JSDoc comments
```

### Template 3: Database Operations

```prompt
Create DAL function at `src/dal/{entityName}Dal.ts`:
- Extend BaseDal singleton pattern
- Use Drizzle ORM with type safety
- Implement CRUD operations
- Add Redis caching layer
- Comprehensive error handling
- Structured logging with Pino
- Zod validation on inputs

Import from: "dal/{entityName}Dal"
Export: Singleton instance
Document: All methods with JSDoc
Test: Create unit tests in `__tests__/dal/`
```

### Template 4: Server Actions

````prompt
Create server action at `src/lib/actions/{actionName}.ts`:
- "use server" directive first line
- Import ActionResult<T> from "dto"
- Zod schema validation
- Error handling with try-catch
- User session validation with auth()
- Return type: Promise<ActionResult<T>>
- Logging with context

Pattern:
```typescript
"use server";
import type { ActionResult } from "@/dto";
import { z } from "zod";

const schema = z.object({ /* ... */ });

export async function myAction(input: unknown): Promise<ActionResult<T>> {
  try {
    const validated = schema.parse(input);
    // Logic
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
````

````

### Template 5: React Components
```prompt
Create React component at `src/components/{path}/{ComponentName}.tsx`:
- Use "use client" if interactive
- TypeScript interface for props
- Import from path aliases
- Shadcn/ui components
- Responsive design (mobile-first)
- Accessibility (ARIA labels)
- Error boundaries
- Loading states

Follow: React 19 patterns, Next.js best practices
Style: TailwindCSS with cn() utility
Document: Component purpose and props with JSDoc
````

---

## 📦 Phase 1: Development Environment

### Task 1: MCP Configuration

```prompt
Create `.vscode/mcp.json` with MCP servers for:
- GitHub integration
- PostgreSQL queries
- Redis operations
- Browser automation
- Documentation lookup

Create PowerShell script `scripts/verify-and-start-mcp-servers.ps1`:
- Check VSCode CLI availability
- Verify MCP server configs
- Start all servers
- Log status to console
- Support --DryRun flag

Use: Template 1 (VSCode Configuration)
```

### Task 2: VSCode Extensions

```prompt
Create `.vscode/extensions.json` with recommended extensions:
- ESLint, Prettier, TypeScript
- Next.js, React, TailwindCSS
- Database tools (PostgreSQL, Redis)
- Testing tools (Vitest, Playwright)
- AI assistants (GitHub Copilot)

Create PowerShell script `scripts/verify-and-install-vscode-extensions.ps1`:
- Check extension installation
- Install missing extensions via code CLI
- Log installation progress
- Support --DryRun flag

Use: Template 1 (VSCode Configuration)
```

### Tasks 3-5: VSCode Settings

```prompt
Apply Template 1 to create/optimize:
- `.vscode/launch.json` - Debug configs (Next.js, Node, Edge runtime)
- `.vscode/tasks.json` - Build/test/deploy tasks with problem matchers
- `.vscode/settings.json` - Editor settings, formatters, linters

Ensure: All extensions configured, paths use workspace-relative
```

---

## 📦 Phase 2: Project Configuration

### Tasks 6-15: Config Files Optimization

```prompt
Apply Template 2 to optimize these files:

**Next.js Configs**:
- `next.config.ts` - Turbopack, image optimization, env vars
- `nextSitemap.config.ts` - Dynamic sitemap generation

**Build Tools**:
- `package.json` - Scripts organization, dependency audit
- `tsconfig.json` - Strict mode, path aliases verification
- `postcss.config.mjs` - TailwindCSS optimization
- `eslint.config.ts` - Flat config, Next.js rules, kebab-case
- `.prettierrc.ts` - Code formatting standards

**Ignore Files**:
- `.gitignore` - Build artifacts, env files, logs
- `.dockerignore` - Node modules, .git, .next
- `.prettierignore` - Generated files, third-party code

Validate each: Lint, format, type-check
Document: All custom configurations
```

### Task 16: Environment Variables

````prompt
Create comprehensive environment setup:

1. **`.env.local`** - All environment variables with examples
2. **`src/lib/env.ts`** - T3 Env validation with Zod schemas
3. **`appConfig.ts`** - Typed config object using env()

Variables to include:
- Database: DATABASE_URL, DATABASE_AUTH_TOKEN
- Redis: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- Auth: NEXTAUTH_SECRET, NEXTAUTH_URL, OAuth providers
- Storage: IMAGEKIT_* credentials
- Custom: CUSTOM_PASSWORD for seeding

Pattern:
```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: { /* server vars */ },
  client: { /* client vars */ },
  runtimeEnv: { /* process.env mapping */ },
});
````

Update: All files using process.env to use env() Validate: Build succeeds with
env validation

````

---

## 📦 Phase 3: Database Seeding (Ultra-Optimized)

### Task 17: V4 Seeding System Enhancement
```prompt
Create production-ready seeding system at `src/database/seed/`:

**Architecture**:
- Main runner: `seedRunnerV4Enhanced.ts`
- Entity seeders: `seeders/{entity}SeederV4.ts`
- Image handler: `imageHandlerOptimized.ts`
- Validation: `helpers/validationSchemas.ts`
- Password: `helpers/passwordHasher.ts`

**Features**:
1. **Dynamic JSON Loading**:
   - Load from: users.json, comics.json, comicsdata1/2.json, chapters.json, chaptersdata1/2.json
   - Zod validation for all data
   - Deduplication by unique fields

2. **Image Handling** (3-layer cache):
   - Session cache (in-memory)
   - Filesystem cache (check before download)
   - Remote download (with retry logic)
   - Hash-based deduplication
   - Comics: `/public/comics/covers/${slug}/`
   - Chapters: `/public/comics/chapters/${comic.slug}/${chapter.slug}/`
   - Fallback: `/placeholder-comic.jpg`, `/shadcn.jpg`

3. **Database Operations**:
   - Use onConflictDoUpdate (upsert pattern)
   - Transaction support for consistency
   - Foreign key validation
   - Batch processing with rate limiting

4. **Password Security**:
   - Use env.CUSTOM_PASSWORD
   - Bcrypt hashing with salt rounds
   - Validate strength before hashing

5. **Logging**:
   - Structured logs with Pino
   - Operation tracking (created/updated/skipped/errors)
   - Progress indicators
   - Final summary report

**CLI Flags**:
- `--dry-run` - Preview without DB changes
- `--verbose` - Detailed logging
- `--users` - Seed users only
- `--comics` - Seed comics only
- `--chapters` - Seed chapters only
- `--continue-on-error` - Don't stop on errors

**Backup**: Copy existing seed/ to seed.backup.{timestamp}/
**Update**: API route at `src/app/api/seed/route.ts`
**Test**: Validate with `pnpm db:seed --dry-run --verbose`
````

---

## 📦 Phase 4: Frontend Pages

### Template: Page Creation

```prompt
For page at `{path}`:
- Server Component by default
- Client Component only if interactive
- Suspense boundaries with Loading UI
- Error boundaries with error.tsx
- Metadata export for SEO
- Type-safe data fetching
- Responsive design
- Accessibility compliant

Use components: 3D Cards, Carousels, Accordions (shadcn/ui)
State management: Zustand stores
Forms: React Hook Form + Zod
Actions: Server actions with validation
```

### Tasks 18-25: Page Implementation

```prompt
Apply Template (Page Creation) to:

**Root Pages** (`src/app/(root)/`):
- `page.tsx` - Homepage with 3D cards, featured comics
- `about/page.tsx` - About page with accordion
- `contact/page.tsx` - Contact form

**Auth Pages** (`src/app/(auth)/`):
- `sign-in/page.tsx` - Login form (email/password, OAuth)
- `sign-up/page.tsx` - Registration form
- `forgot-password/page.tsx` - Password reset
- Components: `components/auth/AuthForm.tsx` (generic)
- Actions: `lib/actions/auth.ts`
- Schemas: Define in action files

**Admin Pages** (`src/app/admin/`):
- `page.tsx` - Dashboard overview
- `comics/page.tsx` - Comics CRUD table
- `comics/[id]/page.tsx` - Edit comic form
- `chapters/page.tsx` - Chapters CRUD table
- `users/page.tsx` - User management
- `authors/page.tsx`, `artists/page.tsx`, `genres/page.tsx`, `types/page.tsx`
- Components: `components/admin/GenericForm.tsx`, `components/admin/DataTable.tsx`
- Actions: CRUD actions per entity in `lib/actions/admin/`
- Use: React Hook Form + Zod for all forms

**User Features**:
- `bookmarks/page.tsx` - Bookmarked comics grid
- `profile/page.tsx` - User profile with edit form
- `profile/settings/page.tsx` - Account settings

**Comic Pages**:
- `comics/page.tsx` - Comics grid with filters (3D cards)
- `comics/[slug]/page.tsx` - Comic details + chapters list
  - Add bookmark action
  - Remove bookmark action
  - Chapter navigation
- `comics/[slug]/[chapterNumber]/page.tsx` - Chapter reader
  - Image gallery (use react-image-gallery or swiper)
  - Navigation (prev/next)
  - Progress tracking

Ensure: All pages use DAL layer, not direct DB queries
```

---

## 📦 Phase 5: State Management

### Task 26: Zustand Stores

````prompt
Create Zustand stores at `src/stores/`:

**Required Stores**:
1. **bookmarkStore.ts** - Bookmark management
   - State: bookmarks (Comic[]), isLoading
   - Actions: addBookmark, removeBookmark, loadBookmarks
   - Persist: localStorage

2. **themeStore.ts** - Theme management
   - State: theme ("light" | "dark" | "system")
   - Actions: setTheme, toggleTheme
   - Persist: localStorage

3. **readingProgressStore.ts** - Reading history
   - State: progress (Map<comicId, { chapter, page }>)
   - Actions: updateProgress, getProgress
   - Persist: localStorage

4. **searchStore.ts** - Search state
   - State: query, filters, results
   - Actions: setQuery, setFilters, clearSearch

Pattern:
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookmarkState {
  bookmarks: Comic[];
  addBookmark: (comic: Comic) => void;
  removeBookmark: (id: number) => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set) => ({
      bookmarks: [],
      addBookmark: (comic) => set((state) => ({
        bookmarks: [...state.bookmarks, comic]
      })),
      removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter(b => b.id !== id)
      })),
    }),
    { name: "bookmarks" }
  )
);
````

Test: Create unit tests for each store Document: State shape and actions

````

---

## 📦 Phase 6: DAL Layer Migration

### Task 27: Query/Mutation Migration
```prompt
Migrate all database operations to DAL layer:

**Step 1**: Identify all direct db.* usage
- Search: `grep -r "from.*database/db" src/`
- Exclude: DAL files, schema definitions

**Step 2**: Create missing DAL classes
- Extend: BaseDal from `src/dal/baseDal.ts`
- Location: `src/dal/{entity}Dal.ts`
- Methods: findById, list, create, update, delete
- Cache: Integrate Redis caching
- Logging: Structured logs

**Step 3**: Migrate queries
- Move: DB queries to `src/database/queries/{entity}.ts`
- Pattern: Pure functions returning query builders
- Use in: DAL classes

**Step 4**: Migrate mutations
- Move: DB mutations to `src/database/mutations/{entity}.ts`
- Pattern: Functions with validation + error handling
- Use in: DAL classes, server actions

**Step 5**: Update imports
- Replace: Direct db imports with DAL imports
- Pattern: `import { comicDal } from "dal/comicDal"`
- Verify: No direct database imports remain

**Step 6**: Delete old files
- Remove: Unused query/mutation files
- Remove: Deprecated helper functions
- Verify: No broken imports

Test: All CRUD operations work
Document: DAL architecture in README
````

---

## 📦 Phase 7: Code Refactoring

### Task 28: Project Structure Optimization

```prompt
Refactor project structure using ts-morph:

**Actions**:
1. Remove duplicate code (use created tools)
2. Organize imports (group by source)
3. Extract shared utilities
4. Consolidate type definitions
5. Remove unused files/folders

**Tools to use**:
- `pnpm refactor:duplicates` - Find duplicates
- `pnpm refactor:unused-deps` - Find unused packages
- AST manipulation with ts-morph for safe refactoring

Document: Changes in migration log
Validate: `pnpm type-check` passes
```

### Task 29: Enhanced CLI System

```prompt
Extend `scripts/cli.ts` with comprehensive commands:

**Command Groups**:
1. **Database**: generate, migrate, push, studio, seed, reset
2. **Development**: dev, build, start, type-check, lint, format
3. **Testing**: test, test:unit, test:e2e, test:coverage
4. **Deployment**: deploy, deploy:preview, deploy:prod
5. **Maintenance**: cleanup, cache:clear, health
6. **Scaffolding**: scaffold (component, action, hook, store, dal)

**Features**:
- Interactive prompts (inquirer)
- Progress spinners (ora)
- Colored output (chalk)
- Error handling
- Help documentation
- Dry-run support

Entry point: `pnpm cw <command>`
Document: All commands in README
```

### Task 30: Type Safety Audit

```prompt
Convert all `any` types to specific types:

**Scan**: `grep -r ": any" src/ --include="*.ts" --include="*.tsx"`
**Exclude**: .d.ts files (acceptable for type definitions)

**Strategy**:
1. Infer type from usage context
2. Create generic type if multiple uses
3. Use unknown + type guards if truly dynamic
4. Document why type is needed

**Fix all errors**:
- Run: `pnpm type-check`
- Run: `pnpm lint:strict`
- Fix: All TypeScript errors
- Fix: All ESLint warnings

Validate: Zero errors in source code
Document: Complex type decisions
```

### Tasks 31-32: Cleanup Scripts

```prompt
Use created tools:

**Duplicates** (`pnpm refactor:duplicates:cleanup`):
- Remove duplicate Zod schemas
- Remove duplicate components
- Remove duplicate functions
- Remove empty folders
- Remove blank files
- Remove .backup files

**Unused Dependencies** (`pnpm refactor:unused-deps`):
- Analyze all imports
- Generate removal scripts
- Review before running
- Uninstall with pnpm

Backup: Create git commit before cleanup
Validate: Build succeeds after cleanup
```

### Task 33: Import Optimization

```prompt
Verify and optimize all imports:

**Step 1**: Verify path aliases in tsconfig.json
- Check all 30+ aliases configured
- Add missing aliases if needed

**Step 2**: Run import checker
- Execute: `pnpm imports:check`
- Fix: Any reported issues

**Step 3**: Optimize imports
- Execute: `pnpm imports:optimize`
- Verify: No broken imports

**Step 4**: Update scripts/replaceImportsEnhanced.ts
- Ensure: Handles all path aliases
- Add: Any new import patterns

Validate: `pnpm type-check` passes
Test: Run a dev build
```

### Tasks 34-35: Code Standards

```prompt
Apply kebab-case convention:

**ESLint Config**:
- Update: `eslint.config.ts`
- Add: naming-convention rules for kebab-case
- Exclude: React components (PascalCase)

**File Conversion**:
- Use: `pnpm refactor:kebab` (dry-run first)
- Convert: All filenames to kebab-case
- Update: All imports automatically
- Preserve: Component names in PascalCase

**Cleanup Documentation**:
- Update: `scripts/cleanup.ts`
- Add: Logic to delete unused .md/.txt/.log files
- Preserve: README.md, LICENSE, CHANGELOG.md
- Execute: `pnpm cleanup:docs`

Validate: All imports work, build succeeds
```

---

## 📦 Phase 8: Final Validation

### Task 36: Error Resolution

```prompt
Run validation and fix all issues:

**Step 1**: Quick validation
- Execute: `pnpm validate:quick`
- Output: Save to validation-errors.txt

**Step 2**: Categorize errors
- TypeScript errors
- ESLint warnings
- Format issues

**Step 3**: Fix systematically
- Start: TypeScript errors (blocking)
- Then: ESLint warnings
- Finally: Format with Prettier

**Step 4**: Verify fixes
- Execute: `pnpm validate:quick` again
- Confirm: Zero errors
- Document: Any deferred fixes (test files)

Target: 0 errors in source code
```

### Task 37: Production Build

```prompt
Verify production build:

**Prerequisites**: `pnpm validate:quick` must pass

**Build Steps**:
1. Clean: `pnpm clean`
2. Build: `pnpm build`
3. Analyze: Check bundle size
4. Test: `pnpm start` (production mode)

**Success Criteria**:
- Build completes without errors
- All pages compile successfully
- Bundle size is optimized
- No runtime errors in production

**If errors**:
- Document error messages
- Fix issues
- Rebuild and validate

Document: Build output and metrics
```

### Task 38: Recommendations Implementation

```prompt
Analyze project and implement improvements:

**Categories**:
1. **Performance**: Bundle size, lazy loading, caching
2. **Security**: Input validation, CSRF protection, rate limiting
3. **SEO**: Metadata, structured data, sitemaps
4. **Accessibility**: ARIA labels, keyboard navigation, contrast
5. **Developer Experience**: Documentation, scripts, tooling
6. **Code Quality**: Test coverage, error handling, logging

**Process**:
1. Run: `@workspace /explain` to analyze
2. Prioritize: High-impact improvements
3. Implement: Top 10 recommendations
4. Test: Verify improvements
5. Document: Changes in RECOMMENDATIONS.md

Validate: All improvements tested
Measure: Performance impact
```

---

## 🎯 Execution Checklist

### Before Starting

- [ ] Read all project files for context
- [ ] Understand existing architecture
- [ ] Backup database and critical files
- [ ] Create git branch for changes
- [ ] Confirm all permissions granted

### During Implementation

- [ ] Follow DRY principles (no duplication)
- [ ] Use path aliases (no relative imports)
- [ ] Add comprehensive JSDoc comments
- [ ] Include error handling in all functions
- [ ] Log all operations with context
- [ ] Validate inputs with Zod schemas
- [ ] Test each change before proceeding

### After Each Phase

- [ ] Run type-check: `pnpm type-check`
- [ ] Run linter: `pnpm lint`
- [ ] Format code: `pnpm format`
- [ ] Test functionality
- [ ] Git commit with clear message
- [ ] Update documentation

### Final Validation

- [ ] All tasks complete (1-38)
- [ ] Zero TypeScript errors in source
- [ ] Successful production build
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Performance metrics recorded
- [ ] Security audit complete
- [ ] Accessibility verified

---

## 📚 Reference Documentation

### Key Files

- **Architecture**: `.github/copilot-instructions.md`
- **Seeding**: `src/database/seed/README.md`
- **DTOs**: `SERVER_ACTIONS_DTO_INDEX.md`
- **Scripts**: `PACKAGE_SCRIPTS_DOCUMENTATION.md`
- **Quick Start**: `QUICK_START.md`

### Commands Reference

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm type-check            # Type checking

# Quality
pnpm validate              # Full validation
pnpm lint:fix              # Fix lint issues
pnpm format                # Format code

# Database
pnpm db:push               # Push schema
pnpm db:seed               # Seed data
pnpm db:studio             # Open Drizzle Studio

# Refactoring
pnpm refactor:duplicates   # Find duplicates
pnpm refactor:kebab        # Kebab-case conversion
pnpm refactor:unused-deps  # Find unused packages

# Cleanup
pnpm cleanup               # Full cleanup
pnpm cleanup:docs          # Clean .md/.txt/.log
```

---

## 🎓 Best Practices Summary

### Code Organization

- **One responsibility per file**: Each module does one thing well
- **Layered architecture**: Routes → Actions → DAL → Database
- **Shared utilities**: Extract common logic to lib/utils
- **Type definitions**: Centralize in src/types

### Performance

- **Server Components**: Default for all pages
- **Lazy loading**: Use dynamic imports for heavy components
- **Image optimization**: Use Next.js Image component
- **Caching**: Redis for frequently accessed data
- **Database**: Optimize queries, use indexes

### Security

- **Input validation**: Zod schemas on all inputs
- **Authentication**: Verify session in all actions
- **Authorization**: Check permissions before operations
- **SQL injection**: Use parameterized queries (Drizzle)
- **Environment variables**: Never commit secrets

### Developer Experience

- **Clear errors**: Meaningful error messages
- **Comprehensive logs**: Track all operations
- **Type safety**: Strict TypeScript everywhere
- **Documentation**: JSDoc on all public APIs
- **Testing**: Unit tests for critical paths

---

**End of Prompts** | **Ready for GitHub Copilot** ✅
