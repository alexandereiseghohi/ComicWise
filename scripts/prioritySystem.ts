#!/usr/bin/env node

/**
 * ComicWise Priority System Implementation
 * Implements P0-P3 priority levels with comprehensive task tracking,
 * execution workflow, and automated recovery
 *
 * Usage:
 *   pnpm priority               - List all tasks
 *   pnpm priority:list          - List all tasks
 *   pnpm priority:status        - Show completion status
 *   pnpm priority:run:p0        - Run P0 priority tasks
 *   pnpm priority:run:p1        - Run P1 priority tasks
 *   pnpm priority:run:p2        - Run P2 priority tasks
 *   pnpm priority:run:p3        - Run P3 priority tasks
 *   pnpm priority:complete      - Run all remaining tasks
 *
 * Environment Variables:
 *   SKIP_VALIDATION=1  - Skip acceptance criteria validation
 *   DRY_RUN=1         - Show commands without executing
 *   VERBOSE=1         - Detailed logging
 *   CONTINUE_ON_ERROR=1 - Continue even if a command fails
 */

import { execSync } from "child_process";

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

interface Task {
  id: string;
  name: string;
  description: string;
  commands: string[];
  acceptance: string[];
  priority: "P0" | "P1" | "P2" | "P3" | "Enhancement";
  estimatedHours: number;
  completed: boolean;
  dependsOn?: string[];
}

interface PriorityGroup {
  level: "P0" | "P1" | "P2" | "P3" | "Enhancement";
  name: string;
  description: string;
  icon: string;
  color: string;
  totalHours: number;
  tasks: Task[];
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIORITY SYSTEM CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const ENV = {
  skipValidation: process.env["SKIP_VALIDATION"] === "1",
  dryRun: process.env["DRY_RUN"] === "1",
  verbose: process.env["VERBOSE"] === "1",
  continueOnError: process.env["CONTINUE_ON_ERROR"] === "1",
};

const PRIORITY_SYSTEM: Record<string, PriorityGroup> = {
  P0: {
    level: "P0",
    name: "Immediate",
    description: "Blocking dev/build/test - Must complete first",
    icon: "🔴",
    color: "\x1B[31m", // Red
    totalHours: 3,
    tasks: [
      {
        id: "p0-1",
        name: "Repo Health & TypeScript Validation",
        description: "Ensure clean builds and type safety",
        priority: "P0",
        estimatedHours: 0.5,
        completed: false,
        commands: ["pnpm install", "pnpm type-check", "pnpm lint", "pnpm format:check"],
        acceptance: [
          "`pnpm type-check` passes (no errors)",
          "`pnpm lint` passes (no critical errors)",
          "`pnpm format:check` passes",
          "Build succeeds",
        ],
      },
      {
        id: "p0-2",
        name: "Database Setup & Schema",
        description: "Ensure database schema with Drizzle ORM is properly configured",
        priority: "P0",
        estimatedHours: 0.5,
        completed: false,
        dependsOn: ["p0-1"],
        commands: ["createdb comicwise || true", "pnpm db:push", "pnpm db:studio"],
        acceptance: [
          "`pnpm db:push` succeeds",
          "Migrations are clean",
          "Schema has slug fields on comics and chapters",
          "Indexes and constraints are proper",
        ],
      },
      {
        id: "p0-3",
        name: "Environment Variables & App Config",
        description: "Centralize and validate all environment variables",
        priority: "P0",
        estimatedHours: 1,
        completed: false,
        dependsOn: ["p0-1"],
        commands: [
          "cp .env.example .env.local",
          "pnpm type-check",
          "echo 'Edit .env.local with your configuration'",
        ],
        acceptance: [
          "All `process.env` imports from `app-config/index.ts`",
          "`app-config/index.ts` has Zod validation",
          "Fallbacks for development included",
          "Type exports available for TypeScript",
          "`.env.example` updated with all required variables",
        ],
      },
    ],
  },

  P1: {
    level: "P1",
    name: "High Priority",
    description: "Must complete before merge",
    icon: "🟠",
    color: "\x1B[33m", // Yellow
    totalHours: 9,
    tasks: [
      {
        id: "p1-1",
        name: "Auth Wiring (NextAuth v5 + Drizzle)",
        description: "Complete authentication setup with NextAuth and Drizzle adapter",
        priority: "P1",
        estimatedHours: 3,
        completed: false,
        dependsOn: ["p0-1", "p0-2", "p0-3"],
        commands: ["pnpm dev", "curl -X POST http://localhost:3000/api/auth/signin"],
        acceptance: [
          "`lib/authConfig.ts` has providers (email, Google, GitHub)",
          "`lib/auth.ts` has server-side helpers",
          "`app/api/auth/[...nextauth]/route.ts` is wired",
          "Nodemailer configured for email provider",
          "Sign-in/out flows work locally",
          "Email provider is functional",
        ],
      },
      {
        id: "p1-2",
        name: "Image Upload Integration",
        description: "Unified image upload with Cloudinary/ImageKit/Local support",
        priority: "P1",
        estimatedHours: 3,
        completed: false,
        dependsOn: ["p0-3"],
        commands: ["pnpm type-check", " Test image upload functionality"],
        acceptance: [
          "`lib/imageUpload.ts` exists with adapters",
          "Supports Cloudinary, ImageKit, and local filesystem",
          "`uploadImage()`, `deleteImage()`, `getOptimizedUrl()` functions work",
          "Admin components use the upload hook",
          "Transformation options (resize, format, quality) supported",
        ],
      },
      {
        id: "p1-3",
        name: "Database Seeding with Realistic Data",
        description: "Populate test database with sample data",
        priority: "P1",
        estimatedHours: 2,
        completed: false,
        dependsOn: ["p0-2"],
        commands: ["pnpm db:seed --dry-run", "pnpm db:seed --skip-images", "pnpm db:seed"],
        acceptance: [
          "`pnpm db:seed` populates all tables",
          "Supports flags: --dry-run, --skip-images, --verbose",
          "Idempotent (doesn't duplicate on re-runs)",
          "Logs progress and errors",
          "Uses faker for missing fields",
        ],
      },
    ],
  },

  P2: {
    level: "P2",
    name: "Medium Priority",
    description: "Important enhancements - after P0 & P1",
    icon: "🟡",
    color: "\x1B[36m", // Cyan
    totalHours: 15,
    tasks: [
      {
        id: "p2-1",
        name: "Advanced Email Notifications",
        description: "Workflow-based email notifications for user actions",
        priority: "P2",
        estimatedHours: 3,
        completed: false,
        dependsOn: ["p1-1"],
        commands: [" Verify email templates", " Test email workflow"],
        acceptance: [
          "Comic created/updated/deleted notifications work",
          "Chapter notifications implemented",
          "User registration confirmations sent",
          "Comment notifications functional",
          "Rate limiting configured",
          "Email queue system working",
        ],
      },
      {
        id: "p2-2",
        name: "Complete Admin Dashboard",
        description: "Finish admin CRUD pages and analytics",
        priority: "P2",
        estimatedHours: 8,
        completed: false,
        dependsOn: ["p1-1", "p1-2"],
        commands: [" Navigate to /admin", " Test CRUD operations"],
        acceptance: [
          "All entity management pages exist (genres, types, authors, artists)",
          "DataTable with search/sort/pagination",
          "Forms with Zod validation",
          "Server actions for CRUD",
          "Analytics dashboard with charts",
          "Advanced filtering available",
          "Bulk operations working",
        ],
      },
      {
        id: "p2-3",
        name: "Full-Text Search Implementation",
        description: "Enable powerful search across comics and chapters",
        priority: "P2",
        estimatedHours: 2,
        completed: false,
        dependsOn: ["p0-2"],
        commands: ["pnpm db:push", " Test search queries"],
        acceptance: [
          "PostgreSQL tsvector and plainto_tsquery used",
          "Results ranked by relevance",
          "Filter by genre, type, status",
          "API endpoint `/api/search?q=keyword` works",
          "UI search component integrated",
          "Performance optimized",
        ],
      },
      {
        id: "p2-4",
        name: "Performance Optimization",
        description: "Implement caching and query optimization",
        priority: "P2",
        estimatedHours: 2,
        completed: false,
        dependsOn: ["p0-2"],
        commands: ["pnpm build", " Monitor cache hit rates"],
        acceptance: [
          "Redis caching layer working (Upstash or local)",
          "Comic lists cached",
          "User profiles cached",
          "Cache invalidated on mutations",
          "Database queries optimized with indexes",
          "Image lazy loading implemented",
          "Bundle size optimized",
        ],
      },
    ],
  },

  P3: {
    level: "P3",
    name: "Low Priority",
    description: "Nice-to-have or future improvements",
    icon: "🟢",
    color: "\x1B[32m", // Green
    totalHours: 20,
    tasks: [
      {
        id: "p3-1",
        name: "Testing Suite",
        description: "Achieve 80%+ code coverage with unit and E2E tests",
        priority: "P3",
        estimatedHours: 8,
        completed: false,
        dependsOn: ["p0-1"],
        commands: ["pnpm test:unit", "pnpm test", "pnpm test:unit:coverage"],
        acceptance: [
          "80%+ code coverage achieved",
          "All server actions tested",
          "Validation schemas tested",
          "Utility functions tested",
          "E2E tests for critical flows",
          "CI integration tests passing",
        ],
      },
      {
        id: "p3-2",
        name: "CI/CD Pipeline",
        description: "Automate testing and deployment",
        priority: "P3",
        estimatedHours: 4,
        completed: false,
        dependsOn: ["p3-1"],
        commands: [" GitHub Actions workflow runs", " Tests pass on push/PR"],
        acceptance: [
          "`.github/workflows/ci.yml` created",
          "Type-check runs on CI",
          "Lint runs with no critical errors",
          "Tests run (unit and E2E)",
          "Build succeeds",
          "Artifacts uploaded",
          "Failing conditions set",
        ],
      },
      {
        id: "p3-3",
        name: "Docker & Deployment",
        description: "Production-ready containerization",
        priority: "P3",
        estimatedHours: 4,
        completed: false,
        dependsOn: ["p0-2"],
        commands: ["docker-compose up -d", "docker-compose -f docker-compose.dev.yml up"],
        acceptance: [
          "Multi-stage Dockerfile for Next.js",
          "Health checks configured",
          "Layer caching optimized",
          "PostgreSQL service working",
          "Redis service working",
          "docker-compose up starts all services",
          "Production build succeeds",
        ],
      },
      {
        id: "p3-4",
        name: "Documentation",
        description: "Complete project documentation",
        priority: "P3",
        estimatedHours: 4,
        completed: false,
        dependsOn: ["p0-1"],
        commands: [" Documentation review", " API docs generated"],
        acceptance: [
          "`docs/API.md` with endpoint reference",
          "`docs/DEPLOYMENT.md` with instructions",
          "`docs/COMPONENTS.md` with component usage",
          "README updated with feature matrix",
          "JSDoc comments on complex functions",
          "Storybook for UI components (optional)",
          "Troubleshooting guide complete",
        ],
      },
    ],
  },

  Enhancement: {
    level: "Enhancement",
    name: "Optional Improvements",
    description: "Future enhancements based on priority",
    icon: "💡",
    color: "\x1B[35m", // Magenta
    totalHours: 0,
    tasks: [
      {
        id: "enh-1",
        name: "Enhanced Admin Features",
        description: "Analytics, filtering, file manager, multi-step forms",
        priority: "Enhancement",
        estimatedHours: 0,
        completed: false,
        dependsOn: ["p2-2"],
        commands: [],
        acceptance: [
          "Analytics dashboard with charts",
          "Advanced filtering & bulk operations",
          "File manager UI for images",
          "Multi-step forms for complex entities",
          "Activity feed and audit logs",
        ],
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getAllTasks(): Task[] {
  return Object.values(PRIORITY_SYSTEM).flatMap((group) => group.tasks);
}

function getTaskById(id: string): Task | undefined {
  return getAllTasks().find((task) => task.id === id);
}

function canRunTask(task: Task, allTasks: Task[]): boolean {
  if (!task.dependsOn || task.dependsOn.length === 0) return true;
  return task.dependsOn.every((depId) => {
    const depTask = allTasks.find((t) => t.id === depId);
    return depTask?.completed;
  });
}

function colorText(text: string, color: string): string {
  return `${color}${text}\x1B[0m`;
}

function logVerbose(message: string): void {
  if (ENV.verbose) {
    console.log(colorText(`  [VERBOSE] ${message}`, "\x1B[90m"));
  }
}

function executeCommand(cmd: string): { success: boolean; output?: string } {
  logVerbose(`Executing: ${cmd}`);
  if (ENV.dryRun) {
    console.log(colorText(`   [DRY RUN] ${cmd}`, "\x1B[33m"));
    return { success: true };
  }
  try {
    const output = execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
    return { success: true, output };
  } catch (error) {
    if (ENV.continueOnError) {
      console.error(colorText(`   ⚠️  Command failed (continuing): ${cmd}`, "\x1B[33m"));
      return { success: false };
    }
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function listTasks(): void {
  console.log("\n" + colorText("═══════════════════════════════════════════════════", "\x1B[36m"));
  console.log(colorText("ComicWise Priority System - Task List", "\x1B[1m"));
  console.log(colorText("═══════════════════════════════════════════════════\n", "\x1B[36m"));

  const allTasks = getAllTasks();

  for (const [, group] of Object.entries(PRIORITY_SYSTEM)) {
    const completed = group.tasks.filter((t) => t.completed).length;
    const total = group.tasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    console.log(
      colorText(`\n${group.icon} ${group.level}: ${group.name}`, group.color + "\x1B[1m")
    );
    console.log(`   ${group.description}`);
    console.log(
      `   Progress: ${completed}/${total} (${progress}%) | Est. ${group.totalHours}h total\n`
    );

    for (const task of group.tasks) {
      const status = task.completed ? "✅" : "⭕";
      const depends = task.dependsOn ? ` [depends: ${task.dependsOn.join(", ")}]` : "";
      console.log(`   ${status} ${task.id}: ${task.name}${depends}`);
      console.log(`      ${task.description} (${task.estimatedHours}h)`);
    }
  }

  const totalCompleted = allTasks.filter((t) => t.completed).length;
  const totalTasks = allTasks.length;
  const totalProgress = Math.round((totalCompleted / totalTasks) * 100);

  console.log(
    colorText(
      `\n\n📊 OVERALL PROGRESS: ${totalCompleted}/${totalTasks} tasks (${totalProgress}%)`,
      "\x1B[33m\x1B[1m"
    )
  );
  console.log(colorText("═══════════════════════════════════════════════════\n", "\x1B[36m"));
}

function showStatus(): void {
  const allTasks = getAllTasks();
  const completed = allTasks.filter((t) => t.completed).length;
  const total = allTasks.length;

  console.log("\n" + colorText("Priority System Status", "\x1B[1m"));
  console.log(colorText("═══════════════════════════════════════════════════\n", "\x1B[36m"));

  for (const [, group] of Object.entries(PRIORITY_SYSTEM)) {
    const groupCompleted = group.tasks.filter((t) => t.completed).length;
    const groupTotal = group.tasks.length;
    const percent = groupTotal > 0 ? Math.round((groupCompleted / groupTotal) * 100) : 0;

    console.log(
      `${group.icon} ${group.level}: ${groupCompleted}/${groupTotal} (${percent}%) complete`
    );
  }

  console.log(
    colorText(
      `\n📊 TOTAL: ${completed}/${total} (${Math.round((completed / total) * 100)}%) complete`,
      "\x1B[33m"
    )
  );
  console.log(colorText("═══════════════════════════════════════════════════\n", "\x1B[36m"));

  if (ENV.dryRun) {
    console.log(colorText("⚠️  Running in DRY RUN mode - no commands executed", "\x1B[33m"));
  }
  if (ENV.continueOnError) {
    console.log(
      colorText("⚠️  Running with CONTINUE_ON_ERROR - will skip failed commands", "\x1B[33m")
    );
  }
}

function runTasks(priority: string): void {
  const group = PRIORITY_SYSTEM[priority];
  if (!group) {
    console.error(`❌ Invalid priority: ${priority}`);
    console.log("Valid priorities: P0, P1, P2, P3, Enhancement");
    process.exit(1);
  }

  const allTasks = getAllTasks();
  const readyTasks = group.tasks.filter((t) => !t.completed && canRunTask(t, allTasks));

  if (readyTasks.length === 0) {
    console.log(colorText(`\n✅ All ${group.level} tasks completed!`, "\x1B[32m"));
    return;
  }

  console.log(
    colorText(
      `\n\n${group.icon} Running ${group.level} tasks (${readyTasks.length} task(s))\n`,
      group.color + "\x1B[1m"
    )
  );

  let tasksFailed = 0;

  for (const task of readyTasks) {
    console.log(colorText(`\n▶️  ${task.name}`, group.color + "\x1B[1m"));
    console.log(`   ${task.description}\n`);

    logVerbose(`Running ${task.id}`);

    for (const cmd of task.commands) {
      console.log(colorText(`   $ ${cmd}`, "\x1B[90m"));
      const result = executeCommand(cmd);
      if (!result.success) {
        tasksFailed++;
        if (!ENV.continueOnError) {
          throw new Error(`Command failed: ${cmd}`);
        }
      }
      if (result.output && ENV.verbose) {
        console.log(result.output);
      }
    }

    console.log(colorText(`\n   Acceptance Criteria:`, "\x1B[36m"));
    for (const criterion of task.acceptance) {
      console.log(`   ☐ ${criterion}`);
    }

    if (!ENV.skipValidation && !ENV.dryRun) {
      console.log(
        colorText(
          `\n   ⏸️  Verify acceptance criteria above are met, then press Enter...`,
          "\x1B[33m"
        )
      );
      console.log(colorText(`      or set SKIP_VALIDATION=1 to auto-mark complete`, "\x1B[33m"));
    }

    task.completed = true;
    console.log(colorText(`   ✅ Task marked complete`, "\x1B[32m"));
  }

  if (tasksFailed > 0) {
    console.log(colorText(`\n⚠️  ${tasksFailed} task(s) had command failures`, "\x1B[33m"));
  }

  console.log(colorText("\n✅ Priority level tasks completed!", "\x1B[32m\x1B[1m"));
}

function completeTask(taskId: string): void {
  const task = getTaskById(taskId);
  if (!task) {
    console.error(`❌ Task not found: ${taskId}`);
    process.exit(1);
  }

  task.completed = true;
  const allTasks = getAllTasks();
  const completed = allTasks.filter((t) => t.completed).length;
  const total = allTasks.length;

  console.log(colorText(`\n✅ Task marked complete: ${taskId}`, "\x1B[32m\x1B[1m"));
  console.log(`📊 Progress: ${completed}/${total} (${Math.round((completed / total) * 100)}%)\n`);
  console.log(
    colorText("Note: Progress is tracked in-memory. For persistent tracking,", "\x1B[90m")
  );
  console.log(
    colorText("update PRIORITY_SYSTEM_CHECKLIST.md manually or use git tracking.", "\x1B[90m\n")
  );
}

function completeAllRemaining(): void {
  const allTasks = getAllTasks();
  const remaining = allTasks.filter((t) => !t.completed);

  if (remaining.length === 0) {
    console.log(colorText("\n✅ All tasks already completed!", "\x1B[32m\x1B[1m"));
    return;
  }

  console.log(
    colorText(`\n\n🚀 Running ALL REMAINING TASKS (${remaining.length} tasks)\n`, "\x1B[35m\x1B[1m")
  );

  const groups = ["P0", "P1", "P2", "P3", "Enhancement"];
  for (const priority of groups) {
    const group = PRIORITY_SYSTEM[priority];
    if (!group) continue;

    const tasksToRun = group.tasks.filter((t) => !t.completed);
    if (tasksToRun.length === 0) continue;

    console.log(
      colorText(
        `\n\n${group.icon} ${group.level} (${tasksToRun.length} task(s))`,
        group.color + "\x1B[1m"
      )
    );
    runTasks(priority);
  }

  showStatus();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENTRYPOINT
// ═══════════════════════════════════════════════════════════════════════════

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0] || "list";

  switch (command.toLowerCase()) {
    case "list":
      listTasks();
      break;
    case "status":
      showStatus();
      break;
    case "run": {
      const priority = args[1];
      if (!priority) {
        console.error("❌ Priority level required: p0, p1, p2, p3, or enhancement");
        process.exit(1);
      }
      runTasks(priority.toUpperCase());
      break;
    }
    case "complete": {
      const taskId = args[1];
      if (!taskId) {
        completeAllRemaining();
      } else {
        completeTask(taskId);
      }
      break;
    }
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log("\nUsage: pnpm priority [command] [options]");
      console.log("\nCommands:");
      console.log("  list                - List all tasks by priority");
      console.log("  status              - Show status of all priorities");
      console.log("  run <priority>      - Run tasks for a priority level");
      console.log("  complete [task-id]  - Mark a task complete or run all remaining");
      console.log("\nEnvironment Variables:");
      console.log("  SKIP_VALIDATION=1   - Skip acceptance criteria validation");
      console.log("  DRY_RUN=1          - Show commands without executing");
      console.log("  VERBOSE=1          - Detailed logging");
      console.log("  CONTINUE_ON_ERROR=1 - Continue even if a command fails");
      process.exit(1);
  }
}

main();
