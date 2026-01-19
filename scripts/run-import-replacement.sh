#!/bin/bash
# Import Replacement Script Runner - Bash Version
# Optimized & Validated for Unix/Linux/macOS

set -e  # Exit on error

# ═══════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════

SCRIPT_NAME="fix-imports.cjs"
BACKUP_DIR=".import-backup-$(date +%Y-%m-%d-%H%M%S)"

DRY_RUN=false
VERBOSE=false
BACKUP=false
VALIDATE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true ;;
    --verbose) VERBOSE=true ;;
    --backup) BACKUP=true ;;
    --validate) VALIDATE=true ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

# ═══════════════════════════════════════════════════
# COLORS
# ═══════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════

print_header() {
  echo ""
  echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║  $(printf '%-58s' "$1")║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
  echo -e "${CYAN}ℹ️  $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

check_prerequisites() {
  print_info "Checking prerequisites..."
  
  # Check Node.js
  if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js: $NODE_VERSION"
  else
    print_error "Node.js not found. Please install Node.js 20+"
    exit 1
  fi
  
  # Check pnpm
  if command -v pnpm >/dev/null 2>&1; then
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm: $PNPM_VERSION"
  else
    print_error "pnpm not found. Please install pnpm"
    exit 1
  fi
  
  # Check script exists
  if [ ! -f "$SCRIPT_NAME" ]; then
    print_error "Script not found: $SCRIPT_NAME"
    exit 1
  fi
  
  print_success "All prerequisites met"
  echo ""
}

create_backup() {
  if [ "$BACKUP" = false ]; then
    return
  fi
  
  print_info "Creating backup..."
  
  if [ -d "src" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r src "$BACKUP_DIR/"
    print_success "Backup created: $BACKUP_DIR"
  else
    print_warning "src directory not found, skipping backup"
  fi
  
  echo ""
}

run_import_replacement() {
  print_info "Running import replacement script..."
  echo ""
  
  if [ "$DRY_RUN" = true ]; then
    print_warning "DRY RUN MODE - No files will be modified"
    echo ""
  fi
  
  if node "$SCRIPT_NAME"; then
    echo ""
    print_success "Script completed successfully"
    return 0
  else
    echo ""
    print_error "Script failed"
    return 1
  fi
}

run_validation() {
  if [ "$VALIDATE" = false ]; then
    return
  fi
  
  print_header "Running Validation"
  
  # Type check
  print_info "Running type check..."
  if pnpm type-check 2>&1 | grep -q "error TS"; then
    ERROR_COUNT=$(pnpm type-check 2>&1 | grep -c "error TS" || echo "0")
    print_warning "Type check found $ERROR_COUNT error(s)"
    print_info "Run 'pnpm type-check' for details"
  else
    print_success "Type check passed"
  fi
  
  echo ""
  
  # Format check
  print_info "Checking code formatting..."
  if pnpm format:check >/dev/null 2>&1; then
    print_success "Format check passed"
  else
    print_info "Run 'pnpm format' to fix formatting"
  fi
  
  echo ""
}

show_summary() {
  local success=$1
  
  print_header "Summary"
  
  if [ "$success" = "0" ]; then
    print_success "Import replacement completed successfully!"
    
    if [ "$BACKUP" = true ]; then
      print_info "Backup location: $BACKUP_DIR"
    fi
    
    echo ""
    print_info "Next steps:"
    echo "  1. Review changes with: git status"
    echo "  2. Run validation: pnpm validate"
    echo "  3. Test build: pnpm build"
    echo "  4. Commit changes if satisfied"
  else
    print_error "Import replacement failed!"
    print_info "Check the error messages above"
    
    if [ "$BACKUP" = true ] && [ -d "$BACKUP_DIR" ]; then
      print_info "Restore from backup: $BACKUP_DIR"
    fi
  fi
  
  echo ""
}

# ═══════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════

print_header "Import Replacement Script Runner v1.0.0"

# Show configuration
if [ "$DRY_RUN" = true ]; then
  print_warning "DRY RUN MODE - No files will be modified"
fi
if [ "$VERBOSE" = true ]; then
  print_info "VERBOSE MODE - Detailed output enabled"
fi
if [ "$BACKUP" = true ]; then
  print_info "BACKUP MODE - Creating backup before changes"
fi
if [ "$VALIDATE" = true ]; then
  print_info "VALIDATE MODE - Running validation after changes"
fi

echo ""

# Execute workflow
check_prerequisites
create_backup

if run_import_replacement; then
  SUCCESS=0
else
  SUCCESS=1
fi

run_validation
show_summary $SUCCESS

exit $SUCCESS
