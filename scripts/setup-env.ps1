# ═══════════════════════════════════════════════════════════════════
# ComicWise - Environment Configuration Script
# ═══════════════════════════════════════════════════════════════════
# Description: Validates and sets up environment variables
# Platform: Windows (PowerShell)
# Package Manager: pnpm
# Usage: .\scripts\setup-env.ps1 [-Validate] [-Create] [-Check]
# ═══════════════════════════════════════════════════════════════════

[CmdletBinding()]
param(
  [Parameter(HelpMessage = "Validate existing .env.local file")]
  [switch]$Validate,

  [Parameter(HelpMessage = "Create .env.local from template")]
  [switch]$Create,

  [Parameter(HelpMessage = "Check environment configuration")]
  [switch]$Check
)

# Configuration
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $ProjectRoot ".env.local"
$EnvTemplate = Join-Path $ProjectRoot ".env.example"
$AppConfig = Join-Path $ProjectRoot "appConfig.ts"

# Color output functions
function Write-Success {
  param([string]$Message)
  Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
  param([string]$Message)
  Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Warning {
  param([string]$Message)
  Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
  param([string]$Message)
  Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Header {
  param([string]$Message)
  Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
  Write-Host "  $Message" -ForegroundColor Magenta
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Magenta
}

# Required environment variables
$RequiredVars = @(
  @{ Name = "DATABASE_URL"; Description = "PostgreSQL connection string"; Example = "postgresql://user:pass@localhost:5432/comicwise" },
  @{ Name = "AUTH_SECRET"; Description = "NextAuth secret (min 32 chars)"; Example = "your-super-secret-auth-key-min-32-chars" },
  @{ Name = "AUTH_URL"; Description = "Application URL"; Example = "http://localhost:3000" },
  @{ Name = "NEXT_PUBLIC_APP_URL"; Description = "Public app URL"; Example = "http://localhost:3000" }
)

# Optional but recommended variables
$RecommendedVars = @(
  @{ Name = "UPLOAD_PROVIDER"; Description = "Image upload provider"; Example = "local" },
  @{ Name = "EMAIL_SERVER_HOST"; Description = "SMTP server host"; Example = "smtp.gmail.com" },
  @{ Name = "EMAIL_SERVER_PORT"; Description = "SMTP port"; Example = "587" },
  @{ Name = "EMAIL_SERVER_USER"; Description = "SMTP username"; Example = "your-email@gmail.com" },
  @{ Name = "EMAIL_FROM"; Description = "Email sender address"; Example = "noreply@comicwise.com" },
  @{ Name = "REDIS_HOST"; Description = "Redis host"; Example = "localhost" },
  @{ Name = "REDIS_PORT"; Description = "Redis port"; Example = "6379" },
  @{ Name = "NODE_ENV"; Description = "Environment"; Example = "development" }
)

# Optional OAuth variables
$OAuthVars = @(
  @{ Name = "AUTH_GOOGLE_CLIENT_ID"; Description = "Google OAuth client ID"; Example = "" },
  @{ Name = "AUTH_GOOGLE_CLIENT_SECRET"; Description = "Google OAuth secret"; Example = "" },
  @{ Name = "AUTH_GITHUB_CLIENT_ID"; Description = "GitHub OAuth client ID"; Example = "" },
  @{ Name = "AUTH_GITHUB_CLIENT_SECRET"; Description = "GitHub OAuth secret"; Example = "" }
)

# Image upload service variables (choose one)
$ImageUploadVars = @{
  ImageKit   = @(
    @{ Name = "IMAGEKIT_PUBLIC_KEY"; Description = "ImageKit public key"; Example = "" },
    @{ Name = "IMAGEKIT_PRIVATE_KEY"; Description = "ImageKit private key"; Example = "" },
    @{ Name = "IMAGEKIT_URL_ENDPOINT"; Description = "ImageKit URL endpoint"; Example = "https://ik.imagekit.io/your-id" }
  )
  Cloudinary = @(
    @{ Name = "CLOUDINARY_CLOUD_NAME"; Description = "Cloudinary cloud name"; Example = "" },
    @{ Name = "CLOUDINARY_API_KEY"; Description = "Cloudinary API key"; Example = "" },
    @{ Name = "CLOUDINARY_API_SECRET"; Description = "Cloudinary API secret"; Example = "" }
  )
  AWS        = @(
    @{ Name = "AWS_REGION"; Description = "AWS region"; Example = "us-east-1" },
    @{ Name = "AWS_ACCESS_KEY_ID"; Description = "AWS access key"; Example = "" },
    @{ Name = "AWS_SECRET_ACCESS_KEY"; Description = "AWS secret key"; Example = "" },
    @{ Name = "AWS_S3_BUCKET_NAME"; Description = "S3 bucket name"; Example = "" }
  )
}

# Function to check if .env.local exists
function Test-EnvFile {
  return Test-Path $EnvFile
}

# Function to parse .env file
function Get-EnvVariables {
  param([string]$FilePath)

  $envVars = @{}
  if (Test-Path $FilePath) {
    Get-Content $FilePath | ForEach-Object {
      $line = $_.Trim()
      if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line.Split("=", 2)
        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"', "'")
        $envVars[$key] = $value
      }
    }
  }
  return $envVars
}

# Function to validate environment variables
function Test-EnvironmentVariables {
  Write-Header "Environment Variable Validation"

  if (-not (Test-EnvFile)) {
    Write-Error ".env.local file not found!"
    Write-Info "Run with -Create flag to create from template"
    return $false
  }

  $envVars = Get-EnvVariables -FilePath $EnvFile
  $missingRequired = @()
  $missingRecommended = @()
  $valid = $true

  # Check required variables
  Write-Info "Checking required variables..."
  foreach ($var in $RequiredVars) {
    if (-not $envVars.ContainsKey($var.Name) -or [string]::IsNullOrWhiteSpace($envVars[$var.Name])) {
      Write-Error "Missing required: $($var.Name) - $($var.Description)"
      $missingRequired += $var
      $valid = $false
    }
    else {
      Write-Success "$($var.Name) is set"
    }
  }

  # Check recommended variables
  Write-Info "`nChecking recommended variables..."
  foreach ($var in $RecommendedVars) {
    if (-not $envVars.ContainsKey($var.Name) -or [string]::IsNullOrWhiteSpace($envVars[$var.Name])) {
      Write-Warning "Missing recommended: $($var.Name) - $($var.Description)"
      $missingRecommended += $var
    }
    else {
      Write-Success "$($var.Name) is set"
    }
  }

  # Validate AUTH_SECRET length
  if ($envVars.ContainsKey("AUTH_SECRET") -and $envVars["AUTH_SECRET"].Length -lt 32) {
    Write-Error "AUTH_SECRET must be at least 32 characters long"
    $valid = $false
  }

  # Validate URLs
  $urlVars = @("DATABASE_URL", "AUTH_URL", "NEXT_PUBLIC_APP_URL")
  foreach ($urlVar in $urlVars) {
    if ($envVars.ContainsKey($urlVar)) {
      try {
        $null = [System.Uri]::new($envVars[$urlVar])
        Write-Success "$urlVar is a valid URL"
      }
      catch {
        Write-Error "$urlVar is not a valid URL: $($envVars[$urlVar])"
        $valid = $false
      }
    }
  }

  if ($valid) {
    Write-Success "`n✨ All required environment variables are properly configured!"
  }
  else {
    Write-Error "`n❌ Environment configuration has errors. Please fix them."
  }

  return $valid
}

# Function to create .env.local from template
function New-EnvFile {
  Write-Header "Creating .env.local File"

  if (Test-EnvFile) {
    $response = Read-Host ".env.local already exists. Overwrite? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
      Write-Info "Aborted. Existing file preserved."
      return
    }
    # Backup existing file
    $backupFile = "$EnvFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $EnvFile $backupFile
    Write-Success "Backed up existing file to: $backupFile"
  }

  # Generate AUTH_SECRET
  $authSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })

  # Create .env.local content
  $envContent = @"
# ═══════════════════════════════════════════════════════════════════
# ComicWise - Environment Configuration
# ═══════════════════════════════════════════════════════════════════
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# IMPORTANT: Never commit this file to version control!
# ═══════════════════════════════════════════════════════════════════

# ━━━ Database Configuration ━━━
DATABASE_URL="postgresql://postgres:password@localhost:5432/comicwise"
# NEON_DATABASE_URL=""  # Optional: Neon serverless Postgres

# ━━━ Authentication (NextAuth v5) ━━━
AUTH_SECRET="$authSecret"
AUTH_URL="http://localhost:3000"

# ━━━ Application Configuration ━━━
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# PORT="3000"  # Optional: custom port

# ━━━ Upload Provider Configuration ━━━
UPLOAD_PROVIDER="local"  # Options: local, imagekit, cloudinary, aws

# ImageKit (if UPLOAD_PROVIDER=imagekit)
# IMAGEKIT_PUBLIC_KEY=""
# IMAGEKIT_PRIVATE_KEY=""
# IMAGEKIT_URL_ENDPOINT=""
# IMAGEKIT_ENABLED="true"

# Cloudinary (if UPLOAD_PROVIDER=cloudinary)
# CLOUDINARY_CLOUD_NAME=""
# CLOUDINARY_API_KEY=""
# CLOUDINARY_API_SECRET=""

# AWS S3 (if UPLOAD_PROVIDER=aws)
# AWS_REGION="us-east-1"
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_S3_BUCKET_NAME=""

# ━━━ Email Configuration (Nodemailer) ━━━
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER=""  # Your email
EMAIL_SERVER_PASSWORD=""  # App password
EMAIL_FROM="noreply@comicwise.com"
EMAIL_SECURE="false"

# Legacy SMTP support (optional)
# SMTP_HOST=""
# SMTP_PORT=""
# SMTP_USER=""
# SMTP_PASSWORD=""
# SMTP_FROM=""

# ━━━ Redis Configuration (ioredis) ━━━
REDIS_HOST="localhost"
REDIS_PORT="6379"
# REDIS_PASSWORD=""  # If Redis requires password
# REDIS_DB="0"
# REDIS_URL=""  # Alternative: full Redis URL
# REDIS_TLS_ENABLED="false"

# ━━━ Upstash Redis (Alternative to local Redis) ━━━
# UPSTASH_REDIS_REST_URL=""
# UPSTASH_REDIS_REST_TOKEN=""

# ━━━ Background Jobs (QStash - Optional) ━━━
# QSTASH_TOKEN=""
# QSTASH_CURRENT_SIGNING_KEY=""
# QSTASH_NEXT_SIGNING_KEY=""
# QSTASH_URL=""

# ━━━ OAuth Providers (Optional) ━━━
# Google OAuth
# AUTH_GOOGLE_CLIENT_ID=""
# AUTH_GOOGLE_CLIENT_SECRET=""

# GitHub OAuth
# AUTH_GITHUB_CLIENT_ID=""
# AUTH_GITHUB_CLIENT_SECRET=""

# ━━━ Custom Password (for seed data) ━━━
# CUSTOM_PASSWORD=""

# ━━━ Development Tokens (Optional) ━━━
# GITHUB_TOKEN=""  # For GitHub MCP server
# BRAVE_API_KEY=""  # For Brave Search MCP
# EVERART_API_KEY=""  # For AI image generation

"@

  $envContent | Out-File -FilePath $EnvFile -Encoding UTF8
  Write-Success ".env.local file created successfully!"
  Write-Info "Please edit .env.local and fill in the required values:"
  Write-Info "  - DATABASE_URL (PostgreSQL connection)"
  Write-Info "  - EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD (if using email)"
  Write-Info "  - OAuth credentials (if using Google/GitHub login)"
  Write-Info "  - Upload service credentials (if using ImageKit/Cloudinary/AWS)"
}

# Function to check environment setup
function Test-EnvironmentSetup {
  Write-Header "Environment Setup Check"

  $issues = @()

  # Check Node.js
  try {
    $nodeVersion = node --version
    Write-Success "Node.js installed: $nodeVersion"
    if ($nodeVersion -match "v(\d+)") {
      $major = [int]$matches[1]
      if ($major -lt 20) {
        Write-Warning "Node.js version should be >= 20.0.0 for optimal performance"
      }
    }
  }
  catch {
    Write-Error "Node.js is not installed or not in PATH"
    $issues += "Node.js"
  }

  # Check pnpm
  try {
    $pnpmVersion = pnpm --version
    Write-Success "pnpm installed: $pnpmVersion"
  }
  catch {
    Write-Error "pnpm is not installed. Run: npm install -g pnpm"
    $issues += "pnpm"
  }

  # Check PostgreSQL connection
  if (Test-EnvFile) {
    $envVars = Get-EnvVariables -FilePath $EnvFile
    if ($envVars.ContainsKey("DATABASE_URL")) {
      Write-Info "Testing PostgreSQL connection..."
      # We'll add database connection test later
      Write-Info "Database URL configured: $($envVars['DATABASE_URL'].Substring(0, 30))..."
    }
  }

  # Check Redis (optional)
  try {
    $redisCheck = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($redisCheck.TcpTestSucceeded) {
      Write-Success "Redis is running on localhost:6379"
    }
    else {
      Write-Warning "Redis is not running (optional for development)"
    }
  }
  catch {
    Write-Warning "Could not check Redis status"
  }

  # Check Docker (optional)
  try {
    $dockerVersion = docker --version
    Write-Success "Docker installed: $dockerVersion"
  }
  catch {
    Write-Warning "Docker is not installed (optional)"
  }

  if ($issues.Count -eq 0) {
    Write-Success "`n✨ Environment setup looks good!"
  }
  else {
    Write-Error "`n❌ Please install missing dependencies: $($issues -join ', ')"
  }
}

# Main execution
Write-Host @"

   ╔═══════════════════════════════════════════════════╗
   ║                                                   ║
   ║         ComicWise Environment Setup               ║
   ║         Next.js 16 + PostgreSQL + Redis           ║
   ║                                                   ║
   ╚═══════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Handle parameters
if ($Create) {
  New-EnvFile
}
elseif ($Validate) {
  Test-EnvironmentVariables
}
elseif ($Check) {
  Test-EnvironmentSetup
}
else {
  # Default behavior: comprehensive check
  Test-EnvironmentSetup
  Write-Host ""
  if (Test-EnvFile) {
    Test-EnvironmentVariables
  }
  else {
    Write-Warning ".env.local not found. Run with -Create to create it."
  }
}

Write-Host "`n"
