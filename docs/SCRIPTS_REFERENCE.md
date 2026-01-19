# Package.json Scripts Reference

Complete guide to all available npm/pnpm scripts in the ComicWise project.

## 📖 Table of Contents

- [Development](#development)
- [Build & Production](#build--production)
- [Database](#database)
- [Redis & Cache](#redis--cache)
- [Queue & Background Jobs](#queue--background-jobs)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [CI/CD](#cicd)
- [Docker](#docker)
- [Deployment](#deployment)
- [Email](#email)
- [File Uploads](#file-uploads)
- [Utilities](#utilities)
- [Setup & Installation](#setup--installation)

---

## Development

Start development server and related tools.

```bash
# Start dev server with Turbopack
pnpm dev

# Start with debugger attached
pnpm dev:debug

# Start with HTTPS (experimental)
pnpm dev:https

# Alternative dev command
pnpm dev:turbo
```

---

## Build & Production

Build and run production versions.

```bash
# Standard production build
pnpm build

# Build with bundle analyzer
pnpm build:analyze
pnpm analyze-bundle

# Debug builds
pnpm build:debug
pnpm build:debug:prerender

# Performance profiling
pnpm build:profile

# Standalone build (for Docker)
pnpm build:standalone

# Check bundle size
pnpm bundle-size

# Start production server
pnpm start
pnpm start:prod

# Build + start
pnpm preview
```

---

## Database

Drizzle ORM database management.

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema to database
pnpm db:push

# Pull schema from database
pnpm db:pull

# Check migrations
pnpm db:check

# Drop database
pnpm db:drop

# Upgrade migrations
pnpm db:up

# Open Drizzle Studio (GUI)
pnpm db:studio

# Backup database
pnpm db:backup

# Restore from backup
pnpm db:restore

# Reset database (drop + push + seed)
pnpm db:reset

# Hard reset (drop + generate + push + seed)
pnpm db:reset:hard

# Seed database
pnpm db:seed
pnpm db:seed:chapters      # Chapters only
pnpm db:seed:comics        # Comics only
pnpm db:seed:users         # Users only
pnpm db:seed:dry-run       # Preview without seeding
pnpm db:seed:no-images     # Skip image downloads
pnpm db:seed:verbose       # Detailed output
```

---

## Redis & Cache

Redis cache management.

```bash
# Start Redis (Docker)
pnpm redis:start

# Stop Redis
pnpm redis:stop

# Open Redis CLI
pnpm redis:cli

# Flush all Redis data
pnpm redis:flush

# Clear application cache
pnpm cache:clear              # Clear all
pnpm cache:clear "comic:*"    # Clear by pattern

# View cache statistics
pnpm cache:stats
```

---

## Queue & Background Jobs

BullMQ job queue management.

```bash
# Start queue worker
pnpm queue:worker

# Open Bull Board dashboard
pnpm queue:dashboard

# Clean queue
pnpm queue:clean

# View queue statistics
pnpm queue:stats

# QStash (Upstash)
pnpm qstash:dashboard
pnpm qstash:test

# Test workflow system
pnpm workflow:test
```

---

## Testing

Playwright E2E and Vitest unit tests.

```bash
# Run all E2E tests
pnpm test

# Interactive UI mode
pnpm test:ui

# Headed mode (see browser)
pnpm test:headed

# Debug mode
pnpm test:debug

# Generate test code
pnpm test:codegen

# Record trace
pnpm test:trace

# View test report
pnpm test:report

# Update snapshots
pnpm test:update-snapshots

# Browser-specific
pnpm test:chromium
pnpm test:firefox
pnpm test:webkit
pnpm test:mobile

# Feature-specific
pnpm test:auth
pnpm test:crud

# Unit tests (Vitest)
pnpm test:unit              # Watch mode
pnpm test:unit:run          # Run once
pnpm test:unit:watch        # Watch mode
pnpm test:unit:coverage     # With coverage
pnpm test:unit:ui           # UI mode

# Run all tests
pnpm test:all
```

---

## Code Quality

Linting, formatting, and type checking.

```bash
# Linting
pnpm lint                   # Check for issues
pnpm lint:fix               # Auto-fix issues
pnpm lint:strict            # Zero warnings
pnpm lint:fixtype           # Fix specific types
pnpm lint:cache             # With cache

# Formatting
pnpm format                 # Format all files
pnpm format:check           # Check formatting

# Type checking
pnpm type-check             # Check types
pnpm type-check:watch       # Watch mode

# Validation (all checks)
pnpm validate               # Strict validation
pnpm validate:quick         # Type + lint only

# Spell checking
pnpm cspell                 # Check spelling
pnpm cspell:fix             # Auto-fix spelling

# Find unused code
pnpm find-deadcode
pnpm find-unused
```

---

## CI/CD

Continuous integration scripts.

```bash
# Standard CI pipeline
pnpm ci

# Full CI (with E2E tests)
pnpm ci:full

# CI build only
pnpm ci:build

# CI lint only
pnpm ci:lint

# CI test only
pnpm ci:test
pnpm ci:test:unit
```

---

## Docker

Docker container management.

```bash
# Build containers
pnpm docker:build

# Start containers
pnpm docker:up

# Stop containers
pnpm docker:down

# Restart containers
pnpm docker:restart

# View logs
pnpm docker:logs
pnpm docker:logs:app
pnpm docker:logs:db

# Development mode
pnpm docker:dev
pnpm docker:dev:build

# Production mode
pnpm docker:prod

# Cleanup
pnpm docker:clean
pnpm docker:prune

# Shell access
pnpm docker:shell

# Test Docker setup
pnpm docker:test
```

---

## Deployment

Deploy to various platforms.

```bash
# Vercel
pnpm deploy:vercel          # Production
pnpm deploy:preview         # Preview

# Docker
pnpm deploy:docker

# Pre-deployment checks
pnpm predeploy
```

---

## Email

Email development and testing.

```bash
# Start email dev server
pnpm email:dev

# Export email templates
pnpm email:export

# Test email sending
pnpm email:test

# Open email preview
pnpm email:preview
```

---

## File Uploads

Bulk image upload to cloud providers.

```bash
# Upload to all providers
pnpm upload:bulk

# Dry run (preview)
pnpm upload:bulk:dry-run

# Specific provider
pnpm upload:bulk:imagekit
pnpm upload:bulk:cloudinary
pnpm upload:bulk:aws

# Specific directory
pnpm upload:comics

# Test upload
pnpm upload:test
```

---

## Utilities

General utility scripts.

```bash
# Clean build artifacts
pnpm clean
pnpm clean:cache
pnpm clean:all

# Next.js info
pnpm info

# Lighthouse audit
pnpm lighthouse

# Security audits
pnpm audit
pnpm audit:fix

# Dependency management
pnpm dedupe
pnpm check-updates
pnpm check-updates:ncu
pnpm update-deps
pnpm update-deps:minor
pnpm update-deps:patch
pnpm update:deps
```

---

## Setup & Installation

Initial setup and installation.

```bash
# Standard setup
pnpm setup

# Clean setup
pnpm setup:clean

# Docker setup
pnpm setup:docker

# Full setup (with build)
pnpm setup:full

# Prepare (Husky hooks)
pnpm prepare

# Post-install hooks
pnpm postinstall
```

---

## Additional Categories

### Codemod & Migration

```bash
pnpm codemod:replace-upload
pnpm migrate:v14-to-v15
```

### Priority System

```bash
pnpm priority
pnpm priority:list
pnpm priority:status
pnpm priority:complete
pnpm priority:run:p0
pnpm priority:run:p1
pnpm priority:run:p2
pnpm priority:run:p3
```

### Type Generation

```bash
pnpm types:generate
pnpm types:install
pnpm stub
pnpm clear-stub
```

### Telemetry

```bash
pnpm telemetry:disable
pnpm telemetry:enable
```

### Monitoring & Health

```bash
pnpm health:check
pnpm health:db
pnpm health:redis
pnpm health:all
```

---

## Common Workflows

### First Time Setup

```bash
pnpm install
pnpm setup
pnpm dev
```

### Daily Development

```bash
pnpm dev                    # Start dev server
pnpm test:unit:watch        # Run tests in watch mode
pnpm lint:fix               # Fix linting issues
```

### Before Committing

```bash
pnpm validate              # Run all checks
pnpm test:unit:run         # Run unit tests
```

### Before Deploying

```bash
pnpm validate
pnpm test:all
pnpm build
```

### Database Reset

```bash
pnpm db:reset              # Quick reset
pnpm db:reset:hard         # Full reset with migrations
```

### Docker Development

```bash
pnpm docker:dev            # Start services
pnpm dev                   # Start Next.js
```

### Production Build

```bash
pnpm build
pnpm start:prod
```

---

## Tips

### Chaining Commands

```bash
# Multiple commands
pnpm clean && pnpm install && pnpm build

# With error handling
pnpm lint:fix && pnpm format && pnpm validate
```

### Environment-Specific

```bash
# Most scripts automatically use .env.local
# Some use --env-file flag explicitly

# Examples:
pnpm db:seed                # Uses .env.local
pnpm upload:bulk            # Uses .env.local
pnpm health:check           # Uses .env.local
```

### Debugging

```bash
# Debug Next.js
pnpm dev:debug

# Debug tests
pnpm test:debug

# Debug build
pnpm build:debug
```

### Performance

```bash
# Analyze bundle
pnpm build:analyze

# Check bundle size
pnpm bundle-size

# Run Lighthouse
pnpm lighthouse
```

---

## Script Categories Summary

| Category         | Scripts     | Description                 |
| ---------------- | ----------- | --------------------------- |
| **Development**  | 4 scripts   | Dev server, debugging       |
| **Build**        | 8 scripts   | Production builds, analysis |
| **Database**     | 17 scripts  | Schema, migrations, seeding |
| **Redis**        | 6 scripts   | Cache management            |
| **Queue**        | 6 scripts   | Background jobs             |
| **Testing**      | 20+ scripts | E2E, unit tests             |
| **Code Quality** | 13 scripts  | Lint, format, types         |
| **CI/CD**        | 6 scripts   | Automation                  |
| **Docker**       | 12 scripts  | Containers                  |
| **Email**        | 4 scripts   | Email dev/test              |
| **Upload**       | 7 scripts   | File uploads                |
| **Utilities**    | 10+ scripts | Misc tools                  |

**Total: 100+ scripts** organized into logical categories.

---

## Need Help?

```bash
# View this guide
cat docs/SCRIPTS_REFERENCE.md

# Check package.json
cat package.json

# Run health checks
pnpm health:all
```

For script-specific help, many scripts support `--help`:

```bash
pnpm db:seed --help
pnpm upload:bulk --help
```
