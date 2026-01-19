# ComicWise Architecture Guide

## Project Structure

```
comicwise/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   ├── api/            # API routes
│   │   └── [slug]/         # Dynamic routes
│   ├── components/          # Reusable React components
│   │   └── ui/             # shadcn/ui components
│   ├── database/            # Database layer
│   │   ├── schema.ts       # Drizzle schema
│   │   ├── seed/           # Seeding system
│   │   └── db.ts           # Database client
│   ├── lib/                 # Utilities and helpers
│   ├── services/            # Business logic
│   │   ├── imageService.ts # Image handling
│   │   └── upload/         # Upload providers
│   ├── hooks/               # React hooks
│   ├── stores/              # State management (Zustand)
│   ├── types/               # TypeScript types
│   └── styles/              # Global styles
├── public/                  # Static assets
├── scripts/                 # Utility scripts
├── .vscode/                 # VS Code settings
├── docker-compose.yml       # Docker setup
└── package.json             # Dependencies
```

## Technology Stack

### Frontend

- **React 19** - UI library
- **Next.js 16** - React framework
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **React Hook Form** - Form management
- **Zustand** - State management

### Backend

- **Next.js API Routes** - Backend
- **NextAuth v5** - Authentication
- **Drizzle ORM** - Database
- **PostgreSQL** - Database
- **Redis/Upstash** - Caching & jobs
- **Nodemailer** - Email

### DevOps

- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Vercel** - Deployment

## Data Flow

```
User Request
    ↓
Next.js API Route (auth middleware)
    ↓
Business Logic (Service Layer)
    ↓
Drizzle ORM (type-safe queries)
    ↓
PostgreSQL (data persistence)
    ↓
Response (JSON)
```

## Authentication Flow

1. User logs in with email/password or OAuth
2. NextAuth validates credentials
3. Session/JWT token created
4. Token stored in secure cookie
5. API requests include token in Authorization header
6. Middleware validates token on protected routes
