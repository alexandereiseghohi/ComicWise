# ComicWise API Documentation

## Overview

ComicWise provides a comprehensive RESTful API and Server Actions for managing
comics, chapters, users, and more.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

All authenticated endpoints require a valid session token.

```typescript
// Using NextAuth session
import { auth } from "@/lib/auth";

const session = await auth();
```

## Endpoints

### Comics

#### GET /api/comics

Get all comics with pagination.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search query
- `genre`: Filter by genre
- `status`: Filter by status

#### GET /api/comics/[slug]

Get a single comic by slug.

#### POST /api/comics

Create a new comic (Admin only).

### Chapters

#### GET /api/comics/[slug]/chapters

Get all chapters for a comic.

#### GET /api/comics/[slug]/chapters/[number]

Get a specific chapter.

### Users

#### GET /api/users/me

Get current user profile.

#### PATCH /api/users/me

Update current user profile.

## Server Actions

ComicWise uses Next.js Server Actions for mutations.

```typescript
import { createComic } from "@/lib/actions/comics";

const result = await createComic(formData);
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Admin: Unlimited

## Error Handling

All API responses follow a consistent error format:

```json
{
  "code": "ERROR_CODE",
  "details": {},
  "error": "Error message"
}
```

## Code Examples

### Fetching Comics

```typescript
const response = await fetch("/api/comics?page=1&limit=20");
const { comics, totalPages } = await response.json();
```

### Creating a Comic (Server Action)

```typescript
"use server";

import { createComic } from "@/lib/actions/comics";

export async function handleCreateComic(formData: FormData) {
  const result = await createComic(formData);
  return result;
}
```

---

_Last updated: 2026-01-20T04:24:35.768Z_
