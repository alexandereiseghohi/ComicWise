/**
 * Phase Automation System - Core Runner
 * Orchestrates phase execution with dependency checking, progress tracking, and error recovery
 */

import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "./logger";
import { progressTracker } from "./progress-tracker";
import type { PhaseConfig, PhaseResult, RunOptions, TaskResult } from "./types";

const execAsync = promisify(exec);

export class PhaseRunner {
  private phases: Map<number, PhaseConfig> = new Map();
  private phaseResults: Map<number, PhaseResult> = new Map();

  registerPhase(config: PhaseConfig) {
    this.phases.set(config.id, config);
  }

  /**
   * Check if phase dependencies are met
   * @param phaseId
   */
  private async checkDependencies(phaseId: number): Promise<boolean> {
    const phase = this.phases.get(phaseId);
    if (!phase) return false;

    for (const depId of phase.dependencies) {
      const depStatus = progressTracker.getPhaseStatus(depId);
      if (depStatus !== "completed" && depStatus !== "skipped") {
        logger.error(
          `Phase ${phaseId} depends on Phase ${depId}, which is ${depStatus} (not completed)`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Execute a single task within a phase
   * @param phaseId
   * @param task
   * @param dryRun
   */
  private async executeTask(
    phaseId: number,
    task: any,
    dryRun: boolean = false
  ): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      logger.pending(`Executing: ${task.name}`);

      if (!dryRun) {
        await task.execute();
      } else {
        logger.info(`[DRY RUN] ${task.name}`);
      }

      const duration = Date.now() - startTime;
      logger.success(`${task.name} (${duration}ms)`);

      progressTracker.setTaskStatus(phaseId, task.id, "completed");

      return {
        taskId: task.id,
        name: task.name,
        status: "success",
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      logger.error(`${task.name} failed: ${errorMsg}`);
      progressTracker.setTaskStatus(phaseId, task.id, "failed");
      progressTracker.addPhaseError(phaseId, errorMsg);

      return {
        taskId: task.id,
        name: task.name,
        status: "failed",
        duration,
        error: errorMsg,
      };
    }
  }

  /**
   * Run verification checks for a phase
   * @param phaseId
   */
  private async verifyPhase(phaseId: number): Promise<boolean> {
    const phase = this.phases.get(phaseId);
    if (!phase?.verifications || phase.verifications.length === 0) {
      return true;
    }

    logger.section(`Verifying Phase ${phaseId}: ${phase.name}`);

    let allPassed = true;

    for (const verification of phase.verifications) {
      try {
        const passed = await verification.check();
        if (passed) {
          logger.success(`✓ ${verification.name}`);
        } else {
          logger.error(`✗ ${verification.name}`);
          if (verification.errorMessage) {
            logger.error(`  ${verification.errorMessage}`);
          }
          allPassed = false;
        }
      } catch (error) {
        logger.error(`✗ ${verification.name}: ${String(error)}`);
        allPassed = false;
      }
    }

    return allPassed;
  }

  /**
   * Run a single phase
   * @param phaseId
   * @param options
   */
  async runPhase(phaseId: number, options: RunOptions = {}): Promise<PhaseResult> {
    const phase = this.phases.get(phaseId);

    if (!phase) {
      throw new Error(`Phase ${phaseId} not registered`);
    }

    logger.header(`PHASE ${phaseId}: ${phase.name}`);
    logger.info(phase.description);
    logger.newline();

    const startTime = new Date();

    // Check if should skip
    if (options.skipCompleted && progressTracker.isPhaseCompleted(phaseId)) {
      logger.info(`Phase ${phaseId} already completed, skipping...`);
      progressTracker.setPhaseStatus(phaseId, "skipped");

      const phaseProgress = progressTracker.getProgress().phases[phaseId];

      return {
        phaseId,
        phaseName: phase.name,
        status: "skipped",
        startTime,
        endTime: new Date(),
        duration: 0,
        tasks: [],
        verificationsPassed: true,
        score: phaseProgress?.score ?? 0,
        errors: [],
      };
    }

    // Check dependencies
    const depsOk = await this.checkDependencies(phaseId);
    if (!depsOk && !options.force) {
      logger.error(`Phase ${phaseId} dependencies not met, skipping...`);

      return {
        phaseId,
        phaseName: phase.name,
        status: "failed",
        startTime,
        endTime: new Date(),
        duration: Date.now() - startTime.getTime(),
        tasks: [],
        verificationsPassed: false,
        score: 0,
        errors: ["Dependency check failed"],
      };
    }

    // Mark as in progress
    progressTracker.setPhaseStatus(phaseId, "in-progress");

    // Execute tasks
    const taskResults: TaskResult[] = [];
    let hasErrors = false;

    for (const task of phase.tasks) {
      const result = await this.executeTask(phaseId, task, options.dryRun);
      taskResults.push(result);

      if (result.status === "failed") {
        hasErrors = true;
        // Continue executing other tasks for better diagnostics
      }
    }

    // Run verifications
    const verificationsOk = await this.verifyPhase(phaseId);

    // Calculate score
    const completedTasks = taskResults.filter((t) => t.status === "success").length;
    const score = Math.round((completedTasks / Math.max(1, phase.tasks.length)) * 100);
    progressTracker.setPhaseScore(phaseId, score);

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    const status = hasErrors ? "failed" : verificationsOk ? "completed" : "failed";

    progressTracker.setPhaseStatus(phaseId, status);

    const phaseProgress = progressTracker.getProgress().phases[phaseId];
    const result: PhaseResult = {
      phaseId,
      phaseName: phase.name,
      status,
      startTime,
      endTime,
      duration,
      tasks: taskResults,
      verificationsPassed: verificationsOk,
      score,
      errors: phaseProgress?.errors || [],
    };

    this.phaseResults.set(phaseId, result);

    // Summary
    logger.newline();
    if (status === "completed") {
      logger.success(
        `Phase ${phaseId} completed successfully (${taskResults.length}/${phase.tasks.length} tasks, ${score}%)`
      );
    } else {
      logger.error(
        `Phase ${phaseId} completed with errors (${completedTasks}/${phase.tasks.length} tasks, ${score}%)`
      );
    }

    return result;
  }

  /**
   * Run multiple phases sequentially
   * @param phaseIds
   * @param options
   */
  async runPhases(phaseIds: number[], options: RunOptions = {}): Promise<Map<number, PhaseResult>> {
    logger.header("PHASE AUTOMATION SYSTEM");
    logger.info(`Running phases: ${phaseIds.join(", ")}`);
    if (options.dryRun) {
      logger.warn("DRY RUN MODE - No changes will be made");
    }
    logger.newline();

    const results = new Map<number, PhaseResult>();

    for (const phaseId of phaseIds) {
      const result = await this.runPhase(phaseId, options);
      results.set(phaseId, result);

      // Stop if phase failed and not forcing
      if (result.status === "failed" && !options.force) {
        logger.error(`Phase ${phaseId} failed, stopping execution`);
        break;
      }
    }

    return results;
  }

  /**
   * Run all phases
   * @param options
   */
  async runAllPhases(options: RunOptions = {}): Promise<Map<number, PhaseResult>> {
    const allPhaseIds = [...this.phases.keys()].sort((a, b) => a - b);
    const startPhase = options.startPhase || 1;
    const endPhase = options.endPhase || 9;

    const phaseIds = allPhaseIds.filter((id) => id >= startPhase && id <= endPhase);

    return this.runPhases(phaseIds, options);
  }

  /**
   * Get results summary
   */
  getResults(): Map<number, PhaseResult> {
    return this.phaseResults;
  }

  /**
   * Print summary report
   * @param results
   */
  printSummary(results: Map<number, PhaseResult>) {
    logger.header("EXECUTION SUMMARY");

    const data = [...results.values()].map((r) => ({
      Phase: `Phase ${r.phaseId}`,
      Name: r.phaseName,
      Status: r.status === "completed" ? "✅" : r.status === "skipped" ? "⏭️" : "❌",
      Score: `${r.score}%`,
      Duration: `${(r.duration! / 1000).toFixed(2)}s`,
      Tasks: `${r.tasks.filter((t) => t.status === "success").length}/${r.tasks.length}`,
    }));

    logger.table(data);

    // Summary stats
    const completed = [...results.values()].filter((r) => r.status === "completed").length;
    const failed = [...results.values()].filter((r) => r.status === "failed").length;
    const skipped = [...results.values()].filter((r) => r.status === "skipped").length;
    const avgScore = [...results.values()].reduce((sum, r) => sum + r.score, 0) / results.size;

    logger.divider();
    logger.info(`✅ Completed: ${completed}`);
    logger.info(`❌ Failed: ${failed}`);
    logger.info(`⏭️ Skipped: ${skipped}`);
    logger.info(`📊 Average Score: ${Math.round(avgScore)}%`);
    logger.newline();

    // Errors
    const allErrors = [...results.values()].flatMap((r) => r.errors).filter(Boolean);

    if (allErrors.length > 0) {
      logger.section("Errors");
      allErrors.forEach((error) => {
        logger.error(`• ${error}`);
      });
      logger.newline();
    }

    // Next steps
    const pendingPhases = [...results.values()]
      .filter((r) => r.status === "failed" || r.status === "skipped")
      .map((r) => r.phaseId);

    if (pendingPhases.length > 0) {
      logger.section("Next Steps");
      logger.info(
        `Re-run failed phases with: pnpm phases:run --start-phase=${Math.min(...pendingPhases)}`
      );
      logger.info("Or run with --force to ignore dependency checks");
      logger.newline();
    }
  }
}

export const phaseRunner = new PhaseRunner();
