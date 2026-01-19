<#
.SYNOPSIS
    Run TypeScript type checking
    
.DESCRIPTION
    Performs TypeScript type checking without emitting files
    
.PARAMETER Watch
    Watch mode - re-run on file changes
    
.EXAMPLE
    .\type-check.ps1
    
.EXAMPLE
    .\type-check.ps1 -Watch
#>

param(
    [switch]$Watch
)

$ErrorActionPreference = "Stop"

function Write-Info { Write-Host "ℹ $_" -ForegroundColor Cyan }
function Write-Success { Write-Host "✓ $_" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "✗ $_" -ForegroundColor Red }

try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $pm = "pnpm"
    }
    elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $pm = "npm run"
    }
    else {
        throw "pnpm or npm not found"
    }

    Write-Info "Running TypeScript type checks..."
    
    if ($Watch) {
        & $pm type-check:watch
    }
    else {
        & $pm type-check
        Write-Success "Type checking completed successfully"
    }
}
catch {
    Write-Error-Custom "Type checking failed: $_"
    exit 1
}
