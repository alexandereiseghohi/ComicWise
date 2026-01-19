# ═══════════════════════════════════════════════════
# ComicWise - Docker Deployment Script (PowerShell)
# ═══════════════════════════════════════════════════

param(
    [Parameter(Position=0)]
    [ValidateSet("development", "production")]
    [string]$Environment = "production"
)

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ComicWise - Docker Deployment                    " -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Check for .env file
if (-not (Test-Path ".env.local") -and -not (Test-Path ".env.production")) {
    Write-Host "Warning: No .env file found. Using defaults." -ForegroundColor Yellow
}

Write-Host "Deploying $Environment environment..." -ForegroundColor Yellow
Write-Host ""

try {
    if ($Environment -eq "development") {
        docker-compose -f docker-compose.dev.yml up -d
    }
    elseif ($Environment -eq "production") {
        docker-compose -f docker-compose.yml up -d
    }
    
    Write-Host ""
    Write-Host "✓ Deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:"
    Write-Host "  - App: http://localhost:3000"
    Write-Host "  - Database: localhost:5432"
    Write-Host "  - Redis: localhost:6379"
    Write-Host ""
    Write-Host "View logs: docker-compose logs -f"
    Write-Host "Stop services: docker-compose down"
}
catch {
    Write-Host "Error during deployment: $_" -ForegroundColor Red
    exit 1
}
