# ComicWise - Complete Onboarding Guide

Welcome to ComicWise! This guide will help you get up and running quickly.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Development Workflow](#development-workflow)
6. [CLI Reference](#cli-reference)
7. [Architecture Overview](#architecture-overview)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 9+ (Install: `npm install -g pnpm`)
- **PostgreSQL** 17+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Optional Software

- **Docker** (for containerized development)
- **Redis** (for caching and queues)
- **VS Code** (recommended editor)

### Check Your Setup

```bash
node --version    # Should be 20+
pnpm --version    # Should be 9+
psql --version    # Should be 17+
git --version
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/comicwise.git
cd comicwise
```

### 2. Install Dependencies

```bash
pnpm install
```

This will:

- Install all npm packages
- Set up Git hooks with Husky
- Generate Drizzle types

### 3. Setup Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your settings
code .env.local  # or your preferred editor
```

**Minimum Required Variables:**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/comicwise_dev
AUTH_SECRET=your-32-character-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Setup Database

```bash
# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000 🎉

---

## Environment Setup

### Development (.env.local)

```env
# Required
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/comicwise_dev
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional - Enable as needed
REDIS_URL=redis://localhost:6379
UPLOAD_PROVIDER=local
LOG_LEVEL=debug
```

### Generate Secure AUTH_SECRET

```bash
# Unix/Mac/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## Database Setup

### Using Local PostgreSQL

```bash
# Create database
createdb comicwise_dev

# Set DATABASE_URL in .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/comicwise_dev

# Push schema
pnpm db:push

# Seed data
pnpm db:seed
```

### Using Docker

```bash
# Start PostgreSQL in Docker
docker run --name comicwise-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=comicwise_dev \
  -p 5432:5432 \
  -d postgres:17-alpine

# Set DATABASE_URL in .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/comicwise_dev
```

### Database Management

```bash
# View database in browser
pnpm db:studio

# Reset database (⚠️ deletes all data)
pnpm db:reset

# Create migration
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

---

## Development Workflow

### Daily Development

```bash
# 1. Start dev server
pnpm dev

# 2. Make changes (hot reload enabled)

# 3. Check code quality
pnpm validate

# 4. Run tests
pnpm test:unit

# 5. Commit changes
git add .
git commit -m "feat: your feature"
```

### Creating New Features

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Use scaffolding for boilerplate
pnpm scaffold

# 3. Develop with type safety
pnpm type-check:watch

# 4. Test your changes
pnpm test:unit:watch

# 5. Validate before commit
pnpm validate
```

### Pre-commit Checklist

✅ Code compiles: `pnpm type-check`  
✅ Linting passes: `pnpm lint`  
✅ Format is correct: `pnpm format:check`  
✅ Tests pass: `pnpm test:unit:run`

Or run all at once:

```bash
pnpm validate && pnpm test:unit:run
```

---

## CLI Reference

### Quick Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server

# Database
pnpm db:push      # Update database schema
pnpm db:seed      # Seed data
pnpm db:studio    # Visual DB browser

# Code Quality
pnpm lint         # Run linter
pnpm format       # Format code
pnpm type-check   # Check types

# Testing
pnpm test         # E2E tests
pnpm test:unit    # Unit tests
```

### Advanced Commands

```bash
# Cache Management
pnpm cache:clear  # Clear all caches
pnpm cache:stats  # View cache stats

# Health Checks
pnpm health:check # System health
pnpm health:db    # Database health
pnpm health:redis # Redis health

# Queue Workers
pnpm queue:worker # Start background jobs
pnpm queue:stats  # View queue stats

# Uploads
pnpm upload:bulk  # Bulk upload images
```

Full CLI documentation: [CLI_COMPLETE_GUIDE.md](./CLI_COMPLETE_GUIDE.md)

---

## Architecture Overview

### Project Structure

```
comicwise/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (root)/       # Public pages
│   │   ├── (auth)/       # Auth pages
│   │   ├── admin/        # Admin dashboard
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── ui/           # UI primitives
│   │   ├── admin/        # Admin components
│   │   └── emails/       # Email templates
│   ├── dal/              # Data Access Layer
│   ├── dto/              # Data Transfer Objects
│   ├── database/         # Database layer
│   │   ├── schema.ts     # Drizzle schema
│   │   ├── queries/      # Read operations
│   │   └── mutations/    # Write operations
│   ├── lib/              # Shared utilities
│   │   ├── actions/      # Server actions
│   │   └── validations/  # Zod schemas
│   ├── hooks/            # React hooks
│   ├── services/         # Business logic
│   ├── stores/           # Client state
│   └── types/            # TypeScript types
├── scripts/              # Automation scripts
├── docs/                 # Documentation
└── public/               # Static files
```

### Tech Stack

**Frontend:**

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Radix UI

**Backend:**

- PostgreSQL 17 (Database)
- Drizzle ORM
- NextAuth.js (Auth)
- Zod (Validation)

**DevOps:**

- Docker
- GitHub Actions
- Vercel (Deployment)

**Tools:**

- ESLint + Prettier
- Vitest + Playwright
- Husky (Git hooks)

---

## Best Practices

### Code Style

1. **Use TypeScript strictly**

   ```typescript
   // ✅ Good
   const user: User = await getUser(id);

   // ❌ Avoid
   const user: any = await getUser(id);
   ```

2. **Use server actions for mutations**

   ```typescript
   // src/lib/actions/comic.ts
   "use server";

   export async function createComic(data: ComicFormData) {
     // validation, database, revalidation
   }
   ```

3. **Use path aliases**

   ```typescript
   // ✅ Good
   import { Button } from "#ui/button";
   import { getUser } from "#dal/userDal";

   // ❌ Avoid
   import { Button } from "../../components/ui/button";
   ```

### Database

1. **Use transactions for multi-step operations**
2. **Add indexes for frequently queried fields**
3. **Use proper cascading deletes**
4. **Validate input with Zod before DB**

### Performance

1. **Use React Server Components by default**
2. **Mark client components with "use client"**
3. **Implement proper caching strategies**
4. **Optimize images with next/image**
5. **Use dynamic imports for heavy components**

### Security

1. **Never expose API keys in client code**
2. **Validate all user input**
3. **Use parameterized queries (Drizzle handles this)**
4. **Implement rate limiting for APIs**
5. **Use HTTPS in production**

---

## Troubleshooting

### Common Issues

#### Port 3000 Already in Use

```bash
# Find and kill process
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

#### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
pnpm health:db
```

#### Module Not Found

```bash
# Clear node_modules and reinstall
pnpm clean:all
pnpm install

# Clear Next.js cache
pnpm clean
```

#### Type Errors

```bash
# Regenerate types
pnpm db:generate

# Check for errors
pnpm type-check

# Fix auto-fixable issues
pnpm lint:fix
```

#### Build Failures

```bash
# Clean build artifacts
pnpm clean

# Check for type errors
pnpm type-check

# Try fresh build
pnpm build
```

---

## Next Steps

### Learn More

- 📖 [CLI Complete Guide](./CLI_COMPLETE_GUIDE.md)
- 📖 [API Documentation](./API.md)
- 📖 [Database Schema](./DATABASE.md)
- 📖 [Testing Guide](./TESTING.md)

### Join the Community

- 💬 Discord: [Join Server](#)
- 🐛 GitHub Issues: [Report Bugs](#)
- 📧 Email: support@comicwise.dev

---

## Getting Help

If you're stuck, try these resources:

1. **Check documentation** in `/docs`
2. **Search GitHub issues**
3. **Ask in Discord**
4. **Create an issue**

---

**Happy Coding! 🚀**

_Last updated: 2025-12-22_
