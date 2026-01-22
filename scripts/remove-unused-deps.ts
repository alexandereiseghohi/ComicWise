#!/usr/bin/env tsx

/**
 * Remove Unused Dependencies
 *
 * Scans the codebase and finds packages that are installed but not imported anywhere.
 * Generates scripts to uninstall them safely.
 */

import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { Project, SyntaxKind } from "ts-morph";

interface DependencyInfo {
  name: string;
  version: string;
  type: "dependencies" | "devDependencies";
  isUsed: boolean;
  importedIn: string[];
}

const excludedPackages = new Set([
  // Build tools that don't show up in imports
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "typescript",
  "tsx",
  "tsup",
  "vitest",
  "playwright",
  "eslint",
  "prettier",
  "postcss",
  "tailwindcss",
  "autoprefixer",
  "next",

  // CLI tools
  "pnpm",
  "turbo",
  "concurrently",

  // Config packages
  "eslint-config-next",
  "eslint-config-prettier",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",

  // Type definitions
  "@types/bcryptjs",
  "@types/nodemailer",

  // Plugins
  "next-sitemap",
  "@sentry/nextjs",
]);

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Read package.json
 */
async function readPackageJson(): Promise<PackageJson> {
  const pkgPath = join(process.cwd(), "package.json");
  const content = await readFile(pkgPath, "utf-8");
  return JSON.parse(content) as PackageJson;
}

/**
 * Get all installed dependencies
 */
async function getInstalledDependencies(): Promise<DependencyInfo[]> {
  console.log(chalk.blue("📦 Reading package.json...\n"));

  const pkg = await readPackageJson();
  const deps: DependencyInfo[] = [];

  // Add dependencies
  if (pkg.dependencies) {
    for (const [name, version] of Object.entries(pkg.dependencies)) {
      deps.push({
        name,
        version: version,
        type: "dependencies",
        isUsed: false,
        importedIn: [],
      });
    }
  }

  // Add devDependencies
  if (pkg.devDependencies) {
    for (const [name, version] of Object.entries(pkg.devDependencies)) {
      deps.push({
        name,
        version: version,
        type: "devDependencies",
        isUsed: false,
        importedIn: [],
      });
    }
  }

  console.log(chalk.green(`✓ Found ${deps.length} total dependencies\n`));
  return deps;
}

/**
 * Check if a package is used in the codebase
 * @param project
 * @param dependencies
 */
function checkPackageUsage(project: Project, dependencies: DependencyInfo[]) {
  console.log(chalk.blue("🔍 Scanning codebase for imports...\n"));

  const sourceFiles = project.getSourceFiles();
  let totalImports = 0;

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    if (filePath.includes("node_modules")) continue;

    const imports = sourceFile.getImportDeclarations();
    const requires = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    // Check regular imports
    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      const packageName = getPackageNameFromImport(moduleSpecifier);

      if (packageName) {
        const dep = dependencies.find(d => d.name === packageName);
        if (dep) {
          dep.isUsed = true;
          dep.importedIn.push(filePath);
          totalImports++;
        }
      }
    }

    // Check dynamic requires (for CJS modules)
    for (const expr of requires) {
      const text = expr.getText();
      if (text.includes("require(")) {
        const match = text.match(/require\(["']([^"']+)["']\)/);
        const matchedImport = match?.[1];
        if (matchedImport) {
          const packageName = getPackageNameFromImport(matchedImport);
          const dep = dependencies.find(d => d.name === packageName);
          if (dep) {
            dep.isUsed = true;
            dep.importedIn.push(filePath);
            totalImports++;
          }
        }
      }
    }
  }

  console.log(chalk.green(`✓ Scanned ${sourceFiles.length} files, found ${totalImports} imports\n`));
}

/**
 * Extract package name from import path
 * @param importPath
 */
function getPackageNameFromImport(importPath: string): string | null {
  // Skip relative imports
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
    return null;
  }

  // Handle scoped packages (@scope/package)
  if (importPath.startsWith("@")) {
    const parts = importPath.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  }

  // Handle regular packages
  const parts = importPath.split("/");
  return parts[0] ?? null;
}

/**
 * Generate removal scripts
 * @param unusedDeps
 */
async function generateRemovalScripts(unusedDeps: DependencyInfo[]) {
  if (unusedDeps.length === 0) {
    console.log(chalk.green("\n✓ No unused dependencies found!\n"));
    return;
  }

  console.log(chalk.blue("\n📝 Generating removal scripts...\n"));

  const regularDeps = unusedDeps.filter(d => d.type === "dependencies");
  const devDeps = unusedDeps.filter(d => d.type === "devDependencies");

  // PowerShell script
  const psScript = `# Remove Unused Dependencies - PowerShell Script
# Generated: ${new Date().toISOString()}

Write-Host "Removing unused dependencies..." -ForegroundColor Yellow

${regularDeps.length > 0 ? `# Regular Dependencies (${regularDeps.length})
pnpm remove ${regularDeps.map(d => d.name).join(" ")}
` : ""}
${devDeps.length > 0 ? `# Dev Dependencies (${devDeps.length})
pnpm remove -D ${devDeps.map(d => d.name).join(" ")}
` : ""}
Write-Host "Done!" -ForegroundColor Green
`;

  // Bash script
  const bashScript = `#!/bin/bash
# Remove Unused Dependencies - Bash Script
# Generated: ${new Date().toISOString()}

echo "Removing unused dependencies..."

${regularDeps.length > 0 ? `# Regular Dependencies (${regularDeps.length})
pnpm remove ${regularDeps.map(d => d.name).join(" ")}
` : ""}
${devDeps.length > 0 ? `# Dev Dependencies (${devDeps.length})
pnpm remove -D ${devDeps.map(d => d.name).join(" ")}
` : ""}
echo "Done!"
`;

  // Write scripts
  await writeFile("scripts/remove-unused-deps.ps1", psScript);
  await writeFile("scripts/remove-unused-deps.sh", bashScript);

  console.log(chalk.green("✓ Generated removal scripts:"));
  console.log(chalk.gray("  - scripts/remove-unused-deps.ps1 (PowerShell)"));
  console.log(chalk.gray("  - scripts/remove-unused-deps.sh (Bash)\n"));
}

/**
 * Print report
 * @param dependencies
 */
function printReport(dependencies: DependencyInfo[]) {
  const unused = dependencies.filter(d => !d.isUsed && !excludedPackages.has(d.name));
  const used = dependencies.filter(d => d.isUsed || excludedPackages.has(d.name));

  console.log(chalk.bold("\n" + "═".repeat(60)));
  console.log(chalk.bold.cyan("   DEPENDENCY USAGE REPORT"));
  console.log(chalk.bold("═".repeat(60) + "\n"));

  console.log(chalk.green(`✓ Used Dependencies: ${used.length}`));
  console.log(chalk.yellow(`⚠ Unused Dependencies: ${unused.length}\n`));

  if (unused.length > 0) {
    console.log(chalk.bold.yellow("Unused Dependencies:\n"));

    const regularDeps = unused.filter(d => d.type === "dependencies");
    const devDeps = unused.filter(d => d.type === "devDependencies");

    if (regularDeps.length > 0) {
      console.log(chalk.white("  Regular Dependencies:"));
      regularDeps.forEach(d => {
        console.log(chalk.gray(`    - ${d.name} (${d.version})`));
      });
      console.log();
    }

    if (devDeps.length > 0) {
      console.log(chalk.white("  Dev Dependencies:"));
      devDeps.forEach(d => {
        console.log(chalk.gray(`    - ${d.name} (${d.version})`));
      });
      console.log();
    }
  }

  console.log(chalk.bold("═".repeat(60)));
  console.log(chalk.bold.green("\n✓ Analysis Complete\n"));

  return unused;
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.cyan("\n╔═══════════════════════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("║   ComicWise - Unused Dependency Finder                ║"));
  console.log(chalk.bold.cyan("╚═══════════════════════════════════════════════════════╝\n"));

  try {
    // Initialize project
    console.log(chalk.blue("🔧 Initializing TypeScript project...\n"));
    const project = new Project({
      tsConfigFilePath: "tsconfig.json",
      skipAddingFilesFromTsConfig: false,
    });

    // Get dependencies
    const dependencies = await getInstalledDependencies();

    // Check usage
    checkPackageUsage(project, dependencies);

    // Print report and generate scripts
    const unusedDeps = printReport(dependencies);
    await generateRemovalScripts(unusedDeps);

    if (unusedDeps.length > 0) {
      console.log(chalk.yellow("💡 Review the generated scripts before running them!"));
      console.log(chalk.yellow("   Some packages may be used indirectly or in config files.\n"));
    }
  } catch (error) {
    console.error(chalk.red("\n✗ Error:"), error);
    process.exit(1);
  }
}

main();
