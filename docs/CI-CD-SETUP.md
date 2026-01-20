# CI/CD Pipeline Configuration Guide

## Overview

ComicWise uses GitHub Actions for automated CI/CD workflows. This guide covers:

- Required GitHub Secrets
- Workflow configurations
- Deployment procedures
- Rollback strategies

---

## Required GitHub Secrets

Configure these in: **Repository Settings > Secrets and variables > Actions**

### Critical Secrets (Required for Deployment)

```yaml
# Database
DATABASE_URL: "postgresql://user:password@host:5432/database?sslmode=require"
NEON_DATABASE_URL: "postgresql://user:password@host.neon.tech:5432/database"

# Authentication
AUTH_SECRET: "your-nextauth-secret-min-32-chars" # Generate with: openssl rand -base64 32
AUTH_TRUST_HOST: "true"

# Vercel Deployment
VERCEL_TOKEN: "your-vercel-api-token"
VERCEL_ORG_ID: "your-org-id"
VERCEL_PROJECT_ID: "your-project-id"

# Docker (for container builds)
DOCKER_USERNAME: "your-dockerhub-username"
DOCKER_PASSWORD: "your-dockerhub-password"

# Redis/Upstash
UPSTASH_REDIS_REST_URL: "https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN: "your-upstash-token"

# Email Service
RESEND_API_KEY: "re_your_resend_api_key"
EMAIL_FROM: "noreply@your-domain.com"

# Image CDN
IMAGEKIT_PUBLIC_KEY: "public_your_imagekit_key"
IMAGEKIT_PRIVATE_KEY: "private_your_imagekit_key"
IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/your_id"

# Error Monitoring
SENTRY_DSN: "https://your-sentry-dsn@sentry.io/project-id"
SENTRY_AUTH_TOKEN: "your-sentry-auth-token"
SENTRY_ORG: "your-org-slug"
SENTRY_PROJECT: "your-project-slug"
```

### Optional Secrets (for Advanced Features)

```yaml
# OAuth Providers
GOOGLE_CLIENT_ID: "your-google-client-id"
GOOGLE_CLIENT_SECRET: "your-google-client-secret"
GITHUB_CLIENT_ID: "your-github-client-id"
GITHUB_CLIENT_SECRET: "your-github-client-secret"

# AWS S3 (if using AWS instead of ImageKit)
AWS_REGION: "us-east-1"
AWS_ACCESS_KEY_ID: "your-access-key"
AWS_SECRET_ACCESS_KEY: "your-secret-key"
AWS_S3_BUCKET_NAME: "your-bucket-name"

# QStash (for background jobs)
QSTASH_TOKEN: "your-qstash-token"
QSTASH_CURRENT_SIGNING_KEY: "your-signing-key"
QSTASH_NEXT_SIGNING_KEY: "your-next-signing-key"
```

---

## GitHub Actions Workflows

Located in `.github/workflows/`

### 1. **ci.yml** - Continuous Integration

**Triggers:** Push to `main`, `develop`; Pull requests

**Steps:**

1. Checkout code
2. Setup Node.js and pnpm
3. Install dependencies
4. Type checking (`pnpm type-check`)
5. Linting (`pnpm lint`)
6. Unit tests (`pnpm test:unit:run`)
7. Build validation (`pnpm build`)

**Configure:**

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
  NEXT_PUBLIC_APP_URL: "http://localhost:3000"
```

---

### 2. **deploy.yml** - Deployment

**Triggers:** Push to `main` branch (production), manual workflow

**Steps:**

1. Checkout code
2. Install dependencies
3. Build project
4. Run database migrations
5. Deploy to Vercel
6. Upload source maps to Sentry
7. Notify team (Slack/Discord webhook)

**Configure:**

```yaml
- name: Deploy to Vercel
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  run: |
    vercel --prod --token=$VERCEL_TOKEN
```

---

### 3. **security.yml** - Security Scanning

**Triggers:** Weekly schedule, manual

**Steps:**

1. CodeQL security analysis
2. Dependency vulnerability scan (npm audit)
3. Secret scanning (TruffleHog)
4. License compliance check

---

### 4. **test.yml** - E2E Testing

**Triggers:** Pull requests, nightly schedule

**Steps:**

1. Setup test database (Docker PostgreSQL)
2. Seed test data
3. Run Playwright E2E tests
4. Upload test reports
5. Cleanup test environment

---

## Deployment Procedures

### Production Deployment (Automated)

1. **Merge to main branch**

   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Workflow automatically:**
   - Runs all tests
   - Builds production bundle
   - Runs database migrations
   - Deploys to Vercel
   - Uploads Sentry source maps
   - Sends deployment notification

3. **Monitor deployment:**
   - GitHub Actions tab: Check workflow status
   - Vercel Dashboard: Verify deployment
   - Sentry: Monitor errors post-deployment

### Manual Deployment (Emergency)

```bash
# 1. Build locally
pnpm build

# 2. Test production build
pnpm start

# 3. Deploy using Vercel CLI
vercel --prod

# 4. Run migrations on production DB
pnpm db:push

# 5. Upload Sentry source maps
pnpm sentry:sourcemaps
```

### Staging Deployment

```bash
# Deploy to staging environment
vercel --target staging

# Use staging environment variables
cp .env.staging .env.production
vercel env pull
```

---

## Rollback Procedures

### Immediate Rollback (Vercel)

**Option 1: Via Vercel Dashboard**

1. Go to Deployments tab
2. Find last stable deployment
3. Click "Promote to Production"

**Option 2: Via CLI**

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Database Rollback

**⚠️ CRITICAL: Only use if database migration caused issues**

```bash
# 1. Create backup first (see Database Backup section)
pnpm db:backup

# 2. Revert migration
pnpm db:rollback

# 3. If schema corrupted, restore from backup
pnpm db:restore --backup=backup-YYYY-MM-DD-HH-MM.sql
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally (`pnpm test`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Database migrations tested in staging
- [ ] Environment variables verified
- [ ] Changelog updated
- [ ] Sentry release created

### During Deployment

- [ ] Monitor GitHub Actions workflow
- [ ] Check Vercel deployment logs
- [ ] Verify database migrations completed
- [ ] Test critical user flows
- [ ] Monitor Sentry for new errors

### Post-Deployment

- [ ] Smoke test critical features
- [ ] Check application performance (Vercel Analytics)
- [ ] Monitor error rates (Sentry)
- [ ] Verify email notifications working
- [ ] Test OAuth login flows
- [ ] Check image uploads (CDN)
- [ ] Notify team of successful deployment

---

## Monitoring & Alerts

### Sentry Configuration

**Performance Monitoring:**

```javascript
SENTRY_TRACES_SAMPLE_RATE = 0.1; // 10% of transactions
SENTRY_REPLAY_SESSION_SAMPLE_RATE = 0.1; // 10% of sessions
SENTRY_REPLAY_ERROR_SAMPLE_RATE = 1.0; // 100% of errors
```

**Alert Rules (Configure in Sentry Dashboard):**

- Error rate > 1% in 5 minutes → Email + Slack
- Response time > 2s for 5 minutes → Email
- Failed deployments → Email + Slack

### Vercel Monitoring

**Configure Alerts:**

- Deployment failures
- Build timeouts
- Function errors
- Bandwidth limits

---

## Troubleshooting

### Deployment Fails

**Check:**

1. GitHub Actions logs
2. Vercel deployment logs
3. Environment variables set correctly
4. Database connection string valid
5. Sentry DSN configured

**Common Fixes:**

```bash
# Clear Next.js cache
pnpm clean

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild from scratch
pnpm build
```

### Migration Fails

**Check:**

1. Database accessible from CI/CD
2. Migration files syntactically correct
3. Schema changes compatible

**Rollback:**

```bash
pnpm db:rollback
```

### Tests Fail in CI

**Debug:**

```bash
# Run tests locally with same conditions
DATABASE_URL=<test-db-url> pnpm test

# Check test database seeding
pnpm db:seed --dry-run
```

---

## Advanced: Blue-Green Deployment

For zero-downtime deployments with instant rollback:

```bash
# 1. Deploy to staging slot
vercel --target staging

# 2. Run smoke tests against staging
pnpm test:e2e:staging

# 3. If successful, promote to production
vercel promote <staging-url>
```

---

## Security Best Practices

1. **Rotate secrets quarterly**
2. **Use separate secrets for staging/production**
3. **Enable branch protection rules**
4. **Require status checks before merging**
5. **Use dependabot for security updates**
6. **Enable 2FA for all team members**
7. **Audit access logs monthly**

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments)
- [Sentry Release Management](https://docs.sentry.io/product/releases/)
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)

---

**Last Updated:** January 20, 2026 **Version:** 1.0.0
