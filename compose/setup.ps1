# Docker setup script for Windows (PowerShell)
# Initialize development/production environment
# Usage: .\compose\setup.ps1 -Environment dev

param(
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up $Environment environment..." -ForegroundColor Cyan

$ComposeFile = if ($Environment -eq "dev") { "docker-compose.dev.yml" } else { "docker-compose.yml" }

# Check Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✓ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker for Windows first." -ForegroundColor Red
    exit 1
}

# Check Docker Compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✓ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Copy environment file if needed
if (-not (Test-Path ".env.local")) {
    if ($Environment -eq "dev") {
        Copy-Item ".envs\.env.development" ".env.local"
        Write-Host "✓ Copied .envs\.env.development to .env.local" -ForegroundColor Green
    } else {
        Copy-Item ".envs\.env.production" ".env.local"
        Write-Host "⚠️  Copied .envs\.env.production to .env.local" -ForegroundColor Yellow
        Write-Host "  IMPORTANT: Update .env.local with real production secrets!" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

# Start services
Write-Host ""
Write-Host "📦 Starting Docker containers ($Environment)..." -ForegroundColor Cyan
docker-compose -f $ComposeFile up -d

# Wait for services
Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Show status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose -f $ComposeFile ps

# Show access information
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green

if ($Environment -eq "dev") {
    Write-Host "✓ Development environment ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access points:"
    Write-Host "  • App:       http://localhost:3000"
    Write-Host "  • PgAdmin:   http://localhost:5051"
    Write-Host "  • Database:  localhost:5433"
    Write-Host "  • Redis:     localhost:6380"
    Write-Host ""
    Write-Host "PgAdmin credentials:"
    Write-Host "  • Email:     admin@example.com"
    Write-Host "  • Password:  admin"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Run migrations: docker-compose -f docker-compose.dev.yml exec app pnpm db:push"
    Write-Host "  2. Seed database: docker-compose -f docker-compose.dev.yml exec app pnpm db:seed"
    Write-Host "  3. Open http://localhost:3000"
} else {
    Write-Host "✓ Production environment ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access points:"
    Write-Host "  • App:       http://localhost:3000"
    Write-Host "  • PgAdmin:   http://localhost:5050"
    Write-Host "  • Database:  localhost:5432"
    Write-Host "  • Redis:     localhost:6379"
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Ensure all environment variables are set correctly in .env.local" -ForegroundColor Yellow
    Write-Host "  • Check DATABASE_URL is production-ready"
    Write-Host "  • Set PGADMIN_DEFAULT_PASSWORD to a strong password"
    Write-Host "  • Update all OAuth and email credentials"
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "View logs: docker-compose -f $ComposeFile logs -f"
Write-Host "Stop services: docker-compose -f $ComposeFile down"
