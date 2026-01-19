# Environment Configuration Files

This directory contains environment configuration templates for different
environments.

## Files

### `.env.development`

Development environment configuration. Use this as a template for `.env.local`
when setting up the project locally.

**Usage:**

```bash
cp .envs/.env.development .env.local
# Then edit .env.local with your local values
```

### `.env.production`

Production environment configuration. Use this as a reference for setting up
production deployments.

**Important:** Never commit `.env.production` with real secrets. Instead:

- Use your deployment platform's secrets/environment management (Vercel, Docker,
  etc.)
- Set variables via CI/CD pipelines
- Use managed services for sensitive data

## Quick Start

### 1. Local Development Setup

```bash
# Copy development template to .env.local
cp .envs/.env.development .env.local

# Edit with your local values
code .env.local
```

### 2. With Docker Compose

```bash
# Use development template for Docker services
docker-compose -f docker-compose.dev.yml up

# Database will be: postgresql://dev:dev123@postgres:5432/comicwise_dev
# Redis will be: redis://redis:6379
# PgAdmin will be: http://localhost:5050
```

### 3. Production Deployment

```bash
# Vercel (automatic)
vercel env pull

# Docker (pass env file)
docker-compose --env-file .envs/.env.production up

# Or set environment variables in your platform:
# - Vercel: Project Settings > Environment Variables
# - Railway: Variables tab
# - Docker: --env-file or docker-compose env
```

## Environment Variables Reference

### Required Variables

| Variable       | Purpose                     | Example                               |
| -------------- | --------------------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection       | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET`  | NextAuth secret (32+ chars) | `openssl rand -base64 32`             |
| `AUTH_URL`     | Auth callback URL           | `http://localhost:3000`               |

### Optional but Recommended

| Variable          | Purpose                     |
| ----------------- | --------------------------- |
| `REDIS_URL`       | Redis caching/sessions      |
| `UPLOAD_PROVIDER` | Image upload service        |
| `EMAIL_SERVER_*`  | Email service configuration |
| `AUTH_GOOGLE_*`   | Google OAuth                |
| `AUTH_GITHUB_*`   | GitHub OAuth                |

## Generate Secure Secrets

### AUTH_SECRET (32+ characters)

**On Linux/Mac:**

```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

**Online (use only for development):**

- https://generate-random.org/api (copy first 32 chars)

## Docker Compose Environment Files

The `docker-compose.yml` and `docker-compose.dev.yml` files automatically use:

- `.envs/.env.development` for `docker-compose.dev.yml`
- `.envs/.env.production` for `docker-compose.yml` (production)

To override, pass `--env-file`:

```bash
docker-compose --env-file .envs/.env.custom up
```

## Database Connection Strings

### Local PostgreSQL

```
postgresql://postgres:postgres@localhost:5432/comicwise_dev
```

### Docker Compose

```
postgresql://dev:dev123@postgres:5432/comicwise_dev
```

### Neon (Cloud)

```
postgresql://user:password@host.neon.tech:5432/db?ssl=true
```

### Connection Pooling (Supabase/PgBouncer)

```
postgresql://user:password@host-pooler.supabase.co:6432/db?ssl=true
```

## Redis Connection

### Local

```
redis://localhost:6379
```

### Docker Compose

```
redis://redis:6379
```

### Upstash

```
redis://:token@host.upstash.io:6379
```

## Email Configuration

### Local Development (MailHog)

```bash
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

Variables:

```
EMAIL_SERVER_HOST=localhost
EMAIL_SERVER_PORT=1025
EMAIL_SECURE=false
```

Web UI: http://localhost:8025

### SendGrid

```
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-api-key
```

### Gmail (less secure - not recommended for production)

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
```

## File Upload Providers

### Local (Development)

```
UPLOAD_PROVIDER=local
```

Files stored in `public/uploads/`

### ImageKit

```
UPLOAD_PROVIDER=imagekit
IMAGEKIT_PUBLIC_KEY=your-key
IMAGEKIT_PRIVATE_KEY=your-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
```

### Cloudinary

```
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

## Troubleshooting

### "Cannot connect to database"

- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running
- Check firewall rules

### "Auth errors"

- Ensure `AUTH_SECRET` is 32+ characters
- Verify `AUTH_URL` matches your app URL
- Check `.env.local` is NOT in git

### "Redis connection refused"

- Verify Redis is running: `redis-cli ping`
- Check `REDIS_URL` or `REDIS_HOST:REDIS_PORT`

### "Email not sending"

- For local dev: Run MailHog
- For production: Verify SMTP credentials
- Check email is not blocked by firewall

## Security Best Practices

✓ Keep `.env.local` in `.gitignore` (do NOT commit) ✓ Use strong secrets (32+
characters) ✓ Rotate secrets regularly ✓ Use managed services for production
(Neon, Upstash, etc.) ✓ Enable SSL/TLS for database connections ✓ Never log or
expose environment variables ✓ Use separate secrets per environment ✓ Audit
access to secrets regularly

## See Also

- [Setup.md](../SETUP.md) - Project setup guide
- [.env.example](../.env.example) - All available variables with descriptions
- [docker-compose.yml](../docker-compose.yml) - Production Docker setup
- [docker-compose.dev.yml](../docker-compose.dev.yml) - Development Docker setup
