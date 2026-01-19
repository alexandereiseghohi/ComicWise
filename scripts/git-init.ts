#!/usr/bin/env tsx
/**
 * Git Repository Initialization Script
 * Initializes a new Git repository with development and production branches
 */

import chalk from "chalk";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import ora from "ora";

interface GitConfig {
  remoteUrl?: string;
  defaultBranch: string;
  devBranch: string;
  prodBranch: string;
}

const config: GitConfig = {
  defaultBranch: "main",
  devBranch: "development",
  prodBranch: "production",
};

function exec(command: string, silent = false): string {
  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: silent ? "pipe" : "inherit",
    });
    return output;
  } catch (error) {
    if (!silent) {
      console.error(chalk.red(`Command failed: ${command}`));
    }
    throw error;
  }
}

function checkGitInstalled(): boolean {
  try {
    exec("git --version", true);
    return true;
  } catch {
    return false;
  }
}

function isGitRepo(): boolean {
  try {
    exec("git rev-parse --git-dir", true);
    return true;
  } catch {
    return false;
  }
}

async function initializeGitRepo() {
  console.log(chalk.cyan("\n═══════════════════════════════════════════════════════════════"));
  console.log(chalk.cyan("   Git Repository Initialization"));
  console.log(chalk.cyan("═══════════════════════════════════════════════════════════════\n"));

  // Check if Git is installed
  if (!checkGitInstalled()) {
    console.error(chalk.red("❌ Git is not installed. Please install Git first."));
    process.exit(1);
  }

  // Check if already a Git repository
  if (isGitRepo()) {
    console.log(chalk.yellow("⚠️  Already a Git repository. Skipping initialization."));
    return;
  }

  const spinner = ora("Initializing Git repository...").start();

  try {
    // Initialize Git repository
    exec("git init", true);
    spinner.succeed("Git repository initialized");

    // Create .gitignore if it doesn't exist
    if (!fs.existsSync(".gitignore")) {
      spinner.start("Creating .gitignore...");
      const gitignoreContent = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;
      fs.writeFileSync(".gitignore", gitignoreContent);
      spinner.succeed(".gitignore created");
    }

    // Configure Git user if not set
    spinner.start("Checking Git configuration...");
    try {
      exec("git config user.name", true);
      exec("git config user.email", true);
      spinner.succeed("Git user configured");
    } catch {
      spinner.warn("Git user not configured. Please set:");
      console.log(chalk.yellow('  git config --global user.name "Your Name"'));
      console.log(chalk.yellow('  git config --global user.email "your@email.com"'));
    }

    // Create initial commit
    spinner.start("Creating initial commit...");
    exec("git add .", true);
    exec('git commit -m "Initial commit: ComicWise project setup"', true);
    spinner.succeed("Initial commit created");

    // Rename default branch to main
    spinner.start(`Renaming branch to ${config.defaultBranch}...`);
    exec(`git branch -M ${config.defaultBranch}`, true);
    spinner.succeed(`Branch renamed to ${config.defaultBranch}`);

    // Create development branch
    spinner.start(`Creating ${config.devBranch} branch...`);
    exec(`git checkout -b ${config.devBranch}`, true);
    spinner.succeed(`${config.devBranch} branch created`);

    // Create production branch
    spinner.start(`Creating ${config.prodBranch} branch...`);
    exec(`git checkout -b ${config.prodBranch}`, true);
    exec(`git checkout ${config.defaultBranch}`, true);
    spinner.succeed(`${config.prodBranch} branch created`);

    console.log(chalk.green("\n✅ Git repository initialized successfully!"));
    console.log(chalk.cyan("\nBranches created:"));
    console.log(chalk.white(`  • ${config.defaultBranch} (current)`));
    console.log(chalk.white(`  • ${config.devBranch}`));
    console.log(chalk.white(`  • ${config.prodBranch}`));

    console.log(chalk.cyan("\nNext steps:"));
    console.log(chalk.white("  1. Set up remote repository:"));
    console.log(chalk.yellow("     git remote add origin <your-repo-url>"));
    console.log(chalk.white("  2. Push all branches:"));
    console.log(chalk.yellow("     git push -u origin --all"));
  } catch (error) {
    spinner.fail("Git initialization failed");
    console.error(chalk.red(error));
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeGitRepo().catch(console.error);
}

export { initializeGitRepo };
