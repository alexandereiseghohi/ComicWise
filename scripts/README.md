# Project Scripts

This folder contains cross-platform PowerShell and POSIX shell scripts to help
with common project tasks.

Usage (PowerShell):

```pwsh
# Run setup
pwsh scripts/setup.ps1

# Run dev
pwsh scripts/dev.ps1

# Deploy to Vercel
pwsh scripts/deploy/vercel.ps1
```

Usage (Bash / WSL / macOS / Linux):

```bash
# Make scripts executable once
chmod +x scripts/*.sh scripts/deploy/*.sh

# Run setup
./scripts/setup.sh

# Run dev
./scripts/dev.sh

# Deploy to Vercel
./scripts/deploy/vercel.sh
```

Notes:

- Scripts prefer `pnpm` when present and fall back to `npm`.
- Scripts are idempotent where possible.
- Review `scripts/install-deps.*` to adjust package manager installation
  commands for your environment.

See specific scripts for flags and examples.
