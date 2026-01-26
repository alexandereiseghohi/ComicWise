# Ticket 010 — LOW: Developer ergonomics & repo housekeeping

## Description

Verify and improve `.vscode` tasks/launch, ensure Husky/pre-commit hooks run,
and add small helper scripts for dev ergonomics.

## Files to edit / create

- Edit: `.vscode/tasks.json`, `.vscode/launch.json` to ensure tasks for `dev`,
  `type-check`, `test:unit`, `test`
- Edit: `package.json` scripts (add helpers if missing)
- Verify Husky in `package.json` (prepare) and `.husky/` hooks

## Acceptance criteria

- VS Code tasks and launch configs allow running & debugging dev server and
  tests.
- `pnpm prepare` sets up Husky hooks (if Husky is used).

## Commands

```bash
pnpm install
pnpm prepare
```

## Estimate

2–4 hours
