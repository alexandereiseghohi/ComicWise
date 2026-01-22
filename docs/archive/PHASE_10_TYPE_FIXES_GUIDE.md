# Phase 10: Type/Lint Fixes - Comprehensive Fix Guide

## Type Errors Summary

- **Total Errors Found**: 30+
- **Categories**:
  1. Index signature access errors (3) - CLI tool
  2. Test type mismatches (9) - ActionResult mismatch
  3. Component property errors (2) - Missing properties
  4. Import errors (2) - Missing exports/modules
  5. API type errors (5) - Generic types
  6. Auth action errors (3) - Wrong function names

## Critical Fixes Required

### 1. CLI Tool - Index Signature Access (scripts/cw.ts)

**Error**: Property access on `process.env` index signature **Solution**: Use
bracket notation `process.env["KEY"]` instead of dot notation **Status**: ✅
Fixed

### 2. Auth Actions - Import/Export Mismatches

**File**: `src/app/(auth)/sign-up/page.tsx` **Error**: `signUpAction` not
exported **Fix**: Use `registerUserAction` instead

```typescript
// Wrong
import { signUpAction } from "@/lib/actions/auth";

// Right
import { registerUserAction } from "@/lib/actions/auth";
```

**File**: `src/app/(auth)/sign-in/page.tsx` **Error**: Expected 2 arguments, got
1 **Fix**: Check function signature in auth actions

### 3. Test Type Mismatches - ActionResult Pattern

**File**: `src/__tests__/lib/actions/bookmark.test.ts` **Error**: ActionResult
type mismatch **Current Pattern**: `{ success: boolean; error?: string }`
**Required Pattern**: Discriminated union with `ActionSuccess` | `ActionError`

**Fix**:

```typescript
// ActionSuccess
{ success: true, data: T }

// ActionError
{ success: false, message: string }
```

### 4. Database Query Type Errors

**File**: `src/app/(root)/comics/[slug]/page.tsx` **Error**: Property
'bookmarks' does not exist on type 'ComicWithRelations' **Fix**: Add bookmarks
to the ComicWithRelations type or use different query

### 5. Component Export Errors

**File**: `src/app/admin/comics/[id]/page.tsx` **Error**: `useConfirmDialog` not
exported from ConfirmDialog **Fix**: Export named function or check if it exists

### 6. Generic CRUD Module Missing

**File**: `src/app/api/artists/[id]/route.ts` **Error**: Cannot find module
'@/lib/api/generic-crud' **Fix**: Create module or use direct queries

## Action Items

### Priority 1: Fix Auth Exports (2 hours)

1. Verify all auth action names match imports
2. Update sign-in/sign-up pages with correct function names
3. Check signature compatibility

### Priority 2: Fix ActionResult Types (2 hours)

1. Update all test files to use correct ActionResult pattern
2. Ensure success/error properties match discriminated union
3. Update BookmarkStatus enum values if needed

### Priority 3: Fix Database Types (1 hour)

1. Update ComicWithRelations to include bookmarks
2. Check all relationship queries
3. Verify foreign key relationships

### Priority 4: Create Missing Modules (1 hour)

1. Create `@/lib/api/generic-crud` or remove references
2. Verify all utility modules exist
3. Add proper type exports

### Priority 5: Fix Component Exports (1 hour)

1. Verify all named exports exist
2. Check useConfirmDialog implementation
3. Update imports to use correct names

## Validation Commands

```bash
# Type check only
pnpm type-check

# Lint with fixes
pnpm lint:fix

# Full validation
pnpm validate

# Build check
pnpm build
```

## Notes

- All type fixes maintain backward compatibility
- No breaking changes to API contracts
- Tests should pass after ActionResult updates
- Build should complete with 0 errors
