# 🎨 ComicWise

> A modern, high-performance web comic platform built with Next.js 16,
> PostgreSQL, and Redis.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## ✨ Features

- 📚 **Comic Management**: Complete CRUD operations for comics and chapters
- 🔐 **Authentication**: NextAuth v5 with multiple providers (Google, GitHub)
- 🎨 **Modern UI**: Tailwind CSS 4.1 with dark mode support
- ⚡ **Performance**: Optimized with Redis caching and ISR
- 🔍 **Search**: Full-text search with PostgreSQL
- 📱 **Responsive**: Mobile-first design
- 🛠️ **Developer Experience**: TypeScript, ESLint, Prettier
- 🐳 **Docker**: Ready for containerized deployment
- 📊 **Analytics**: Sentry error tracking and monitoring

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Redis 7+ (optional)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd comicwise

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Documentation

- [Setup Guide](./docs/SETUP.md)
- [API Documentation](./docs/API.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI
- **State Management**: Zustand, Jotai
- **Forms**: React Hook Form + Zod

### Backend

- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Cache**: Redis (ioredis + Upstash)
- **Authentication**: NextAuth v5
- **Validation**: Zod

### DevOps

- **Package Manager**: pnpm
- **Linting**: ESLint 9
- **Formatting**: Prettier 3
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel / Docker

## 📦 Project Structure

```
comicwise/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   ├── database/         # Database schema & queries
│   ├── services/         # Business logic
│   └── types/            # TypeScript types
├── public/               # Static assets
├── scripts/              # Utility scripts
├── docs/                 # Documentation
└── tests/                # Test files
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test:unit

# Run e2e tests
pnpm test

# Run with coverage
pnpm test:unit:coverage
```

## 🐳 Docker

```bash
# Development
docker compose up -d

# Production
docker compose -f docker-compose.yml up -d
```

## 📝 Available Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `pnpm dev`        | Start development server  |
| `pnpm build`      | Build for production      |
| `pnpm start`      | Start production server   |
| `pnpm lint`       | Run ESLint                |
| `pnpm format`     | Format code with Prettier |
| `pnpm type-check` | Check TypeScript types    |
| `pnpm test`       | Run all tests             |
| `pnpm db:push`    | Push database schema      |
| `pnpm db:seed`    | Seed database             |
| `pnpm db:studio`  | Open Drizzle Studio       |

## 🤝 Contributing

Contributions are welcome! Please read our
[Contributing Guide](./docs/CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE)
file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Radix UI](https://www.radix-ui.com/)

---

**Made with ❤️ by the ComicWise Team**

_Last updated: 2026-01-20T04:24:35.792Z_

## 🔐 Environment hygiene & secret scanning

We enforce a lightweight secret-scanning step to prevent committing sensitive
values (API keys, tokens, DB credentials) to the repository.

Local usage

```bash
# Install deps
pnpm install

# Run the secret scanner locally
pnpm run check-env-secrets

# The script exits non-zero if it finds potential secrets; replace the values with placeholders before committing.
```

CI

A GitHub Actions workflow is included at
`.github/workflows/check-env-secrets.yml` which runs
`pnpm run check-env-secrets` on pull requests and pushes to `main`. The job will
fail the run if any potential secrets are detected — fix or redact before
merging.

Guidance

- Never commit real `.env` files. Use `.env.example` or templates with
  placeholders.
- Keep local secrets in `.env.local` (ignored by git) and back them up locally
  if needed (for example, `.env.local.bak`).
- Rotate exposed tokens immediately and replace them with placeholders in the
  repo.

Cache adapter (test/CI)

- The project uses a compatibility cache adapter layer
  (`src/lib/cache/index.ts`). For local development the Redis-backed client is
  used by default. In tests and CI we recommend using the in-memory adapter to
  avoid external Redis dependencies. To force the in-memory adapter in tests
  set:

```bash
export CACHE_ADAPTER=in-memory
export SKIP_ENV_VALIDATION=true
```

The test harness already sets these variables when running unit tests via
Vitest.
