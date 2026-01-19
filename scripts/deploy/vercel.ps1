<#
.SYNOPSIS
  Deploy the project to Vercel (requires Vercel CLI or npx/pnpm dlx).
#>
param(
  [Parameter(ValueFromRemainingArguments = $true)]
  $Args
)

if (Get-Command vercel -ErrorAction SilentlyContinue) {
  vercel --prod @Args
  exit $LASTEXITCODE
}

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  pnpm dlx vercel --prod @Args
  exit $LASTEXITCODE
}

if (Get-Command npx -ErrorAction SilentlyContinue) {
  npx vercel --prod @Args
  exit $LASTEXITCODE
}

Write-Error "Vercel CLI not found. Install it with 'pnpm add -g vercel' or use 'npx vercel'."
