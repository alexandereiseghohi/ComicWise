<#
.SYNOPSIS
  Deploy Next.js export to GitHub Pages using `gh-pages` package.
#>
param()

if (-not (Test-Path -Path "out" -PathType Container)) {
  Write-Output "No 'out' folder found. Running build + export..."
  if (Get-Command pnpm -ErrorAction SilentlyContinue) { pnpm build; pnpm run export } else { npm run build; npm run export }
}

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  pnpm dlx gh-pages -d out -b gh-pages
}
else {
  if (Get-Command npx -ErrorAction SilentlyContinue) { npx gh-pages -d out -b gh-pages } else { Write-Error "Install 'gh-pages' (npm i -D gh-pages) or use npx." }
}

Write-Output "GitHub Pages deployment finished."
