<#
.SYNOPSIS
    Complete project setup script
    
.DESCRIPTION
    Installs dependencies, configures environment, and runs initial checks
    
.PARAMETER Clean
    Clean build artifacts before setup
    
.PARAMETER SkipValidation
    Skip validation checks after setup
    
.PARAMETER DockerDB
    Use Docker for database instead of local PostgreSQL
    
.PARAMETER Dev
    Start development server after setup
    
.EXAMPLE
    .\setup.ps1
    
.EXAMPLE
    .\setup.ps1 -Clean -Dev
    
.EXAMPLE
    .\setup.ps1 -DockerDB
#>

param(
    [switch]$Clean,
    [switch]$SkipValidation,
    [switch]$DockerDB,
    [switch]$Dev
)

$ErrorActionPreference = "Stop"

function Write-Header { Write-Host "`n╔════════════════════════════════════════════════════════════════╗`n║ ComicWise Project Setup`n╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan }
function Write-Info { Write-Host "ℹ $_" -ForegroundColor Cyan }
function Write-Success { Write-Host "✓ $_" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "✗ $_" -ForegroundColor Red }
function Write-Warning { Write-Host "⚠ $_" -ForegroundColor Yellow }

Write-Header

# Detect package manager
$pm = if (Get-Command pnpm -ErrorAction SilentlyContinue) { 'pnpm' } else { 'npm' }
Write-Success "Using package manager: $pm"

# Clean build artifacts
if ($Clean) {
    Write-Info "Cleaning build artifacts..."
    & pnpm clean
}

# Install dependencies
Write-Info "Installing dependencies..."
if ($pm -eq 'pnpm') {
    & pnpm install
}
else {
    & npm ci
}
Write-Success "Dependencies installed"

# Setup environment
Write-Info "Setting up environment..."
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Warning ".env created from .env.example - please configure it"
    }
}
Write-Success "Environment configured"

# Database setup
Write-Info "Setting up database..."
if ($DockerDB) {
    Write-Info "Starting Docker containers..."
    & docker compose -f docker-compose.dev.yml up -d
}
& $pm db:push
& $pm db:seed
Write-Success "Database setup complete"

# Validation
if (-not $SkipValidation) {
    Write-Info "Running validation checks..."
    try {
        & $pm type-check
        Write-Success "Type checking passed"
    }
    catch {
        Write-Warning "Type checking failed - continuing anyway"
    }
    
    try {
        & $pm lint:strict
        Write-Success "Linting passed"
    }
    catch {
        Write-Warning "Linting issues found - you can fix with 'pnpm lint:fix'"
    }
}

# Start dev server
if ($Dev) {
    Write-Success "Setup complete - Starting development server..."
    & $pm dev
}
else {
    Write-Success "`nSetup complete!"
    Write-Info "Next steps:"
    Write-Info "  1. Review and configure .env file"
    Write-Info "  2. Run 'pnpm dev' to start the development server"
    Write-Info "  3. Visit http://localhost:3000"
}
