<#
.SYNOPSIS
  Install dependencies using pnpm or npm. Run in PowerShell (pwsh).
#>

param(
  [switch]$Force
)

function Detect-PkgManager {
  if (Get-Command pnpm -ErrorAction SilentlyContinue) { return 'pnpm' }
  if (Get-Command npm -ErrorAction SilentlyContinue) { return 'npm' }
  return $null
}

$pkg = Detect-PkgManager
if (-not $pkg) {
  Write-Error "No pnpm or npm found. Please install Node.js and pnpm or npm."
  exit 1
}
Write-Output "Using package manager: $pkg"

if ($pkg -eq 'pnpm') { pnpm install } else { npm ci }

Write-Output "Attempting to ensure common dev tools are present (prettier, eslint)."
try {
  if ($pkg -eq 'pnpm') { pnpm add -D prettier eslint | Out-Null } else { npm install --no-audit --no-fund --save-dev prettier eslint | Out-Null }
}
catch {
  Write-Warning "Could not add dev deps automatically. You can add them manually if required."
}

Write-Output "Done. Run './scripts/setup.sh' or 'pwsh ./scripts/setup.ps1' next."
