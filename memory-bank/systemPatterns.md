# System Patterns

ArchitectureOverview: Server components: Next.js server components + server
actions, Drizzle for DB access, Redis for caching.

Components:

- src/app (routes & pages)
- src/lib (actions, nodemailer, seed helpers)
- src/database (drizzle init, seeders)

DataFlow:

1. Seed JSON -> seedHelpers validate -> download images -> save to public/comics
   -> insert rows via Drizzle.

DecisionRecords:

- Use public/ for static image serving to match Next.js public-root convention.
