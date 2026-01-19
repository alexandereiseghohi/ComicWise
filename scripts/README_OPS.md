# Developer Ops Scripts

Two helper scripts are provided to centralize common workspace tasks:
`scripts/ops.ps1` (PowerShell) and `scripts/ops.sh` (bash).

Available tasks:

- setup: install dependencies (`pnpm install`)
- cleanup: remove `node_modules`, `.next`, `dist`, etc.
- backup: create a repo archive (excludes `node_modules`, `.git`, `.next`)
- restore: extract a backup archive
- deploy: run `compose/deploy.*` if present, otherwise build or use
  `docker-compose`
- test: run `pnpm test`
- build: run `pnpm build`
- dev / run: run `pnpm dev`
- lint: run `pnpm lint`
- format: run code formatter (Prettier)
- type-check: run `pnpm type-check`
- fix-imports: attempt to run `scripts/update-imports-to-aliases.ts` or fallback
  to `eslint --fix`
- refactor: run `eslint --fix` and format; (codemods recommended for larger
  refactors)

Usage examples (PowerShell):

```powershell
# Install deps
.\scripts\ops.ps1 -Task setup

# Create a backup
.\scripts\ops.ps1 -Task backup -Name my-backup.zip

# Run type-check
.\scripts\ops.ps1 -Task 'type-check'
```

Usage examples (bash):

```bash
# Install deps
./scripts/ops.sh setup

# Create a backup
./scripts/ops.sh backup my-backup.tar.gz

# Run lint + fix
./scripts/ops.sh refactor
```

Notes & recommendations:

- The `refactor` task is intentionally conservative: it runs `eslint --fix` and
  formats the project. For structural refactors (extracting large components,
  converting class components, etc.) use codemods with `jscodeshift` or write
  `ts-morph` scripts under `scripts/codemods` and call them from these ops
  scripts.
- The `fix-imports` task will try to invoke
  `scripts/update-imports-to-aliases.ts` if present; ensure `ts-node` is
  available in devDependencies or run it manually.
- Backups created by these scripts exclude large directories; consider extending
  exclusions for CI artifacts or caches.
