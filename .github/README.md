---
title: ComicWise - GitHub Directory Index
version: 1.0.0
updated: 2026-01-22
---

# 📚 ComicWise - GitHub Directory Index

> **Complete guide to all GitHub resources, workflows, and prompts**

---

## 📂 Directory Structure

```
.github/
├── workflows/                 # GitHub Actions CI/CD workflows
│   ├── ci.yml                # Continuous Integration pipeline
│   ├── cd.yml                # Continuous Deployment pipeline
│   ├── migrations.yml        # Database migration automation
│   └── [other workflows]
├── prompts/                   # GitHub Copilot AI Assistant prompts
│   ├── README.md             # Prompts documentation
│   ├── mainsetup.prompt.md   # Setup and configuration tasks
│   ├── maintasks.prompt.md   # Feature implementation tasks
│   └── [other prompts]
├── FUNDING.yml               # GitHub Sponsors configuration
├── ISSUE_TEMPLATE/           # Issue templates
├── PULL_REQUEST_TEMPLATE.md  # PR template
└── dependabot.yml            # Dependabot configuration
```

---

## 🔧 Workflows

### CI/CD Pipelines

**Location:** `.github/workflows/`

These GitHub Actions workflows automate testing, building, and deployment.

#### 1. **ci.yml** - Continuous Integration

**Trigger:** Push to any branch or pull request

**Jobs:**
1. **Install & Cache**
   - Install dependencies
   - Cache node_modules and build artifacts

2. **Lint**
   - Run ESLint
   - Check code formatting with Prettier
   - Fail on errors

3. **Type Check**
   - Run TypeScript compiler
   - Verify no type errors
   - Strict mode enabled

4. **Test**
   - Run Vitest unit tests
   - Run Playwright E2E tests
   - Generate coverage reports
   - Fail if coverage < 80%

5. **Build**
   - Build Next.js application
   - Verify build succeeds
   - Check bundle size
   - Upload build artifacts

**Status Badge:** Add to README:
```markdown
[![CI](https://github.com/[user]/comicwise/actions/workflows/ci.yml/badge.svg)](https://github.com/[user]/comicwise/actions/workflows/ci.yml)
```

---

#### 2. **cd.yml** - Continuous Deployment

**Trigger:** Push to `main` branch (only after CI passes)

**Jobs:**
1. **Run CI** - Duplicate CI checks
2. **Build Docker Image** - Create optimized Docker image
3. **Deploy to Staging** - Deploy to staging environment
4. **Run Smoke Tests** - Verify staging deployment
5. **Deploy to Production** - Manual approval required
6. **Notify** - Send deployment notification

**Requires:**
- Docker registry credentials
- Staging/production server access
- Deployment secrets

---

#### 3. **migrations.yml** - Database Migrations

**Trigger:** Manual trigger or on schema file changes

**Jobs:**
1. **Validate Migrations** - Check migration files
2. **Test on Staging DB** - Test migrations safely
3. **Apply to Production** - With backup and rollback

---

## 🤖 GitHub Copilot Prompts

### Available Prompts

**Location:** `.github/prompts/`

#### 1. **mainsetup.prompt.md**

Comprehensive setup guide covering:
- VS Code configuration
- Project configuration files
- Environment variables
- Database seeding system
- Initial validation

**Use:** First-time setup or re-configuration

**Time:** 4-6 hours

**Output:**
- ✅ Configured VS Code
- ✅ Optimized config files
- ✅ Working seeding system
- ✅ All validations passing

---

#### 2. **maintasks.prompt.md**

Comprehensive implementation guide covering:
- All user-facing pages
- All server actions
- Testing suite
- Documentation
- CI/CD pipelines
- Final optimization

**Use:** Feature implementation and deployment

**Time:** 2-3 weeks

**Output:**
- ✅ All pages implemented
- ✅ 80%+ test coverage
- ✅ Complete documentation
- ✅ Production-ready code

---

### How to Use Prompts

#### In GitHub Copilot CLI:

```bash
# Start Copilot
copilot-cli

# Reference the prompt file
# Option 1: Direct paste
@.github/prompts/mainsetup.prompt.md

# Option 2: File reference in message
"Follow the tasks in @.github/prompts/mainsetup.prompt.md to setup VS Code"
```

#### In VS Code Copilot Chat:

1. Open `.github/prompts/mainsetup.prompt.md`
2. Open Copilot Chat (`Ctrl+Shift+I` on Windows)
3. Reference: `#file:.github/prompts/mainsetup.prompt.md`
4. Ask for specific task

#### In GitHub Web:

1. Navigate to `.github/prompts/` directory
2. Select prompt file
3. Copy raw content
4. Use in Copilot Chat

---

## 📋 Issue Templates

**Location:** `.github/ISSUE_TEMPLATE/`

### Standard Issue Types

1. **Bug Report** - Report bugs and issues
2. **Feature Request** - Suggest new features
3. **Documentation** - Documentation improvements
4. **Performance** - Performance related issues

### Creating Issues

Click "New Issue" on GitHub and select appropriate template.

---

## 🔐 Issue Labels

Standard labels for organization:

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation needs
- `good first issue` - Good for beginners
- `help wanted` - Extra attention needed
- `wontfix` - This will not be worked on
- `critical` - Urgent/high-priority
- `performance` - Performance related

---

## 🚀 Pull Request Template

**File:** `.github/PULL_REQUEST_TEMPLATE.md`

### PR Guidelines:

1. **Title:** Clear description of changes
2. **Description:** What and why of changes
3. **Type:** Bug fix, feature, docs, etc.
4. **Related Issue:** Link to related issue
5. **Checklist:** Verify before submitting

### PR Checks Required:

- ✅ CI pipeline passes
- ✅ Code review approved
- ✅ No merge conflicts
- ✅ All tests passing

---

## 🤖 Dependabot Configuration

**File:** `.github/dependabot.yml`

Automatically:
- Checks for dependency updates
- Creates pull requests for updates
- Groups updates by package type

### Configuration Includes:

- **npm:** JavaScript/TypeScript dependencies
- **docker:** Docker base images
- **github-actions:** GitHub Actions workflows

### Review Updates:

1. Dependabot creates PR
2. CI pipeline validates
3. Review changes
4. Merge if tests pass

---

## 💰 GitHub Sponsors

**File:** `.github/FUNDING.yml`

Shows sponsorship options to contributors.

---

## 🔑 Secrets & Variables

### Required Secrets (Set in GitHub Settings):

```
SENTRY_DSN              # Error tracking
DATABASE_URL            # Production database
NEXTAUTH_SECRET         # Auth secret
VERCEL_TOKEN            # Vercel deployment
DOCKER_USERNAME         # Docker registry
DOCKER_PASSWORD         # Docker registry
```

### Required Variables:

```
NODE_VERSION            # Node.js version (18.x)
NEXT_PUBLIC_SITE_URL   # Production URL
```

### Setting Secrets:

1. Go to repository Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Add secret name and value
5. Click "Add secret"

---

## 📊 Workflow Status

View workflow status:

1. Go to Actions tab
2. Select workflow
3. See recent runs
4. Click run for details

### Common Issues:

- **Build Failure** - Check logs, fix errors locally
- **Test Failure** - Add/fix tests locally
- **Deployment Failure** - Check credentials and deployment logs

---

## 🔄 Repository Hooks

### Pre-commit Hooks

Using Husky (.husky directory):

- `lint-staged` - Lint and format staged files
- `commitlint` - Validate commit messages

### Commit Message Format:

```
type(scope): subject

feat(auth): add login functionality
fix(comics): resolve pagination issue
docs(readme): update setup instructions
```

### Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (no logic change)
- `refactor` - Code refactoring
- `test` - Testing
- `chore` - Build/tooling

---

## 📝 Documentation Files

Documentation should be in repository root or `docs/` directory:

- **README.md** - Project overview
- **CHANGELOG.md** - Version history
- **CONTRIBUTING.md** - Contribution guidelines
- **CODE_OF_CONDUCT.md** - Community standards
- **LICENSE** - Project license
- **docs/setup.md** - Detailed setup
- **docs/architecture.md** - System architecture
- **docs/api-reference.md** - API documentation

---

## 🔗 Quick Links

### GitHub Features:
- **Actions:** Automated workflows
- **Projects:** Project management boards
- **Discussions:** Community discussions
- **Wiki:** Project documentation
- **Releases:** Version releases
- **Issues:** Bug reports and features
- **Pull Requests:** Code reviews

### External Services:
- **Sentry:** Error tracking
- **Vercel:** Deployment platform
- **Docker Hub:** Container registry
- **Dependabot:** Dependency updates

---

## 🎯 Best Practices

### Committing:
1. Make small, focused commits
2. Write clear commit messages
3. Reference related issues
4. Test before committing

### Creating Issues:
1. Search for existing issues first
2. Use appropriate template
3. Provide detailed description
4. Include steps to reproduce (for bugs)
5. Add relevant labels

### Creating PRs:
1. Create branch from latest `main`
2. Make focused changes
3. Write clear PR description
4. Reference related issues
5. Wait for CI to pass
6. Request review from maintainers
7. Address review feedback

### Code Review:
1. Review code for:
   - Correctness
   - Style consistency
   - Performance
   - Security
   - Test coverage
2. Request changes if needed
3. Approve when satisfied
4. Comment constructively

---

## 🚀 Deployment Process

### Automatic Deployment Flow:

```
1. Push code to main branch
   ↓
2. CI pipeline runs (lint, type, test, build)
   ↓
3. If CI passes, CD pipeline starts
   ↓
4. Build Docker image
   ↓
5. Deploy to staging
   ↓
6. Run smoke tests
   ↓
7. Wait for manual approval
   ↓
8. Deploy to production
   ↓
9. Send notifications
```

### Manual Deployment:

```bash
# Vercel
pnpm deploy:vercel

# Docker
pnpm docker:build
pnpm docker:push
pnpm docker:deploy

# Custom server
pnpm build
scp -r .next/ user@server:/app/
ssh user@server 'cd /app && pnpm start'
```

---

## 📞 Support & Contact

### Getting Help:

1. **Check Documentation:** Review README and docs/
2. **Search Issues:** Look for similar issues
3. **Check Discussions:** Community discussions tab
4. **Create Issue:** If problem not found
5. **GitHub Copilot:** Ask Copilot for code help

### Reporting Issues:

Use the Bug Report template:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs if applicable

---

## 🔐 Security

### Security Best Practices:

1. **Secrets Management**
   - Never commit secrets
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly

2. **Dependency Management**
   - Keep dependencies updated
   - Review Dependabot PRs
   - Run security audits

3. **Code Review**
   - Review all PRs
   - Check for security issues
   - Verify input validation

4. **Monitoring**
   - Monitor Sentry for errors
   - Check performance metrics
   - Review deployment logs

---

## 📊 Project Metrics

### Workflow Statistics:

- **Build Time:** ~5-10 minutes
- **Test Suite:** ~2-3 minutes
- **Deployment:** ~5-10 minutes (staging), ~10-15 minutes (production)
- **Success Rate:** Target 95%+

### Code Quality:

- **Test Coverage:** Target 80%+
- **Lighthouse Score:** Target 90+
- **Bundle Size:** Target < 500KB (gzipped)
- **Type Safety:** 100% (no `any` types)

---

## 🎓 Learning Resources

### GitHub Features:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Copilot Guide](https://github.com/features/copilot)
- [GitHub Best Practices](https://guides.github.com/)

### Project-Specific:
- `.github/prompts/README.md` - Copilot prompts guide
- `mainsetup.prompt.md` - Setup detailed guide
- `maintasks.prompt.md` - Implementation detailed guide

---

## 📝 Notes

### For Team Members:

- **Workflow updates:** Keep .github/workflows/ updated
- **Prompt updates:** Update prompts as project evolves
- **Documentation:** Update docs as features change
- **Secrets:** Coordinate secret management carefully
- **CI/CD:** Monitor workflow status regularly

### Common Tasks:

```bash
# View workflow runs
gh run list

# View specific run
gh run view [run-id]

# View workflow logs
gh run view [run-id] --log

# Trigger workflow manually
gh workflow run [workflow-name]

# Create release
gh release create [tag] --generate-notes
```

---

## ✅ Checklist for New Contributors

- [ ] Read README.md
- [ ] Read CONTRIBUTING.md
- [ ] Set up local environment per mainsetup.prompt.md
- [ ] Run `pnpm install` and `pnpm dev`
- [ ] Understand architecture
- [ ] Find issue to work on
- [ ] Create feature branch
- [ ] Make changes following guidelines
- [ ] Test locally (pnpm test, pnpm build)
- [ ] Create PR with clear description
- [ ] Address review feedback
- [ ] Celebrate when merged! 🎉

---

## 🎉 Conclusion

This `.github/` directory contains all automation, workflows, and guidance for the ComicWise project. Reference these resources for smooth development, testing, and deployment workflows.

**Happy contributing! 🚀**

---

**Last Updated:** 2026-01-22  
**Version:** 1.0.0  
**Maintainer:** ComicWise Team

