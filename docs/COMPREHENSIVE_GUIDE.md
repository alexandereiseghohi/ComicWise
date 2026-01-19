# ComicWise - Complete Documentation

Generated: 2025-12-29T20:05:26.815Z

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Environment Variables](#environment-variables)
5. [Database](#database)
6. [Database Seeding](#database-seeding)
7. [API Reference](#api-reference)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

# Project Overview

ComicWise is a full-featured web comic reading and management platform built
with modern web technologies.

### Key Features

- **Authentication**: NextAuth v5 with OAuth and credentials
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis for performance optimization
- **Image Management**: Multi-provider support (ImageKit, Cloudinary, AWS S3,
  Local)
- **Search**: Full-text search across comics, authors, and artists
- **Admin Panel**: Comprehensive content and user management
- **API**: RESTful endpoints with rate limiting
- **Background Jobs**: Queue system with BullMQ
- **Email**: Automated notifications with React Email
- **SEO**: Optimized metadata and sitemaps

---

# Quick Start

## Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 15+
- Redis (optional, can use Upstash)

## Installation

```bash
# Clone repository
git clone <repository-url>
cd comicwise

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local

# Run database migrations
pnpm db:push

# Seed database
pnpm db:seed

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

---

# Detailed Setup

### Environment Configuration

Create a `.env.local` file based on `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/comicwise"

# Authentication
AUTH_SECRET="your-secret-key-min-32-chars"
AUTH_URL="http://localhost:3000/api/auth"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Upload Provider
UPLOAD_PROVIDER="local" # or imagekit, cloudinary, aws

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Email (optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@comicwise.com"
```

### Database Setup

```bash
# Push schema to database
pnpm db:push

# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Drop database (development only)
pnpm db:drop
```

### Docker Setup

```bash
# Start services with Docker Compose
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

---

# Environment Variables

### Required Variables

| Variable            | Description                    | Example                        |
| ------------------- | ------------------------------ | ------------------------------ |
| DATABASE_URL        | PostgreSQL connection string   | postgresql://...               |
| AUTH_SECRET         | NextAuth secret (min 32 chars) | long-random-string             |
| AUTH_URL            | Auth callback URL              | http://localhost:3000/api/auth |
| NODE_ENV            | Environment mode               | development, production        |
| NEXT_PUBLIC_APP_URL | Public app URL                 | http://localhost:3000          |

### Optional Variables

| Variable              | Description           | Default        |
| --------------------- | --------------------- | -------------- |
| UPLOAD_PROVIDER       | Image upload service  | local          |
| IMAGEKIT_PUBLIC_KEY   | ImageKit public key   | -              |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | -              |
| AWS_REGION            | AWS region            | -              |
| REDIS_HOST            | Redis hostname        | localhost      |
| REDIS_PORT            | Redis port            | 6379           |
| EMAIL_SERVER_HOST     | SMTP host             | smtp.gmail.com |

### Validation

Validate your environment configuration:

```bash
pnpm tsx scripts/envValidator.ts --report
```

---

# Database

### Schema

ComicWise uses PostgreSQL with the following main tables:

- **users**: User accounts and profiles
- **comics**: Comic metadata and information
- **chapters**: Individual comic chapters
- **chapters_images**: Images within chapters
- **comments**: User comments on comics
- **bookmarks**: User bookmarks
- **genres**: Comic genres and categories
- **authors**: Comic authors
- **artists**: Comic artists
- **authenticators**: WebAuthn authenticators

### Migrations

```bash
# Generate schema changes
pnpm db:generate

# Migrate to latest schema
pnpm db:migrate

# Create backup before important changes
pnpm db:pull
```

### Queries

Access database through Drizzle Studio:

```bash
pnpm db:studio
```

---

# Database Seeding

### Seed Data Files

Place seed data in JSON format at project root:

- **users.json**: User accounts
- **comics.json**: Comic information
- **chapters.json**: Chapter data
- **chaptersdata1.json**, **comicsdata1.json**: Additional data sets

### Seed Commands

```bash
# Seed all data
pnpm db:seed

# Seed specific entity
pnpm db:seed:users
pnpm db:seed:comics
pnpm db:seed:chapters

# Validate without seeding
pnpm db:seed:dry-run

# Verbose output
pnpm db:seed:verbose

# Clear all data
pnpm seed:clear
```

### Custom Seeding

The seeding system uses:

- **Zod validation**: Type-safe data validation
- **Image service**: Automatic image download and optimization
- **Batch processing**: Efficient bulk inserts
- **Transaction support**: Data integrity
- **Progress tracking**: Real-time feedback

Example seed data structure (users.json):

```json
[
  {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": true,
    "emailVerified": "2025-12-29T00:00:00Z"
  }
]
```

---

# API Reference

### Authentication Endpoints

- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/session` - Get current session
- `POST /api/auth/register` - Register new user

### Comics Endpoints

- `GET /api/comics` - List all comics
- `GET /api/comics/:id` - Get comic details
- `POST /api/comics` - Create new comic (admin)
- `PUT /api/comics/:id` - Update comic (admin)
- `DELETE /api/comics/:id` - Delete comic (admin)

### Chapters Endpoints

- `GET /api/chapters` - List chapters
- `GET /api/chapters/:id` - Get chapter details
- `POST /api/chapters` - Create chapter (admin)
- `PUT /api/chapters/:id` - Update chapter (admin)
- `DELETE /api/chapters/:id` - Delete chapter (admin)

### Comments Endpoints

- `GET /api/comments` - List comments
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Search Endpoint

- `GET /api/search?q=query` - Search comics/authors/artists

### Upload Endpoint

- `POST /api/upload` - Upload images

### Rate Limiting

API requests are rate-limited based on user role:

- **Unauthenticated**: 10 requests per minute
- **Authenticated User**: 100 requests per minute
- **Admin**: 500 requests per minute

---

# Testing

### Unit Tests

Run unit tests with Vitest:

```bash
# Run all tests
pnpm test:unit

# Watch mode
pnpm test:unit:watch

# Coverage report
pnpm test:unit:coverage

# Run specific test
pnpm vitest run path/to/test.spec.ts
```

### E2E Tests

Run end-to-end tests with Playwright:

```bash
# Run all tests
pnpm test

# Headed mode (see browser)
pnpm test:headed

# Debug mode
pnpm test:debug

# Generate test code
pnpm test:codegen

# View report
pnpm test:report
```

### CI/CD Testing

```bash
# Run full CI pipeline
pnpm ci:full

# Type check, lint, and test
pnpm validate
```

---

# Deployment

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Analyze bundle size
pnpm build:analyze
```

### Environment for Production

Update `.env.local` for production:

```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
DATABASE_URL="postgresql://...production..."
AUTH_SECRET="generate-new-secret"
# Use production Redis/email/upload providers
```

### Vercel Deployment

```bash
# Deploy preview
pnpm deploy:preview

# Deploy production
pnpm deploy:vercel
```

### Docker Deployment

```bash
# Build Docker image
docker build -t comicwise:latest .

# Run container
docker run -p 3000:3000 --env-file .env.local comicwise:latest
```

---

# Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check database connection
pnpm health:db

# Verify DATABASE_URL in .env.local
# Test connection: psql $DATABASE_URL
```

#### Redis Connection Failed

```bash
# Check Redis connection
pnpm health:redis

# If using Upstash, verify credentials
# Local Redis: ensure service is running
```

#### Build Errors

```bash
# Clean and rebuild
pnpm clean && pnpm install

# Check TypeScript errors
pnpm type-check

# Fix linting issues
pnpm lint:fix
```

#### Performance Issues

```bash
# Analyze bundle size
pnpm build:analyze

# Check cache
pnpm cache:stats

# Clear cache
pnpm cache:clear
```

### Debug Mode

Enable detailed logging:

```bash
DEBUG=next:* pnpm dev
```

### Health Check

```bash
# Check all services
pnpm health:all

# Individual checks
pnpm health:db
pnpm health:redis
pnpm health:check
```

---
