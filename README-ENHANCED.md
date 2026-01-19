# ComicWise 📚

> A modern, full-stack comic reading platform built with Next.js 16, PostgreSQL,
> and cutting-edge web technologies.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📖 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [CLI Tools](#-cli-tools-scriptscli)
- [Project Structure](#-project-structure)
- [Scripts & Automation](#-scripts--automation)
- [Database](#-database-schema)
- [Theming System](#-theming-system)
- [Image Upload](#-image-upload--cloud-providers)
- [Cache & Redis](#-cache--redis-management)
- [Queue Workers](#-queue-workers--background-jobs)
- [Health Monitoring](#-health-monitoring)
- [CI/CD](#-cicd--automation)
- [Tab Completion](#-tab-completion)
- [Workflow Examples](#-workflow-chaining-examples)
- [Troubleshooting](#-error-troubleshooting)
- [Pro Tips](#-pro-tips--shortcuts)

---

## 🌟 Features

### Core Functionality

- 📖 **Comic Library** - Browse thousands of comics with advanced filtering
- 📑 **Chapter Reader** - Smooth, responsive reading experience
- 🔖 **Bookmarks** - Track reading progress across devices
- 💬 **Comments** - Engage with community discussions
- 🔍 **Advanced Search** - Full-text search with PostgreSQL
- ⭐ **Ratings & Reviews** - Community-driven content curation

### Developer Experience

- 🛠️ **100+ Organized Scripts** - Categorized automation tools
- 🎨 **Advanced Theming** - Multi-theme support with CSS variables
- ☁️ **Multi-Cloud Upload** - ImageKit, Cloudinary, S3, Local
- 📊 **Health Monitoring** - System, database, and Redis checks
- ⚡ **Shell Aliases** - Lightning-fast command shortcuts
- 🔄 **Workflow Chaining** - Combine commands for complex operations
- 📚 **Complete Documentation** - Every command documented
- ✨ **Tab Completion** - Auto-complete for all CLI commands

### Technical Stack

- ⚡ **Next.js 16** - React Server Components, Streaming
- 🗄️ **PostgreSQL 17** - Advanced full-text search
- 🎨 **Tailwind CSS 4** - Utility-first styling with theming
- 📧 **React Email** - Type-safe email templates
- 🔄 **QStash** - Serverless background jobs
- ☁️ **Multi-Cloud** - ImageKit/Cloudinary/S3 support
- 🛡️ **Upstash Redis** - Rate limiting & caching
- 🧪 **Playwright** - E2E testing
- 🐳 **Docker** - Production-ready containers

---

## 📋 Prerequisites

- **Node.js** 22+ with Corepack enabled
- **pnpm** 9+
- **PostgreSQL** 17+
- **Docker** & **Docker Compose** (optional)
- **Redis** (optional, for caching)

---

## 🚀 Quick Start

### Option 1: Docker Setup (Recommended)

```bash
# Clone and setup
git clone <repository-url>
cd comicwise
cp .envs/.env.development .env.local

# Start all services
docker-compose -f docker-compose.dev.yml up

# Initialize database
docker-compose -f docker-compose.dev.yml exec app pnpm db:push
docker-compose -f docker-compose.dev.yml exec app pnpm db:seed

# Open http://localhost:3000
```

### Option 2: Local Development

```bash
# Install dependencies
corepack enable
pnpm install

# Setup environment
cp .envs/.env.development .env.local
# Edit .env.local with your credentials

# Setup database
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

---

## 🛠️ CLI Tools (scripts/cli)

ComicWise includes a comprehensive CLI for project management:

```bash
# Scaffold new features
pnpm cli scaffold --type component --name MyComponent
pnpm cli scaffold --type page --name dashboard

# Cloud uploads
pnpm cli upload --provider imagekit --path ./images
pnpm cli upload --provider cloudinary --bulk

# Health checks
pnpm cli health --all
pnpm cli health --db
pnpm cli health --redis
pnpm cli health --system

# Cache management
pnpm cli cache stats
pnpm cli cache clear
pnpm cli cache flush --pattern "comics:*"

# Database operations
pnpm cli db migrate
pnpm cli db seed
pnpm cli db reset

# Queue workers
pnpm cli queue start
pnpm cli queue stats
pnpm cli queue retry-failed

# CI/CD helpers
pnpm cli ci check
pnpm cli ci report
pnpm cli ci workflows
```

### Available Scripts Categories

#### Development Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Production build
- `pnpm start` - Start production server
- `pnpm type-check` - TypeScript validation
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean build artifacts

#### Database Scripts

- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema to database
- `pnpm db:pull` - Pull schema from database
- `pnpm db:seed` - Seed database
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:reset` - Reset database

#### Testing Scripts

- `pnpm test` - Run all tests
- `pnpm test:unit` - Unit tests
- `pnpm test:e2e` - E2E tests with Playwright
- `pnpm test:watch` - Watch mode
- `pnpm test:coverage` - Generate coverage report

#### Image & Upload Scripts

- `pnpm upload:imagekit` - Upload to ImageKit
- `pnpm upload:cloudinary` - Upload to Cloudinary
- `pnpm upload:s3` - Upload to AWS S3
- `pnpm upload:bulk` - Bulk upload to all providers

#### Cache & Redis Scripts

- `pnpm cache:stats` - View cache statistics
- `pnpm cache:clear` - Clear all cache
- `pnpm cache:flush` - Flush specific patterns
- `pnpm redis:check` - Check Redis connection
- `pnpm redis:info` - Redis server info

#### Queue & Background Jobs

- `pnpm queue:start` - Start queue workers
- `pnpm queue:stop` - Stop queue workers
- `pnpm queue:stats` - View queue statistics
- `pnpm queue:retry` - Retry failed jobs
- `pnpm queue:clear` - Clear queue

#### Health & Monitoring

- `pnpm health:all` - Run all health checks
- `pnpm health:db` - Database health
- `pnpm health:redis` - Redis health
- `pnpm health:system` - System resources

#### Cleanup & Maintenance

- `pnpm cleanup:project` - Clean unused files
- `pnpm cleanup:cache` - Clear all caches
- `pnpm cleanup:logs` - Remove old logs
- `pnpm fix:all` - Auto-fix all errors
- `pnpm fix:imports` - Update import paths

---

## 📁 Project Structure

```
comicwise/
├── cli/                      # CLI tool implementation
│   ├── commands/
│   │   ├── scaffold.ts       # Project scaffolding
│   │   ├── upload.ts         # Multi-cloud uploads
│   │   ├── health.ts         # Health monitoring
│   │   ├── cache.ts          # Cache management
│   │   ├── queue.ts          # Queue workers
│   │   ├── db.ts             # Database operations
│   │   └── ci.ts             # CI/CD helpers
│   └── index.ts              # CLI entry point
├── scripts/                  # Automation scripts
│   ├── upload-bulk.ts        # Bulk image upload
│   ├── health-check.ts       # System health checks
│   ├── cache-stats.ts        # Cache statistics
│   ├── queue-worker.ts       # Background job processor
│   ├── cleanup-project.ts    # Project cleanup
│   ├── fix-all-errors.ts     # Auto error fixing
│   └── apply-camelcase.ts    # Code style enforcement
├── src/
│   ├── app/                  # Next.js 16 App Router
│   │   ├── (root)/          # Public pages
│   │   ├── (auth)/          # Authentication pages
│   │   ├── admin/           # Admin dashboard
│   │   └── api/             # API routes
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── auth/            # Authentication forms
│   │   ├── admin/           # Admin components
│   │   └── emails/          # Email templates
│   ├── database/             # Database layer
│   │   ├── schema.ts        # Drizzle schema
│   │   ├── queries/         # Type-safe queries
│   │   ├── mutations/       # Type-safe mutations
│   │   └── seed/            # Seeding utilities
│   ├── lib/                  # Core libraries
│   │   ├── actions/         # Server actions
│   │   ├── validations/     # Zod schemas
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── auth.ts          # Auth utilities
│   │   ├── cache.ts         # Cache layer
│   │   └── workflow.ts      # Workflow orchestration
│   ├── services/             # Business logic
│   │   ├── upload/          # Upload providers
│   │   ├── cache.service.ts
│   │   ├── image.service.ts
│   │   └── rateLimit.service.ts
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # Zustand stores
│   ├── types/                # TypeScript definitions
│   └── styles/               # Global styles & themes
├── public/
│   ├── uploads/              # Local file uploads
│   │   ├── comics/          # Comic covers
│   │   ├── chapters/        # Chapter pages
│   │   └── avatars/         # User avatars
│   └── themes/               # Theme assets
├── compose/                  # Docker configurations
├── docs/                     # Documentation
│   ├── API.md               # API documentation
│   ├── THEMING.md           # Theming guide
│   ├── WORKFLOWS.md         # Workflow examples
│   └── TROUBLESHOOTING.md   # Common issues
├── .github/
│   └── workflows/           # GitHub Actions
└── tests/                    # Test suites
```

---

## 🎨 Theming System

ComicWise features an advanced theming system with multiple pre-built themes and
full customization support.

### Available Themes

- **Light Mode** - Clean, modern light theme
- **Dark Mode** - Eye-friendly dark theme
- **Cyberpunk** - Neon-inspired futuristic theme
- **Forest** - Nature-inspired green theme
- **Ocean** - Calm blue theme
- **Sunset** - Warm orange/pink theme
- **Custom** - Create your own!

### Using Themes

```tsx
// In your components
import { useTheme } from "@/hooks/useTheme";

export default function MyComponent() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      {themes.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
```

### Creating Custom Themes

1. Create theme file in `src/styles/themes/`:

```css
/* src/styles/themes/my-theme.css */
[data-theme="my-theme"] {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 346.8 77.2% 49.8%;
  /* ... more variables */
}
```

2. Register in theme configuration:

```typescript
// src/lib/theme-config.ts
export const themes = {
  // ... existing themes
  "my-theme": {
    name: "My Theme",
    colors: {
      /* color definitions */
    },
  },
};
```

### Theme Configuration

```bash
# Generate theme from colors
pnpm cli scaffold --type theme --name "My Theme" --primary "#ff0000"

# Preview themes
pnpm dev
# Navigate to /admin/themes
```

See [docs/THEMING.md](docs/THEMING.md) for complete theming documentation.

---

## ☁️ Image Upload & Cloud Providers

Support for multiple cloud storage providers with automatic fallback and
optimization.

### Supported Providers

1. **ImageKit** (Recommended)
   - CDN delivery
   - Real-time transformations
   - Automatic optimization

2. **Cloudinary**
   - Advanced transformations
   - Video support
   - AI-powered features

3. **AWS S3**
   - Scalable storage
   - Custom CDN integration
   - Lifecycle management

4. **Local Storage**
   - Development/testing
   - No external dependencies
   - Full control

### Configuration

```env
# .env.local
IMAGE_PROVIDER=imagekit  # imagekit | cloudinary | s3 | local

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_endpoint

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket
```

### Upload Usage

```typescript
// In your code
import { uploadImage } from "@/services/upload";

const result = await uploadImage(file, {
  provider: "imagekit",
  folder: "comics",
  transformation: {
    width: 800,
    height: 1200,
    quality: 80,
  },
});
```

```bash
# CLI bulk upload
pnpm cli upload --provider imagekit --path ./comics --recursive

# Upload to multiple providers
pnpm cli upload --provider all --path ./images
```

---

## 🗄️ Cache & Redis Management

Advanced caching layer with Redis for improved performance.

### Cache Commands

```bash
# View cache statistics
pnpm cache:stats

# Clear all cache
pnpm cache:clear

# Clear specific pattern
pnpm cache:flush --pattern "comics:*"

# Redis health check
pnpm redis:check

# Redis server info
pnpm redis:info
```

### Using Cache in Code

```typescript
import { cache } from "@/lib/cache";

// Get from cache
const data = await cache.get("comics:featured");

// Set cache with TTL
await cache.set("comics:featured", data, { ttl: 3600 });

// Delete from cache
await cache.del("comics:featured");

// Clear pattern
await cache.clearPattern("comics:*");
```

### Cache Configuration

```env
# .env.local
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600  # Default TTL in seconds
CACHE_ENABLED=true
```

---

## 🔄 Queue Workers & Background Jobs

Process background tasks with QStash and Bull queues.

### Queue Operations

```bash
# Start queue workers
pnpm queue:start

# View queue statistics
pnpm queue:stats

# Retry failed jobs
pnpm queue:retry

# Clear queue
pnpm queue:clear
```

### Creating Background Jobs

```typescript
import { addToQueue } from "@/lib/queue";

// Add job to queue
await addToQueue("email:send", {
  to: "user@example.com",
  template: "welcome",
  data: { name: "John" },
});

// Process in queue worker
// scripts/queue-worker.ts handles the processing
```

### Queue Configuration

```env
# .env.local
QSTASH_TOKEN=your_token
QSTASH_URL=your_url
QUEUE_CONCURRENCY=5
```

---

## 📊 Health Monitoring

Comprehensive health checks for all system components.

### Health Check Commands

```bash
# Check everything
pnpm health:all

# Database health
pnpm health:db

# Redis health
pnpm health:redis

# System resources
pnpm health:system

# API health
pnpm health:api
```

### Health Check Output

```json
{
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 12,
      "connections": 5
    },
    "redis": {
      "status": "healthy",
      "latency": 3,
      "memory": "1.2MB"
    },
    "system": {
      "cpu": 25,
      "memory": 45,
      "disk": 60
    }
  },
  "status": "healthy"
}
```

### Automated Monitoring

Health checks run automatically in production:

- Every 5 minutes via cron
- Before deployments
- In CI/CD pipeline
- Exposed at `/api/health`

---

## 🔄 CI/CD & Automation

### GitHub Actions Workflows

All workflows in `.github/workflows/`:

1. **ci.yml** - Continuous Integration
   - Run tests
   - Type checking
   - Linting
   - Build verification

2. **health-check.yml** - Health Monitoring
   - Scheduled health checks
   - Alerts on failures
   - Performance tracking

3. **cleanup.yml** - Maintenance
   - Clean old artifacts
   - Optimize cache
   - Update dependencies

4. **deploy.yml** - Deployment
   - Build and test
   - Deploy to staging/production
   - Run smoke tests

### CI Commands

```bash
# Check CI status
pnpm cli ci check

# View CI report
pnpm cli ci report

# List workflows
pnpm cli ci workflows

# Trigger workflow
pnpm cli ci trigger --workflow deploy
```

---

## ⌨️ Tab Completion

Enable tab completion for lightning-fast command execution.

### Setup (Bash)

```bash
# Add to ~/.bashrc
eval "$(pnpm cli completion bash)"
```

### Setup (Zsh)

```bash
# Add to ~/.zshrc
eval "$(pnpm cli completion zsh)"
```

### Setup (PowerShell)

```powershell
# Add to $PROFILE
pnpm cli completion powershell | Out-String | Invoke-Expression
```

### Usage

```bash
# Type and press TAB
pnpm cli <TAB>
# Shows: scaffold upload health cache queue db ci

pnpm cli upload --provider <TAB>
# Shows: imagekit cloudinary s3 local all
```

---

## 🔗 Workflow Chaining Examples

Combine commands for powerful automation.

### Complete Comic Upload Workflow

```bash
# Upload, process, and cache in one command
pnpm cli upload --provider imagekit --path ./comics && \
pnpm db:seed && \
pnpm cache:clear && \
pnpm health:all
```

### Development Setup

```bash
# Fresh start workflow
pnpm db:reset && \
pnpm db:seed && \
pnpm cache:clear && \
pnpm dev
```

### Production Deployment

```bash
# Pre-deployment checks
pnpm type-check && \
pnpm lint && \
pnpm test && \
pnpm build && \
pnpm health:all
```

### Cleanup Workflow

```bash
# Complete cleanup
pnpm cleanup:cache && \
pnpm cleanup:logs && \
pnpm cleanup:project && \
pnpm cache:clear
```

See [docs/WORKFLOWS.md](docs/WORKFLOWS.md) for more examples.

---

## 🐛 Error Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check database health
pnpm health:db

# Reset database
pnpm db:reset
pnpm db:push
pnpm db:seed
```

#### Type Errors

```bash
# Auto-fix common type errors
pnpm fix:all

# Manual type check
pnpm type-check

# Regenerate types
pnpm db:generate
```

#### Import Errors

```bash
# Fix import paths
pnpm fix:imports

# Update to aliases
pnpm tsx scripts/update-imports-to-aliases.ts
```

#### Cache Issues

```bash
# Clear all caches
pnpm cache:clear

# Check Redis connection
pnpm redis:check

# Restart Redis (Docker)
docker-compose restart redis
```

#### Build Failures

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Getting Help

1. Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Run diagnostics: `pnpm health:all`
3. Check logs: `docker-compose logs -f`
4. Open issue with diagnostic output

---

## 💡 Pro Tips & Shortcuts

### Shell Aliases

Add to your shell configuration:

```bash
# ~/.bashrc or ~/.zshrc
alias cw='cd ~/projects/comicwise'
alias cwd='cw && pnpm dev'
alias cwb='cw && pnpm build'
alias cwt='cw && pnpm test'
alias cwh='cw && pnpm health:all'
alias cwc='cw && pnpm cache:clear'
alias cwdb='cw && pnpm db:studio'
```

### VS Code Snippets

Create `.vscode/comicwise.code-snippets`:

```json
{
  "Server Action": {
    "prefix": "action",
    "body": [
      "'use server'",
      "",
      "export async function ${1:actionName}(${2:params}) {",
      "  try {",
      "    // Implementation",
      "    return { success: true, data: ${3:result} }",
      "  } catch (error) {",
      "    return { success: false, error: error.message }",
      "  }",
      "}"
    ]
  }
}
```

### Performance Tips

1. **Enable Redis caching** for production
2. **Use ImageKit** for automatic image optimization
3. **Enable ISR** for static pages
4. **Use server components** where possible
5. **Lazy load** components with dynamic imports

### Development Workflow

```bash
# Morning routine
pnpm health:all && pnpm dev

# Before commit
pnpm type-check && pnpm lint:fix && pnpm test

# Before deploy
pnpm build && pnpm test:e2e && pnpm health:all
```

---

## 📚 Complete Onboarding Guide

### Day 1: Setup

1. **Clone and Install**

   ```bash
   git clone <repo>
   cd comicwise
   corepack enable
   pnpm install
   ```

2. **Environment Setup**

   ```bash
   cp .envs/.env.development .env.local
   # Edit .env.local with your credentials
   ```

3. **Database Setup**

   ```bash
   pnpm db:push
   pnpm db:seed
   pnpm db:studio  # Open Drizzle Studio
   ```

4. **Start Development**
   ```bash
   pnpm dev
   # Open http://localhost:3000
   ```

### Day 2: Explore Features

1. **Try the CLI**

   ```bash
   pnpm cli scaffold --type component --name TestComponent
   pnpm cli health --all
   pnpm cli cache stats
   ```

2. **Upload Images**

   ```bash
   pnpm cli upload --provider local --path ./test-images
   ```

3. **Run Tests**
   ```bash
   pnpm test
   pnpm test:e2e
   ```

### Day 3: Customize

1. **Create Custom Theme**

   ```bash
   pnpm cli scaffold --type theme --name MyTheme
   ```

2. **Add Custom Scripts**
   - Add script to `package.json`
   - Create in `scripts/` directory
   - Update CLI commands

3. **Configure Cloud Providers**
   - Setup ImageKit/Cloudinary
   - Test uploads
   - Configure transformations

### Week 2: Advanced Topics

- Study `src/database/schema.ts` for data model
- Review `src/lib/actions/` for server actions
- Explore `src/services/` for business logic
- Read workflow examples in docs
- Set up CI/CD pipelines

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

## 📞 Support

- 📧 Email: support@comicwise.app
- 💬 Discord: [Join Server](https://discord.gg/comicwise)
- 📖 Docs: [docs.comicwise.app](https://docs.comicwise.app)
- 🐛 Issues: [GitHub Issues](https://github.com/yourorg/comicwise/issues)

---

**Built with ❤️ by the ComicWise Team**
