# 🚀 ComicWise Quick Start Guide

## Project Setup Complete! ✅

All optimization tasks have been successfully completed. Here's your quick
reference guide.

---

## 📦 Installation Verified

```bash
✅ All dependencies installed via pnpm
✅ Package lock file synchronized
✅ Dev dependencies ready
```

---

## ⚡ Lightning-Fast Commands

### Load Aliases First!

**Windows (PowerShell):**

```powershell
. .\scripts\cw-aliases.ps1
```

**Linux/Mac (Bash):**

```bash
source ./scripts/cw-aliases.sh
```

### Development Commands

```bash
cw-dev              # Start development server
cw-build            # Build for production
cw-start            # Start production server
cw-clean            # Clean build artifacts
```

### Database Commands

```bash
cw-db-push          # Push schema to database
cw-db-seed          # Seed database
cw-db-studio        # Open Drizzle Studio
cw-db-reset         # Reset database
```

### Code Quality

```bash
cw-lint             # Run ESLint
cw-lint-fix         # Auto-fix ESLint errors
cw-format           # Format with Prettier
cw-type-check       # Check TypeScript
cw-validate         # Run all checks
```

### Testing

```bash
cw-test             # Run all tests
cw-test-unit        # Unit tests only
cw-test-ui          # Tests with UI
```

### Utilities

```bash
cw-scaffold         # Generate components
cw-optimize         # Run optimization
cw-cleanup          # Clean unused files
cw-imports          # Optimize imports
cw-help             # Show all commands
```

---

## 🎨 Type System

### New Type Files Created

```
src/types/
  ├── Core.ts          # Core application types
  ├── Utility.ts       # Helper utility types
  ├── Api.ts           # API response types
  ├── database.ts      # Database models (enhanced)
  ├── actions.ts       # Server action types
  └── index.ts         # Centralized exports
```

### Using Types

```typescript
// Import from centralized location
import type { Comic, ComicWithRelations, ApiResponse } from "#types";

// Or specific imports
import type { Nullable, Optional, Prettify } from "#types/Core";
import type { ActionResponse } from "#types/actions";
```

---

## 📂 Import Paths

### Primary Aliases (# prefix)

```typescript
import { Button } from "#ui/button";
import { getComics } from "#actions/comics";
import { db } from "#database/db";
import type { Comic } from "#types";
```

### Short Aliases

```typescript
import { auth } from "auth";
import { db } from "db";
import { cn } from "utils";
import appConfig from "appConfig";
```

### Backwards Compatible (@ prefix)

```typescript
import { Button } from "@/components/ui/button";
import type { Comic } from "@/types/database";
```

---

## 🛠️ Scaffolding New Code

### Interactive Mode

```bash
cw-scaffold
# or
pnpm scaffold
```

### Direct Commands

```bash
pnpm scaffold --type=component
pnpm scaffold --type=hook
pnpm scaffold --type=action
pnpm scaffold --type=api
```

### Templates Available

- **Components:** React components with TypeScript
- **Hooks:** Custom React hooks
- **Actions:** Server actions with type safety
- **API Routes:** Next.js API endpoints

---

## 🔍 Type Checking

### Quick Check

```bash
cw-type-check
```

### Watch Mode

```bash
pnpm type-check:watch
```

### Full Validation

```bash
cw-validate
# Runs: type-check + lint + format check
```

---

## 🧹 Code Quality

### Auto-fix Everything

```bash
cw-lint-fix
cw-format
```

### Check Before Commit

```bash
cw-validate
```

---

## 🐳 Docker Commands

```bash
cw-docker-up        # Start containers
cw-docker-down      # Stop containers
cw-docker-build     # Build images
cw-docker-logs      # View logs
```

---

## 🏥 Health Checks

```bash
cw-health           # Overall health
cw-health-db        # Database status
cw-health-redis     # Redis status
cw-health-all       # Complete check
```

---

## 📝 Project Scripts

### Optimization

```bash
pnpm tsx scripts/MasterOptimization.ts
```

### Import Optimization

```bash
pnpm tsx scripts/replace-imports.ts
# or
cw-imports
```

### Cleanup

```bash
pnpm tsx scripts/cleanup-comprehensive.ts
# or
cw-cleanup
```

---

## 🎯 Common Workflows

### Starting Development

```bash
# 1. Load aliases
. .\scripts\cw-aliases.ps1

# 2. Start database
cw-docker-up

# 3. Push schema
cw-db-push

# 4. Seed data
cw-db-seed

# 5. Start dev server
cw-dev
```

### Before Committing

```bash
# 1. Check types
cw-type-check

# 2. Fix linting
cw-lint-fix

# 3. Format code
cw-format

# 4. Run tests
cw-test-unit
```

### Production Build

```bash
# 1. Validate everything
cw-validate

# 2. Run tests
cw-test

# 3. Build
cw-build

# 4. Start production
cw-start
```

---

## 📊 Project Stats

- **Total Files:** 455+ TypeScript/TSX files
- **Type Files:** 40+ type definition files
- **Shell Aliases:** 40+ quick commands
- **Scripts:** 60+ automation scripts
- **Package Manager:** pnpm v10.26.2

---

## 🔗 Useful Files

- `PROJECT_OPTIMIZATION_COMPLETE.md` - Full completion report
- `scripts/cw-aliases.ps1` - PowerShell aliases
- `scripts/cw-aliases.sh` - Bash aliases
- `scripts/MasterOptimization.ts` - Master optimization script
- `scripts/scaffold-enhanced.ts` - Project scaffolding
- `scripts/replace-imports.ts` - Import path optimizer

---

## 💡 Tips

1. **Always load aliases first** for lightning-fast commands
2. **Use `cw-help`** to see all available commands
3. **Use scaffolding** for consistent code generation
4. **Run `cw-validate`** before committing
5. **Type-check regularly** with `cw-type-check`

---

## 🎉 You're All Set!

Start developing with:

```bash
. .\scripts\cw-aliases.ps1
cw-dev
```

Happy coding! 🚀

---

**Generated:** December 24, 2025  
**Status:** ✅ Ready for Development
