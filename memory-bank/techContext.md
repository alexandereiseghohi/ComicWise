# Technical Context

TechStack:

- Next.js 16, React 19, TypeScript, Drizzle ORM, PostgreSQL, Redis, pnpm,
  Tailwind

Runtime/OS:

- Dev: Windows (PowerShell), Linux CI

DevSetup:

- pnpm install
- copy .env.example -> .env and fill secrets
- pnpm dev

CI/CDNotes:

- Use GitHub Actions jobs for type-check, lint, build, seed-dry-run

CriticalDeps:

- DATABASE*URL, REDIS_URL, SMTP*\* (not checked into repo)
