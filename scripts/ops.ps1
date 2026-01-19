<#
Optimized developer ops script for Windows PowerShell (pwsh)

Usage:
  .\scripts\ops.ps1 -Task setup
  .\scripts\ops.ps1 -Task build
  .\scripts\ops.ps1 -Task backup -Name comicwise-backup.zip

This file centralizes common workspace tasks (setup, cleanup, backup, restore,
deploy, test, build, dev, lint, format, type-check, fix-imports, refactor).
#>

param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("setup", "cleanup", "backup", "restore", "deploy", "test", "build", "dev", "run", "lint", "format", "type-check", "fix-imports", "refactor")]
  [string]$Task,
  [string]$Name = "comicwise-backup.zip",
  [string]$Source = ".",
  [string]$Target = "."
)

function Exec([string]$cmd) {
  Write-Host "-> $cmd" -ForegroundColor Cyan
  Invoke-Expression $cmd
}

switch ($Task) {
  'setup' {
    Write-Host "Installing dependencies (pnpm)..." -ForegroundColor Green
    Exec "pnpm install"
    Write-Host "Setup complete." -ForegroundColor Green
  }

  'cleanup' {
    Write-Host "Cleaning workspace: removing node_modules, .next, dist..." -ForegroundColor Yellow
    Get-ChildItem -Path . -Filter node_modules -Recurse -Directory -ErrorAction SilentlyContinue | ForEach-Object { Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }
    if (Test-Path .next) { Remove-Item -Recurse -Force .next }
    if (Test-Path dist) { Remove-Item -Recurse -Force dist }
    Write-Host "Cleanup finished." -ForegroundColor Green
  }

  'backup' {
    Write-Host "Creating repository backup: $Name" -ForegroundColor Green
    $exclusions = @('node_modules', 'pnpm-store', 'dist', '.next', '.git')
    $zipPath = Join-Path -Path $PWD -ChildPath $Name
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Compress-Archive -Path (Get-ChildItem -Path $Source -Recurse | Where-Object { foreach ($ex in $exclusions) { if ($_.FullName -like "*\$ex*") { return $false } }; return $true } | Select-Object -ExpandProperty FullName) -DestinationPath $zipPath
    Write-Host "Backup created: $zipPath" -ForegroundColor Green
  }

  'restore' {
    Write-Host "Restoring backup $Name to $Target" -ForegroundColor Green
    if (-Not (Test-Path $Name)) { Write-Error "Backup $Name not found"; break }
    Expand-Archive -LiteralPath $Name -DestinationPath $Target -Force
    Write-Host "Restore complete." -ForegroundColor Green
  }

  'deploy' {
    Write-Host "Deploying application..." -ForegroundColor Green
    if (Test-Path compose\deploy.ps1) {
      Exec "pwsh -File compose\deploy.ps1"
    }
    elseif (Get-Command docker-compose -ErrorAction SilentlyContinue) {
      Exec "docker-compose up -d --build"
    }
    else {
      Exec "pnpm build"
      Write-Host "No deploy helper found. Build completed locally." -ForegroundColor Yellow
    }
  }

  'test' {
    Write-Host "Running tests (pnpm test)..." -ForegroundColor Green
    Exec "pnpm test"
  }

  'build' {
    Write-Host "Building production bundle (pnpm build)..." -ForegroundColor Green
    Exec "pnpm build"
  }

  'dev' {
    Write-Host "Starting dev server (pnpm dev)..." -ForegroundColor Green
    Exec "pnpm dev"
  }
  'run' {
    Write-Host "Starting dev server (pnpm dev)..." -ForegroundColor Green
    Exec "pnpm dev"
  }

  'lint' {
    Write-Host "Running linter (pnpm lint)..." -ForegroundColor Green
    Exec "pnpm lint"
  }

  'format' {
    Write-Host "Formatting code with Prettier (if available)..." -ForegroundColor Green
    if (Get-Command pnpm -ErrorAction SilentlyContinue) { Exec "pnpm format" } else { Exec "npx prettier --write ." }
  }

  'type-check' {
    Write-Host "Running TypeScript type-check (pnpm type-check)..." -ForegroundColor Green
    Exec "pnpm type-check"
  }

  'fix-imports' {
    Write-Host "Attempting to run update-imports-to-aliases script (if present)..." -ForegroundColor Green
    if (Test-Path scripts\update-imports-to-aliases.ts) {
      if (Get-Command pnpm -ErrorAction SilentlyContinue) { Exec "pnpm ts-node scripts/update-imports-to-aliases.ts" } else { Write-Host "ts-node not available; run 'pnpm install -D ts-node' or run script manually with ts-node." -ForegroundColor Yellow }
    }
    else {
      Write-Host "No update-imports script found. Falling back to ESLint --fix for import fixes." -ForegroundColor Yellow
      Exec "pnpm lint -- --fix"
    }
  }

  'refactor' {
    Write-Host "Automated refactor helpers: running ESLint --fix and Prettier. For complex refactors, use jscodeshift or ts-morph." -ForegroundColor Green
    Exec "pnpm lint -- --fix"
    Exec "pnpm format"
    Write-Host "If you want project-wide codemods, install jscodeshift and add transforms into scripts/codemods." -ForegroundColor Yellow
  }

  default {
    Write-Host "Unknown task: $Task" -ForegroundColor Red
  }
}
