<#
.SYNOPSIS
    Build project for production
    
.DESCRIPTION
    Builds the Next.js application with type checking and validation
    
.PARAMETER Debug
    Build with debug information
    
.PARAMETER Analyze
    Analyze bundle size after build
    
.PARAMETER Watch
    Continue watching files after build (development mode)
    
.EXAMPLE
    .\build.ps1
    
.EXAMPLE
    .\build.ps1 -Analyze
#>

param(
    [switch]$Debug,
    [switch]$Analyze,
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

    Write-Info "Starting build process..."
    
    if ($Debug) {
        & $pm build:debug
    }
    elseif ($Analyze) {
        & $pm build:analyze
    }
    else {
        & $pm build
    }
    
    Write-Success "Build completed successfully"
}
catch {
    Write-Error-Custom "Build failed: $_"
    exit 1
}
