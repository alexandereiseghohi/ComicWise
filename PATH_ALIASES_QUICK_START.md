# Path Aliases Quick Start Guide

## ⚡ Quick Commands

### Validate Aliases

```bash
pnpm tsx scripts/replaceImportsEnhanced.ts --validate
```

### Preview Changes

```bash
pnpm tsx scripts/replaceImportsEnhanced.ts --dry-run --verbose
```

### Apply Optimization

```bash
pnpm tsx scripts/replaceImportsEnhanced.ts
```

### Full Options

```bash
pnpm tsx scripts/replaceImportsEnhanced.ts --validate --dry-run --verbose --backup
```

---

## 📚 Path Aliases Reference

| Alias         | Path                       | Common Use         |
| ------------- | -------------------------- | ------------------ |
| `@/*`         | `src/*`                    | Any src imports    |
| `@/appConfig` | `appConfig.ts`             | App config         |
| `actions`     | `src/lib/actions/*`        | Server actions     |
| `admin`       | `src/components/admin/*`   | Admin components   |
| `appConfig`   | `appConfig.ts`             | Config file        |
| `assets`      | `src/assets/*`             | Images, fonts, etc |
| `auth`        | `src/lib/auth.ts`          | Authentication     |
| `authAdapter` | `src/lib/authAdapter.ts`   | Auth adapter       |
| `authConfig`  | `src/lib/authConfig.ts`    | Auth config        |
| `components`  | `src/components/*`         | UI components      |
| `dal`         | `src/dal/*`                | Data access layer  |
| `database`    | `src/database/*`           | Database           |
| `db`          | `src/database/db.ts`       | DB instance        |
| `dto`         | `src/dto/*`                | Data objects       |
| `emails`      | `src/components/emails/*`  | Email components   |
| `env`         | `src/lib/env.ts`           | Environment        |
| `hooks`       | `src/hooks/*`              | React hooks        |
| `lib`         | `src/lib/*`                | Library code       |
| `mutations`   | `src/database/mutations/*` | DB mutations       |
| `public`      | `public/*`                 | Static files       |
| `queries`     | `src/database/queries/*`   | DB queries         |
| `redis`       | `redis.ts`                 | Redis config       |
| `schema`      | `src/database/schema.ts`   | DB schema          |
| `services`    | `src/services/*`           | Services           |
| `src`         | `src/*`                    | Source code        |
| `stores`      | `src/stores/*`             | State stores       |
| `styles`      | `src/styles/*`             | Stylesheets        |
| `tests`       | `src/tests/*`              | Tests              |
| `types`       | `src/types/*`              | TypeScript types   |
| `ui`          | `src/components/ui/*`      | UI library         |
| `utils`       | `src/lib/utils.ts`         | Utilities          |
| `validations` | `src/lib/validations/*`    | Validation         |

---

## 💡 Usage Examples

### Imports

```typescript
// ❌ Don't - Relative
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";

// ✅ Do - Path Aliases
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
```

### Exports

```typescript
// ❌ Don't - Relative
export { getUser } from "../../../database/queries/user";

// ✅ Do - Path Aliases
export { getUser } from "@/database/queries/user";
```

### Deep Imports

```typescript
// Components
import { Header } from "@/components/admin/Header";
import { Panel } from "@/components/ui/Panel";

// Hooks
import { useForm } from "@/hooks/useForm";
import { useCache } from "@/hooks/useCache";

// Database
import { getUserById } from "@/database/queries/user";
import { createPost } from "@/database/mutations/post";

// Services
import { emailService } from "@/services/email";
import { imageService } from "@/services/image";

// Types
import type { User, Post } from "@/types";
```

---

## 🎯 Common Patterns

### Component Import Pattern

```typescript
// Single component
import { Button } from "@/components/ui/Button";

// Multiple from same module
import { Button, Card, Dialog } from "@/components/ui";

// Component + utilities
import { Header } from "@/components/admin/Header";
import { AdminLayout } from "@/components/admin/Layout";
```

### Database Import Pattern

```typescript
import { db } from "@/database/db";
import { userSchema } from "@/database/schema";
import { getUser, getUserById } from "@/database/queries/user";
import { createUser, updateUser } from "@/database/mutations/user";
```

### Type Import Pattern

```typescript
import type { User, Post, Comment } from "@/types";
import type { CreateUserInput } from "@/dto/User";
```

### Hook Import Pattern

```typescript
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";
import { useCache } from "@/hooks/useCache";
```

---

## 🔄 Optimization Workflow

### Step 1: Check current state

```bash
pnpm tsx scripts/replaceImportsEnhanced.ts --dry-run --validate
```

### Step 2: Review changes

- Check which files will be modified
- Review replacement count per category
- Look for any errors

### Step 3: Apply with backup

```bash
pnpm tsx scripts/replaceImportsEnhanced.ts --backup
```

### Step 4: Verify

```bash
pnpm lint
pnpm tsc --noEmit
```

---

## ⚙️ Configuration (tsconfig.json)

Location: `tsconfig.json` → `compilerOptions.paths`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "components": ["./src/components/*"],
      "hooks": ["./src/hooks/*"],
      "database": ["./src/database/*"]
    }
  }
}
```

**All 32 aliases are already configured and validated!**

---

## 🛠️ Troubleshooting

### Aliases not working in IDE

1. Reload IDE/editor
2. Check VS Code: Restart Terminal
3. Check WebStorm: Invalidate Caches
4. Verify tsconfig.json is in root

### Path not found errors

1. Run: `pnpm tsx scripts/replaceImportsEnhanced.ts --validate`
2. Check output for invalid paths
3. Update tsconfig.json if needed
4. Re-run validation

### Imports not being replaced

1. Check alias exists in tsconfig.json
2. Verify file path matches alias target
3. Run with `--verbose` to see details
4. Check file is .ts or .tsx

---

## ✅ Checklist

- [ ] Reviewed tsconfig.json paths
- [ ] Validated all aliases with `--validate`
- [ ] Run optimizer with `--dry-run` first
- [ ] Applied optimizations with `--backup`
- [ ] Verified code still builds
- [ ] Use aliases in new code going forward
- [ ] Remove relative imports from files

---

## 📖 More Information

- **Full Documentation:** `PATH_ALIASES_OPTIMIZATION_COMPLETE.md`
- **Quick Reference:** This file
- **Validation Results:** Run `--validate` flag
- **Script Details:** `scripts/replaceImportsEnhanced.ts`

---

## 🚀 Pro Tips

1. **Always use `@/` prefix** for src directory imports
2. **Prefer specific aliases** over general ones (e.g., `@/components/ui/Button`
   not `components/ui/Button`)
3. **Group imports** by type at top of file
4. **Use TypeScript types** with `import type {}`
5. **Run optimizer** periodically to maintain consistency

---

## 📞 Support

For issues:

1. Check `--validate` output
2. Run with `--verbose` for details
3. Check tsconfig.json paths
4. Review error messages
5. Contact team if needed

---

**Status:** ✅ All 32 path aliases configured and validated

**Last Updated:** 2026-01-15
