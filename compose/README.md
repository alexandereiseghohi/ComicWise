# Docker Setup Guide

This guide explains how to use Docker and Docker Compose for ComicWise
development and production.

## Quick Start

### Development with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, PgAdmin, Next.js app)
docker-compose -f docker-compose.dev.yml up

# Access services:
# - App: http://localhost:3000
# - PgAdmin: http://localhost:5051
# - Redis: localhost:6380
# - PostgreSQL: localhost:5433
```

### Production Deployment

```bash
# Build and start production containers
docker-compose up -d

# Access services:
# - App: http://localhost:3000
# - PgAdmin: http://localhost:5050
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

## Services

### PostgreSQL (postgres)

- **Image:** `postgres:17-alpine`
- **Development Port:** 5433
- **Production Port:** 5432
- **Dev Credentials:** `dev:dev123`
- **Volume:** `comicwise_postgres_data`
- **Health Check:** Enabled

### Redis (redis)

- **Image:** `redis:7-alpine`
- **Development Port:** 6380
- **Production Port:** 6379
- **Volume:** `comicwise_redis_data`
- **Persistence:** AOF (Append-Only File)

### PgAdmin (pgadmin)

- **Image:** `dpage/pgadmin4:latest`
- **Development Port:** 5051
- **Production Port:** 5050
- **Access:** http://localhost:5051 (dev) or http://localhost:5050 (prod)
- **Volume:** `comicwise_pgadmin_data`
- **Default Credentials:**
  - Email: `admin@example.com`
  - Password: `admin` (change in production!)

### Next.js App (app)

- **Development Target:** builder (with hot reload)
- **Production Target:** runner (optimized)
- **Port:** 3000
- **Volume:** Current directory (dev only)
- **Depends On:** PostgreSQL, Redis

## Environment Variables

Services load environment variables from `.env.local` or
`.envs/.env.development` (dev) and `.envs/.env.production` (prod).

### Key Variables

```env
# Database
DATABASE_URL=postgresql://dev:dev123@postgres:5432/comicwise_dev
POSTGRES_DB=comicwise_dev
POSTGRES_USER=dev
POSTGRES_PASSWORD=dev123

# Redis
REDIS_URL=redis://redis:6379

# Auth
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-secret

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
```

See `.envs/README.md` for complete variable reference.

## Docker Compose Commands

### Development

```bash
# Start services in foreground (see logs)
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down

# Remove volumes (deletes data!)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild images
docker-compose -f docker-compose.dev.yml up --build
```

### Production

```bash
# Same commands, but without `-f` flag (uses docker-compose.yml)
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## Database Operations

### Initialize Database (Development)

```bash
# Start PostgreSQL
docker-compose -f docker-compose.dev.yml up postgres -d

# Run migrations
docker-compose -f docker-compose.dev.yml exec app pnpm db:push

# Seed database
docker-compose -f docker-compose.dev.yml exec app pnpm db:seed
```

### Access PostgreSQL CLI

```bash
# Development
docker-compose -f docker-compose.dev.yml exec postgres psql -U dev -d comicwise_dev

# Production
docker-compose exec postgres psql -U postgres -d comicwise
```

### Backup Database

```bash
# Development
docker-compose -f docker-compose.dev.yml exec postgres pg_dump \
  -U dev comicwise_dev > backup.sql

# Production
docker-compose exec postgres pg_dump \
  -U postgres comicwise > backup.sql
```

### Restore Database

```bash
# Development
docker-compose -f docker-compose.dev.yml exec -T postgres psql \
  -U dev comicwise_dev < backup.sql

# Production
docker-compose exec -T postgres psql \
  -U postgres comicwise < backup.sql
```

## PgAdmin Access

### Development

- URL: http://localhost:5051
- Email: admin@example.com
- Password: admin

### Production

- URL: http://localhost:5050
- Email: Configure via `PGADMIN_DEFAULT_EMAIL`
- Password: Configure via `PGADMIN_DEFAULT_PASSWORD`

### Register PostgreSQL Server in PgAdmin

1. Open PgAdmin (http://localhost:5051)
2. Login with your credentials
3. Right-click "Servers" > "Register" > "Server"
4. Fill in:
   - **Name:** ComicWise PostgreSQL
   - **Host:** postgres (or localhost)
   - **Port:** 5432
   - **Database:** comicwise_dev (dev)
   - **Username:** dev
   - **Password:** dev123 (dev)
5. Click Save

## Building Images

### Build Locally

```bash
# Development (builder stage - includes dev dependencies)
docker build -f compose/Dockerfile --target builder .

# Production (runner stage - optimized)
docker build -f compose/Dockerfile --target runner .

# With custom tag
docker build -f compose/Dockerfile --target runner -t comicwise-app:1.0.0 .
```

### Docker Hub / Registry

```bash
# Build and tag
docker build -f compose/Dockerfile --target runner \
  -t username/comicwise-app:latest .

# Push to registry
docker push username/comicwise-app:latest

# Use in docker-compose.yml
image: username/comicwise-app:latest
```

## Health Checks

All services include health checks. View status:

```bash
docker-compose ps
```

Output example:

```
NAME                     STATUS
comicwise-postgres       Up 2 minutes (healthy)
comicwise-redis          Up 2 minutes (healthy)
comicwise-pgadmin        Up 2 minutes (healthy)
comicwise-app-dev        Up 1 minute
```

## Troubleshooting

### "Cannot connect to PostgreSQL"

```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Test connection manually
docker-compose exec postgres psql -U dev -c "SELECT version();"
```

### "Port already in use"

Change ports in docker-compose file or use environment variables:

```bash
# Override port
APP_PORT=3001 docker-compose up

# Or in .env.local
APP_PORT=3001
POSTGRES_PORT=5434
REDIS_PORT=6380
PGADMIN_PORT=5051
```

### "Permission denied" on volumes

```bash
# Fix permissions (Linux/Mac)
docker-compose down -v
sudo chown -R $USER:$USER pgadmin_data postgres_data redis_data
docker-compose up
```

### Rebuild everything from scratch

```bash
# Remove containers, volumes, and rebuild
docker-compose down -v
docker-compose up --build
```

## Performance Tips

### Development

1. **Volume Mount Limits:** Avoid mounting entire `node_modules`
   - Current setup excludes it: `/app/node_modules`

2. **File Watching:** Enable polling for slow systems:

   ```env
   CHOKIDAR_USEPOLLING=true
   ```

3. **Memory:** Increase Docker memory if slow:
   - Docker Desktop: Preferences > Resources > Memory

### Production

1. **Resource Limits:** Set in docker-compose.yml:

   ```yaml
   deploy:
     resources:
       limits:
         cpus: "2"
         memory: 2G
   ```

2. **Database Connection Pooling:**

   ```
   DATABASE_URL=...?connection_limit=20
   ```

3. **Image Caching:** Layer caching already optimized in Dockerfile

## Security

### Development

- Use `comicwise-dev-network` (isolated)
- Simple credentials (OK for dev)
- Health checks enabled
- No SSL/TLS needed (localhost)

### Production

- Enable TLS/SSL for all external connections
- Use strong credentials for PgAdmin
- Set resource limits
- Regular backups
- Monitor logs
- Use secrets management (Docker Secrets, environment)

```yaml
# Example production database variable
DATABASE_URL: postgresql://user:${DB_PASSWORD}@postgres:5432/comicwise?ssl=require
```

## Deployment Platforms

### Vercel (Recommended for Next.js)

- No Docker needed
- Use Neon for PostgreSQL
- Use Upstash for Redis
- Deploy: `git push`

### Railway/Render

- Deploy docker-compose.yml
- Set environment variables in platform UI
- Automatic SSL/TLS

### Docker Swarm / Kubernetes

- Requires docker-compose.yml to be adapted
- Add additional services (ingress, monitoring)
- Use manifests/helm charts for K8s

### Self-Hosted VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into server
ssh user@your-vps

# Clone repo
git clone ...
cd comicwise

# Copy production env
cp .envs/.env.production .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Useful Scripts

See `compose/` directory for helper scripts:

- `setup.sh` - Initialize Docker environment
- `seed.sh` - Run database seeding in Docker
- `health-check.sh` - Check all service health
- `deploy.sh` / `deploy.ps1` - Deploy to production

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Specification](https://compose-spec.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation/)
- [PgAdmin Documentation](https://www.pgadmin.org/docs/)
