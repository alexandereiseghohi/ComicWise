# ComicWise - Technical Requirements Document (TRD)

**Document Version**: 1.0 **Date**: January 2026 **Status**: PRODUCTION READY
**Project**: ComicWise - Modern Web Comic Platform

---

## Executive Summary

The Technical Requirements Document specifies the technical architecture,
technology stack, system design, and implementation details for ComicWise
platform.

---

## 1. Technology Stack

### 1.1 Frontend Stack

| Layer         | Technology       | Version  | Purpose                     |
| ------------- | ---------------- | -------- | --------------------------- |
| Framework     | Next.js          | 16+      | App Router, SSR, API routes |
| Runtime       | React            | 19+      | UI components               |
| Language      | TypeScript       | 5+       | Type safety                 |
| Styling       | Tailwind CSS     | 4.1+     | Utility-first styling       |
| UI Components | shadcn/ui        | Latest   | Pre-built components        |
| State         | Zustand          | 4+       | Client state management     |
| Forms         | React Hook Form  | 7+       | Form handling               |
| Validation    | Zod              | Latest   | Schema validation           |
| HTTP Client   | fetch API        | Built-in | API calls                   |
| Icons         | Lucide React     | Latest   | Icon components             |
| Analytics     | Vercel Analytics | Latest   | Performance tracking        |

### 1.2 Backend Stack

| Layer          | Technology  | Version | Purpose                    |
| -------------- | ----------- | ------- | -------------------------- |
| Runtime        | Node.js     | 20+     | Server runtime             |
| Framework      | Next.js     | 16+     | Server actions, API routes |
| Language       | TypeScript  | 5+      | Type safety                |
| Database       | PostgreSQL  | 16+     | ACID-compliant database    |
| ORM            | Drizzle     | Latest  | Type-safe queries          |
| Cache          | Redis       | 7+      | In-memory caching          |
| Auth           | NextAuth.js | 5+      | Authentication             |
| Email          | Nodemailer  | Latest  | Email delivery             |
| Validation     | Zod         | Latest  | Schema validation          |
| Error Tracking | Sentry      | Latest  | Error monitoring           |

### 1.3 Development Tools

| Category        | Technology | Purpose            |
| --------------- | ---------- | ------------------ |
| Package Manager | pnpm       | 9+                 |
| Linter          | ESLint     | Code quality       |
| Formatter       | Prettier   | Code formatting    |
| Type Checker    | TypeScript | Type safety        |
| Unit Testing    | Vitest     | Component testing  |
| E2E Testing     | Playwright | End-to-end testing |
| Pre-commit      | Husky      | Git hooks          |
| Build           | SWC        | Fast transpilation |
| Bundler         | Webpack    | Code bundling      |
| Environment     | dotenv     | Configuration      |

### 1.4 Infrastructure & DevOps

| Component        | Technology         | Purpose              |
| ---------------- | ------------------ | -------------------- |
| Hosting          | Vercel/Docker      | Deployment platform  |
| Database Hosting | AWS RDS            | Managed PostgreSQL   |
| Cache Hosting    | ElastiCache        | Managed Redis        |
| CDN              | Vercel CDN         | Content distribution |
| Storage          | S3/Object Storage  | Image storage        |
| Monitoring       | Sentry/Vercel      | Error & performance  |
| CI/CD            | GitHub Actions     | Automation           |
| Logs             | CloudWatch/ELK     | Log aggregation      |
| DNS              | Route53/Cloudflare | Domain management    |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────────────────────────────────────────────┐
│  │ React 19 + Next.js 16 + Tailwind CSS                 │
│  │ Zustand (State) + React Hook Form (Forms)            │
│  └──────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
                          ↕ (HTTPS)
┌─────────────────────────────────────────────────────────┐
│              Next.js 16 Application Server               │
│  ┌──────────────────────────────────────────────────────┐
│  │ API Routes + Server Actions + Server Components     │
│  │ NextAuth.js 5 (Authentication)                       │
│  │ Middleware (Auth, Rate Limiting)                     │
│  └──────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
    ↕                ↕               ↕              ↕
  Database        Cache           Storage         Email
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│PostgreSQL│  │  Redis   │  │    S3    │  │Nodemailer│
│   16+    │  │   7+     │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### 2.2 Application Layer Architecture

```
┌─────────────────────────────────────┐
│        Next.js App Directory         │
├─────────────────────────────────────┤
│ ├── app/                            │
│ │   ├── (auth)/                     │
│ │   │   ├── sign-up                 │
│ │   │   ├── sign-in                 │
│ │   │   ├── forgot-password         │
│ │   │   └── reset-password          │
│ │   ├── (root)/                     │
│ │   │   ├── comics/                 │
│ │   │   │   ├── page.tsx            │
│ │   │   │   ├── [slug]/             │
│ │   │   │   │   ├── page.tsx        │
│ │   │   │   │   └── chapters/       │
│ │   │   │   │       └── [id]/       │
│ │   │   ├── profile/[id]/           │
│ │   │   └── dashboard/              │
│ │   ├── api/                        │
│ │   │   ├── comics/                 │
│ │   │   ├── chapters/               │
│ │   │   ├── users/                  │
│ │   │   ├── bookmarks/              │
│ │   │   └── auth/                   │
│ │   └── admin/                      │
│ ├── components/                     │
│ │   ├── ui/        (shadcn)         │
│ │   ├── forms/     (form system)    │
│ │   ├── layout/                     │
│ │   ├── comics/                     │
│ │   └── admin/                      │
│ ├── lib/                            │
│ │   ├── actions/   (server actions) │
│ │   ├── auth.ts    (NextAuth)       │
│ │   ├── cache.ts   (Redis)          │
│ │   ├── email.ts                    │
│ │   └── validations/                │
│ ├── database/                       │
│ │   ├── schema.ts  (Drizzle)        │
│ │   ├── db.ts      (client)         │
│ │   ├── queries/                    │
│ │   ├── mutations/                  │
│ │   └── seed/                       │
│ ├── stores/        (Zustand)        │
│ ├── types/         (TypeScript)     │
│ └── middleware.ts  (auth, logging)  │
└─────────────────────────────────────┘
```

### 2.3 Data Flow Architecture

**Request Flow**:

```
User Request
    ↓
Next.js Middleware (Auth check)
    ↓
Route Handler / Server Action
    ↓
Input Validation (Zod)
    ↓
Permission Check (RBAC)
    ↓
Database Query (Drizzle ORM)
    ↓
Cache Layer (Redis) - if cacheable
    ↓
Response Formatting
    ↓
Return to Client
```

---

## 3. Database Design

### 3.1 Database Technology

- **Type**: PostgreSQL 16
- **Connection Pool**: 5-20 connections
- **SSL**: Required for all connections
- **Backup**: Daily automated backups
- **Replication**: Read replicas for scaling
- **Sharding**: Planned for future (Year 2)

### 3.2 Core Tables

| Table          | Purpose             | Estimated Size     |
| -------------- | ------------------- | ------------------ |
| users          | User accounts       | 500K rows (Year 1) |
| comics         | Comic metadata      | 50K rows (Year 1)  |
| chapters       | Chapter data        | 500K rows (Year 1) |
| chapter_images | Chapter images      | 5M rows (Year 1)   |
| bookmarks      | User bookmarks      | 5M rows (Year 1)   |
| comments       | Comments/reviews    | 5M rows (Year 1)   |
| genres         | Genre categories    | 50 rows            |
| comic_to_genre | Comic-genre mapping | 100K rows          |
| authors        | Author info         | 10K rows           |
| artists        | Artist info         | 10K rows           |

### 3.3 Schema Structure

**Implemented Tables**:

- ✅ users
- ✅ comics
- ✅ chapters
- ✅ chapter_images
- ✅ bookmarks
- ✅ genres
- ✅ comic_to_genre
- ✅ authors
- ✅ artists
- ✅ comments
- ✅ ratings/reviews (future)

**Relationships**:

```
users (1) ──────→ (N) bookmarks
       (1) ──────→ (N) comments
       (1) ──────→ (N) ratings

comics (1) ──────→ (N) chapters
      (1) ──────→ (N) comments
      (1) ──────→ (N) bookmarks
      (1) ──────→ (N) comic_to_genre
      (M) ──────→ (N) genres

chapters (1) ──────→ (N) chapter_images
        (1) ──────→ (N) comments

authors (1) ──────→ (N) comics
artists (1) ──────→ (N) comics
```

### 3.4 Indexing Strategy

| Table     | Column            | Type            | Reason             |
| --------- | ----------------- | --------------- | ------------------ |
| users     | email             | UNIQUE          | Prevent duplicates |
| comics    | slug              | UNIQUE          | URL routing        |
| comics    | status            | INDEX           | Filtering          |
| chapters  | comic_id          | INDEX           | Lookups            |
| bookmarks | user_id, comic_id | COMPOSITE INDEX | Query optimization |
| comments  | comic_id          | INDEX           | Filtering          |
| comics    | title             | FULLTEXT INDEX  | Search             |

---

## 4. Caching Strategy

### 4.1 Cache Layers

| Layer    | Technology    | TTL       | Strategy        |
| -------- | ------------- | --------- | --------------- |
| Browser  | HTTP headers  | 1 year    | Static assets   |
| CDN      | Vercel CDN    | 24 hours  | Images, static  |
| Server   | Redis         | 30-180s   | Dynamic content |
| Database | Query results | In-memory | Computed values |

### 4.2 Cacheable Content

| Content         | TTL  | Invalidation        |
| --------------- | ---- | ------------------- |
| Comic list      | 30s  | On new comic        |
| Comic detail    | 60s  | On comic update     |
| Chapter content | 180s | On chapter update   |
| User profile    | 120s | On profile update   |
| Genres          | 24h  | Manual invalidation |
| Search results  | 60s  | Per-query           |

### 4.3 Cache Invalidation

```typescript
// Automatic on mutations
revalidatePath("/comics"); // ISR invalidation
revalidateTag("comics-list"); // Tag-based invalidation
cache.del("comics:*"); // Wildcard Redis delete
```

---

## 5. API Design

### 5.1 API Architecture

- **Style**: REST API with Server Actions
- **Protocol**: HTTPS only
- **Format**: JSON
- **Versioning**: URL-based (future): `/api/v2/*`
- **Rate Limiting**: 100 req/min per IP, 1000 req/min per user
- **Authentication**: Bearer token (JWT)
- **CORS**: Whitelist specific origins

### 5.2 Core API Endpoints

#### Comics

- `GET /api/comics` - List all comics
- `GET /api/comics/[id]` - Get comic detail
- `POST /api/comics` - Create comic (admin)
- `PUT /api/comics/[id]` - Update comic (admin)
- `DELETE /api/comics/[id]` - Delete comic (admin)
- `GET /api/comics/search?q=*` - Search comics

#### Chapters

- `GET /api/comics/[id]/chapters` - List chapters
- `GET /api/comics/[id]/chapters/[chapterId]` - Get chapter
- `POST /api/comics/[id]/chapters` - Create chapter (admin)
- `PUT /api/comics/[id]/chapters/[chapterId]` - Update chapter
- `DELETE /api/comics/[id]/chapters/[chapterId]` - Delete chapter

#### Bookmarks

- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks/[comicId]` - Remove bookmark

#### Users

- `GET /api/users/[id]/profile` - Get user profile
- `PUT /api/users/[id]/profile` - Update profile
- `GET /api/users/[id]/bookmarks` - Get user bookmarks
- `GET /api/users/[id]/reading-history` - Get reading history

### 5.3 Response Format

**Success Response**:

```typescript
{
  success: true,
  data: { /* entity data */ },
  meta?: { /* pagination, timestamps */ }
}
```

**Error Response**:

```typescript
{
  success: false,
  error: "Error message",
  details?: { /* validation errors */ }
}
```

**Pagination**:

```typescript
{
  items: [/* data */],
  pagination: {
    total: 100,
    page: 1,
    limit: 20,
    pages: 5
  }
}
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```
User Login
    ↓
NextAuth.js Provider (Google/GitHub/Email)
    ↓
Session Creation
    ↓
JWT Token Generated (24h expiry)
    ↓
Refresh Token (7d expiry)
    ↓
Session stored in database
    ↓
Cookie set (HttpOnly, Secure)
```

### 6.2 Authorization Strategy

**Role-Based Access Control**:

```typescript
// Middleware check
const session = await auth();
if (!session?.user?.roles.includes("admin")) {
  return unauthorized();
}

// Page-level protection
<ProtectedRoute role="admin">
  <AdminDashboard />
</ProtectedRoute>

// API route protection
export async function POST(req) {
  const session = await auth();
  if (!session) return Unauthorized();
}
```

**Permission Levels**:

- **User**: Read public content, bookmark, comment
- **Moderator**: User permissions + moderate comments
- **Admin**: All permissions + manage content, users

### 6.3 Session Management

- **Session Storage**: Database + JWT tokens
- **Session Duration**: 30 days
- **Token Refresh**: Automatic on page load
- **Multi-device**: Multiple concurrent sessions allowed
- **Logout**: Delete all sessions

---

## 7. File & Media Management

### 7.1 Image Handling

| Aspect         | Specification                   |
| -------------- | ------------------------------- |
| Upload         | Multipart form-data             |
| Formats        | PNG, JPG, WebP                  |
| Max Size       | 10MB per image                  |
| Processing     | Sharp optimization              |
| Storage        | AWS S3 / Object Storage         |
| CDN            | Vercel CDN / CloudFront         |
| Formats Served | WebP (primary), AVIF (next-gen) |
| Responsive     | 6 breakpoints (320px - 1920px)  |

### 7.2 Image Optimization Pipeline

```
Upload
    ↓
Validation (size, format, dimensions)
    ↓
Optimization (Sharp)
    ├── Generate WebP
    ├── Generate AVIF
    ├── Generate thumbnail
    └── Resize for breakpoints
    ↓
Upload to S3
    ↓
Sync to CDN
    ↓
Return optimized URLs
```

### 7.3 Image Serving Strategy

```html
<picture>
  <source srcset="/image.avif" type="image/avif" />
  <source srcset="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="..." />
</picture>
```

---

## 8. Deployment Architecture

### 8.1 Deployment Environments

| Environment | Purpose        | Deployment      |
| ----------- | -------------- | --------------- |
| Development | Local testing  | Manual          |
| Staging     | Pre-production | Automated CI/CD |
| Production  | Live platform  | Manual approval |

### 8.2 Deployment Pipeline

```
git push to main
    ↓
GitHub Actions triggered
    ↓
Run tests (unit + E2E)
    ↓
Type check (TypeScript)
    ↓
Linting check
    ↓
Build artifact creation
    ↓
Deploy to Vercel (staging)
    ↓
Automated smoke tests
    ↓
Deploy to Production (manual approval)
    ↓
Health checks
    ↓
Rollback ready
```

### 8.3 Infrastructure as Code

- **Framework**: Terraform (future)
- **Configuration**: Environment variables in .env
- **Secrets**: AWS Secrets Manager
- **Database migrations**: Drizzle migrations
- **Monitoring**: CloudWatch dashboards

---

## 9. Performance Optimization

### 9.1 Frontend Optimization

| Technique          | Implementation        | Expected Gain     |
| ------------------ | --------------------- | ----------------- |
| Code splitting     | Dynamic imports       | 40% bundle size   |
| Image optimization | WebP/AVIF             | 60% image size    |
| Lazy loading       | Intersection Observer | 30% load time     |
| Caching            | Redis + ISR           | 50% response time |
| Minification       | Webpack               | 25% file size     |
| Tree shaking       | ESBuild               | 15% bundle size   |

### 9.2 Backend Optimization

| Technique            | Implementation     | Expected Gain       |
| -------------------- | ------------------ | ------------------- |
| Query optimization   | Indexed queries    | 70% DB time         |
| Connection pooling   | 20 connection pool | 40% connection time |
| Batch operations     | Bulk insert        | 50% write time      |
| Database replication | Read replicas      | 80% read scaling    |
| Caching              | Redis 7+           | 90% cache hit       |
| Pagination           | Limit 20-50 items  | 75% memory usage    |

### 9.3 Network Optimization

- HTTP/2 enabled
- GZIP compression
- Brotli compression (modern browsers)
- HSTS headers
- Content-Type compression
- Request bundling (GraphQL - future)

---

## 10. Monitoring & Observability

### 10.1 Monitoring Stack

| Component       | Tool             | Metrics              |
| --------------- | ---------------- | -------------------- |
| Application     | Sentry           | Errors, performance  |
| Infrastructure  | CloudWatch       | CPU, memory, disk    |
| Database        | AWS RDS Insights | Queries, connections |
| Frontend        | Vercel Analytics | Page performance     |
| User Experience | LogRocket        | Session replay       |
| Uptime          | Pingdom          | Availability         |

### 10.2 Key Metrics

```typescript
// Application metrics
- Error rate (target: < 0.1%)
- Response time (target: < 200ms p95)
- Database query time (target: < 100ms)
- Cache hit rate (target: > 80%)
- Page load time (target: < 2.5s LCP)

// Infrastructure metrics
- CPU utilization (target: < 70%)
- Memory usage (target: < 80%)
- Disk I/O (target: < 60%)
- Network throughput
- Database connections (target: < 15/20)

// User metrics
- DAU (Daily Active Users)
- Session duration (target: > 15 min)
- Bounce rate (target: < 30%)
- Engagement rate
- Conversion rate
```

### 10.3 Alerting Strategy

| Alert          | Threshold   | Action      | Severity |
| -------------- | ----------- | ----------- | -------- |
| Error rate     | > 1%        | Page team   | CRITICAL |
| Uptime         | < 99.5%     | Page team   | CRITICAL |
| Response time  | > 500ms p95 | Monitor     | HIGH     |
| Database query | > 1000ms    | Investigate | HIGH     |
| Memory usage   | > 85%       | Auto-scale  | MEDIUM   |

---

## 11. Security Architecture

### 11.1 Security Layers

```
┌─────────────────────────────────┐
│    Client Security              │
│  - HTTPS only                   │
│  - CSP headers                  │
│  - SRI for external scripts     │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│    Network Security             │
│  - WAF (Web Application FW)     │
│  - DDoS protection              │
│  - TLS 1.3                      │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│    Application Security         │
│  - Authentication (NextAuth)    │
│  - Authorization (RBAC)         │
│  - Input validation (Zod)       │
│  - Rate limiting                │
│  - CSRF protection              │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│    Data Security                │
│  - Encryption at rest (AES-256) │
│  - Encryption in transit (TLS)  │
│  - Key rotation (90 days)       │
│  - Secrets management           │
└─────────────────────────────────┘
```

### 11.2 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=()
```

---

## 12. Integration Points

### 12.1 External Services

| Service          | Purpose        | Integration       |
| ---------------- | -------------- | ----------------- |
| SendGrid/Mailgun | Email delivery | Nodemailer        |
| Google OAuth     | Social login   | NextAuth.js       |
| GitHub OAuth     | Social login   | NextAuth.js       |
| Sentry           | Error tracking | @sentry/nextjs    |
| Vercel Analytics | Performance    | Next.js built-in  |
| S3               | Image storage  | AWS SDK           |
| CloudFront       | CDN            | AWS configuration |

### 12.2 Webhook Integrations

- Database replication events
- Cache invalidation events
- Error tracking webhooks
- Deployment notifications

---

## 13. Scalability Architecture

### 13.1 Horizontal Scaling

```
Load Balancer
    ├── App Server 1
    ├── App Server 2
    ├── App Server 3
    └── App Server N

Shared Resources:
    ├── RDS Database (read replicas)
    ├── Redis Cluster
    └── S3 Storage
```

### 13.2 Database Scaling

**Read Scaling**:

- Read replicas for SELECT queries
- Load balancing between replicas
- Automatic failover

**Write Scaling** (Future):

- Database sharding
- Partition by user_id or comic_id
- Consistent hashing

**Backup Strategy**:

- Daily full backups
- Hourly incremental backups
- Multi-region replication

---

## 14. Technology Decisions & Rationale

| Technology   | Rationale                              | Alternative       |
| ------------ | -------------------------------------- | ----------------- |
| Next.js 16   | Full-stack framework, SSR, API routes  | Remix, Nuxt       |
| PostgreSQL   | ACID compliance, reliability           | MySQL, MongoDB    |
| Drizzle ORM  | Type-safe, minimal abstraction         | Prisma, TypeORM   |
| Zustand      | Lightweight, performant                | Redux, Jotai      |
| Tailwind CSS | Utility-first, rapid development       | Styled-components |
| Vercel       | Optimized for Next.js, easy deployment | AWS, Heroku       |

---

## 15. Development Standards

### 15.1 Code Organization

- **Pages**: `src/app/**/page.tsx`
- **Components**: `src/components/**/*.tsx`
- **Business logic**: `src/lib/actions/*.ts`
- **Database**: `src/database/**/*.ts`
- **Types**: `src/types/**/*.ts`
- **Stores**: `src/stores/**/*.ts`
- **Tests**: `src/__tests__/**/*.test.ts`

### 15.2 Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **Directories**: kebab-case

### 15.3 Code Quality Standards

- TypeScript strict mode enabled
- ESLint with Airbnb config
- Prettier formatting enforced
- Pre-commit hooks via Husky
- 70%+ test coverage required
- Code review before merge

---

**Document Status**: APPROVED **Last Updated**: January 2026 **Next Review**:
April 2026
