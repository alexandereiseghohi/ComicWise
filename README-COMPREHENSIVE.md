# 🎨 ComicWise - Modern Comic Reading Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**A modern, full-stack comic reading and management platform built with
cutting-edge web technologies.**

[Features](#features) • [Quick Start](#quick-start) •
[Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Database](#database)
- [Authentication](#authentication)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🎯 **For Readers**

- **📚 Extensive Library** - Browse thousands of comics across multiple genres
- **🔖 Smart Bookmarks** - Save your favorite comics and track reading progress
- **💬 Community** - Engage with other readers through comments and discussions
- **🔍 Advanced Search** - Full-text search with filters for genre, author,
  status
- **📱 Responsive Design** - Seamless experience across desktop, tablet, and
  mobile
- **🌙 Dark Mode** - Eye-friendly reading with automatic theme switching
- **📊 Reading History** - Track your reading habits and discover new content

### 👨‍💼 **For Administrators**

- **📝 Content Management** - Full CRUD operations for comics, chapters,
  authors, artists
- **👥 User Management** - Role-based access control (Admin, Moderator, User)
- **📈 Analytics Dashboard** - Track views, engagement, and user statistics
- **🖼️ Image CDN** - Integrated ImageKit/Cloudinary for optimized delivery
- **📤 Bulk Operations** - Efficient tools for bulk uploads and management
- **🔧 System Health** - Monitoring for database, cache, and services

### ⚡ **Technical Features**

- **🚀 Server Components** - Optimized performance with React 19 RSC
- **💾 Smart Caching** - Redis-based caching for lightning-fast responses
- **🛡️ Rate Limiting** - API protection with Upstash Rate Limit
- **🔒 Type Safety** - Full TypeScript coverage with Zod validation
- **🗄️ Database Migrations** - Version-controlled schema with Drizzle ORM
- **📧 Email Integration** - Automated emails with React Email templates
- **🐳 Docker Ready** - Containerized deployment with Docker Compose
- **🔄 Background Jobs** - QStash integration for long-running tasks

---

## 🛠️ Tech Stack

### **Core**

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with Server Components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework

### **Database & ORM**

- **[PostgreSQL 15+](https://www.postgresql.org/)** - Primary database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe ORM
- **[Redis](https://redis.io/)** - Caching and session storage
- **[BullMQ](https://docs.bullmq.io/)** - Queue management

### **Authentication**

- **[NextAuth v5](https://next-auth.js.org/)** - Authentication framework
- **OAuth Providers** - Google, GitHub integration
- **JWT Sessions** - Secure session management

### **UI Components**

- **[Shadcn/UI](https://ui.shadcn.com/)** - Accessible component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled UI primitives
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Recharts](https://recharts.org/)** - Charting library

### **Image & Media**

- **[ImageKit](https://imagekit.io/)** - Image CDN and optimization
- **[Cloudinary](https://cloudinary.com/)** - Alternative image hosting
- **[Sharp](https://sharp.pixelplumbing.com/)** - Image processing

### **Developer Tools**

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Playwright](https://playwright.dev/)** - E2E testing
- **[Vitest](https://vitest.dev/)** - Unit testing

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **PostgreSQL** >= 15
- **Redis** >= 7.0 (optional - can use Upstash)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/comicwise.git
cd comicwise
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/comicwise"

# Authentication
AUTH_SECRET="your-secret-key-min-32-chars"
AUTH_URL="http://localhost:3000"

# Image Hosting (choose one)
UPLOAD_PROVIDER="imagekit"
IMAGEKIT_PUBLIC_KEY="your-public-key"
IMAGEKIT_PRIVATE_KEY="your-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"

# Redis (optional)
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

4. **Set up the database**

```bash
# Generate schema
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

5. **Start the development server**

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application
running!

---

## 📁 Project Structure

```
comicwise/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (root)/              # Public pages
│   │   │   ├── comics/          # Comic listings and details
│   │   │   ├── chapters/        # Chapter reader
│   │   │   └── profile/         # User profile
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── comics/          # Comic CRUD
│   │   │   └── chapters/        # Chapter CRUD
│   │   └── dashboard/           # Admin dashboard
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── admin/               # Admin components
│   │   ├── layout/              # Layout components
│   │   ├── profile/             # Profile components
│   │   └── auth/                # Auth components
│   │
│   ├── database/                # Database layer
│   │   ├── schema.ts            # Drizzle schema
│   │   ├── db.ts                # Database instance
│   │   ├── queries/             # Query functions
│   │   ├── mutations/           # Mutation functions
│   │   └── seed/                # Database seeding
│   │       ├── run.ts           # Main seed runner
│   │       ├── seeders/         # Entity seeders
│   │       └── utils/           # Seed utilities
│   │
│   ├── lib/                     # Utilities and configs
│   │   ├── actions/             # Server actions
│   │   ├── validations/         # Zod schemas
│   │   ├── api/                 # API utilities
│   │   ├── auth.ts              # NextAuth config
│   │   └── utils.ts             # Helper functions
│   │
│   ├── services/                # Business logic services
│   │   ├── imageService.ts      # Image handling
│   │   ├── cacheService.ts      # Redis caching
│   │   ├── searchService.ts     # Search functionality
│   │   └── upload/              # Upload providers
│   │       ├── imagekit.ts      # ImageKit provider
│   │       ├── cloudinary.ts    # Cloudinary provider
│   │       └── local.ts         # Local storage
│   │
│   ├── types/                   # TypeScript types
│   │   ├── Core.ts              # Core application types
│   │   ├── Utility.ts           # Utility types
│   │   ├── database.ts          # Database types
│   │   └── index.ts             # Type exports
│   │
│   └── styles/                  # Global styles
│       └── globals.css          # Tailwind & custom CSS
│
├── public/                      # Static assets
│   ├── images/                  # Public images
│   └── uploads/                 # Local uploads
│
├── scripts/                     # Build and maintenance
│   ├── cleanup.ts               # Project cleanup
│   ├── camelCase.ts             # Naming conventions
│   └── scaffold.ts              # Component scaffolding
│
├── .env.local                   # Environment variables (gitignored)
├── .env.example                 # Environment template
├── appConfig.ts                 # Application configuration
├── drizzle.config.ts            # Drizzle ORM config
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind configuration
└── package.json                 # Dependencies and scripts
```

---

## 💻 Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm dev:debug              # Start with Node.js debugger
pnpm build                  # Build for production
pnpm start                  # Start production server

# Code Quality
pnpm type-check             # Run TypeScript compiler
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix ESLint issues
pnpm format                 # Format with Prettier
pnpm validate               # Run all checks (type, lint, format)

# Testing
pnpm test                   # Run Playwright E2E tests
pnpm test:unit              # Run Vitest unit tests
pnpm test:all               # Run all tests

# Database
pnpm db:generate            # Generate Drizzle migrations
pnpm db:push                # Push schema to database
pnpm db:studio              # Open Drizzle Studio
pnpm db:seed                # Seed database
pnpm db:reset               # Reset and reseed database

# Utilities
pnpm cleanup                # Clean build artifacts
pnpm scaffold               # Generate component scaffolding
```

### Development Workflow

1. **Create a feature branch**

```bash
git checkout -b feature/my-feature
```

2. **Make your changes**

- Write code following project conventions
- Add tests for new functionality
- Update documentation as needed

3. **Run quality checks**

```bash
pnpm validate               # Type-check + lint + format
pnpm test:all               # Run all tests
```

4. **Commit your changes**

```bash
git add .
git commit -m "feat: add my feature"
```

5. **Push and create PR**

```bash
git push origin feature/my-feature
```

---

## 🗄️ Database

### Schema Overview

The database uses Drizzle ORM with PostgreSQL and includes:

- **user** - User accounts with NextAuth integration
- **account** - OAuth provider connections
- **session** - Active user sessions
- **comic** - Comic series metadata
- **chapter** - Individual chapters
- **author** - Comic authors
- **artist** - Comic artists
- **genre** - Genre taxonomy
- **type** - Comic types (Manga, Manhwa, Manhua)
- **bookmark** - User bookmarks
- **comment** - Chapter comments
- **rating** - Comic ratings

### Migrations

```bash
# Generate new migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema without migration
pnpm db:push

# Reset database
pnpm db:reset
```

### Seeding

Seed data from JSON files:

```bash
# Seed all data
pnpm db:seed

# Seed specific entities
pnpm db:seed:users
pnpm db:seed:comics
pnpm db:seed:chapters

# Seed from JSON files
pnpm seed:json

# Dry run (validation only)
pnpm seed:json:validate
```

---

## 🔐 Authentication

### Setup

ComicWise uses NextAuth v5 for authentication with multiple providers:

1. **Credentials** - Email/password authentication
2. **Google OAuth** - Sign in with Google
3. **GitHub OAuth** - Sign in with GitHub

### Configuration

Set up OAuth providers in `.env.local`:

```env
# Google OAuth
AUTH_GOOGLE_CLIENT_ID="your-client-id"
AUTH_GOOGLE_CLIENT_SECRET="your-client-secret"

# GitHub OAuth
AUTH_GITHUB_CLIENT_ID="your-client-id"
AUTH_GITHUB_CLIENT_SECRET="your-client-secret"
```

### Usage

```typescript
import { auth } from "auth";

// In Server Components
const session = await auth();

// In API Routes
export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... your code
}

// In Server Actions
("use server");

export async function myAction() {
  const session = await auth();
  // ... your code
}
```

---

## 🌐 API Routes

### RESTful API Endpoints

```
# Comics
GET    /api/comics              # List comics
GET    /api/comics/:id          # Get comic
POST   /api/comics              # Create comic (admin)
PUT    /api/comics/:id          # Update comic (admin)
DELETE /api/comics/:id          # Delete comic (admin)

# Chapters
GET    /api/chapters            # List chapters
GET    /api/chapters/:id        # Get chapter
POST   /api/chapters            # Create chapter (admin)
PUT    /api/chapters/:id        # Update chapter (admin)
DELETE /api/chapters/:id        # Delete chapter (admin)

# Users
GET    /api/users               # List users (admin)
GET    /api/users/:id           # Get user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user (admin)

# Bookmarks
GET    /api/bookmarks           # List user bookmarks
POST   /api/bookmarks           # Create bookmark
DELETE /api/bookmarks/:id       # Delete bookmark

# Comments
GET    /api/comments            # List comments
POST   /api/comments            # Create comment
PUT    /api/comments/:id        # Update comment
DELETE /api/comments/:id        # Delete comment
```

### API Features

- **Authentication** - Protected routes with NextAuth
- **Validation** - Zod schemas for request/response
- **Rate Limiting** - Upstash Redis rate limiting
- **Caching** - Redis caching for GET requests
- **Error Handling** - Consistent error responses
- **Pagination** - Cursor-based pagination

---

## 🚢 Deployment

### Docker Deployment

1. **Build and run with Docker Compose**

```bash
docker compose up -d
```

2. **Environment variables**

Create `compose/.env` with production settings

3. **View logs**

```bash
docker compose logs -f app
```

### Vercel Deployment

1. **Install Vercel CLI**

```bash
pnpm dlx vercel
```

2. **Deploy**

```bash
# Preview deployment
pnpm deploy:preview

# Production deployment
pnpm deploy:vercel
```

3. **Environment Variables**

Add environment variables in Vercel dashboard

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production DATABASE_URL
- [ ] Set AUTH_SECRET (32+ characters)
- [ ] Configure OAuth providers
- [ ] Set up image CDN credentials
- [ ] Enable Redis caching
- [ ] Configure email service
- [ ] Set up monitoring
- [ ] Enable rate limiting
- [ ] Review security headers

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Run tests and linting
6. Submit a pull request

### Code Style

- Follow existing code style
- Use TypeScript strict mode
- Add JSDoc comments for public APIs
- Write unit tests for new features
- Update documentation

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: update dependencies
```

### Pull Request Process

1. Update README if needed
2. Add tests for new features
3. Ensure all tests pass
4. Request review from maintainers
5. Address review feedback
6. Merge after approval

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful UI components
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe ORM
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📞 Support

- 📧 Email: support@comicwise.com
- 💬 Discord: [Join our community](https://discord.gg/comicwise)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/comicwise/issues)
- 📖 Docs: [Documentation](https://docs.comicwise.com)

---

<div align="center">

**Made with ❤️ by the ComicWise Team**

[⬆ Back to top](#-comicwise---modern-comic-reading-platform)

</div>
