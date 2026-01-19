# ComicWise CLI - Complete Reference Guide

> Comprehensive documentation for all CLI commands, scripts, and workflows

## Quick Start

```bash
# Show all available commands
pnpm cw help

# Or use the script directly
.\scripts\cw.ps1 help    # PowerShell
./scripts/cw.sh help     # Bash
```

## Table of Contents

- [Database Commands](#database-commands)
- [Cache Commands](#cache-commands)
- [Health Commands](#health-commands)
- [Queue Commands](#queue-commands)
- [Upload Commands](#upload-commands)
- [Scaffold Commands](#scaffold-commands)
- [CI/CD Commands](#cicd-commands)
- [Development Workflows](#development-workflows)
- [Troubleshooting](#troubleshooting)

---

## Database Commands

### `db:push` - Push Schema Changes

```bash
pnpm db:push
# or
cw db push
```

Pushes local schema changes to the database without migrations.

**Use case:** Development and rapid prototyping

---

### `db:seed` - Seed Database

```bash
pnpm db:seed
# With options:
pnpm db:seed -- --verbose
pnpm db:seed -- --comics-only
pnpm db:seed -- --users-only
pnpm db:seed -- --dry-run
```

**Options:**

- `--verbose`: Show detailed output
- `--comics-only`: Seed only comics
- `--chapters-only`: Seed only chapters
- `--users-only`: Seed only users
- `--dry-run`: Preview without making changes
- `--skip-images`: Skip image uploads

---

### `db:studio` - Open Drizzle Studio

```bash
pnpm db:studio
```

Opens visual database browser at http://localhost:4983

---

### `db:reset` - Reset Database

```bash
pnpm db:reset
```

⚠️ **Warning:** Drops all tables and reseeds data

---

### `db:generate` - Generate Migrations

```bash
pnpm db:generate
```

Creates migration files from schema changes

---

### `db:migrate` - Run Migrations

```bash
pnpm db:migrate
```

Applies pending migrations to database

---

## Cache Commands

### `cache:clear` - Clear All Cache

```bash
pnpm cache:clear
# or
cw cache clear
```

Clears Redis cache and Next.js cache

---

### `cache:stats` - Show Cache Statistics

```bash
pnpm cache:stats
```

Displays cache hit/miss ratios and memory usage

**Output:**

```
Cache Statistics
├── Keys: 1,234
├── Memory: 45.6 MB
├── Hit Rate: 87.3%
└── Uptime: 2d 14h
```

---

## Health Commands

### `health:check` - System Health Check

```bash
pnpm health:check
# or
cw health check
```

**Checks:**

- ✅ Database connectivity
- ✅ Redis connectivity
- ✅ Disk space
- ✅ Memory usage
- ✅ API endpoints

---

### `health:db` - Database Health

```bash
pnpm health:db
```

Verifies database connection and query performance

---

### `health:redis` - Redis Health

```bash
pnpm health:redis
```

Tests Redis connection and latency

---

### `health:all` - Complete Health Audit

```bash
pnpm health:all
```

Runs all health checks and generates report

---

## Queue Commands

### `queue:worker` - Start Queue Worker

```bash
pnpm queue:worker
```

Starts background job processor for:

- Email notifications
- Image processing
- Data exports
- Scheduled tasks

---

### `queue:stats` - Queue Statistics

```bash
pnpm queue:stats
```

**Output:**

```
Queue Statistics
├── Active Jobs: 3
├── Waiting: 12
├── Completed: 1,234
├── Failed: 5
└── Delayed: 0
```

---

### `queue:clean` - Clean Failed Jobs

```bash
pnpm queue:clean
```

Removes failed and completed jobs from queue

---

## Upload Commands

### `upload:bulk` - Bulk Upload Images

```bash
# Upload to default provider
pnpm upload:bulk

# Specify provider
pnpm upload:bulk -- --provider=imagekit
pnpm upload:bulk -- --provider=cloudinary
pnpm upload:bulk -- --provider=aws

# Upload specific directory
pnpm upload:comics

# Dry run (preview only)
pnpm upload:bulk -- --dry-run
```

**Providers:**

- `local`: Local file system
- `imagekit`: ImageKit CDN
- `cloudinary`: Cloudinary
- `aws`: AWS S3

---

### `upload:test` - Test Upload Provider

```bash
pnpm upload:test
```

Uploads test image to verify provider configuration

---

## Scaffold Commands

### `scaffold` - Interactive Scaffolding

```bash
pnpm scaffold
```

Interactive wizard for creating:

- New pages
- API routes
- Components
- Server actions
- Database models

---

### Create Specific Items

```bash
# Create page
pnpm scaffold -- --type=page --name=about

# Create API route
pnpm scaffold -- --type=api --name=users

# Create component
pnpm scaffold -- --type=component --name=Header
```

---

## CI/CD Commands

### `ci` - Run CI Checks

```bash
pnpm ci
```

Runs complete CI pipeline:

1. Type checking
2. Linting
3. Unit tests
4. Build verification

---

### `ci:lint` - Lint Only

```bash
pnpm ci:lint
```

Runs ESLint with strict rules (zero warnings)

---

### `ci:test` - Tests with Coverage

```bash
pnpm ci:test
```

Runs tests and generates HTML/JSON reports

---

### `ci:build` - Production Build

```bash
pnpm ci:build
```

Creates optimized production build

---

## Development Workflows

### Standard Development Flow

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database
pnpm db:push
pnpm db:seed

# 3. Start development
pnpm dev
```

---

### Feature Development Flow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Scaffold new files
pnpm scaffold

# 3. Develop with hot reload
pnpm dev

# 4. Run tests
pnpm test

# 5. Check code quality
pnpm validate

# 6. Commit changes
git add .
git commit -m "feat: add new feature"
```

---

### Pre-deployment Checklist

```bash
# 1. Run full validation
pnpm validate

# 2. Run all tests
pnpm test:all

# 3. Build for production
pnpm build

# 4. Preview production build
pnpm start

# 5. Run CI checks
pnpm ci:full
```

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check database status
pnpm health:db

# Reset database
pnpm db:reset

# Verify DATABASE_URL in .env.local
```

---

#### Redis Connection Errors

```bash
# Check Redis status
pnpm health:redis

# Start Redis (Docker)
docker run -p 6379:6379 redis:alpine

# Or use Upstash Redis (cloud)
```

---

#### Build Errors

```bash
# Clean and rebuild
pnpm clean
pnpm build

# Check for type errors
pnpm type-check

# Fix linting issues
pnpm lint:fix
```

---

#### Import Path Issues

```bash
# Optimize import paths
pnpm imports:optimize

# Check import paths
pnpm imports:check
```

---

## Keyboard Shortcuts

### VS Code Integration

```json
// .vscode/tasks.json
{
  "tasks": [
    {
      "label": "Dev Server",
      "type": "shell",
      "command": "pnpm dev",
      "problemMatcher": []
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "pnpm test:unit",
      "problemMatcher": []
    }
  ]
}
```

---

## Shell Aliases

### PowerShell

```powershell
# Add to $PROFILE
function dev { pnpm dev }
function build { pnpm build }
function test { pnpm test @args }
function lint { pnpm lint }
```

### Bash/Zsh

```bash
# Add to ~/.bashrc or ~/.zshrc
alias dev="pnpm dev"
alias build="pnpm build"
alias test="pnpm test"
alias lint="pnpm lint"
```

---

## Advanced Usage

### Chaining Commands

```bash
# Clean, install, setup
pnpm clean && pnpm install && pnpm setup

# Full CI pipeline
pnpm type-check && pnpm lint:strict && pnpm test:unit:run && pnpm build

# Database reset and seed
pnpm db:reset && pnpm db:seed -- --verbose
```

---

### Environment-Specific Commands

```bash
# Development
NODE_ENV=development pnpm dev

# Production build
NODE_ENV=production pnpm build

# Test environment
NODE_ENV=test pnpm test
```

---

### Debug Mode

```bash
# Debug Next.js
pnpm dev:debug

# Debug tests
pnpm test:debug

# Verbose logging
LOG_LEVEL=debug pnpm dev
```

---

## Performance Tips

1. **Use Turbo mode** (enabled by default)

   ```bash
   pnpm dev --turbopack
   ```

2. **Run tests in parallel**

   ```bash
   pnpm test --parallel
   ```

3. **Cache ESLint results**

   ```bash
   pnpm lint:cache
   ```

4. **Use incremental builds**
   ```bash
   pnpm build --profile
   ```

---

## Getting Help

### CLI Help

```bash
pnpm cw help
cw help
```

### Script Documentation

```bash
# View script source
cat scripts/[script-name].ts

# Check package.json
cat package.json | grep "scripts"
```

### Community Support

- GitHub Issues
- Discord Community
- Documentation: /docs

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

**Last Updated:** 2025-12-22  
**Version:** 1.0.0
