# Docker Configuration & Deployment Guide

## Overview

ComicWise uses Docker for consistent development and production environments
with:

- Multi-stage builds for minimal image size
- PostgreSQL with optimized settings
- Redis for caching
- Health checks and automatic restart
- Non-root security

## 1. Directory Structure

```
compose/
├── Dockerfile          # Multi-stage production build
├── setup.sh           # Initialize containers and database
├── seed.sh            # Run database seeding
└── test.sh            # Integration test suite

docker-compose.yml     # Production configuration
docker-compose.dev.yml # Development with hot reload
.dockerignore          # Files to exclude from build
```

## 2. Building Docker Images

### Production Build

```bash
# Build with cache optimization
docker compose build

# Build specific service
docker compose build app

# Build with buildkit (faster)
DOCKER_BUILDKIT=1 docker compose build

# Build and push to registry
docker buildx build -t myregistry/comicwise:latest --push .
```

### Development Build

```bash
# Build development image with volume mounts
docker compose -f docker-compose.dev.yml build

# Build with cache busting
docker compose build --no-cache
```

## 3. Container Optimization

### Multi-Stage Build Strategy

The Dockerfile uses 4 stages:

1. **base**: Common dependencies (Node 22-alpine)
2. **deps**: Install dependencies (cached)
3. **builder**: Build application
4. **runner**: Production image (minimal, non-root)

### Layer Caching

Each layer is cached by Docker:

```dockerfile
# Stage 1: Install system deps - cached
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init

# Stage 2: Install npm deps - cached separately
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 3: Build app - only rebuilds when src changes
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 4: Minimal production image
FROM base AS runner
COPY --from=builder /app/.next/standalone ./
```

### Image Size Optimization

Current size: **< 200MB** (small and fast)

Techniques:

- Alpine base image (5MB)
- Multi-stage builds (excludes dev deps)
- Standalone output (no node_modules in container)
- Stripped non-essential files

```bash
# Check image size
docker images comicwise-app

# Compare compressed vs uncompressed
docker save comicwise-app | gzip | wc -c
```

## 4. Running Containers

### Production Deployment

```bash
# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f app

# Scale app service
docker compose up -d --scale app=3

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Development Workflow

```bash
# Start with hot reload
docker compose -f docker-compose.dev.yml up

# Run specific service
docker compose -f docker-compose.dev.yml up app

# Run in background
docker compose -f docker-compose.dev.yml up -d

# Follow logs
docker compose -f docker-compose.dev.yml logs -f app

# Execute command in container
docker compose -f docker-compose.dev.yml exec app pnpm type-check

# Stop all services
docker compose -f docker-compose.dev.yml down
```

## 5. Database Services

### PostgreSQL Configuration

**Performance settings:**

```yaml
postgres:
  image: postgres:17-alpine
  environment:
    POSTGRES_DB: comicwise
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  command:
    - "postgres"
    - "-c"
    - "max_connections=200" # Connection pool
    - "-c"
    - "shared_buffers=512MB" # Memory allocation
    - "-c"
    - "effective_cache_size=2GB" # Cache size
    - "-c"
    - "work_mem=5242kB" # Query memory
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**Volume persistence:**

```yaml
volumes:
  postgres_data:
    driver: local
    name: comicwise_postgres_data
```

**Health check:**

```bash
# Manual check
docker compose exec postgres pg_isready -U postgres

# Check from logs
docker compose logs postgres
```

### Redis Configuration

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 3s
    retries: 5
  command: >
    redis-server --appendonly yes            # Persistence --maxmemory
    1gb            # Max memory --maxmemory-policy allkeys-lru  # Eviction
    policy
```

**Health check:**

```bash
docker compose exec redis redis-cli ping
```

## 6. Setup Script Usage

### Initialize Environment

```bash
# Run setup script
bash compose/setup.sh

# Manual steps
docker compose build
docker compose up -d
docker compose exec postgres pg_isready -U postgres
docker compose exec app pnpm db:push
docker compose exec app pnpm db:seed
```

### What Setup Does

1. ✅ Checks Docker installation
2. ✅ Verifies environment file
3. ✅ Starts containers
4. ✅ Waits for PostgreSQL health check
5. ✅ Waits for Redis health check
6. ✅ Displays service status

### Troubleshooting

```bash
# Service won't start?
docker compose logs app

# Database won't connect?
docker compose logs postgres

# Port already in use?
docker compose down -v
# Change ports in docker-compose.yml

# Out of disk space?
docker system prune -af --volumes
docker buildx prune -a
```

## 7. Seeding Database

### Run Seed

```bash
# Via script
bash compose/seed.sh

# Or directly
docker compose exec app pnpm db:seed

# With options
docker compose exec app pnpm db:seed --verbose
docker compose exec app pnpm db:seed --dry-run
docker compose exec app pnpm db:seed --skip-images
```

### Seed Options

```bash
pnpm db:seed              # Seed all tables
pnpm db:seed:users        # Users only
pnpm db:seed:comics       # Comics only
pnpm db:seed:chapters     # Chapters only
pnpm db:seed:verbose      # With detailed logging
pnpm db:seed:dry-run      # Show SQL without executing
pnpm db:seed:no-images    # Skip image downloads
```

## 8. Integration Testing

### Run Tests in Docker

```bash
# Run test suite
bash compose/test.sh

# Or manually
docker compose build
docker compose up -d
docker compose exec app pnpm test:unit:run
docker compose exec app pnpm test --reporter=html
docker compose exec app pnpm build

# Cleanup after tests
docker compose down -v
```

### Test What

- Type checking
- Unit tests with coverage
- Build verification
- Database connectivity
- API health checks

## 9. Security Best Practices

### Non-Root User

Containers run as non-root user `nextjs` (UID 1001):

```dockerfile
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs
USER nextjs
```

### Environment Variables

**Sensitive data via .env.local:**

```bash
# Never commit .env.local
echo ".env.local" >> .gitignore

# Use secrets for sensitive values
docker compose config --no-interpolate | grep NEXTAUTH_SECRET
```

**Available variables:**

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Email
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
```

### Network Security

```yaml
networks:
  comicwise-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

Services communicate internally, only expose ports as needed.

### Read-Only Filesystem

For production, consider read-only filesystem:

```yaml
tmpfs:
  - /tmp
  - /run
```

## 10. Performance Tuning

### Resource Limits

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: "2"
        memory: 2G
      reservations:
        cpus: "0.5"
        memory: 512M
```

### Logging

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

Limits log file to 30MB total (3 files × 10MB).

## 11. Monitoring & Logging

### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs app
docker compose logs postgres

# Follow logs (tail -f)
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app
```

### Health Status

```bash
# Check service health
docker compose ps

# Manual health check
docker compose exec app curl http://localhost:3000/api/health

# Check database
docker compose exec postgres pg_isready
```

### Resource Usage

```bash
# CPU and memory
docker stats

# Disk usage
docker system df

# Image layers
docker image history comicwise-app
```

## 12. Cleanup & Maintenance

### Remove Old Images

```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup (WARNING: removes all unused containers, images, networks, volumes)
docker system prune -a --volumes
```

### Backup Database

```bash
# Backup
docker compose exec postgres pg_dump -U postgres comicwise > backup.sql

# Restore
docker compose exec -T postgres psql -U postgres comicwise < backup.sql
```

### Update Images

```bash
# Pull latest images
docker compose pull

# Rebuild and restart
docker compose up -d --build
```

## 13. Deployment Checklist

Before deploying to production:

- [ ] Build image: `docker compose build`
- [ ] Test locally: `docker compose up`
- [ ] Run migrations: `docker compose exec app pnpm db:push`
- [ ] Seed data: `docker compose exec app pnpm db:seed`
- [ ] Run tests: `bash compose/test.sh`
- [ ] Check logs: `docker compose logs`
- [ ] Verify health: `docker compose ps`
- [ ] Test API: `curl http://localhost:3000/api/health`
- [ ] Check performance: `docker stats`

## 14. Common Issues

### Container Won't Start

```bash
# Check logs
docker compose logs app

# Common causes:
# 1. Port already in use - change port in docker-compose.yml
# 2. Database not ready - wait for postgres healthcheck
# 3. Missing env vars - check .env.local
```

### Database Connection Failed

```bash
# Check PostgreSQL status
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U postgres -c "SELECT 1"

# Reset database
docker compose down -v
docker compose up -d
docker compose exec app pnpm db:push
```

### Slow Builds

```bash
# Build with cache
docker compose build --no-cache  # Force rebuild

# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker compose build

# Remove dangling images
docker image prune -f
```

## 15. Quick Reference

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Logs
docker compose logs -f

# Shell
docker compose exec app sh

# Test
bash compose/test.sh

# Seed
bash compose/seed.sh

# Reset
docker compose down -v && docker compose up -d && \
  docker compose exec app pnpm db:push && \
  docker compose exec app pnpm db:seed
```
