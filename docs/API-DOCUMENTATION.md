# ComicWise API Documentation

Complete REST API reference for the ComicWise platform.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Comics API](#comics-api)
- [Chapters API](#chapters-api)
- [Bookmarks API](#bookmarks-api)
- [Comments API](#comments-api)
- [Users API](#users-api)
- [Search API](#search-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Overview

**Base URL:** `https://comicwise.app/api`

**Content Type:** `application/json`

**Authentication:** Bearer token (JWT) via NextAuth

## Authentication

### Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "image": "https://cdn.example.com/avatar.jpg"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "success": true
}
```

### Sign Up

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

### Sign Out

```http
POST /api/auth/signout
Authorization: Bearer {token}
```

## Comics API

### List Comics

```http
GET /api/comics?page=1&limit=20&genre=action&status=ongoing
```

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `genre` (string, optional) - Filter by genre
- `status` (string, optional) - Filter by status (ongoing, completed, hiatus)
- `sort` (string, default: "latest") - Sort by (latest, popular, rating, title)

**Response:**

```json
{
  "data": {
    "comics": [
      {
        "id": 1,
        "title": "Amazing Spider-Man",
        "slug": "amazing-spider-man",
        "description": "The adventures of Peter Parker...",
        "coverImage": "https://cdn.example.com/covers/spiderman.jpg",
        "author": "Stan Lee",
        "artist": "Steve Ditko",
        "genres": ["action", "superhero"],
        "status": "ongoing",
        "rating": 4.8,
        "views": 1250000,
        "bookmarks": 45000,
        "chapters": 200,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1500,
      "totalPages": 75
    }
  },
  "success": true
}
```

### Get Comic by ID

```http
GET /api/comics/1
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "title": "Amazing Spider-Man",
    "slug": "amazing-spider-man",
    "description": "The adventures of Peter Parker...",
    "coverImage": "https://cdn.example.com/covers/spiderman.jpg",
    "author": "Stan Lee",
    "artist": "Steve Ditko",
    "genres": ["action", "superhero"],
    "status": "ongoing",
    "rating": 4.8,
    "views": 1250000,
    "bookmarks": 45000,
    "chapters": [
      {
        "id": 1,
        "number": 1,
        "title": "The Birth of Spider-Man",
        "pages": 22,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  "success": true
}
```

### Create Comic (Creator Only)

```http
POST /api/comics
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "New Comic Title",
  "description": "Comic description",
  "author": "Author Name",
  "artist": "Artist Name",
  "genres": ["action", "adventure"],
  "status": "ongoing",
  "cover": <file>
}
```

**Response:**

```json
{
  "data": {
    "id": 1501,
    "title": "New Comic Title",
    "slug": "new-comic-title",
    "coverImage": "https://cdn.example.com/covers/new-comic.jpg"
  },
  "success": true
}
```

### Update Comic (Creator Only)

```http
PATCH /api/comics/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Updated description",
  "status": "completed"
}
```

### Delete Comic (Creator/Admin Only)

```http
DELETE /api/comics/1
Authorization: Bearer {token}
```

## Chapters API

### List Chapters

```http
GET /api/comics/1/chapters?page=1&limit=20
```

**Response:**

```json
{
  "data": {
    "chapters": [
      {
        "id": 1,
        "number": 1,
        "title": "The Birth of Spider-Man",
        "pages": 22,
        "views": 50000,
        "comicId": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 200,
      "totalPages": 10
    }
  },
  "success": true
}
```

### Get Chapter by ID

```http
GET /api/comics/1/chapters/1
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "number": 1,
    "title": "The Birth of Spider-Man",
    "pages": [
      "https://cdn.example.com/chapters/1/page-1.jpg",
      "https://cdn.example.com/chapters/1/page-2.jpg"
    ],
    "views": 50000,
    "comicId": 1,
    "comic": {
      "id": 1,
      "title": "Amazing Spider-Man"
    },
    "prevChapter": null,
    "nextChapter": {
      "id": 2,
      "number": 2,
      "title": "The Villain Strikes"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "success": true
}
```

### Create Chapter (Creator Only)

```http
POST /api/comics/1/chapters
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "number": 201,
  "title": "New Chapter",
  "pages": [<file1>, <file2>, ...]
}
```

### Update Chapter (Creator Only)

```http
PATCH /api/comics/1/chapters/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Chapter Title"
}
```

### Delete Chapter (Creator/Admin Only)

```http
DELETE /api/comics/1/chapters/1
Authorization: Bearer {token}
```

## Bookmarks API

### List User Bookmarks

```http
GET /api/bookmarks?page=1&limit=20&status=reading
Authorization: Bearer {token}
```

**Query Parameters:**

- `status` (string, optional) - Filter by status (reading, completed,
  plan_to_read, on_hold, dropped)

**Response:**

```json
{
  "data": {
    "bookmarks": [
      {
        "id": 1,
        "userId": "user_123",
        "comicId": 1,
        "status": "reading",
        "lastReadChapter": 45,
        "comic": {
          "id": 1,
          "title": "Amazing Spider-Man",
          "coverImage": "https://cdn.example.com/covers/spiderman.jpg",
          "chapters": 200
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  },
  "success": true
}
```

### Create Bookmark

```http
POST /api/bookmarks
Authorization: Bearer {token}
Content-Type: application/json

{
  "comicId": 1,
  "status": "reading"
}
```

### Update Bookmark

```http
PATCH /api/bookmarks/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "lastReadChapter": 200
}
```

### Delete Bookmark

```http
DELETE /api/bookmarks/1
Authorization: Bearer {token}
```

## Comments API

### List Comments

```http
GET /api/comics/1/chapters/1/comments?page=1&limit=20
```

**Response:**

```json
{
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "Great chapter!",
        "likes": 125,
        "userId": "user_123",
        "user": {
          "id": "user_123",
          "name": "John Doe",
          "image": "https://cdn.example.com/avatars/john.jpg"
        },
        "chapterId": 1,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 450,
      "totalPages": 23
    }
  },
  "success": true
}
```

### Create Comment

```http
POST /api/comics/1/chapters/1/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "This chapter was amazing!"
}
```

### Update Comment

```http
PATCH /api/comments/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Updated comment text"
}
```

### Delete Comment

```http
DELETE /api/comments/1
Authorization: Bearer {token}
```

### Like Comment

```http
POST /api/comments/1/like
Authorization: Bearer {token}
```

## Users API

### Get Current User

```http
GET /api/users/me
Authorization: Bearer {token}
```

**Response:**

```json
{
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://cdn.example.com/avatars/john.jpg",
    "bio": "Comic enthusiast",
    "role": "user",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  "success": true
}
```

### Update Profile

```http
PATCH /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "bio": "Updated bio"
}
```

### Upload Avatar

```http
POST /api/users/me/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "avatar": <file>
}
```

### Delete Account

```http
DELETE /api/users/me
Authorization: Bearer {token}
```

## Search API

### Global Search

```http
GET /api/search?q=spider&type=comics&page=1&limit=20
```

**Query Parameters:**

- `q` (string, required) - Search query
- `type` (string, optional) - Search type (comics, chapters, users)
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response:**

```json
{
  "data": {
    "results": [
      {
        "id": 1,
        "type": "comic",
        "title": "Amazing Spider-Man",
        "coverImage": "https://cdn.example.com/covers/spiderman.jpg",
        "relevance": 0.95
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  },
  "success": true
}
```

## Error Handling

All API responses follow this structure:

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "code": "ERROR_CODE",
  "error": "Error message",
  "success": false
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Validation Error Example

```json
{
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "error": "Validation failed",
  "success": false
}
```

## Rate Limiting

Rate limits are applied per endpoint and user:

### Limits

- **Authentication:** 5 requests per 15 minutes
- **API (read):** 100 requests per minute
- **API (write):** 30 requests per minute
- **Comments:** 10 per minute
- **Uploads:** 10 per 5 minutes

### Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320000
```

### Rate Limit Exceeded Response

```json
{
  "error": "Too many requests",
  "limit": 100,
  "message": "Rate limit exceeded. Try again in 5 minutes.",
  "remaining": 0,
  "retryAfter": 1705320000,
  "success": false
}
```

## Webhooks

### Comic Updated

```json
{
  "data": {
    "comicId": 1,
    "changes": ["description", "status"]
  },
  "event": "comic.updated",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Chapter Published

```json
{
  "data": {
    "comicId": 1,
    "chapterId": 201,
    "chapterNumber": 201
  },
  "event": "chapter.published",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## SDKs

### JavaScript/TypeScript

```bash
npm install @comicwise/sdk
```

```typescript
import { ComicWise } from "@comicwise/sdk";

const client = new ComicWise({
  apiKey: process.env.COMICWISE_API_KEY,
});

const comics = await client.comics.list({ page: 1, limit: 20 });
```

### Python

```bash
pip install comicwise
```

```python
from comicwise import ComicWise

client = ComicWise(api_key=os.getenv("COMICWISE_API_KEY"))
comics = client.comics.list(page=1, limit=20)
```

## Support

- **Documentation:** https://docs.comicwise.app
- **Email:** support@comicwise.app
- **GitHub:** https://github.com/comicwise/comicwise
