# ComicWise Database Schema

**Framework:** Drizzle ORM 0.45.1 **Database:** PostgreSQL 15+

## Overview

The database uses PostgreSQL with Drizzle ORM for type-safe queries. All tables
use UUID primary keys and have automatic timestamps.

## Tables

## Relationships

- **users** ← **bookmarks** (one user has many bookmarks)
- **users** ← **comments** (one user can write many comments)
- **comics** ← **chapters** (one comic has many chapters)
- **comics** ← **ratings** (one comic can have many ratings)
- **chapters** ← **comments** (one chapter can have many comments)

## Migrations

Migrations are managed with Drizzle Kit. Run migrations with:

```bash
pnpm db:push
```
