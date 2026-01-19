<#
.SYNOPSIS
  Install commonly-required deployment CLIs: Vercel CLI, GitHub CLI (gh), and gh-pages.
.DESCRIPTION
  Detects available package managers and tries an appropriate install method. For Windows, uses Chocolatey or winget if present; otherwise uses pnpm/npm.
#>
param(
  [string]$PackageManager = "detect",
  [switch]$NoGhPages
)

function Detect-PM {
  if ($PackageManager -ne 'detect') { return $PackageManager }
  if (Get-Command pnpm -ErrorAction SilentlyContinue) { return 'pnpm' }
  if (Get-Command npm -ErrorAction SilentlyContinue) { return 'npm' }
  if (Get-Command choco -ErrorAction SilentlyContinue) { return 'choco' }
  if (Get-Command winget -ErrorAction SilentlyContinue) { return 'winget' }
  if (Get-Command brew -ErrorAction SilentlyContinue) { return 'brew' }
  if (Get-Command apt -ErrorAction SilentlyContinue) { return 'apt' }
  return 'npm'
}

$pm = Detect-PM
Write-Output "Using package manager: $pm"

function Install-With-Npm([string[]]$pkgs) {
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    foreach ($p in $pkgs) { pnpm add -g $p }
    return
  }
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    foreach ($p in $pkgs) { npm install -g $p }
    return
  }
  Write-Warning "Neither pnpm nor npm present to install packages: $($pkgs -join ', ')"
}

switch ($pm) {
  'pnpm' {
    Install-With-Npm @('vercel')
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { Write-Warning 'Install GitHub CLI (gh) separately (choco/winget/brew)'; }
    if (-not $NoGhPages) { Install-With-Npm @('gh-pages') }
  }
  'npm' {
    Install-With-Npm @('vercel')
    Write-Warning 'Install GitHub CLI (gh) separately (choco/winget/brew)'
    if (-not $NoGhPages) { Install-With-Npm @('gh-pages') }
  }
  'choco' { choco install -y vercel.cli gh || Write-Warning 'Chocolatey install failed'; if (-not $NoGhPages) { Install-With-Npm @('gh-pages') } }
  'winget' { winget install --id Vercel.Vercel -e --source winget -h || Write-Warning 'winget install failed'; winget install --id GitHub.cli -e --source winget -h || Write-Warning 'winget install failed'; if (-not $NoGhPages) { Install-With-Npm @('gh-pages') } }
  'brew' { brew install vercel || Write-Warning 'brew vercel install failed'; brew install gh || Write-Warning 'brew gh install failed'; if (-not $NoGhPages) { Install-With-Npm @('gh-pages') } }
  default { Install-With-Npm @('vercel'); if (-not $NoGhPages) { Install-With-Npm @('gh-pages') }; Write-Warning 'Consider installing GitHub CLI (gh) via system package manager for best results.' }
}

Write-Output 'Installation complete. Verify with: vercel --version; gh --version; npx gh-pages --version'
