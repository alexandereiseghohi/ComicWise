#!/usr/bin/env tsx
/**
 * Git Commit and Push Script
 * Automates git add, commit, and push operations
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { execSync } from "node:child_process";
import ora from "ora";

interface CommitOptions {
  message?: string;
  type?: string;
  scope?: string;
  push?: boolean;
  branch?: string;
}

const COMMIT_TYPES = [
  { name: "feat: A new feature", value: "feat" },
  { name: "fix: A bug fix", value: "fix" },
  { name: "docs: Documentation changes", value: "docs" },
  { name: "style: Code style changes (formatting, etc)", value: "style" },
  { name: "refactor: Code refactoring", value: "refactor" },
  { name: "perf: Performance improvements", value: "perf" },
  { name: "test: Adding or updating tests", value: "test" },
  { name: "chore: Maintenance tasks", value: "chore" },
  { name: "ci: CI/CD changes", value: "ci" },
  { name: "build: Build system changes", value: "build" },
];

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

function getCurrentBranch(): string {
  return exec("git rev-parse --abbrev-ref HEAD", true).trim();
}

function hasChanges(): boolean {
  try {
    const status = exec("git status --porcelain", true);
    return status.length > 0;
  } catch {
    return false;
  }
}

function hasRemote(): boolean {
  try {
    exec("git remote -v", true);
    return true;
  } catch {
    return false;
  }
}

async function gitCommitAndPush(options: CommitOptions = {}) {
  console.log(chalk.cyan("\n═══════════════════════════════════════════════════════════════"));
  console.log(chalk.cyan("   Git Commit and Push"));
  console.log(chalk.cyan("═══════════════════════════════════════════════════════════════\n"));

  // Check for changes
  if (!hasChanges()) {
    console.log(chalk.yellow("⚠️  No changes to commit."));
    return;
  }

  const currentBranch = getCurrentBranch();
  console.log(chalk.cyan(`Current branch: ${chalk.white(currentBranch)}\n`));

  // Get commit details if not provided
  if (!options.message) {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Select commit type:",
        choices: COMMIT_TYPES,
      },
      {
        type: "input",
        name: "scope",
        message: "Commit scope (optional):",
        default: "",
      },
      {
        type: "input",
        name: "message",
        message: "Commit message:",
        validate: (input: string) => input.length > 0 || "Commit message is required",
      },
      {
        type: "confirm",
        name: "push",
        message: "Push to remote?",
        default: true,
      },
    ]);

    options = { ...options, ...answers };
  }

  // Build commit message
  const scope = options.scope ? `(${options.scope})` : "";
  const commitMessage = `${options.type}${scope}: ${options.message}`;

  const spinner = ora("Adding files...").start();

  try {
    // Git add all
    exec("git add .", true);
    spinner.succeed("Files staged");

    // Git commit
    spinner.start("Creating commit...");
    exec(`git commit -m "${commitMessage}"`, true);
    spinner.succeed(`Committed: ${chalk.white(commitMessage)}`);

    // Git push if requested
    if (options.push !== false) {
      if (!hasRemote()) {
        spinner.warn("No remote repository configured. Skipping push.");
        console.log(chalk.yellow("\nTo add a remote:"));
        console.log(chalk.white("  git remote add origin <your-repo-url>"));
      } else {
        spinner.start("Pushing to remote...");
        try {
          exec(`git push origin ${currentBranch}`, true);
          spinner.succeed(`Pushed to ${chalk.white(`origin/${currentBranch}`)}`);
        } catch {
          // If push fails (e.g., upstream not set), try setting upstream
          try {
            exec(`git push -u origin ${currentBranch}`, true);
            spinner.succeed(`Pushed to ${chalk.white(`origin/${currentBranch}`)} (upstream set)`);
          } catch {
            spinner.fail("Push failed");
            console.log(chalk.yellow("\nYou may need to set the upstream branch:"));
            console.log(chalk.white(`  git push -u origin ${currentBranch}`));
          }
        }
      }
    }

    console.log(chalk.green("\n✅ Git operations completed successfully!"));
  } catch (error) {
    spinner.fail("Git operation failed");
    console.error(chalk.red(error));
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: CommitOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--message":
      case "-m":
        options.message = args[++i];

        break;

      case "--type":
      case "-t":
        options.type = args[++i];

        break;

      case "--scope":
      case "-s":
        options.scope = args[++i];

        break;

      case "--no-push":
        options.push = false;

        break;

      // No default
    }
  }

  gitCommitAndPush(options).catch(console.error);
}

export { gitCommitAndPush };
