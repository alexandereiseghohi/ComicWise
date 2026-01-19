---
title: ComicWise Complete Setup
description: Complete setup guide for ComicWise project
tags: [setup, nextjs, postgresql, redis]
---

# ComicWise - Complete Project Setup

## Project Overview

ComicWise is a modern web comic platform built with:
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Cache**: Redis (ioredis + Upstash)
- **Auth**: NextAuth v5
- **Styling**: Tailwind CSS 4.1
- **Testing**: Vitest + Playwright

## Prerequisites

1. Node.js 20+
2. pnpm 9+
3. PostgreSQL 16+
4. Redis 7+ (optional)

## Quick Setup

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local

# Setup database
pnpm db:push
pnpm db:seed

# Run development server
pnpm dev
```

## Environment Variables

Required variables in `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/comicwise"
AUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Project Structure

- `src/app` - Next.js app router pages
- `src/components` - Reusable React components
- `src/database` - Database schema and queries
- `src/lib` - Utility functions and helpers
- `src/services` - Business logic layer

## Development Workflow

1. Create feature branch
2. Make changes
3. Run tests: `pnpm test`
4. Run linter: `pnpm lint`
5. Commit and push
6. Create pull request

## Common Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm lint             # Run ESLint
pnpm type-check       # Check TypeScript
pnpm test:unit        # Run unit tests
pnpm test             # Run e2e tests
pnpm db:studio        # Open Drizzle Studio
```

## Deployment

### Vercel
1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

### Docker
```bash
docker compose up -d
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)

---

*Generated: 2026-01-19T19:55:57.819Z*
