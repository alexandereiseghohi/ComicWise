#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ComicWise Operations CLI - Enhanced PowerShell wrapper

.DESCRIPTION
    Comprehensive CLI for ComicWise project operations with tab completion

.EXAMPLE
    .\scripts\cw.ps1 db push
    .\scripts\cw.ps1 cache clear
#>

param(
    [Parameter(Position = 0)]
    [string]$Command,
    
    [Parameter(Position = 1)]
    [string]$SubCommand,
    
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

# ═══════════════════════════════════════════════════
# COLORS & FORMATTING
# ═══════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$Colors = @{
    Info    = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error   = "Red"
    Gray    = "DarkGray"
}

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $Colors.Info
    Write-Host " $Text" -ForegroundColor $Colors.Info
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $Colors.Info
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor $Colors.Success
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ $Text" -ForegroundColor $Colors.Info
}

function Write-Warn {
    param([string]$Text)
    Write-Host "⚠ $Text" -ForegroundColor $Colors.Warning
}

function Write-Err {
    param([string]$Text)
    Write-Host "✖ $Text" -ForegroundColor $Colors.Error
}

# ═══════════════════════════════════════════════════
# COMMAND ROUTER
# ═══════════════════════════════════════════════════

switch ($Command) {
    "db" {
        switch ($SubCommand) {
            "push" { pnpm db:push }
            "seed" { pnpm db:seed }
            "studio" { pnpm db:studio }
            "reset" { pnpm db:reset }
            "generate" { pnpm db:generate }
            "migrate" { pnpm db:migrate }
            default { Write-Err "Unknown db command: $SubCommand" }
        }
    }
    "cache" {
        switch ($SubCommand) {
            "clear" { pnpm cache:clear }
            "stats" { pnpm cache:stats }
            default { Write-Err "Unknown cache command: $SubCommand" }
        }
    }
    "health" {
        switch ($SubCommand) {
            "check" { pnpm health:check }
            "db" { pnpm health:db }
            "redis" { pnpm health:redis }
            "all" { pnpm health:all }
            default { Write-Err "Unknown health command: $SubCommand" }
        }
    }
    "queue" {
        switch ($SubCommand) {
            "worker" { pnpm queue:worker }
            "stats" { pnpm queue:stats }
            "clean" { pnpm queue:clean }
            default { Write-Err "Unknown queue command: $SubCommand" }
        }
    }
    "upload" {
        switch ($SubCommand) {
            "bulk" { pnpm upload:bulk $Arguments }
            "test" { pnpm upload:test }
            default { Write-Err "Unknown upload command: $SubCommand" }
        }
    }
    "dev" { pnpm dev }
    "build" { pnpm build }
    "test" { pnpm test $Arguments }
    "lint" { pnpm lint }
    "format" { pnpm format }
    "type-check" { pnpm type-check }
    
    "help" {
        Write-Header "ComicWise CLI - Quick Reference"
        Write-Host "Database Commands:" -ForegroundColor $Colors.Warning
        Write-Host "  cw db push           Push schema changes" -ForegroundColor $Colors.Gray
        Write-Host "  cw db seed           Seed the database" -ForegroundColor $Colors.Gray
        Write-Host "  cw db studio         Open Drizzle Studio" -ForegroundColor $Colors.Gray
        Write-Host "  cw db reset          Reset database" -ForegroundColor $Colors.Gray
        Write-Host ""
        Write-Host "Cache Commands:" -ForegroundColor $Colors.Warning
        Write-Host "  cw cache clear       Clear all cache" -ForegroundColor $Colors.Gray
        Write-Host "  cw cache stats       Show cache statistics" -ForegroundColor $Colors.Gray
        Write-Host ""
        Write-Host "Health Commands:" -ForegroundColor $Colors.Warning
        Write-Host "  cw health check      Run system health check" -ForegroundColor $Colors.Gray
        Write-Host "  cw health db         Check database connection" -ForegroundColor $Colors.Gray
        Write-Host "  cw health redis      Check Redis connection" -ForegroundColor $Colors.Gray
        Write-Host ""
        Write-Host "Queue Commands:" -ForegroundColor $Colors.Warning
        Write-Host "  cw queue worker      Start queue worker" -ForegroundColor $Colors.Gray
        Write-Host "  cw queue stats       Show queue statistics" -ForegroundColor $Colors.Gray
        Write-Host ""
        Write-Host "Development:" -ForegroundColor $Colors.Warning
        Write-Host "  cw dev               Start dev server" -ForegroundColor $Colors.Gray
        Write-Host "  cw build             Build for production" -ForegroundColor $Colors.Gray
        Write-Host "  cw test              Run tests" -ForegroundColor $Colors.Gray
        Write-Host "  cw lint              Run linter" -ForegroundColor $Colors.Gray
        Write-Host ""
    }
    
    default {
        if ([string]::IsNullOrWhiteSpace($Command)) {
            & "$PSScriptRoot\cw.ps1" "help"
        }
        else {
            Write-Err "Unknown command: $Command"
            Write-Info "Run 'cw help' for available commands"
        }
    }
}
