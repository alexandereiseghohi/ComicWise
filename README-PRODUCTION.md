# 🎨 ComicWise - Modern Comic Reading Platform

> **A production-ready web comic reading and management platform built with
> Next.js 16, PostgreSQL, Redis, and modern web technologies.**

**Version: 2.0.0** | **Last Updated: 2025-12-29** | **Status: Production Ready**
✨

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.45.1-green)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [📋 Prerequisites](#-prerequisites)
- [💻 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🏗️ Project Structure](#️-project-structure)
- [📚 Documentation](#-documentation)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [📜 Scripts Reference](#-scripts-reference)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 👥 For Readers

- 📚 **Massive Comic Library** - Browse thousands of comics with advanced search
  & filtering
- 🔖 **Smart Bookmarks** - Save favorites, track reading progress, auto-resume
- 📖 **Seamless Reading** - Optimized chapter navigation with intelligent
  preloading
- ⭐ **Community** - Rate comics, write reviews, engage in discussions
- 🌓 **Dark Mode** - Comfortable reading in any lighting condition
- 📱 **Responsive Design** - Perfect experience on desktop, tablet, mobile
- 🔍 **Full-Text Search** - Find comics, authors, artists instantly

### 👨‍💼 For Administrators

- 📊 **Admin Dashboard** - Comprehensive analytics & management interface
- ✏️ **Content Management** - Full CRUD for comics, chapters, authors, artists
- 👥 **User Management** - Role-based access control (user, admin, moderator)
- 📤 **Bulk Upload** - Efficiently upload and manage multiple comics at once
- 🖼️ **Multi-Provider Images** - Support for ImageKit, Cloudinary, AWS S3, local
  storage
- 📈 **Analytics** - Track views, user engagement, trending comics
- 🔐 **Security** - Rate limiting, input validation, secure authentication

### ⚡ Technical Highlights

- 🚀 **Next.js 16** - App Router, React Server Components, Turbopack
- 🗄️ **PostgreSQL** - Powerful relational DB with full-text search
- 🔄 **Redis** - Lightning-fast caching and session management
- 🔐 **NextAuth v5** - Secure auth with OAuth support (Google, GitHub)
- 📦 **Drizzle ORM** - Type-safe queries with zero runtime overhead
- 🎨 **Tailwind CSS** - Utility-first styling with shadcn/ui components
- 📧 **Email System** - Automated notifications with React Email
- 🐳 **Docker Ready** - Full containerization for easy deployment
- ✅ **Comprehensive Testing** - Vitest (unit), Playwright (E2E)
- 🔧 **CI/CD Pipeline** - GitHub Actions for automated testing & deployment

---

## 🛠️ Tech Stack

### Core Framework

```yaml
Next.js 16.1.1 - App Router with RSC - Turbopack for faster builds - Partial
Prerendering - Server Actions

React 19.2.3 - Server Components - Optimistic updates - Streaming & Suspense
```

### Database & ORM

```yaml
PostgreSQL 15+ - Full-text search - JSONB support - Advanced indexing -
Transactional integrity

Drizzle ORM 0.45.1 - Type-safe queries - Zero-cost abstractions - Migration
system
```

### Authentication & Security

```yaml
NextAuth v5 - Credentials provider - OAuth (Google, GitHub) - JWT sessions -
Secure cookies

bcryptjs - Password hashing Zod - Input validation Rate limiting - Upstash Redis
```

### Frontend

```yaml
React 19 - UI library TypeScript 5 - Type safety Tailwind CSS 4 - Styling
shadcn/ui - Component library Framer Motion - Animations React Hook Form - Form
management Zustand - State management TanStack React Table - Data tables
```

### Backend Services

```yaml
Redis/Upstash - Caching & sessions NodeMailer - Email sending BullMQ - Job queue
Sharp - Image optimization ImageKit/Cloudinary/AWS S3 - Image hosting
```

### DevOps & Tools

```yaml
Docker - Containerization GitHub Actions - CI/CD Vercel - Deployment pnpm -
Package manager ESLint - Code linting Prettier - Code formatting Vitest - Unit
testing Playwright - E2E testing
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **pnpm 10+**
- **PostgreSQL 15+**
- **Redis 7+** (or Upstash)
- **Git**

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/comicwise.git
cd comicwise

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Setup database
pnpm db:push
pnpm db:seed

# 5. Start development
pnpm dev
# Open http://localhost:3000
```

---

## 📋 Prerequisites

### System Requirements

- **OS**: Windows, macOS, or Linux
- **Node.js**: 20.0.0 or higher
- **Memory**: 4GB minimum (8GB recommended)
- **Disk Space**: 5GB free

### External Services

- **Database**: PostgreSQL 15+ (local or cloud)
- **Cache**: Redis 7+ or Upstash
- **Image Storage**: Local, ImageKit, Cloudinary, or AWS S3
- **Email**: SMTP server (Gmail, SendGrid, etc.)

### Optional Services

- **GitHub OAuth**: For social login
- **Google OAuth**: For social login
- **Upstash**: For serverless Redis
- **QStash**: For background jobs
- **Vercel**: For deployment

---

## 💻 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/comicwise.git
cd comicwise
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/comicwise"

# Authentication
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000/api/auth"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Email
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# Upload Provider
UPLOAD_PROVIDER="local"  # or: imagekit, cloudinary, aws

# OAuth (Optional)
AUTH_GITHUB_CLIENT_ID="your-github-client-id"
AUTH_GITHUB_CLIENT_SECRET="your-github-secret"
```

### Step 4: Database Setup

```bash
# Create tables
pnpm db:push

# Seed sample data
pnpm db:seed

# View/modify schema (optional)
pnpm db:studio
```

### Step 5: Start Development

```bash
pnpm dev
```

Visit `http://localhost:3000`

---

## ⚙️ Configuration

### Environment Variables

See `.env.local` for all available configuration options:

| Variable          | Purpose                                       | Required    |
| ----------------- | --------------------------------------------- | ----------- |
| `DATABASE_URL`    | PostgreSQL connection                         | ✅ Yes      |
| `AUTH_SECRET`     | NextAuth JWT secret                           | ✅ Yes      |
| `AUTH_URL`        | Auth callback URL                             | ✅ Yes      |
| `REDIS_HOST`      | Redis server hostname                         | ✅ Yes      |
| `UPLOAD_PROVIDER` | Image storage (local/imagekit/cloudinary/aws) | ✅ Yes      |
| `EMAIL_SERVER_*`  | Email configuration                           | ⚠️ Optional |
| `AUTH_GITHUB_*`   | GitHub OAuth                                  | ⚠️ Optional |
| `AUTH_GOOGLE_*`   | Google OAuth                                  | ⚠️ Optional |

### Database Schema

The project uses Drizzle ORM with PostgreSQL. Schema files are in
`src/database/schema/`.

Key tables:

- **users** - User accounts and profiles
- **comics** - Comic metadata
- **chapters** - Comic chapters/episodes
- **bookmarks** - User bookmarks
- **comments** - Chapter discussions
- **ratings** - Comic ratings

---

## 🏗️ Project Structure

```
comicwise/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── api/               # API routes
│   │   └── [slug]/            # Dynamic routes
│   ├── components/             # React components
│   │   └── ui/                # shadcn/ui components
│   ├── database/              # Database layer
│   │   ├── schema/            # Drizzle schema
│   │   ├── seed/              # Seeding system
│   │   └── db.ts              # Database client
│   ├── services/              # Business logic
│   │   ├── imageService.ts   # Image handling
│   │   └── upload/            # Upload providers
│   ├── lib/                   # Utilities
│   │   └── validations/       # Zod schemas
│   ├── hooks/                 # React hooks
│   ├── stores/                # Zustand state
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── public/                     # Static files
├── scripts/                    # Utility scripts
├── .vscode/                    # VS Code settings
├── .github/                    # GitHub Actions
├── docker-compose.yml          # Docker setup
├── appConfig.ts              # App configuration
└── package.json               # Dependencies
```

---

## 📚 Documentation

- **[API Documentation](./docs/generated/API.md)** - API endpoints & usage
- **[Database Schema](./docs/generated/DATABASE.md)** - Database design
- **[Components](./docs/generated/COMPONENTS.md)** - UI component library
- **[Setup Guide](./docs/generated/SETUP.md)** - Detailed setup instructions
- **[Architecture](./docs/generated/ARCHITECTURE.md)** - System architecture

Generate documentation with:

```bash
tsx scripts/generateComprehensiveDocumentation.ts
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
pnpm test:unit              # Run once
pnpm test:unit:watch       # Watch mode
pnpm test:unit:coverage    # With coverage
```

### E2E Tests (Playwright)

```bash
pnpm test                   # Run all E2E tests
pnpm test:headed           # Headed browser
pnpm test:ui               # Test UI
pnpm test:report           # View last report
```

### Code Quality

```bash
pnpm validate              # Type-check, lint, format check
pnpm lint                  # ESLint
pnpm lint:fix              # Auto-fix linting
pnpm format                # Prettier format
pnpm type-check            # TypeScript check
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy with Vercel CLI
pnpm dlx vercel

# Or set environment variables and push to main branch
git push origin main
```

### Docker

```bash
# Build image
docker build -t comicwise .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e AUTH_SECRET=... \
  comicwise
```

### Docker Compose

```bash
# Start services (PostgreSQL, Redis, app)
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

---

## 📜 Scripts Reference

### Development

```bash
pnpm dev                    # Start dev server
pnpm dev:debug             # With Node debugger
pnpm build                 # Build for production
pnpm start                 # Start production server
```

### Database

```bash
pnpm db:push              # Push schema changes
pnpm db:pull              # Introspect existing DB
pnpm db:seed              # Seed sample data
pnpm db:reset             # Reset entire database
pnpm db:studio            # Open Drizzle Studio
```

### Code Quality

```bash
pnpm lint                 # Run ESLint
pnpm lint:fix             # Auto-fix linting
pnpm format               # Format with Prettier
pnpm type-check           # TypeScript checking
pnpm validate             # All quality checks
```

### Utilities

```bash
pnpm clean                # Clean build artifacts
pnpm clean:all            # Clean + node_modules
pnpm health:check         # System health check
pnpm cache:clear          # Clear Next.js cache
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow TypeScript strict mode
- Add tests for new features
- Update documentation
- Use conventional commit messages
- Pass all CI checks

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for
details.

---

## 🙏 Acknowledgments

Built with modern technologies and best practices. Special thanks to:

- [Next.js](https://nextjs.org/) - React framework
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- All open-source contributors

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/comicwise/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/yourusername/comicwise/discussions)
- **Email**: support@comicwise.com

---

**Made with ❤️ by the ComicWise team**
