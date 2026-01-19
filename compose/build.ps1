# ═══════════════════════════════════════════════════
# ComicWise - Docker Build Script (PowerShell)
# ═══════════════════════════════════════════════════

param(
    [Parameter(Position=0)]
    [ValidateSet("development", "production")]
    [string]$BuildType = "production",
    
    [Parameter(Position=1)]
    [string]$CacheFlag = "--no-cache"
)

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ComicWise - Docker Build Script                  " -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Docker is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "Building Docker image..." -ForegroundColor Yellow
Write-Host "Build type: $BuildType"
Write-Host "Cache: $CacheFlag"
Write-Host ""

try {
    if ($BuildType -eq "development") {
        docker-compose -f docker-compose.dev.yml build $CacheFlag
        Write-Host "✓ Development image built successfully" -ForegroundColor Green
    }
    elseif ($BuildType -eq "production") {
        docker-compose -f docker-compose.yml build $CacheFlag
        Write-Host "✓ Production image built successfully" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Build complete!" -ForegroundColor Green
}
catch {
    Write-Host "Error during build: $_" -ForegroundColor Red
    exit 1
}
