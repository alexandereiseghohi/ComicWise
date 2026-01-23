#!/usr/bin/env node

/**
 * Phase Automation CLI
 * Master orchestration tool for 9-phase project completion system
 *
 * Usage:
 *   pnpm phases:run              - Run all phases
 *   pnpm phases:run:1            - Run phase 1
 *   pnpm phases:verify           - Verify all phases
 *   pnpm phases:status           - Show status of all phases
 *   pnpm phases:report           - Generate completion report
 */

import { Command } from "commander";
import { logger } from "./logger";
import { phase1Config } from "./phase-1-vscode";
import { phase2Config } from "./phase-2-environment";
import { phase3Config } from "./phase-3-database";
import { phase4Config } from "./phase-4-frontend";
import { phase5Config } from "./phase-5-scripts";
import { phase6Config } from "./phase-6-cicd";
import { phase7Config } from "./phase-7-documentation";
import { phase8Config } from "./phase-8-testing";
import { phase9Config } from "./phase-9-optional";
import { PhaseRunner } from "./phase-runner-core";
import { progressTracker } from "./progress-tracker";

const program = new Command();
const runner = new PhaseRunner();

// Register all phases
[
  phase1Config,
  phase2Config,
  phase3Config,
  phase4Config,
  phase5Config,
  phase6Config,
  phase7Config,
  phase8Config,
  phase9Config,
].forEach((config) => {
  runner.registerPhase(config);
});

program.name("phase-runner").description("ComicWise Phase Automation System").version("1.0.0");

/**
 * Run all phases or specific phase range
 */
program
  .command("run-all")
  .description("Run all phases sequentially")
  .option("--dry-run", "Preview changes without applying")
  .option("--skip-completed", "Skip already completed phases")
  .option("--force", "Force re-run of completed phases")
  .option("--verbose", "Verbose logging")
  .option("--start-phase <number>", "Start from specific phase (1-9)", "1")
  .option("--end-phase <number>", "End at specific phase (1-9)", "9")
  .action(async (options) => {
    try {
      const results = await runner.runAllPhases({
        dryRun: options.dryRun,
        skipCompleted: options.skipCompleted,
        force: options.force,
        verbose: options.verbose,
        startPhase: Number.parseInt(options.startPhase),
        endPhase: Number.parseInt(options.endPhase),
      });

      runner.printSummary(results);

      // Exit with error code if any phase failed
      const failedPhases = [...results.values()].filter((r) => r.status === "failed");
      if (failedPhases.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      logger.error(String(error));
      process.exit(1);
    }
  });

/**
 * Run specific phase
 */
program
  .command("run-phase <phaseId>")
  .description("Run a specific phase")
  .option("--dry-run", "Preview changes without applying")
  .option("--force", "Ignore dependency checks")
  .option("--verbose", "Verbose logging")
  .action(async (phaseId, options) => {
    try {
      const id = Number.parseInt(phaseId);
      if (isNaN(id) || id < 1 || id > 9) {
        throw new Error("Phase ID must be between 1 and 9");
      }

      const result = await runner.runPhase(id, {
        dryRun: options.dryRun,
        force: options.force,
        verbose: options.verbose,
      });

      logger.header(`Phase ${id} Result`);
      logger.info(`Status: ${result.status}`);
      logger.info(`Score: ${result.score}%`);
      logger.info(
        `Tasks: ${result.tasks.filter((t) => t.status === "success").length}/${result.tasks.length}`
      );

      if (result.status === "failed") {
        logger.error("Phase execution failed");
        process.exit(1);
      }
    } catch (error) {
      logger.error(String(error));
      process.exit(1);
    }
  });

/**
 * Show status of all phases
 */
program
  .command("status")
  .description("Show completion status of all phases")
  .action(() => {
    logger.header("PHASE STATUS");

    const progress = progressTracker.getProgress();
    const data = Object.entries(progress.phases).map(([id, phase]) => ({
      Phase: `Phase ${id}`,
      Status: phase.status,
      Score: `${phase.score}%`,
      Tasks: Object.keys(phase.tasks).length,
      Started: phase.startedAt ? new Date(phase.startedAt).toLocaleString() : "-",
      Completed: phase.completedAt ? new Date(phase.completedAt).toLocaleString() : "-",
    }));

    logger.table(data);

    const completed = Object.values(progress.phases).filter((p) => p.status === "completed").length;
    const total = Object.keys(progress.phases).length;
    const avgScore = Math.round(
      Object.values(progress.phases).reduce((sum, p) => sum + p.score, 0) / total
    );

    logger.section("Summary");
    logger.info(`✅ Completed: ${completed}/${total} phases`);
    logger.info(`📊 Average Score: ${avgScore}%`);
    logger.info(`📅 Last Updated: ${new Date(progress.lastUpdated).toLocaleString()}`);
    logger.newline();
  });

/**
 * Generate completion report
 */
program
  .command("report")
  .description("Generate comprehensive completion report")
  .option("--format <format>", "Report format (console, json, markdown)", "console")
  .action((options) => {
    logger.header("COMPLETION REPORT");

    const progress = progressTracker.getProgress();
    const completed = Object.values(progress.phases).filter((p) => p.status === "completed").length;
    const total = Object.keys(progress.phases).length;
    const avgScore = Math.round(
      Object.values(progress.phases).reduce((sum, p) => sum + p.score, 0) / total
    );

    if (options.format === "json") {
      console.log(JSON.stringify(progress, null, 2));
    } else {
      logger.section("Project Completion Status");
      logger.info(
        `Overall Progress: ${completed}/${total} phases (${Math.round((completed / total) * 100)}%)`
      );
      logger.info(`Average Quality Score: ${avgScore}%`);
      logger.info(`Last Updated: ${new Date(progress.lastUpdated).toLocaleString()}`);
      logger.newline();

      logger.section("Phase Details");
      Object.entries(progress.phases).forEach(([id, phase]) => {
        const statusEmoji =
          phase.status === "completed"
            ? "✅"
            : phase.status === "in-progress"
              ? "🔄"
              : phase.status === "failed"
                ? "❌"
                : "⏳";

        logger.info(`${statusEmoji} Phase ${id}: ${phase.status.toUpperCase()} (${phase.score}%)`);
      });

      logger.newline();
    }
  });

/**
 * Reset progress
 */
program
  .command("reset")
  .description("Reset progress tracking")
  .option("--phase <number>", "Reset specific phase only")
  .action((options) => {
    if (options.phase) {
      const phaseId = Number.parseInt(options.phase);
      progressTracker.resetPhase(phaseId);
      logger.success(`Phase ${phaseId} progress reset`);
    } else {
      progressTracker.reset();
      logger.success("All phase progress reset");
    }
  });

/**
 * Verify phases
 */
program
  .command("verify")
  .description("Verify phase completion status")
  .option("--phase <number>", "Verify specific phase only")
  .action((options) => {
    logger.header("PHASE VERIFICATION");

    const progress = progressTracker.getProgress();

    if (options.phase) {
      const phaseId = Number.parseInt(options.phase);
      const phase = progress.phases[phaseId];
      if (!phase) {
        logger.error(`Phase ${phaseId} not found`);
        return;
      }

      logger.info(`Phase ${phaseId}:`);
      logger.info(`  Status: ${phase.status}`);
      logger.info(`  Score: ${phase.score}%`);
      logger.info(`  Tasks: ${Object.keys(phase.tasks).length}`);
      if (phase.errors) {
        logger.warn(`  Errors: ${phase.errors.length}`);
        phase.errors.forEach((error) => {
          logger.error(`    - ${error}`);
        });
      }
    } else {
      Object.entries(progress.phases).forEach(([id, phase]) => {
        const statusEmoji =
          phase.status === "completed" ? "✅" : phase.status === "failed" ? "❌" : "⏳";
        logger.info(`${statusEmoji} Phase ${id}: ${phase.status} (${phase.score}%)`);
      });
    }

    logger.newline();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
