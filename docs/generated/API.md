# ComicWise API Documentation

**Version:** 1.0.0 **Base URL:** `https://api.comicwise.com` (or
`http://localhost:3000` for local development)

## Overview

The ComicWise API provides endpoints for managing comics, chapters, users, and
more. All endpoints use REST conventions and return JSON responses.

## Authentication

All API endpoints require authentication via NextAuth. Include the session token
in the `Authorization` header:

```
Authorization: Bearer {session_token}
```

## Endpoints

### GET /api/users

API endpoint

### GET /api/users/[id]

API endpoint

### GET /api/upload

API endpoint

### GET /api/types

API endpoint

### GET /api/types/[id]

API endpoint

### GET /api/seed

Seed API Route - CRUD Operations

### GET /api/search

Handle main search functionality @param searchParams

### GET /api/lib/genericCrud.ts

API endpoint

### GET /api/lib/generic-crud.ts

API endpoint

### GET /api/health

### GET /api/genres

API endpoint

### GET /api/genres/[id]

API endpoint

### GET /api/comments

API endpoint

### GET /api/comments/[id]

API endpoint

### GET /api/comics

API endpoint

### GET /api/comics/[id]

API endpoint

### GET /api/comic-images

API endpoint

### GET /api/chapters

API endpoint

### GET /api/chapters/[id]

API endpoint

### GET /api/chapter-images

API endpoint

## Response Format

All responses follow this standard format:

```json
{
  "data": {
    /* response data */
  },
  "error": null,
  "success": true,
  "timestamp": "2025-12-29T20:30:00Z"
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes:

- `400` Bad Request - Invalid input
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `500` Internal Server Error - Server error
