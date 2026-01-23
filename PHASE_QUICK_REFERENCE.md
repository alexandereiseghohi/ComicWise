# Quick Reference: Phase Automation Commands

## Essential Commands

```bash
# View current status
pnpm phases:status

# Run all phases
pnpm phases:run

# Run specific phase (1-9)
pnpm phase1  # shorthand
pnpm phases:run:1  # full command

# Skip already-completed phases
pnpm phases:run --skip-completed

# Preview without changes
pnpm phases:run --dry-run

# Generate comprehensive report
pnpm phases:report

# Reset progress
pnpm phases:reset
```

## Phase Shortcuts

```bash
pnpm phase1   # VS Code Configuration
pnpm phase2   # Environment & Configuration
pnpm phase3   # Database & Seeding
pnpm phase4   # Frontend Implementation
pnpm phase5   # Scripts & Automation
pnpm phase6   # CI/CD & DevOps
pnpm phase7   # Documentation & Quality
pnpm phase8   # Testing & QA
pnpm phase9   # Optional Enhancements
```

## Common Workflows

### Fresh Setup

```bash
pnpm phases:reset
pnpm phases:run
```

### Development Progress

```bash
# Check status
pnpm phases:status

# Run after changes
pnpm phases:run --skip-completed

# Resume from failure
pnpm phases:run:4  # Run phase 4
pnpm phases:run --start-phase=5  # Continue from 5
```

### Before Deployment

```bash
# Full validation
pnpm phases:run --force

# Or just check
pnpm phases:run --dry-run
```

## Troubleshooting

### Phase Dependency Error

```bash
# Run dependency first
pnpm phases:run:1

# Or force ignore dependencies
pnpm phases:run:2 --force
```

### Slow Execution

```bash
# Skip already done phases
pnpm phases:run --skip-completed

# Run specific phase only
pnpm phase4
```

### Check Logs

```bash
# Look at progress file
cat .phases-progress.json

# View detailed status
pnpm phases:report
```

## All Available Commands

| Command               | Purpose                      |
| --------------------- | ---------------------------- |
| `pnpm phases:run`     | Run all phases               |
| `pnpm phases:run:1-9` | Run specific phase           |
| `pnpm phase1-9`       | Shorthand for specific phase |
| `pnpm phases:status`  | Show status table            |
| `pnpm phases:verify`  | Verify completion            |
| `pnpm phases:report`  | Generate full report         |
| `pnpm phases:reset`   | Reset all progress           |

## Options

Add these flags to any `pnpm phases:run` command:

```bash
--dry-run              # Preview without changes
--skip-completed       # Skip already done phases
--force                # Force re-run, ignore dependencies
--verbose              # Show detailed logs
--start-phase=N        # Start from specific phase
--end-phase=N          # End at specific phase
```

## Typical Timings

- Phase 1: 2 min
- Phase 2: 5 min
- Phase 3: 15 min
- Phase 4: 10 min
- Phase 5: 10 min
- Phase 6: 10 min
- Phase 7: 10 min
- Phase 8: 20 min
- Phase 9: Variable
- **Total: ~90 min for fresh setup**

## What Each Phase Does

| Phase | Focus       | Key Actions                   |
| ----- | ----------- | ----------------------------- |
| 1     | VS Code     | Verify config files           |
| 2     | Environment | Validate .env and TypeScript  |
| 3     | Database    | Seed data, push schema        |
| 4     | Frontend    | Validate pages and components |
| 5     | Scripts     | Lint, format, optimize        |
| 6     | CI/CD       | Validate workflows, Docker    |
| 7     | Docs        | Verify documentation quality  |
| 8     | Testing     | Run tests, coverage           |
| 9     | Optional    | Custom enhancements           |

## Success Indicators

Phase runs successfully when:

- ✅ Status shows "completed"
- ✅ Score shows 100%
- ✅ All tasks show green checkmarks
- ✅ No errors in output

Example:

```
Phase 1  VS Code Configuration        ✅      100%   0.10s     3/3
```

## For More Information

- Full guide: `docs/PHASE_AUTOMATION.md`
- Technical details: `PHASE_AUTOMATION_SUMMARY.md`
- Source code: `scripts/phases/`

---

**Quick Reference Version:** 1.0.0 **Last Updated:** 2026-01-22
