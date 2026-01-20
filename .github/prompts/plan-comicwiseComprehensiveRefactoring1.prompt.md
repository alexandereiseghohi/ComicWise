# Comprehensive Execution Prompt: ComicWise 14-Task Refactoring

**Created**: January 20, 2026
**Version**: 1.0
**Status**: Ready for Execution
**Executor**: AI Coding Agent

---

## Preamble

This is a comprehensive, step-by-step prompt to execute all **14 tasks** of the ComicWise refactoring plan. The total scope encompasses:

- **56 new files** (components, pages, services, scripts)
- **600+ targeted edits** across the codebase
- **40+ obsolete files** for deletion
- **Total implementation time**: 125-155 hours
- **Quality gates**: All files must pass type-check, lint, and test validation

This prompt is designed for an AI coding agent with full file access to execute changes incrementally, validate at each phase, and ensure production-readiness throughout.

---

## Context & Prerequisites

### Project Reference
- **Repository**: IMPLEMENTATION-CHANGES.md
- **Technology Stack**: Next.js 16, TypeScript 5, Drizzle ORM, Zustand, Tailwind CSS 4.1
- **Testing Frameworks**: Vitest (unit), Playwright (E2E)
- **Database**: PostgreSQL 16 with Drizzle migrations

### Path Aliases (Required for All Imports)
```typescript
@/           → src/
@/appConfig  → src/lib/env.ts (environment validation)
db/          → src/database/db.ts
database/    → src/database/
components/  → src/components/
actions/     → src/lib/actions/
stores/      → src/stores/
mutations/   → src/database/mutations/
queries/     → src/database/queries/
```

### Tools & Commands
```bash
# Development
pnpm dev                    # Start dev server (hot reload)
pnpm build                  # Production build

# Validation
pnpm type-check            # TypeScript validation (MUST PASS)
pnpm lint                  # ESLint validation (MUST PASS)
pnpm format:check          # Code formatting check
pnpm validate              # Full validation suite

# Database
pnpm db:push               # Apply schema migrations
pnpm db:seed               # Run database seed
pnpm db:seed:dry-run       # Validate seed without DB changes
pnpm db:studio             # Open Drizzle Studio (web UI)

# Testing
pnpm test                  # E2E tests (Playwright)
pnpm test:ui               # Interactive Playwright UI
pnpm test:unit:run         # Unit tests (Vitest)

# Git
git add .                  # Stage changes
git commit -m "Task N: ..." # Commit (required after each task)
git status                 # Check git state
```

---

## Execution Model

### Before Starting Each Task
1. **Read** the task description below
2. **Verify** prerequisites are complete
3. **Run validation**: `pnpm type-check && pnpm lint`
4. **Create a git branch** (optional): `git checkout -b task/N-title`

### During Each Task
1. **Create files** in exact paths specified
2. **Edit files** with changes described
3. **Delete files** if applicable
4. **Use path aliases** for all imports
5. **Follow code patterns** (JSDoc, error handling, type safety)
6. **Run incremental validation** after major changes

### After Completing Each Task
1. **Validate**: `pnpm type-check && pnpm lint && pnpm build`
2. **Test**: `pnpm test:unit:run` (if applicable)
3. **Commit**: `git add . && git commit -m "Task N: <Title>"`
4. **Verify**: `git status` shows clean working directory
5. **Proceed** to next task only if validation passes

---

## Phase-by-Phase Implementation

---

## PHASE 1: Seeding System (0.5 hours total)

### Task 1: Production Seed Runner

**Objective**: Fix critical path aliases in seed runner to enable database operations
**Estimated Time**: 0.5 hours
**Prerequisites**: None
**Phase**: Phase 1 (Foundation)

#### Context
The `seedRunnerV4.ts` file currently has incorrect path aliases that prevent it from running. This is a blocker for all database operations in subsequent tasks. Must fix 4 import statements.

#### File 1: Edit `src/database/seed/seedRunnerV4.ts`

**Current Issue**:
```typescript
// WRONG - These paths don't exist
import { db } from "@/database/db";
import { schema } from "@/database/schema";
import { env } from "@/lib/env";
import { cache } from "@/lib/cache";
```

**Required Changes**:
```typescript
// CORRECT - Use established aliases
import { db } from "db";
import * as schema from "database/schema";
import { env } from "@/appConfig";
import { cache } from "lib/cache";
```

**Locations to Change**:
1. Line ~3-6: Update all four import statements
2. Verify no other alias mismatches in the file
3. Check for any `@/database/` patterns and convert to `database/`

#### Validation Steps

```bash
# 1. Type check only
pnpm type-check

# Expected: Zero errors in seedRunnerV4.ts

# 2. Dry-run the seed (no DB changes)
pnpm db:seed:dry-run

# Expected: Script executes without import errors
# May have validation errors if schema changed - that's OK

# 3. Full validation
pnpm type-check && pnpm lint

# Expected: Clean output, zero errors
```

#### Success Criteria
- ✅ `pnpm type-check` passes with zero errors
- ✅ `pnpm db:seed:dry-run` executes without throwing import errors
- ✅ No references to old `@/database/db` pattern remain
- ✅ File compiles successfully
- ✅ `pnpm lint` shows no errors

#### Commit
```bash
git add src/database/seed/seedRunnerV4.ts
git commit -m "Task 1: Production Seed Runner - Fix path aliases (db, database, appConfig, cache)"
```

#### Blocker Resolution
Once Task 1 completes successfully, all subsequent tasks can begin. The seed runner is now ready to support data operations.

---

## PHASE 2A: Page Infrastructure (30-40 hours total)

### Task 2: Root Pages (Browse & Search)

**Objective**: Create page infrastructure for browsing and searching comics
**Estimated Time**: 10-12 hours
**Prerequisites**: Task 1 ✓
**Phase**: Phase 2A (Sequential)

#### Architecture Overview
```
src/app/(root)/
├── browse/page.tsx         # NEW
├── search/page.tsx         # NEW
└── page.tsx               # EDIT - Add featured content

src/components/comics/
├── ComicBrowser.tsx        # NEW - Main component
├── ComicCard.tsx          # EDIT - Enhance
└── Pagination.tsx         # EDIT - Enhance

src/components/shared/
└── SearchAutocomplete.tsx  # NEW - Search input

src/components/comics/
└── FeaturedCarousel.tsx    # NEW - Featured section
```

#### Key Implementation Patterns

**Pattern 1: Client Component with State**
```typescript
"use client";

import { useMemo, useCallback } from "react";
import type { Comic } from "database/schema";

export function ComicBrowser(props: ComicBrowserProps) {
  // Implementation with sorting, filtering, pagination
}
```

**Pattern 2: Server Page**
```typescript
import { Suspense } from "react";
import { getComics } from "@/database/queries/comics";

export const metadata = {
  title: "Browse Comics | ComicWise",
};

export default async function BrowsePage({ searchParams }) {
  const { comics, total } = await getComics({
    page: parseInt(searchParams.page || "1"),
  });

  return <ComicBrowser comics={comics} total={total} />;
}
```

#### Files to Create
1. `src/components/comics/ComicBrowser.tsx` (180-220 lines)
2. `src/components/shared/SearchAutocomplete.tsx` (140-170 lines)
3. `src/components/comics/FeaturedCarousel.tsx` (160-200 lines)
4. `src/app/(root)/browse/page.tsx` (80-120 lines)
5. `src/app/(root)/search/page.tsx` (90-130 lines)

#### Files to Edit
1. `src/app/(root)/page.tsx` - Add FeaturedCarousel (~50-80 lines)
2. `src/components/ui/Pagination.tsx` - Enhance (~40-60 lines)

#### Success Criteria
- ✅ All 5 new files compile without errors
- ✅ ComicBrowser renders comics in responsive grid
- ✅ SearchAutocomplete debounces input (300ms)
- ✅ browse/page.tsx shows pagination
- ✅ search/page.tsx handles query parameter
- ✅ FeaturedCarousel auto-rotates
- ✅ `pnpm type-check` passes
- ✅ `pnpm lint` passes

#### Commit
```bash
git add .
git commit -m "Task 2: Root Pages (Browse & Search) - 5 new components, enhanced pagination"
```

---

### Task 3: Authentication Pages & Components

**Objective**: Create complete authentication flows (sign-in, sign-up, password reset)
**Estimated Time**: 12-15 hours
**Prerequisites**: Task 2 ✓
**Phase**: Phase 2A (Sequential)

#### Files to Create
1. `src/app/(auth)/sign-in/page.tsx` (100-140 lines)
2. `src/app/(auth)/sign-up/page.tsx` (120-160 lines)
3. `src/app/(auth)/forgot-password/page.tsx` (80-110 lines)
4. `src/app/(auth)/reset-password/page.tsx` (100-140 lines)
5. `src/components/auth/OAuthButtons.tsx` (60-90 lines)
6. `src/components/auth/PasswordStrengthMeter.tsx` (70-100 lines)

#### Files to Edit
1. `src/lib/authConfig.ts` - Update callback handlers (~40-60 lines)
2. `src/lib/actions/auth.ts` - Add sign-in, sign-up, password reset actions (~150-200 lines)

#### Key Pattern: Server Action with DTO
```typescript
"use server";

import { ActionResult } from "@/dto";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signInAction(
  input: z.infer<typeof signInSchema>
): Promise<ActionResult<{ user: User }>> {
  try {
    const data = signInSchema.parse(input);
    // Business logic here
    return { success: true, data: { user } };
  } catch (error) {
    return { success: false, message: "Sign-in failed" };
  }
}
```

#### Success Criteria
- ✅ All 4 auth pages render without errors
- ✅ Forms validate with react-hook-form + Zod
- ✅ OAuth buttons integrate with NextAuth
- ✅ Password strength meter updates in real-time
- ✅ Error messages display correctly
- ✅ `pnpm type-check` passes

#### Commit
```bash
git add .
git commit -m "Task 3: Auth Pages & Components - 6 new components, sign-in/up/reset flows"
```

---

### Task 4: Admin Pages & Dashboard

**Objective**: Create complete admin dashboard with CRUD interfaces
**Estimated Time**: 12-15 hours
**Prerequisites**: Task 3 ✓
**Phase**: Phase 2A (Sequential)

#### Files to Create
1. `src/app/admin/page.tsx` (120-160 lines) - Dashboard
2. `src/app/admin/users/page.tsx` (140-180 lines) - User management
3. `src/app/admin/comics/[id]/edit/page.tsx` (150-200 lines) - Comic editor
4. `src/app/admin/chapters/[comicId]/[id]/edit/page.tsx` (160-210 lines) - Chapter editor
5. `src/components/admin/DashboardStats.tsx` (120-160 lines)
6. `src/components/admin/BulkActionsToolbar.tsx` (100-140 lines)
7. `src/components/admin/CrudModal.tsx` (180-220 lines)

#### Files to Edit
1. `src/components/tables/DataTable.tsx` - Add sorting, filtering, selection (~100-150 lines)
2. `src/components/tables/ComicsTable.tsx` - Integrate with DataTable (~80-120 lines)
3. `src/app/admin/layout.tsx` - Add admin navigation (~60-100 lines)
4. `src/lib/actions/admin.ts` - Admin mutations (~200-300 lines)

#### Critical Implementation: DataTable Component

Must support:
- Sorting (click headers)
- Filtering (per-column)
- Pagination
- Row selection
- Bulk actions
- Responsive design

#### Success Criteria
- ✅ Admin dashboard loads with stats
- ✅ DataTable supports sorting on all columns
- ✅ DataTable supports filtering
- ✅ Pagination works correctly
- ✅ Row selection works with bulk actions
- ✅ CRUD modal validates input
- ✅ Admin middleware prevents unauthorized access
- ✅ `pnpm type-check` passes

#### Commit
```bash
git add .
git commit -m "Task 4: Admin Pages & Dashboard - 7 new components, complete CRUD"
```

---

## PHASE 2B: Integration & Medium Components (25-35 hours total)

**Status**: Tasks 5-8 can run in parallel after Task 4 completes

### Task 5: Bookmarks Feature (6-8 hours)

**Files to Create**:
1. `src/app/(root)/bookmarks/page.tsx` (100-130 lines)
2. `src/components/bookmarks/BookmarkFilters.tsx` (80-120 lines)
3. `src/components/bookmarks/BookmarkGridView.tsx` (90-130 lines)
4. `src/components/bookmarks/BookmarkListView.tsx` (100-150 lines)

**Files to Edit**:
1. `src/components/comics/BookmarkButton.tsx` - Add optimistic updates (~30-50 lines)
2. `src/lib/actions/bookmark.ts` - Add toggle action (~40-70 lines)

**Success Criteria**:
- ✅ Bookmarks page renders user's bookmarks
- ✅ Grid/list view toggle works
- ✅ Filter and sort work correctly
- ✅ Bookmark button updates immediately (optimistic)

---

### Task 6: User Profile Pages (8-10 hours)

**Files to Create**:
1. `src/app/(root)/profile/page.tsx` (80-120 lines)
2. `src/app/(root)/profile/edit/page.tsx` (100-140 lines)
3. `src/app/(root)/profile/settings/page.tsx` (90-130 lines)
4. `src/app/(root)/profile/security/page.tsx` (100-150 lines)
5. `src/components/profile/ProfileForm.tsx` (120-160 lines)
6. `src/components/profile/ReadingHistory.tsx` (110-150 lines)

**Files to Edit**:
1. `src/stores/authStore.ts` - Add profile methods (~40-60 lines)
2. `src/lib/actions/users.ts` - Add profile, password actions (~100-150 lines)

---

### Task 7: Comics Listing & Filtering (7-9 hours)

**Files to Create**:
1. `src/app/(root)/comics/page.tsx` (100-140 lines)
2. `src/components/comics/ComicGrid.tsx` (120-160 lines)
3. `src/components/comics/AdvancedFilters.tsx` (140-180 lines)
4. `src/components/comics/SortDropdown.tsx` (60-90 lines)

**Files to Edit**:
1. `src/components/comics/ComicCard.tsx` - Add rating, bookmark indicator (~40-60 lines)
2. `src/lib/validations/comicFilterSchema.ts` - Enhance filter schema (~30-50 lines)
3. `src/database/queries/comics.ts` - Add advanced queries (~100-150 lines)

---

### Task 8: Comic Details & Reader Pages (8-10 hours)

**Files to Create**:
1. `src/app/(root)/comics/[slug]/page.tsx` (120-160 lines)
2. `src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx` (130-180 lines)
3. `src/components/comics/ComicDetailsHeader.tsx` (140-180 lines)
4. `src/components/comics/ChaptersList.tsx` (150-200 lines)
5. `src/components/comics/ImageGallery.tsx` (200-260 lines)
6. `src/components/comics/RelatedComics.tsx` (100-140 lines)
7. `src/components/comics/ComicReviews.tsx` (150-200 lines)

**Files to Edit**:
1. `src/database/queries/comics.ts` - Add related, reviews queries (~80-120 lines)
2. `src/stores/readerStore.ts` - Add progress tracking (~60-90 lines)
3. `src/lib/actions/chapter.ts` - Add review, rate actions (~80-120 lines)

---

## PHASE 3: State Management & Optimization (12-18 hours total)

### Task 9: Chapter Reader Enhancement (6-9 hours)

**Files to Create**:
1. `src/components/reader/ReaderControls.tsx` (150-200 lines)
2. `src/hooks/useChapterReading.ts` (120-170 lines)

**Files to Edit**:
1. `src/components/comics/ImageGallery.tsx` - Integrate ReaderControls (~60-100 lines)
2. `src/stores/readerStore.ts` - Add zoom, view mode, progress (~80-120 lines)

**Features**:
- Zoom in/out controls
- Fit options (width, height, page)
- Page navigation
- Keyboard shortcuts
- Chapter navigation

---

### Task 10: Zustand Store Consolidation (6-9 hours)

**Files to Edit**:
1. `src/stores/authStore.ts` - Finalize auth state (~80-120 lines)
2. `src/stores/comicStore.ts` - Add pagination, filters (~100-150 lines)
3. `src/stores/bookmarkStore.ts` - Add sync, optimistic updates (~70-100 lines)
4. `src/stores/readerStore.ts` - Finalize reader state (~80-120 lines)
5. `src/stores/uiStore.ts` - Consolidate theme, layout (~60-90 lines)
6. `src/stores/index.ts` - Export all, hydration (~40-60 lines)

**Pattern**:
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: "auth-storage", version: 1 }
  )
);
```

---

## PHASE 4: Refactoring & Infrastructure (35-45 hours total)

### Task 11: Code Cleanup & Organization (15-20 hours)

**Files to Delete** (40+):
- All_TASKS_COMPLETE*.md
- COMPREHENSIVE_SETUP_MILESTONE_REPORT.md
- IMPLEMENTATION_COMPLETE.md
- PHASE_3_SETUP.md
- (Continue with remaining setup reports)
- src/**/*.backup.ts

**Reorganize**:
```
Before: src/components/ (40+ files mixed)
After:
- src/components/ui/ (Base UI)
- src/components/shared/ (Navigation, Footer)
- src/components/admin/ (Admin-specific)
- src/components/comics/ (Comic domain)
- src/components/profile/ (Profile)
- src/components/reader/ (Reader)
- src/components/tables/ (Tables)
```

**Update Imports** (50+ files):
```typescript
// Before: import { Button } from "../components/ui/Button";
// After: import { Button } from "@/components/ui/Button";
```

**Success Criteria**:
- ✅ 40+ obsolete files deleted
- ✅ Components organized in folders
- ✅ All imports use path aliases
- ✅ No unused imports
- ✅ `pnpm lint` clean

---

### Task 12: AST Refactoring & Type Safety (12-15 hours)

**Files to Create** (4 scripts):
1. `scripts/removeAnyTypes.ts` - Replace `any` with proper types
2. `scripts/consolidateDuplicates.ts` - Merge duplicate functions
3. `scripts/updateImports.ts` - Normalize imports
4. `scripts/removeUnusedExports.ts` - Remove dead code

**Execution**:
```bash
ts-node scripts/removeAnyTypes.ts --dry-run
# Review changes
ts-node scripts/removeAnyTypes.ts
pnpm type-check
# Repeat for other scripts
```

---

### Task 13: CLI System & Development Commands (8-12 hours)

**Files to Create** (8 files):
1. `bin/cli.ts` - Main entry point
2. `bin/commands/db.ts` - Database commands
3. `bin/commands/dev.ts` - Dev server
4. `bin/commands/build.ts` - Production build
5. `bin/commands/test.ts` - Test runners
6. `bin/commands/scaffold.ts` - Generate components/pages
7. `bin/commands/validate.ts` - Validation commands
8. `bin/commands/deploy.ts` - Deployment commands

**Commands**:
```bash
comicwise db:seed
comicwise dev
comicwise build
comicwise test:unit
comicwise test:e2e
comicwise scaffold:page PageName
comicwise validate
comicwise deploy:check
```

**Files to Edit**:
1. `package.json` - Add bin entry

---

## PHASE 5: Final Validation (5-8 hours total)

### Task 14: Production Validation & Documentation (5-8 hours)

**Validation Sequence**:

```bash
# 1. Type Safety
pnpm type-check
# Expected: ✅ Zero errors

# 2. Linting
pnpm lint
pnpm format:check
# Expected: ✅ Zero errors

# 3. Unit Tests
pnpm test:unit:run
# Expected: ✅ All tests passing

# 4. E2E Tests
pnpm test
# Expected: ✅ All tests passing

# 5. Production Build
pnpm build
# Expected: ✅ Build succeeds

# 6. Database Seed
pnpm db:seed:dry-run
# Expected: ✅ Seed executes cleanly

# 7. CLI Functionality
pnpm cli --help
# Expected: ✅ All commands visible
```

**Files to Update**:
1. `.github/copilot-instructions.md` - Update with Phase 1-5 completion
2. `README.md` - Update features, add Phase completion notes
3. `docs/SETUP.md` (new) - Comprehensive setup guide

---

## Implementation Standards & Guidelines

### Code Quality Standards

#### TypeScript
- **Strict Mode**: `strict: true` in tsconfig.json
- **No Any**: Use `unknown` with type guards
- **Explicit Returns**: All functions must have return type
- **Discriminated Unions**: Use for state machines

#### React Components
- **Functional Components**: No class components
- **Hooks**: Use hooks for state/effects
- **Memoization**: Memoize expensive computations
- **PropTypes**: TypeScript interfaces > PropTypes

#### Forms & Validation
- **react-hook-form**: For form management
- **Zod**: For validation schemas
- **Error Handling**: Show clear error messages
- **Loading States**: Disable submit during loading

#### Server Actions
- **"use server"**: Explicit directive
- **Type Safety**: Input validation with Zod
- **Error Handling**: Try-catch with ActionResult DTO
- **Revalidation**: Clear cache after mutations

### File Organization

#### Naming Conventions
- **Components**: PascalCase (UserCard.tsx)
- **Pages**: lowercase with slashes (user/page.tsx)
- **Utilities**: camelCase (formatDate.ts)
- **Stores**: camelCase with Store suffix (authStore.ts)
- **Hooks**: camelCase with use prefix (useAuth.ts)

---

## Validation & Testing Checkpoints

### Per-Task Checklist

```bash
# 1. Type check
pnpm type-check
# Expected: ✅ Zero errors

# 2. Lint
pnpm lint
# Expected: ✅ Zero errors

# 3. Format check
pnpm format:check
# Expected: ✅ All files formatted

# 4. Build test
pnpm build --skip-generate
# Expected: ✅ Build succeeds

# 5. Unit tests (if applicable)
pnpm test:unit:run
# Expected: ✅ Tests passing

# 6. Commit
git add .
git commit -m "Task N: <Title>"
```

---

## Git Workflow

### Branch Strategy
```bash
# Create feature branch
git checkout -b task/N-title

# Make changes, commit
git push origin task/N-title

# Create PR, merge when approved
```

### Viewing Progress
```bash
git log --oneline -10
git diff main...task/N-title
git diff --name-status main...task/N-title
```

---

## Success Definition

**Refactoring Complete When**:

1. ✅ All 14 tasks completed
2. ✅ 56 new files created
3. ✅ 600+ edits applied
4. ✅ 40+ files deleted
5. ✅ `pnpm type-check` passes
6. ✅ `pnpm lint` passes
7. ✅ `pnpm test:unit:run` passes
8. ✅ `pnpm test` passes
9. ✅ `pnpm build` succeeds
10. ✅ `pnpm db:seed:dry-run` executes cleanly
11. ✅ CLI commands functional
12. ✅ Documentation updated
13. ✅ No regressions
14. ✅ Production deployment ready

---

**Document Version**: 1.0
**Created**: January 20, 2026
**Status**: Ready for Execution
**Total Implementation Time**: 125-155 hours
**Next Step**: Start Task 1 with seed runner path alias fixes
