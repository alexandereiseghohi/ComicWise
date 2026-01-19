# ComicWise Onboarding Guide

Welcome to ComicWise! This guide will help you get started quickly.

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 16+
- Redis 7+
- Docker (optional)

## Installation

### 1. Clone and Install

```bash
git clone <repository-url>
cd comicwise
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/comicwise
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Push schema to database
pnpm db:push

# Seed initial data
pnpm db:seed
```

### 4. Verify Installation

```bash
pnpm health
```

### 5. Start Development

```bash
pnpm dev
```

Visit http://localhost:3000

## Project Structure

```
comicwise/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── dal/          # Data Access Layer
│   ├── dto/          # Data Transfer Objects
│   ├── database/     # Database schema and queries
│   ├── lib/          # Utilities and helpers
│   └── types/        # TypeScript types
├── scripts/          # Build and utility scripts
├── public/           # Static assets
└── docs/            # Documentation
```

## Key Concepts

### Data Access Layer (DAL)

All database operations go through DAL classes:

```typescript
import { UserDal } from "@/dal/UserDal";

const user = await UserDal.getById("123");
```

### Data Transfer Objects (DTO)

Use DTOs for data validation and transformation:

```typescript
import { UserDto } from "@/dto/UserDto";

const userData = UserDto.create({
  email: "user@example.com",
  name: "John Doe",
});
```

### Logging

Use the centralized logger:

```typescript
import { logger } from "@/lib/logger";

logger.info("User logged in", { userId: "123" });
logger.error("Error occurred", error);
```

### Environment Variables

Access via centralized config:

```typescript
import { env } from "@/lib/env";

const dbUrl = env.DATABASE_URL;
```

## Daily Workflow

### Starting Work

```bash
# Pull latest changes
git pull

# Install any new dependencies
pnpm install

# Check system health
pnpm health

# Start development server
pnpm dev
```

### Before Committing

```bash
# Format code
pnpm format

# Run linter
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test
```

### Creating New Features

#### 1. Create Component

```bash
pnpm scaffold component MyComponent
```

#### 2. Create Page

```bash
pnpm scaffold page my-page
```

#### 3. Create API Route

```bash
pnpm scaffold api my-endpoint
```

#### 4. Create DAL

```bash
pnpm scaffold dal MyModel
```

## Common Tasks

### Adding a New Database Table

1. Define schema in `src/database/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Run migration: `pnpm db:migrate`
4. Create DAL: `pnpm scaffold dal MyTable`

### Working with Cache

```bash
# View all keys
pnpm cache:keys

# Get a value
pnpm cache:get user:123

# Clear cache
pnpm cache:flush
```

### Running Background Jobs

```bash
# Start worker
pnpm worker email

# In another terminal
pnpm dev
```

### Uploading Images

```bash
pnpm upload ./public/images cloudinary
```

## Debugging

### Enable Debug Logs

```env
LOG_LEVEL=debug
```

### View Logs

```bash
tail -f logs/app.log
```

### Database Issues

```bash
# Reset database
pnpm db:push

# Reseed data
pnpm db:seed

# Open studio
pnpm db:studio
```

## Testing

### Unit Tests

```bash
pnpm test
```

### E2E Tests

```bash
pnpm test:e2e
```

### Test Coverage

```bash
pnpm test --coverage
```

## Deployment

### Build for Production

```bash
pnpm build
```

### Run Production Server

```bash
pnpm start
```

### Docker Deployment

```bash
docker-compose up -d
```

## Getting Help

- **Documentation**: Check `docs/` folder
- **CLI Guide**: See `docs/CLI_GUIDE.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Issues**: Open GitHub issue

## Best Practices

1. **Always run health check** before starting work
2. **Use DAL/DTO pattern** for data operations
3. **Write tests** for new features
4. **Format and lint** before committing
5. **Use TypeScript strictly** - no `any` types
6. **Log important events** with proper context
7. **Handle errors gracefully** with try-catch
8. **Use environment variables** for config
9. **Document complex logic** with comments
10. **Keep components small** and focused

## Next Steps

1. Explore the codebase
2. Read the architecture docs
3. Try creating a simple feature
4. Join the team chat
5. Review open issues

Happy coding! 🚀
