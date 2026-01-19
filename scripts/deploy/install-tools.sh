#!/usr/bin/env bash
set -euo pipefail

# Install required CLI tools for deployment: vercel, gh (GitHub CLI), gh-pages
# Supports pnpm/npm globally, Homebrew (macOS), apt (Debian/Ubuntu), yum/dnf (RHEL/CentOS), and explicit suggestions for Windows.

usage() {
  cat <<EOF
Usage: $0 [--package-manager pnpm|npm|brew|apt|dnf|yum|choco|winget] [--no-gh-pages]
Installs: vercel, gh (GitHub CLI), gh-pages (via npm/pnpm when appropriate).
EOF
}

PM="detect"
NO_GH_PAGES=false
while [[ ${#} -gt 0 ]]; do
  case "$1" in
    --package-manager) PM="$2"; shift 2;;
    --no-gh-pages) NO_GH_PAGES=true; shift 1;;
    -h|--help) usage; exit 0;;
    *) shift 1;;
  esac
done

install_with_npm() {
  if command -v pnpm >/dev/null 2>&1; then
    echo "Installing with pnpm (global)"
    pnpm add -g "$@"
  elif command -v npm >/dev/null 2>&1; then
    echo "Installing with npm (global)"
    npm install -g "$@"
  else
    echo "No pnpm/npm found. Try install node+pnpm or pass --package-manager to choose a system package manager." >&2
    return 1
  fi
}

if [[ "$PM" == "detect" ]]; then
  if [[ "$(uname -s)" == "Darwin" ]] && command -v brew >/dev/null 2>&1; then
    PM=brew
  elif command -v apt >/dev/null 2>&1; then
    PM=apt
  elif command -v dnf >/dev/null 2>&1; then
    PM=dnf
  elif command -v yum >/dev/null 2>&1; then
    PM=yum
  elif command -v choco >/dev/null 2>&1; then
    PM=choco
  elif command -v winget >/dev/null 2>&1; then
    PM=winget
  else
    PM=npm
  fi
fi

echo "Selected package manager: $PM"

case "$PM" in
  pnpm|npm)
    # Install CLI packages individually to avoid pnpm treating combined specs as one
    install_with_npm vercel || true
    install_with_npm gh || true
    if [[ "$NO_GH_PAGES" == "false" ]]; then
      install_with_npm gh-pages || true
    fi
    ;;
  brew)
    echo "Installing vercel and gh with Homebrew..."
    brew install vercel || true
    brew install gh || true
    # gh-pages via npm
    install_with_npm gh-pages || true
    ;;
  apt)
    echo "Installing GitHub CLI via apt (Debian/Ubuntu)..."
    sudo apt update
    sudo apt install -y gh || true
    # vercel via npm
    install_with_npm vercel || true
    if [[ "$NO_GH_PAGES" == "false" ]]; then
      install_with_npm gh-pages || true
    fi
    ;;
  dnf|yum)
    echo "Installing GitHub CLI via dnf/yum..."
    sudo "$PM" install -y gh || true
    install_with_npm vercel || true
    if [[ "$NO_GH_PAGES" == "false" ]]; then
      install_with_npm gh-pages || true
    fi
    ;;
  choco)
    echo "Installing via Chocolatey (Windows)..."
    choco install -y vercel.cli gh || true
    # recommend pnpm or npm for gh-pages
    ;;
  winget)
    echo "Installing via winget (Windows)..."
    winget install --id Vercel.Vercel -e --source winget || true
    winget install --id GitHub.cli -e --source winget || true
    ;;
  *)
    echo "Unknown package manager: $PM. Falling back to npm/pnpm global installs."
    install_with_npm vercel || true
    if [[ "$NO_GH_PAGES" == "false" ]]; then
      install_with_npm gh-pages || true
    fi
    ;;
esac

if [[ "$NO_GH_PAGES" == "false" ]]; then
  echo "Ensuring gh-pages package is available (for GitHub Pages deployments)."
  install_with_npm gh-pages || true
fi

echo "Installation finished. Verify with: vercel --version; gh --version; npx gh-pages --version"
