# ComicWise Setup Guide

## Prerequisites

- Node.js 20+ 
- pnpm 9+
- PostgreSQL 16+
- Redis 7+ (optional but recommended)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd comicwise
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Setup database**
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

## Environment Variables

See `.env.example` for all available environment variables.

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: Secret for NextAuth (generate with `openssl rand -base64 32`)

### Optional Variables

- `REDIS_URL`: Redis connection string
- `IMAGEKIT_*`: ImageKit CDN credentials
- `CLOUDINARY_*`: Cloudinary credentials

## Development

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm type-check`: Run TypeScript compiler
- `pnpm test`: Run tests

### Database Commands

- `pnpm db:push`: Push schema changes to database
- `pnpm db:seed`: Seed database with sample data
- `pnpm db:studio`: Open Drizzle Studio
- `pnpm db:reset`: Reset and reseed database

## Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository in Vercel
3. Configure environment variables
4. Deploy

### Docker

1. Build image: `docker compose build`
2. Run containers: `docker compose up -d`

## Troubleshooting

### Common Issues

**Database connection failed**
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct

**Module not found**
- Run `pnpm install`
- Clear cache: `pnpm clean && pnpm install`

**TypeScript errors**
- Run `pnpm type-check` to see all errors
- Update `tsconfig.json` if needed

---

*Last updated: 2026-01-19T19:55:57.770Z*
