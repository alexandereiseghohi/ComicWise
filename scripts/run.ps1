<#
.SYNOPSIS
    Run the production server
    
.DESCRIPTION
    Starts the production Next.js server (requires prior build)
    
.PARAMETER Preview
    Run in preview mode instead of production
    
.PARAMETER Port
    Port number for the server (default: 3000)
    
.EXAMPLE
    .\run.ps1
    
.EXAMPLE
    .\run.ps1 -Preview
#>

param(
    [switch]$Preview,
    [int]$Port = 3000
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

    $env:PORT = $Port
    
    if ($Preview) {
        Write-Info "Starting preview server on port $Port..."
        & $pm preview
    }
    else {
        Write-Info "Starting production server on port $Port..."
        & $pm start:prod
    }
}
catch {
    Write-Error-Custom "Failed to start server: $_"
    exit 1
}
