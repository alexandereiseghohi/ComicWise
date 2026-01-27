#!/usr/bin/env node
/**
 * Pre-commit hook setup script
 * Run this to initialize Husky git hooks for development
 * Usage: node setup-hooks.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const hooksDir = path.join(__dirname, "..", ".husky");
const preCommitHook = path.join(hooksDir, "pre-commit");
const preCommitScriptPath = path.join(__dirname, "..", ".husky", "pre-commit");

// Ensure hooks directory exists
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
  console.log("✅ Created .husky directory");
}

// Pre-commit hook content
const preCommitContent = `#!/usr/bin/env sh
. "\$(dirname -- "\$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."
echo ""

# Run linting
echo "📝 Linting files..."
pnpm lint:fix || exit 1

# Run type checking on changed files
echo "🔎 Type checking..."
pnpm type-check || exit 1

# Run tests for changed files
echo "🧪 Running tests..."
pnpm test:unit:run -- --changed || exit 1

echo ""
echo "✅ Pre-commit checks passed!"
`;

// Write pre-commit hook
fs.writeFileSync(preCommitScriptPath, preCommitContent);
fs.chmodSync(preCommitScriptPath, 0o755);
console.log("✅ Created pre-commit hook");

// Initialize Husky if not already done
try {
  execSync("pnpm husky install", { cwd: process.cwd() });
  console.log("✅ Husky initialized");
} catch {
  console.warn("⚠️  Husky initialization skipped (may already be initialized)");
}

console.log("");
console.log("✅ Pre-commit hooks setup complete!");
console.log("");
console.log("Hooks installed:");
console.log("  - pre-commit: Runs lint, type-check, and tests before committing");
