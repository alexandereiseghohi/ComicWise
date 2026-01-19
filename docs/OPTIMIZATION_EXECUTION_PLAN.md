# ComicWise Project Optimization - Execution Plan

## Overview

This document outlines the phased approach to optimize the ComicWise project due
to rate limits and context window constraints.

## ✅ COMPLETED TASKS

### Task 1: VS Code Configuration Files

**Status:** ✅ COMPLETED  
**Files Modified:**

- `.vscode/mcp.json` (enhanced with auto-approve features, sequential-thinking,
  playwright servers)
- `.vscode/extensions.json` (added i18n-ally, versionlens, import-cost,
  styled-components)
- `.vscode/launch.json` (added compounds, presentation groups, more debug
  configurations)
- `.vscode/tasks.json` (added emoji icons, presentation groups, better
  organization)
- `.vscode/settings.json` (comprehensive TypeScript, ESLint, Prettier,
  path-intellisense settings)

**Backup Files Created:**

- `.vscode/mcp.backup.json`
- `.vscode/extensions.backup.json`
- `.vscode/launch.backup.json`
- `.vscode/tasks.backup.json`
- `.vscode/settings.backup.json`

---

## 📋 PENDING TASKS

Due to GitHub Copilot rate limits and the 4096 token context window, the
remaining tasks will be executed in phases.

### Phase 2: Configuration & Type System (Next Priority)

```bash
# Run these commands manually:
pnpm run type-check                  # Identify current type errors
pnpm run lint                        # Identify current lint errors
```

**Tasks:**

1. **ESLint Configuration** - Enhance `eslint.config.ts`
2. **TypeScript Types** - Consolidate all `src/types/*.ts` files
3. **TSConfig Paths** - Optimize path aliases in `tsconfig.json`
4. **Remove Any Types** - Replace all `any` types with proper types

### Phase 3: Code Refactoring (After Phase 2)

**Tasks:**

1. **Import Migration** - Update all imports to use new path aliases
2. **CamelCase Refactoring** - Rename files/functions to camelCase
3. **Scripts Optimization** - Optimize `package.json` scripts
4. **Shell Aliases** - Create PowerShell/Bash aliases

### Phase 4: Structure & Cleanup (After Phase 3)

**Tasks:**

1. **Folder Structure** - Refactor to Next.js 16 best practices
2. **Cleanup Duplicates** - Remove unused/duplicate files
3. **NextAuth Integration** - Align NextAuth with database schema
4. **Fix Errors** - Fix all remaining type/lint errors

### Phase 5: Documentation & Validation (Final)

**Tasks:**

1. **Scaffolding Templates** - Create project templates
2. **Documentation** - Generate comprehensive docs
3. **Final Validation** - Run all tests and checks
4. **Optimization Report** - Generate detailed report

---

## 🚀 HOW TO PROCEED

### Option A: Manual Step-by-Step (Recommended for Rate Limits)

Execute each script individually with breaks between runs:

```bash
# Phase 2 - Run one at a time
pnpm tsx scripts/optimize-eslint-config.ts
# Wait 5 minutes due to rate limits
pnpm tsx scripts/consolidate-types.ts
# Wait 5 minutes
pnpm tsx scripts/optimize-tsconfig-paths.ts
# Wait 5 minutes
pnpm tsx scripts/remove-any-types.ts
```

### Option B: Interactive Master Script

```bash
pnpm tsx scripts/comprehensive-optimization-master.ts --interactive
```

This will prompt you before each task, allowing you to control the pace.

### Option C: Run Specific Tasks Only

```bash
pnpm tsx scripts/comprehensive-optimization-master.ts --tasks eslint-config typescript-types
```

---

## 📊 Current Project State

### Statistics (as of optimization start):

- **Total Files in src/:** 638
- **TypeScript Files:** ~500+
- **Git Status:** 50+ modified files (mostly UI components)
- **Node.js:** v24.11.0
- **pnpm:** 10.26.2

### Known Issues to Address:

1. **Type Safety:** Many files use `any` types
2. **Import Paths:** Inconsistent use of path aliases
3. **Naming Conventions:** Mix of camelCase, PascalCase, kebab-case
4. **Duplicate Files:** Multiple similar files in different locations
5. **Unused Components:** Several shadcn-studio demo components not used
6. **NextAuth Integration:** User types not fully aligned with database schema

---

## 📝 RECOMMENDATIONS

### Immediate Actions (Can be done now):

1. ✅ Review the enhanced VS Code configuration files
2. ✅ Commit the current changes to Git before proceeding
3. ✅ Run `pnpm type-check` to see current type errors
4. ✅ Run `pnpm lint` to see current lint errors
5. ✅ Review `src/types/` directory structure

### Before Running Automated Scripts:

1. Ensure database is running (`docker compose up -d`)
2. Ensure all environment variables are set
3. Create a Git branch for optimization changes
4. Have a backup of your current working state

### Rate Limit Mitigation:

- Run scripts one at a time with 5-10 minute breaks
- Use `--interactive` flag for controlled execution
- Monitor GitHub Copilot usage in VS Code
- Consider running non-AI tasks (like cleanup) during off-peak hours

---

## 🔧 Individual Task Scripts

Each task has been broken down into individual scripts in the `scripts/`
directory:

| Script                         | Description                     | Estimated Time |
| ------------------------------ | ------------------------------- | -------------- |
| `optimize-eslint-config.ts`    | Enhance ESLint configuration    | 2 min          |
| `consolidate-types.ts`         | Consolidate TypeScript types    | 5 min          |
| `optimize-tsconfig-paths.ts`   | Optimize path aliases           | 3 min          |
| `remove-any-types.ts`          | Replace `any` with proper types | 15 min         |
| `migrate-import-paths.ts`      | Update import statements        | 10 min         |
| `camelcase-refactor.ts`        | Refactor to camelCase           | 10 min         |
| `optimize-scripts.ts`          | Optimize package.json           | 2 min          |
| `create-shell-aliases.ts`      | Generate shell aliases          | 2 min          |
| `refactor-folder-structure.ts` | Restructure folders             | 10 min         |
| `cleanup-duplicates.ts`        | Remove duplicates               | 5 min          |
| `integrate-nextauth.ts`        | NextAuth-DB integration         | 5 min          |
| `fix-type-errors.ts`           | Auto-fix type errors            | 15 min         |
| `generate-documentation.ts`    | Generate docs                   | 5 min          |
| `final-validation.ts`          | Run all checks                  | 5 min          |

**Total Estimated Time:** ~1.5 hours (with breaks for rate limits)

---

## ✅ NEXT STEPS

1. **Review this plan** and decide on execution strategy
2. **Commit current work** to Git
3. **Choose** Option A, B, or C above
4. **Start with Phase 2** tasks
5. **Monitor and adjust** based on rate limits

---

## 📧 SUPPORT

If you encounter issues:

1. Check the backup files in `.vscode/*.backup.json`
2. Review the optimization logs
3. Use Git to revert if needed
4. Run `pnpm validate` to check project health

---

**Last Updated:** 2025-12-24  
**Version:** 1.0.0  
**Status:** Phase 1 Complete ✅
