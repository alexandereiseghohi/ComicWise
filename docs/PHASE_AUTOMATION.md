# ComicWise Phase Automation System

The Phase Automation System is a comprehensive 9-phase orchestration framework
that guides the ComicWise project from setup through production optimization.
Each phase builds on the previous one, ensuring systematic completion of all
project requirements.

## Quick Start

### View Current Status

```bash
pnpm phases:status
```

### Run All Phases

```bash
# Preview changes without applying
pnpm phases:run --dry-run

# Run with skip-completed (ignore already-done phases)
pnpm phases:run --skip-completed

# Run all phases from scratch
pnpm phases:run --force
```

### Run Specific Phase

```bash
pnpm phases:run:1      # Run Phase 1
pnpm phase1            # Shorthand
pnpm phases:run:2      # Run Phase 2
pnpm phase2            # Shorthand
# ... and so on through phase9
```

### Get Reports

```bash
pnpm phases:status     # Show current status of all phases
pnpm phases:report     # Generate comprehensive report
pnpm phases:verify     # Verify phase completion
```

### Reset Progress

```bash
pnpm phases:reset              # Reset all phases
pnpm phases:reset --phase=1    # Reset specific phase only
```

## The 9 Phases

### Phase 1: VS Code Configuration ✅

**Duration:** ~2 min **Dependencies:** None

Validates and configures VS Code environment:

- ✅ Verify .vscode configuration files (extensions.json, settings.json,
  launch.json, tasks.json)
- ✅ Validate MCP server configuration
- ✅ Verify recommended extensions are configured

**Status:** Can be run immediately

**Completion Check:**

```bash
pnpm phases:run:1
```

---

### Phase 2: Environment & Configuration ⏳

**Duration:** ~5 min **Dependencies:** Phase 1

Validates environment variables and configuration files:

- Verify .env.local exists and is configured
- Validate all config files (tsconfig.json, next.config.ts, drizzle.config.ts,
  etc.)
- Run TypeScript type checking
- Validate environment variables are set

**What Gets Checked:**

- `.env.local` file presence
- TypeScript compilation (no errors)
- All configuration files are valid JSON/TS
- Environment variable validation

**Common Issues:**

- `.env.local` missing → Copy from `.env.example`
- TypeScript errors → Fix type errors first
- Config file errors → Validate JSON syntax

**Completion Check:**

```bash
pnpm phases:run:2
```

---

### Phase 3: Database & Seeding ⏳

**Duration:** ~15 min **Dependencies:** Phase 1, 2

Sets up database and seeds initial data:

- Health check database connection
- Push Drizzle schema to database
- Dry-run seed validation
- Execute database seeding
- Verify seeded data

**What Gets Done:**

- Applies schema changes from Drizzle ORM
- Validates seed runner
- Seeds users, comics, and chapters
- Downloads and caches comic images

**Prerequisites:**

- Database running (PostgreSQL)
- Redis running (for caching)
- .env.local with DB credentials

**Completion Check:**

```bash
pnpm phases:run:3
```

---

### Phase 4: Frontend Implementation ⏳

**Duration:** ~10 min **Dependencies:** Phase 1, 2, 3

Validates core frontend components and features:

- Verify layout components exist
- Validate comic listing pages
- Verify chapter reader implementation
- Check user profile pages
- Run linting

**What Gets Checked:**

- App structure and layouts
- Page routes and components
- ESLint validation

**Common Issues:**

- Missing pages → Create using `pnpm scaffold:component`
- Linting errors → Run `pnpm lint:fix`

**Completion Check:**

```bash
pnpm phases:run:4
```

---

### Phase 5: Scripts & Automation ⏳

**Duration:** ~10 min **Dependencies:** Phase 1, 2, 3, 4

Validates and optimizes project automation scripts:

- Validate all required scripts exist
- Run linter checks
- Optimize imports
- Format code
- Clean up project

**What Gets Done:**

- ESLint validation
- Code formatting with Prettier
- Project cleanup (temp files, cache)
- Import optimization

**Completion Check:**

```bash
pnpm phases:run:5
```

---

### Phase 6: CI/CD & DevOps ⏳

**Duration:** ~10 min **Dependencies:** Phase 1, 2, 3, 4, 5

Validates CI/CD pipelines and deployment infrastructure:

- Validate GitHub Actions workflows
- Verify Docker configuration
- Test Docker build
- Validate environment templates

**What Gets Checked:**

- `.github/workflows` directory
- Docker files and compose configs
- Environment templates (.env.example, staging, production)

**Completion Check:**

```bash
pnpm phases:run:6
```

---

### Phase 7: Documentation & Quality ⏳

**Duration:** ~10 min **Dependencies:** Phase 1, 2, 3, 4, 5, 6

Ensures comprehensive documentation and code quality:

- Verify README.md is comprehensive
- Check docs directory is populated
- Run linter
- Fix code formatting
- TypeScript type checking

**What Gets Checked:**

- Documentation completeness
- Code quality standards
- No linting errors
- No TypeScript errors

**Completion Check:**

```bash
pnpm phases:run:7
```

---

### Phase 8: Testing & Quality Assurance ⏳

**Duration:** ~20 min **Dependencies:** Phase 1, 2, 3, 4, 5, 6, 7

Runs comprehensive testing and quality validation:

- Execute unit tests (Vitest)
- Generate test coverage report
- Run E2E tests (Playwright) - optional
- Validate code quality
- Security audit

**What Gets Checked:**

- Unit test pass rate
- Code coverage percentage
- E2E test results (if available)
- Security vulnerabilities

**Coverage Targets:**

- Minimum: 80% overall coverage
- Critical paths: 100% coverage

**Completion Check:**

```bash
pnpm phases:run:8
```

---

### Phase 9: Optional Enhancements 🔧

**Duration:** Variable **Dependencies:** Phase 1, 2, 3, 4, 5, 6, 7, 8

Implements optional features and advanced enhancements:

- i18n internationalization framework
- Advanced analytics integration
- Onboarding flow
- Custom features

**Features Available:**

- Multi-language support
- Enhanced tracking
- User onboarding
- Custom integrations

**Completion Check:**

```bash
pnpm phases:run:9
```

---

## Progress Tracking

The system automatically tracks progress in `.phases-progress.json`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-22T20:30:00Z",
  "phases": {
    "1": {
      "status": "completed",
      "score": 100,
      "tasks": { "check-vscode-config": "completed", ... },
      "startedAt": "2026-01-22T20:25:00Z",
      "completedAt": "2026-01-22T20:27:00Z"
    },
    "2": { "status": "pending", "score": 0, "tasks": {} },
    ...
  }
}
```

## Options & Flags

### Common Options

```bash
# Dry-run mode - preview without making changes
pnpm phases:run --dry-run

# Skip already completed phases
pnpm phases:run --skip-completed

# Force re-run of completed phases
pnpm phases:run --force

# Verbose logging
pnpm phases:run --verbose
```

### Phase Range Options

```bash
# Run phases 1-5
pnpm phases:run --start-phase=1 --end-phase=5

# Run phases 3-7
pnpm phases:run --start-phase=3 --end-phase=7

# Run from phase 3 to end
pnpm phases:run --start-phase=3
```

## Dependency Chain

The phases have dependencies that must be respected:

```
Phase 1 (VS Code)
    ↓
Phase 2 (Environment) → depends on Phase 1
    ↓
Phase 3 (Database) → depends on Phase 1, 2
    ↓
Phase 4 (Frontend) → depends on Phase 1, 2, 3
    ↓
Phase 5 (Scripts) → depends on Phase 1, 2, 3, 4
    ↓
Phase 6 (CI/CD) → depends on Phase 1, 2, 3, 4, 5
    ↓
Phase 7 (Documentation) → depends on Phase 1, 2, 3, 4, 5, 6
    ↓
Phase 8 (Testing) → depends on Phase 1, 2, 3, 4, 5, 6, 7
    ↓
Phase 9 (Optional) → depends on all previous phases
```

## Execution Examples

### Complete Fresh Setup

```bash
# Reset all progress and run from scratch
pnpm phases:reset
pnpm phases:run

# Or with a preview
pnpm phases:run --dry-run
```

### Resume from Failure

```bash
# If phase 4 failed, continue from there
pnpm phases:run --start-phase=4

# Or fix specific phase then continue
pnpm phases:run:4
pnpm phases:run --start-phase=5
```

### Quick Validation

```bash
# Check status without running
pnpm phases:status

# Verify specific phase
pnpm phases:verify --phase=3

# Generate full report
pnpm phases:report --format=json > phase-report.json
```

### Skip Completed

```bash
# Run phases, skip any already completed
pnpm phases:run --skip-completed

# This is useful for CI/CD to avoid redundant work
```

## Troubleshooting

### Phase Dependencies Not Met

**Error:** `Phase X depends on Phase Y, which is pending`

**Solution:**

1. Run the dependency phase first: `pnpm phases:run:Y`
2. Or force ignore dependencies: `pnpm phases:run:X --force`
3. Or reset and start over: `pnpm phases:reset && pnpm phases:run`

### Tasks Failing

**Error:** `Phase X failed - Check logs for details`

**Solution:**

1. Check the error message in console output
2. Address the specific issue (e.g., install dependencies, fix linting)
3. Re-run the phase: `pnpm phases:run:X --force`

### Database Connection Issues

**Error:** `Cannot connect to database`

**Solution:**

1. Ensure PostgreSQL is running
2. Check `.env.local` has correct DATABASE_URL
3. Run `pnpm health:db` to diagnose
4. Check `.env.example` for required variables

### TypeScript Errors

**Error:** `TypeScript compilation errors detected`

**Solution:**

1. Run `pnpm type-check` to see errors
2. Fix TypeScript issues in source files
3. Run phase 2 again: `pnpm phases:run:2 --force`

### Linting Errors

**Error:** `ESLint errors detected`

**Solution:**

1. Run `pnpm lint` to see errors
2. Run `pnpm lint:fix` for automatic fixes
3. Manually fix remaining issues
4. Re-run the phase: `pnpm phases:run:X --force`

## Development with Phases

### During Development

Keep phases updated as you work:

```bash
# After environment changes
pnpm phases:run:2 --force

# After frontend changes
pnpm phases:run:4 --force

# After tests
pnpm phases:run:8 --force

# Check overall progress
pnpm phases:status
```

### Before Committing

```bash
# Run through phase 7 to ensure quality
pnpm phases:run --start-phase=1 --end-phase=7

# Or quick check
pnpm phases:verify
```

### For Production Deployments

```bash
# Run full validation
pnpm phases:run --force

# Or verify without changes
pnpm phases:run --dry-run
```

## Performance Notes

### Typical Timing

| Phase     | Typical Time | Notes                        |
| --------- | ------------ | ---------------------------- |
| Phase 1   | ~2 min       | Quick verification           |
| Phase 2   | ~5 min       | Type checking included       |
| Phase 3   | ~15 min      | Database seeding can be slow |
| Phase 4   | ~10 min      | Component validation         |
| Phase 5   | ~10 min      | Linting and formatting       |
| Phase 6   | ~10 min      | Docker build testing         |
| Phase 7   | ~10 min      | Documentation checks         |
| Phase 8   | ~20 min      | Test execution               |
| Phase 9   | Variable     | Optional enhancements        |
| **Total** | **~90 min**  | First run from scratch       |

### Optimization Tips

1. **Use `--skip-completed`** to avoid re-running phases
2. **Run specific phases** during development instead of all 9
3. **Use `--dry-run`** to preview before committing changes
4. **Cache results** - phases save progress automatically

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Phase Validation
on: [push, pull_request]

jobs:
  phases:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Run Phase Validation
        run: pnpm phases:run --skip-completed

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: phase-report
          path: .phases-progress.json
```

## Advanced Usage

### Monitoring Phase Progress

```bash
# Watch for updates (requires 'watch' CLI tool)
watch -n 5 'pnpm phases:status'
```

### Custom Phase Definitions

To extend the phase system with custom phases:

1. Create new phase file in `scripts/phases/phase-10-custom.ts`
2. Export phase config with tasks and verifications
3. Register in `scripts/phases/phase-runner.ts`
4. Add to package.json scripts

### Programmatic Access

```typescript
import { phaseRunner } from "./scripts/phases/phase-runner-core";
import { phase1Config } from "./scripts/phases/phase-1-vscode";

// Register phase
phaseRunner.registerPhase(phase1Config);

// Run phase
const result = await phaseRunner.runPhase(1);

// Get results
const allResults = phaseRunner.getResults();
```

## File Structure

```
scripts/phases/
├── types.ts                          # Type definitions
├── logger.ts                         # Logging utilities
├── progress-tracker.ts               # Progress persistence
├── phase-runner-core.ts              # Core orchestration engine
├── phase-runner.ts                   # CLI entry point
├── phase-1-vscode.ts                 # Phase 1: VS Code
├── phase-2-environment.ts            # Phase 2: Environment
├── phase-3-database.ts               # Phase 3: Database
├── phase-4-frontend.ts               # Phase 4: Frontend
├── phase-5-scripts.ts                # Phase 5: Scripts
├── phase-6-cicd.ts                   # Phase 6: CI/CD
├── phase-7-documentation.ts          # Phase 7: Documentation
├── phase-8-testing.ts                # Phase 8: Testing
└── phase-9-optional.ts               # Phase 9: Optional

.phases-progress.json                 # Progress tracking (git-ignored)
```

## Next Steps

1. **Run Phase 1:** `pnpm phases:run:1`
2. **Check Status:** `pnpm phases:status`
3. **Run All:** `pnpm phases:run`
4. **Monitor:** `pnpm phases:report`

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review phase error messages
3. Check individual script documentation
4. Refer to phase-specific logs

---

**Last Updated:** 2026-01-22 **Phase System Version:** 1.0.0 **Maintenance:**
The phase system is automatically updated as project structure changes.
