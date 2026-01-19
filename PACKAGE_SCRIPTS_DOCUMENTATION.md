# ComicWise - Package.json Scripts Documentation

**Last Updated:** 2026-01-18T21:12:00.000Z  
**Total Scripts:** 120  
**Categories:** 20

---

## 📋 Quick Reference

### Most Commonly Used Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Code Quality
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix ESLint errors
pnpm format                 # Format code with Prettier
pnpm type-check             # Check TypeScript types
pnpm validate               # Run all quality checks

# Database
pnpm db:push                # Push schema to database
pnpm db:seed                # Seed database with data
pnpm db:reset               # Drop, push, and seed
pnpm db:studio              # Open Drizzle Studio

# Testing
pnpm test                   # Run Playwright E2E tests
pnpm test:unit              # Run Vitest unit tests
pnpm test:all               # Run all tests

# Setup
pnpm setup                  # Install, push schema, seed
pnpm setup:clean            # Clean setup from scratch
```

---

## 📚 Complete Scripts Reference

### 🔧 DEVELOPMENT

| Script      | Command                             | Description                                         |
| ----------- | ----------------------------------- | --------------------------------------------------- |
| `dev`       | `next dev`                          | Start Next.js development server                    |
| `dev:debug` | `NODE_OPTIONS='--inspect' next dev` | Start dev server with Node inspector                |
| `dev:https` | `next dev --experimental-https`     | Start dev server with HTTPS                         |
| `predev`    | `pnpm clean:cache && pnpm typegen`  | Auto-run before dev (cleans cache, generates types) |

---

### 🏗️ BUILD & DEPLOY

| Script             | Command                                            | Description                              |
| ------------------ | -------------------------------------------------- | ---------------------------------------- |
| `build`            | `next build`                                       | Build for production                     |
| `build:analyze`    | `cross-env ANALYZE=true next build`                | Build with bundle analyzer               |
| `build:debug`      | `next build --debug`                               | Build with debug output                  |
| `build:standalone` | `cross-env NEXT_OUTPUT_MODE=standalone next build` | Build standalone mode                    |
| `prebuild`         | `pnpm clean:cache && pnpm typegen`                 | Auto-run before build                    |
| `postbuild`        | `pnpm dlx next-sitemap`                            | Auto-run after build (generates sitemap) |
| `start`            | `next start`                                       | Start production server                  |
| `start:prod`       | `NODE_ENV=production next start`                   | Start with production env                |
| `deploy:preview`   | `vercel`                                           | Deploy to Vercel preview                 |
| `deploy:vercel`    | `vercel --prod`                                    | Deploy to Vercel production              |
| `predeploy`        | `pnpm validate && pnpm build`                      | Auto-run before deploy                   |

---

### 🗄️ DATABASE (Drizzle)

| Script             | Command                                                            | Description                          |
| ------------------ | ------------------------------------------------------------------ | ------------------------------------ |
| `db:check`         | `drizzle-kit check`                                                | Check for schema conflicts           |
| `db:drop`          | `drizzle-kit drop`                                                 | Drop all tables                      |
| `db:generate`      | `drizzle-kit generate`                                             | Generate migrations                  |
| `db:migrate`       | `drizzle-kit migrate`                                              | Run migrations                       |
| `db:pull`          | `drizzle-kit introspect`                                           | Pull schema from database            |
| `db:push`          | `drizzle-kit push`                                                 | Push schema to database              |
| `db:reset`         | `pnpm db:drop && pnpm db:push && pnpm db:seed`                     | Full database reset                  |
| `db:reset:hard`    | `pnpm db:drop && pnpm db:generate && pnpm db:push && pnpm db:seed` | Hard reset with migration generation |
| `db:seed`          | `tsx src/database/seed/seed-runner-v3.ts`                          | Seed all data                        |
| `db:seed:users`    | `tsx src/database/seed/seed-runner-v3.ts --users`                  | Seed users only                      |
| `db:seed:comics`   | `tsx src/database/seed/seed-runner-v3.ts --comics`                 | Seed comics only                     |
| `db:seed:chapters` | `tsx src/database/seed/seed-runner-v3.ts --chapters`               | Seed chapters only                   |
| `db:seed:dry-run`  | `tsx src/database/seed/seed-runner-v3.ts --dry-run`                | Test seed without writing            |
| `db:seed:verbose`  | `tsx src/database/seed/seed-runner-v3.ts --verbose`                | Seed with detailed logging           |
| `db:studio`        | `drizzle-kit studio`                                               | Open Drizzle Studio GUI              |

---

### 🧪 TESTING

| Script               | Command                           | Description                   |
| -------------------- | --------------------------------- | ----------------------------- |
| `test`               | `playwright test`                 | Run Playwright E2E tests      |
| `test:all`           | `pnpm test:unit:run && pnpm test` | Run all tests (unit + E2E)    |
| `test:debug`         | `playwright test --debug`         | Run E2E tests in debug mode   |
| `test:headed`        | `playwright test --headed`        | Run E2E tests with browser UI |
| `test:ui`            | `playwright test --ui`            | Open Playwright UI            |
| `test:codegen`       | `playwright codegen`              | Generate test code            |
| `test:report`        | `playwright show-report`          | Show test report              |
| `test:unit`          | `vitest`                          | Run unit tests in watch mode  |
| `test:unit:run`      | `vitest run`                      | Run unit tests once           |
| `test:unit:watch`    | `vitest watch`                    | Run unit tests in watch mode  |
| `test:unit:coverage` | `vitest run --coverage`           | Run unit tests with coverage  |

---

### ✨ CODE QUALITY

| Script             | Command                                                    | Description                        |
| ------------------ | ---------------------------------------------------------- | ---------------------------------- |
| `lint`             | `eslint .`                                                 | Run ESLint                         |
| `lint:fix`         | `eslint . --fix`                                           | Fix ESLint errors                  |
| `lint:strict`      | `eslint . --max-warnings=0`                                | Strict linting (no warnings)       |
| `format`           | `prettier --write "**/*.{ts,tsx,...}"`                     | Format all code                    |
| `format:check`     | `prettier --check "**/*.{ts,tsx,...}"`                     | Check formatting                   |
| `type-check`       | `tsc --noEmit`                                             | Check TypeScript types             |
| `type-check:watch` | `tsc --noEmit --watch`                                     | Check types in watch mode          |
| `typegen`          | `next typegen`                                             | Generate Next.js types             |
| `validate`         | `pnpm type-check && pnpm lint:strict && pnpm format:check` | Run all quality checks             |
| `validate:quick`   | `pnpm type-check && pnpm lint`                             | Quick validation (no format check) |

---

### 🔄 CI/CD

| Script     | Command                                                          | Description                 |
| ---------- | ---------------------------------------------------------------- | --------------------------- |
| `ci`       | `pnpm validate && pnpm test:unit:run`                            | Basic CI pipeline           |
| `ci:build` | `pnpm build`                                                     | CI build step               |
| `ci:full`  | `pnpm validate && pnpm test:unit:run && pnpm test && pnpm build` | Full CI pipeline            |
| `ci:lint`  | `pnpm lint:strict`                                               | CI lint step                |
| `ci:test`  | `pnpm test --reporter=json --reporter=html`                      | CI test step with reporters |

---

### 🧹 PROJECT MAINTENANCE

| Script                       | Command                                                    | Description                  |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------- |
| `clean`                      | `rimraf .next out dist build .turbo coverage .react-email` | Clean build artifacts        |
| `clean:all`                  | `pnpm clean && rimraf node_modules pnpm-lock.yaml`         | Clean everything             |
| `clean:cache`                | `rimraf .next/cache`                                       | Clean Next.js cache          |
| `cleanup`                    | `tsx scripts/projectCleanup2025.ts`                        | Run project cleanup script   |
| `cleanup:dry-run`            | `tsx scripts/projectCleanup2025.ts --dry-run`              | Test cleanup without changes |
| `cleanup:duplicates`         | `tsx scripts/cleanup-duplicates.ts`                        | Remove duplicate files       |
| `cleanup:duplicates:dry-run` | `tsx scripts/cleanup-duplicates.ts --dry-run`              | Test duplicate cleanup       |
| `check-updates`              | `pnpm dlx npm-check-updates --deep -i`                     | Check for package updates    |

---

### 🔧 SETUP & INSTALLATION

| Script           | Command                                                             | Description               |
| ---------------- | ------------------------------------------------------------------- | ------------------------- |
| `setup`          | `pnpm install && pnpm db:push && pnpm db:seed`                      | Quick setup               |
| `setup:clean`    | `pnpm clean && pnpm install && pnpm db:reset`                       | Clean setup               |
| `setup:full`     | `pnpm clean:all && pnpm install && pnpm db:reset && pnpm build`     | Full setup from scratch   |
| `setup:complete` | `tsx scripts/complete-setup.ts`                                     | Run complete setup script |
| `setup:master`   | `tsx scripts/master-setup.ts`                                       | Run master setup script   |
| `postinstall`    | `pnpm dlx update-browserslist-db@latest --auto && pnpm db:generate` | Auto-run after install    |
| `prepare`        | `husky install`                                                     | Setup git hooks           |

---

### 📊 ANALYSIS & OPTIMIZATION

| Script               | Command                                                     | Description             |
| -------------------- | ----------------------------------------------------------- | ----------------------- |
| `analyze`            | `tsx scripts/analyze-project.ts`                            | Full project analysis   |
| `analyze:packages`   | `tsx scripts/uninstall-unused-packages.ts --dry-run`        | Analyze package usage   |
| `optimize:all`       | `tsx scripts/comprehensiveMasterOptimization2025.ts`        | Run all optimizations   |
| `optimize:camelcase` | `tsx scripts/camelCaseConverter2025.ts`                     | Convert to camelCase    |
| `optimize:types`     | `tsx scripts/updateAnyTypes.ts`                             | Update `any` types      |
| `imports:check`      | `tsx scripts/replaceImportsEnhanced.ts --dry-run --verbose` | Check import statements |
| `imports:optimize`   | `tsx scripts/replaceImportsEnhanced.ts`                     | Optimize imports        |

---

### 💾 CACHE MANAGEMENT

| Script        | Command                     | Description             |
| ------------- | --------------------------- | ----------------------- |
| `cache:clear` | `tsx scripts/clearCache.ts` | Clear application cache |
| `cache:stats` | `tsx scripts/cacheStats.ts` | Show cache statistics   |

---

### 🏥 HEALTH CHECKS

| Script         | Command                                                    | Description               |
| -------------- | ---------------------------------------------------------- | ------------------------- |
| `health:all`   | `pnpm health:db && pnpm health:redis && pnpm health:check` | Run all health checks     |
| `health:check` | `tsx scripts/healthCheck.ts`                               | General health check      |
| `health:db`    | `tsx scripts/checkDb.ts`                                   | Check database connection |
| `health:redis` | `tsx scripts/checkRedis.ts`                                | Check Redis connection    |

---

### 🐳 DOCKER

| Script         | Command                                   | Description                    |
| -------------- | ----------------------------------------- | ------------------------------ |
| `docker:build` | `docker compose build`                    | Build Docker images            |
| `docker:up`    | `docker compose up -d`                    | Start containers in background |
| `docker:down`  | `docker compose down`                     | Stop containers                |
| `docker:clean` | `docker compose down -v --remove-orphans` | Clean Docker environment       |
| `docker:logs`  | `docker compose logs -f`                  | Follow container logs          |

---

### 🔴 REDIS

| Script        | Command                                              | Description          |
| ------------- | ---------------------------------------------------- | -------------------- |
| `redis:cli`   | `docker exec -it comicwise-redis redis-cli`          | Open Redis CLI       |
| `redis:flush` | `docker exec -it comicwise-redis redis-cli FLUSHALL` | Flush all Redis data |

---

### 📦 QUEUE MANAGEMENT

| Script         | Command                              | Description           |
| -------------- | ------------------------------------ | --------------------- |
| `queue:worker` | `tsx scripts/queueWorker.ts`         | Start queue worker    |
| `queue:stats`  | `tsx scripts/queueWorker.ts --stats` | Show queue statistics |
| `queue:clean`  | `tsx scripts/queueWorker.ts --clean` | Clean queue           |

---

### 🏗️ SCAFFOLDING

| Script               | Command                                    | Description              |
| -------------------- | ------------------------------------------ | ------------------------ |
| `scaffold`           | `tsx scripts/scaffold.ts`                  | Interactive scaffolding  |
| `scaffold:component` | `tsx scripts/scaffold.ts --type=component` | Scaffold a component     |
| `scaffold:action`    | `tsx scripts/scaffold.ts --type=action`    | Scaffold a server action |
| `scaffold:hook`      | `tsx scripts/scaffold.ts --type=hook`      | Scaffold a React hook    |

---

### 📤 FILE UPLOADS

| Script                   | Command                                           | Description               |
| ------------------------ | ------------------------------------------------- | ------------------------- |
| `upload:bulk`            | `tsx scripts/uploadBulk.ts`                       | Bulk upload files         |
| `upload:bulk:dry-run`    | `tsx scripts/uploadBulk.ts --dry-run`             | Test bulk upload          |
| `upload:bulk:imagekit`   | `tsx scripts/uploadBulk.ts --provider=imagekit`   | Upload to ImageKit        |
| `upload:bulk:cloudinary` | `tsx scripts/uploadBulk.ts --provider=cloudinary` | Upload to Cloudinary      |
| `upload:bulk:aws`        | `tsx scripts/uploadBulk.ts --provider=aws`        | Upload to AWS S3          |
| `upload:test`            | `tsx scripts/uploadBulk.ts --test`                | Test upload functionality |

---

### 📚 DOCUMENTATION

| Script          | Command                                      | Description                |
| --------------- | -------------------------------------------- | -------------------------- |
| `docs:all`      | `tsx scripts/master-setup.ts`                | Generate all documentation |
| `docs:generate` | `tsx scripts/master-setup.ts --task=docs`    | Generate API docs          |
| `docs:readme`   | `tsx scripts/master-setup.ts --task=readme`  | Generate README            |
| `docs:prompts`  | `tsx scripts/master-setup.ts --task=prompts` | Generate GitHub prompts    |

---

### 🛠️ UTILITIES

| Script     | Command                            | Description             |
| ---------- | ---------------------------------- | ----------------------- |
| `cw`       | `tsx scripts/cli/cw.ts`            | ComicWise CLI tool      |
| `priority` | `tsx scripts/prioritySystem.ts`    | Priority system manager |
| `upstash`  | `pnpm dlx @upstash/qstash-cli dev` | Upstash QStash CLI      |

---

### 💻 VSCODE TOOLS

| Script                      | Command                                                         | Description               |
| --------------------------- | --------------------------------------------------------------- | ------------------------- |
| `vscode:extensions`         | `pwsh scripts/verify-and-install-vscode-extensions.ps1`         | Install VSCode extensions |
| `vscode:extensions:dry-run` | `pwsh scripts/verify-and-install-vscode-extensions.ps1 -DryRun` | Check extensions          |
| `vscode:mcp`                | `pwsh scripts/verify-and-start-mcp-servers.ps1`                 | Verify MCP servers        |
| `vscode:mcp:dry-run`        | `pwsh scripts/verify-and-start-mcp-servers.ps1 -DryRun`         | Test MCP verification     |

---

### ⚠️ LEGACY/DEPRECATED

These scripts are kept for backward compatibility but may be removed in future
versions:

| Script          | New Alternative    | Description                  |
| --------------- | ------------------ | ---------------------------- |
| `seed:users`    | `db:seed:users`    | Use db:seed:users instead    |
| `seed:comics`   | `db:seed:comics`   | Use db:seed:comics instead   |
| `seed:chapters` | `db:seed:chapters` | Use db:seed:chapters instead |
| `seed:validate` | `db:seed:dry-run`  | Use db:seed:dry-run instead  |
| `seed:clear`    | `db:reset`         | Use db:reset instead         |

---

## 🚀 Common Workflows

### First Time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Setup database
pnpm db:push
pnpm db:seed

# 4. Start development
pnpm dev
```

### Daily Development

```bash
# Start dev server
pnpm dev

# In another terminal, watch types
pnpm type-check:watch

# Before committing
pnpm validate
pnpm test:unit:run
```

### Before Deploying

```bash
# Run full validation
pnpm ci:full

# Build for production
pnpm build

# Test production build locally
pnpm start

# Deploy
pnpm deploy:vercel
```

### Database Management

```bash
# Make schema changes in src/database/schema/

# Push to database
pnpm db:push

# Or generate migration
pnpm db:generate
pnpm db:migrate

# Reset database (careful!)
pnpm db:reset
```

### Code Quality

```bash
# Fix all auto-fixable issues
pnpm lint:fix
pnpm format

# Check everything
pnpm validate

# Type checking
pnpm type-check
```

---

## 📝 Notes

### Script Naming Conventions

- **Prefix with category**: `db:`, `test:`, `docker:`, etc.
- **Use colons for namespacing**: `db:seed:users`
- **Use dashes for modifiers**: `cleanup-duplicates`, `dry-run`
- **Use descriptive names**: `health:check` not `check`

### Pre/Post Hooks

Some scripts have automatic hooks:

- `predev` runs before `dev`
- `prebuild` runs before `build`
- `postbuild` runs after `build`
- `postinstall` runs after `pnpm install`
- `predeploy` runs before `deploy:*`

### Environment Variables

Scripts using `tsx --env-file=.env.local` automatically load environment
variables from `.env.local`.

---

**Total Scripts:** 120  
**Last Updated:** 2026-01-18T21:12:00.000Z  
**Maintained by:** ComicWise Team
