# ComicWise - Complete Setup Guide

## Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 10+
- PostgreSQL 15+
- Redis 7+ (or use Upstash)
- Git

## Quick Start (5 minutes)

```bash
# 1. Clone the repository
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

# 5. Start development server
pnpm dev
# Open http://localhost:3000
```

## Detailed Setup

### 1. Environment Configuration

Create `.env.local` file with required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/comicwise"
NEON_DATABASE_URL="..."  # Optional: Neon serverless

# Authentication
AUTH_SECRET="your-random-32-character-secret"
AUTH_URL="http://localhost:3000/api/auth"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Email (Nodemailer)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@comicwise.com"
```

### 2. Database Setup

```bash
# Create database tables
pnpm db:push

# Seed with sample data
pnpm db:seed

# View/modify schema
pnpm db:studio
```

### 3. Docker Setup (Optional)

```bash
# Start PostgreSQL and Redis containers
pnpm docker:up

# View container logs
pnpm docker:logs

# Stop containers
pnpm docker:down
```

## Available Commands

### Development

- `pnpm dev` - Start dev server
- `pnpm dev:debug` - Start with Node debugger
- `pnpm build` - Build for production

### Database

- `pnpm db:push` - Push schema changes
- `pnpm db:seed` - Seed with sample data
- `pnpm db:reset` - Reset entire database

### Testing

- `pnpm test:unit` - Run unit tests
- `pnpm test` - Run E2E tests
- `pnpm validate` - Lint, type-check, format check

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - TypeScript type checking

## Troubleshooting

### Database Connection Failed

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Verify credentials and port

### Module Not Found Errors

- Run `pnpm install` again
- Clear node_modules: `pnpm clean:all && pnpm install`

### Port 3000 Already in Use

- Change PORT in .env.local
- Or kill existing process:
  `lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill`
