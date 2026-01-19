# ComicWise CLI Guide

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Development Scripts](#development-scripts)
- [Database Management](#database-management)
- [Testing](#testing)
- [Production Scripts](#production-scripts)
- [Utility Scripts](#utility-scripts)
- [Advanced Workflows](#advanced-workflows)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run health check
pnpm health
```

## Development Scripts

### Start Development Server

```bash
pnpm dev
```

Starts Next.js in development mode with Turbopack for faster builds.

### Type Checking

```bash
pnpm type-check
```

Runs TypeScript compiler without emitting files to check for type errors.

### Linting

```bash
pnpm lint
```

Runs ESLint to check code quality and style.

### Formatting

```bash
pnpm format
```

Formats all TypeScript, TSX, and Markdown files using Prettier.

## Database Management

### Generate Migrations

```bash
pnpm db:generate
```

Generates SQL migration files from schema changes.

### Run Migrations

```bash
pnpm db:migrate
```

Applies pending migrations to the database.

### Push Schema

```bash
pnpm db:push
```

Pushes schema changes directly to the database (dev only).

### Studio

```bash
pnpm db:studio
```

Opens Drizzle Studio for visual database management.

### Seed Database

```bash
pnpm db:seed
```

Seeds the database with initial data.

## Testing

### Unit Tests

```bash
pnpm test
```

Runs Vitest unit tests.

### Test UI

```bash
pnpm test:ui
```

Opens Vitest UI for interactive testing.

### E2E Tests

```bash
pnpm test:e2e
```

Runs Playwright end-to-end tests.

## Production Scripts

### Build

```bash
pnpm build
```

Creates optimized production build.

### Start Production Server

```bash
pnpm start
```

Starts production server (requires build first).

## Utility Scripts

### Health Check

```bash
pnpm health
```

Checks system health (database, Redis, dependencies, TypeScript).

### Cache Management

```bash
# Flush all cache
pnpm cache:flush

# List all keys
pnpm cache:keys

# Get specific key
pnpm cache:get mykey

# Set key-value
pnpm cache:set mykey myvalue

# Show Redis info
pnpm cache:info
```

### Bulk Upload

```bash
pnpm upload ./images cloudinary
```

Uploads images to cloud provider (Cloudinary, AWS S3, etc.).

### Queue Worker

```bash
pnpm worker email
```

Starts background job worker for specified queue.

### Scaffolding

```bash
# Create new page
pnpm scaffold page Dashboard

# Create new component
pnpm scaffold component Button

# Create new API route
pnpm scaffold api users

# Create new DAL
pnpm scaffold dal User
```

### CI Check

```bash
pnpm ci
```

Runs all CI checks (lint, type-check, build, test).

### Cleanup

```bash
pnpm clean
```

Removes unused files and optimizes project structure.

### CamelCase Conversion

```bash
pnpm camelcase
```

Converts all code to camelCase conventions.

## Advanced Workflows

### Complete Development Setup

```bash
pnpm install && \
pnpm db:push && \
pnpm db:seed && \
pnpm dev
```

### Pre-commit Checks

```bash
pnpm format && \
pnpm lint && \
pnpm type-check && \
pnpm test
```

### Full CI Pipeline

```bash
pnpm ci
```

### Database Reset

```bash
pnpm db:push && \
pnpm db:seed
```

### Production Deployment

```bash
pnpm type-check && \
pnpm lint && \
pnpm test && \
pnpm build
```

## Tips & Shortcuts

- Use `pnpm health` before starting work to ensure everything is set up
- Run `pnpm ci` before pushing to catch issues early
- Use `pnpm scaffold` to quickly generate boilerplate code
- Keep `pnpm worker` running in background for async jobs
- Use `pnpm cache:flush` when experiencing caching issues

## Troubleshooting

### Type Errors

```bash
pnpm type-check
```

### Build Failures

```bash
pnpm clean && pnpm install && pnpm build
```

### Database Issues

```bash
pnpm db:push
```

### Cache Problems

```bash
pnpm cache:flush
```

### Test Failures

```bash
pnpm test --reporter=verbose
```
