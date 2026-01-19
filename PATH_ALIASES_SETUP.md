# Path Aliases Configuration - ComicWise

## Overview

This project uses TypeScript path aliases to enable clean, absolute imports
instead of relative imports. The configuration is managed in `tsconfig.json` and
automatically processed by the enhanced import optimizer script.

## Current Path Aliases

The project defines **33 path aliases** in `tsconfig.json`:

### Root Aliases

- **`@/*`** → `./src/*` - General access to src directory
- **`src`** → `./src/*` - Alternative to @/\*

### Configuration Files

- **`@/appConfig`** → `./appConfig` - App configuration
- **`appConfig`** → `./appConfig` - Alternative reference
- **`redis`** → `./redis` - Redis configuration

### Components

- **`components`** → `./src/components/*` - All components
- **`ui`** → `./src/components/ui/*` - UI components
- **`layout`** → `./src/components/layout/*` - Layout components
- **`emails`** → `./src/components/emails/*` - Email components
- **`admin`** → `./src/components/admin/*` - Admin components

### Core Libraries

- **`lib`** → `./src/lib/*` - Library utilities
- **`utils`** → `./src/lib/utils` - Utility functions
- **`env`** → `./src/lib/env` - Environment configuration
- **`auth`** → `./src/lib/auth` - Authentication
- **`authConfig`** → `./src/lib/authConfig` - Auth configuration
- **`authAdapter`** → `./src/lib/authAdapter` - Auth adapter
- **`actions`** → `./src/lib/actions/*` - Server actions
- **`validations`** → `./src/lib/validations/*` - Validation schemas

### Database Layer

- **`db`** → `./src/database/db` - Database instance
- **`database`** → `./src/database/*` - Database utilities
- **`schema`** → `./src/database/schema` - Database schema
- **`dal`** → `./src/dal/*` - Data Access Layer
- **`queries`** → `./src/database/queries/*` - Database queries
- **`mutations`** → `./src/database/mutations/*` - Database mutations

### Application State & Services

- **`dto`** → `./src/dto/*` - Data Transfer Objects
- **`types`** → `./src/types/*` - TypeScript types
- **`hooks`** → `./src/hooks/*` - React hooks
- **`services`** → `./src/services/*` - Business services
- **`stores`** → `./src/stores/*` - State stores
- **`tests`** → `./src/tests/*` - Test files

### Assets & Styles

- **`assets`** → `./src/assets/*` - Static assets
- **`styles`** → `./src/styles/*` - CSS/styling
- **`public`** → `./public/*` - Public static files

## Usage Examples

### Before (Relative Imports)

```typescript
import { Button } from "../../../components/ui/Button";
import { useUser } from "../../hooks/useUser";
import { db } from "../../../database/db";
import { userSchema } from "../../../database/schema";
```

### After (Path Aliases)

```typescript
import { Button } from "@/components/ui/Button";
import { useUser } from "@/hooks/useUser";
import { db } from "@/database/db";
import { userSchema } from "@/database/schema";
```

## Automatic Import Optimization

### Running the Optimizer

The enhanced import optimizer automatically processes all TypeScript files and
converts relative imports to path aliases.

**Syntax:**

```bash
pnpm tsx scripts/replaceImportsEnhanced.ts [options]
```

**Available Options:**

- `--dry-run` - Preview changes without modifying files
- `--verbose` - Show detailed processing information
- `--backup` - Create backup before modifications

**Examples:**

```bash
# Preview what will change
pnpm tsx scripts/replaceImportsEnhanced.ts --dry-run

# Apply changes with detailed output
pnpm tsx scripts/replaceImportsEnhanced.ts --verbose

# Create backup and apply changes
pnpm tsx scripts/replaceImportsEnhanced.ts --backup
```

### How It Works

1. **Loads tsconfig.json** - Reads all 33 path alias definitions
2. **Generates Patterns** - Creates regex patterns for each alias automatically
3. **Processes Files** - Scans all `.ts` and `.tsx` files
4. **Replaces Imports** - Converts relative imports to matching path aliases
5. **Fixes Invalid Imports** - Corrects imports like `from "ui/..."` to
   `from "@/components/ui/..."`
6. **Reports Results** - Displays summary with modification statistics

### Features

✅ **Dynamic Configuration** - Reads directly from tsconfig.json  
✅ **Smart Matching** - Handles multiple import patterns  
✅ **Priority Ordering** - Processes specific paths before general ones  
✅ **Invalid Detection** - Fixes bare imports (e.g., `ui/` →
`@/components/ui/`)  
✅ **Backup Support** - Optional automatic backups before changes  
✅ **Dry Run Mode** - Preview changes without applying them  
✅ **Performance** - Processes 600+ files in ~2.3 seconds  
✅ **Detailed Reporting** - Statistics by category and file

## IDE Configuration

### VS Code

The path aliases are automatically recognized by VS Code with proper TypeScript
support.

### WebStorm / IntelliJ

Path aliases are automatically supported in WebStorm 2022+ versions.

## Benefits

1. **Cleaner Imports** - No more `../../../` chains
2. **Maintainability** - Easier refactoring and reorganization
3. **Readability** - Clear what each import represents
4. **Type Safety** - Full TypeScript support and type checking
5. **IDE Support** - Auto-completion and go-to-definition work seamlessly

## Adding New Aliases

To add a new path alias:

1. **Edit tsconfig.json:**

```json
{
  "compilerOptions": {
    "paths": {
      "newAlias": ["./path/to/target/*"],
      "newAlias/sub": ["./path/to/target/sub/*"]
    }
  }
}
```

2. **Run the optimizer** to update all imports:

```bash
pnpm tsx scripts/replaceImportsEnhanced.ts --verbose
```

## Best Practices

### ✅ Do

- Use path aliases for all imports outside the same directory
- Keep alias names meaningful and consistent
- Use the most specific alias available
- Regularly run the optimizer to maintain consistency

### ❌ Don't

- Mix relative and absolute imports in the same file
- Create overly broad aliases
- Use relative imports when a path alias exists
- Modify tsconfig.json paths without updating optimizer

## Script Architecture

### Type Definitions

- **Pattern** - Regex pattern with category and priority
- **Stats** - Tracking for processed files and replacements
- **TsConfigPaths** - Type for tsconfig.json paths

### Core Functions

- **loadTsConfigPaths()** - Reads tsconfig.json
- **generatePatternsFromTsConfig()** - Creates regex patterns dynamically
- **processFile()** - Applies replacements to individual files
- **main()** - Orchestrates the entire process

### Key Features

- **Dynamic Pattern Generation** - Patterns created from tsconfig.json, not
  hardcoded
- **Priority System** - More specific paths matched before general ones
- **Invalid Pattern Fixing** - Catches and fixes broken imports
- **Comprehensive Stats** - Detailed breakdown by category

## Troubleshooting

### Imports Not Being Replaced

1. Check the alias exists in tsconfig.json
2. Run with `--verbose` to see processing details
3. Verify the import path matches the target path

### Type Errors After Optimization

1. Run TypeScript compiler to verify: `pnpm tsc --noEmit`
2. Check that path aliases match actual file locations
3. Ensure no circular dependencies were created

### Files Not Being Processed

1. Check file is included in `FILES_TO_PROCESS` patterns
2. Verify file doesn't match `EXCLUDE_PATTERNS`
3. Ensure file is `.ts` or `.tsx` format

## Related Files

- **tsconfig.json** - Path alias definitions
- **scripts/replaceImportsEnhanced.ts** - The optimizer script
- **next.config.ts** - Next.js configuration (inherits tsconfig paths)
- **.eslintrc** - ESLint rules for import sorting

## Version History

### v2.0.0 (Current)

- ✅ Dynamic path alias generation from tsconfig.json
- ✅ Automatic pattern creation based on configured aliases
- ✅ Improved maintainability and extensibility
- ✅ Support for all 33 project aliases
- ✅ Better error handling and reporting

### v1.0.0 (Previous)

- Hardcoded replacement patterns
- Manual pattern maintenance required
- Limited to predefined aliases
