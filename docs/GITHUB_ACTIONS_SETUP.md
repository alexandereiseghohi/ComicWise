# GitHub Actions Setup Guide

> **Complete walkthrough** for configuring GitHub Actions CI/CD for ComicWise

## 📋 Overview

The ComicWise project uses GitHub Actions for automated:

- ✅ Type checking and linting
- ✅ Unit and E2E testing
- ✅ Building and deploying
- ✅ Security scanning
- ✅ Deployment to Vercel and Docker

## 🚀 Quick Setup (5 minutes)

### Step 1: Add Secrets to GitHub

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository
secret**

**Required Secrets:**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/comicwise

# Authentication
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://yourdomain.com
AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Deployment (optional)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org
VERCEL_PROJECT_ID=your_vercel_project
```

### Step 2: Verify Workflows

```bash
# Check workflow files
ls -la .github/workflows/
# Expected output:
# - ci.yml (main CI pipeline)
# - deploy.yml (deployment workflows)
```

### Step 3: Trigger First Run

```bash
# Push to main branch or create a PR
git push origin main

# Monitor in GitHub: Actions tab
```

---

## 🔧 Workflow Files

### `.github/workflows/ci.yml`

**Purpose**: Core CI pipeline  
**Triggers**: Push to main/develop, Pull requests  
**Jobs**:

1. **Install** - Setup dependencies with caching
2. **Lint & Type Check** - Code quality
3. **Unit Tests** - Vitest coverage
4. **E2E Tests** - Playwright tests
5. **Build** - Next.js production build
6. **Security** - Audit and secret scanning
7. **Status Check** - Summary report

**Status**: ✅ Complete

### `.github/workflows/deploy.yml`

**Purpose**: Deployment automation  
**Triggers**: Push to main/staging, Manual dispatch  
**Jobs**:

1. **Pre-deploy Checks** - Determine target environment
2. **Deploy Staging** - Vercel preview
3. **Deploy Production** - Vercel production
4. **Deploy Docker** - Self-hosted deployment
5. **Post-deploy Checks** - Health verification

**Status**: ✅ Complete

---

## 📊 Workflow Architecture

```
┌─────────────────────────────────────────────────┐
│ Event: Push / PR / Workflow Dispatch            │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼────┐            ┌──────▼────┐
    │ Install │            │   CI.yml  │
    └───┬────┘            └─────┬─────┘
        │                       │
        │        ┌──────────────┼──────────────┐
        │        │              │              │
    ┌───▼─────────▼──┐  ┌──────▼──┐  ┌────────▼────┐
    │  Lint & Type   │  │ Tests    │  │   Build     │
    │   Check        │  │ (Unit)   │  │             │
    └────────┬───────┘  └────┬─────┘  └────────┬────┘
             │               │                 │
             │        ┌──────▼──┐             │
             │        │E2E Tests│             │
             │        └────┬────┘             │
             │             │                 │
             └─────────────┼─────────────────┘
                           │
                      ┌────▼────┐
                      │ Security │
                      └────┬────┘
                           │
                      ┌────▼──────────┐
                      │ Status Check  │
                      └──────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              ┌─────▼────┐      ┌──────▼──┐
              │ Deploy    │      │ Notify  │
              │ (if main) │      │ PR      │
              └──────────┘      └─────────┘
```

---

## 🔐 Secret Configuration by Environment

### Development (Local)

```bash
# .env.local (never commit)
DATABASE_URL=postgresql://user:password@localhost:5432/comicwise
NEXTAUTH_SECRET=dev-secret-not-secure
NEXTAUTH_URL=http://localhost:3000
```

### Staging

```bash
# GitHub Secrets (STAGING_*)
STAGING_DATABASE_URL=postgresql://...staging...
STAGING_NEXTAUTH_SECRET=<strong-random-value>
```

### Production

```bash
# GitHub Secrets (PROD_* or plain)
DATABASE_URL=postgresql://...prod...
NEXTAUTH_SECRET=<strong-random-value>
VERCEL_TOKEN=<your-token>
```

---

## ✅ Pre-Merge Checklist

Before opening a PR, ensure:

- [ ] All secrets configured in GitHub
- [ ] Local `.env.local` exists (never commit)
- [ ] `pnpm validate` passes
- [ ] No `console.log` in production code
- [ ] Tests pass locally
- [ ] Branch naming follows convention

---

## 🐛 Debugging Workflow Failures

### View Logs

1. Go to **Actions** tab
2. Select failing workflow run
3. Click job name to see detailed logs
4. Search for error messages

### Common Issues

#### Issue: "Lint & Type Check failed"

```bash
# Run locally to debug
pnpm lint --max-warnings=0
pnpm type-check

# Fix issues
pnpm lint:fix
pnpm format
```

#### Issue: "Database connection error"

```bash
# Verify secret is set
# Go to: Settings > Secrets > DATABASE_URL
# Ensure DATABASE_URL format is correct:
# postgresql://user:pass@host:port/database
```

#### Issue: "Build failed"

```bash
# Check environment variables
# Ensure all required secrets are configured
# Try local build
pnpm build
```

#### Issue: "Tests timeout"

```yaml
# Increase timeout in workflow
timeout-minutes: 60 # Was 30
```

---

## 🚀 Deployment Workflow

### Manual Deployment

```bash
# Trigger deployment via GitHub UI
# Actions > Deploy > Run workflow > Select environment
```

### Automatic Deployment

```bash
# Merge to main → Auto-deploys to production
# Merge to staging → Auto-deploys to staging preview
```

### Deployment Targets

| Branch      | Environment | URL                              |
| ----------- | ----------- | -------------------------------- |
| `main`      | Production  | comicwise.vercel.app             |
| `staging`   | Staging     | staging-comicwise.vercel.app     |
| `feature/*` | Preview     | pr-{number}-comicwise.vercel.app |

---

## 📈 Monitoring & Notifications

### GitHub Status Checks

PR requirements:

- ✅ Lint & Type Check must pass
- ✅ Build must succeed
- ⏭️ Tests are optional (warnings allowed)

### PR Comments

Workflows auto-comment on PRs with:

- Status of each job
- Links to artifacts
- Deployment URLs

### Email Notifications

Enable in **Settings** > **Notifications**:

- ✅ Workflow runs
- ✅ Deployment status
- ✅ Security alerts

---

## 🔄 Updating Workflows

### When to update workflows

- New CI requirement
- Update Node/pnpm versions
- Add new check or test
- Fix failing workflow

### Process

```bash
# 1. Create feature branch
git checkout -b ci/update-workflow

# 2. Edit workflow file
nano .github/workflows/ci.yml

# 3. Test syntax (optional)
yamllint .github/workflows/ci.yml

# 4. Commit and push
git add .github/workflows/ci.yml
git commit -m "ci: update workflow"
git push origin ci/update-workflow

# 5. Open PR and monitor first run
```

---

## 🛡️ Security Considerations

### Secrets Best Practices

✅ **Do**:

- Use strong, unique secrets
- Rotate secrets quarterly
- Limit secret access to needed jobs
- Enable secret masking (default)
- Audit secret usage

❌ **Don't**:

- Commit secrets to repo
- Log secrets in output
- Use test/dummy values
- Share secrets via chat/email
- Reuse secrets across services

### Code Security

CI runs security checks:

- `pnpm audit` - Dependency vulnerabilities
- TruffleHog - Exposed secrets detection
- ESLint Security - Code security issues

---

## 📊 Performance Optimization

### Caching Strategy

```yaml
# Workflow uses multi-level caching:
1. pnpm store cache (dependencies) 2. Node modules cache (built dependencies) 3.
Build artifacts cache (.next/)
```

**Cache hits save ~5 minutes per run**

### Parallel Jobs

Jobs run in parallel when possible:

- Lint, Tests, E2E all run simultaneously
- Build waits for Lint to complete
- Deploy waits for Build

---

## 🧪 Testing Workflows Locally

### Option 1: Act (Local GitHub Actions)

```bash
# Install act
brew install act

# Run workflow locally
act push --secret-file .secrets
```

### Option 2: Docker Simulation

```bash
# Test in Docker container
docker build -t ci-test .
docker run ci-test pnpm validate
```

---

## 📚 Workflow Reference

### Available Environment Variables

```yaml
# GitHub-provided
${{ github.ref }}           # Branch/tag name
${{ github.sha }}           # Commit SHA
${{ github.actor }}         # User who triggered
${{ github.event_name }}    # Event type

# Custom
${{ env.NODE_VERSION }}     # Defined in env
${{ secrets.DATABASE_URL }}  # From secrets
```

### Common Actions

```yaml
# Checkout code
uses: actions/checkout@v4

# Setup Node.js
uses: actions/setup-node@v4

# Cache dependencies
uses: actions/cache@v4

# Upload artifacts
uses: actions/upload-artifact@v4

# Create PR comment
uses: actions/github-script@v7
```

---

## 🆘 Getting Help

### Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides)

### Troubleshooting

1. **Check logs** - Actions tab shows detailed output
2. **Run locally** - `pnpm validate` to test locally
3. **Check secrets** - Verify all required secrets are set
4. **Review changes** - Ensure .github/workflows/ changes are correct

---

## ✨ Best Practices Summary

1. **Keep workflows simple** - One responsibility per job
2. **Use caching** - Speeds up runs significantly
3. **Parallel execution** - Run independent jobs together
4. **Clear logs** - Helpful for debugging
5. **Secure secrets** - Never log or commit them
6. **Monitor regularly** - Review Action runs weekly
7. **Document changes** - Update this guide when workflows change

---

**Last Updated**: 2025-12-13  
**Workflow Version**: 1.0  
**Maintained by**: ComicWise DevOps Team

---

## 📝 Quick Reference Card

```bash
# View workflow status
gh workflow list --repo owner/comicwise

# Trigger workflow manually
gh workflow run deploy.yml -f environment=production --repo owner/comicwise

# View recent runs
gh run list --repo owner/comicwise --limit 10

# Download artifacts
gh run download <run-id> --repo owner/comicwise

# View logs
gh run view <run-id> --log --repo owner/comicwise
```
