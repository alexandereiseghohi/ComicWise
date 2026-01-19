/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Progress Tracker - Track and Display Seeding Progress
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from "@/database/seed/logger";

export class ProgressTracker {
  private total: number;
  private current: number;
  private startTime: number;
  private taskName: string;
  private successCount: number;
  private errorCount: number;

  constructor(taskName: string, total: number) {
    this.taskName = taskName;
    this.total = total;
    this.current = 0;
    this.startTime = Date.now();
    this.successCount = 0;
    this.errorCount = 0;
  }

  increment(success = true) {
    this.current++;
    if (success) {
      this.successCount++;
    } else {
      this.errorCount++;
    }

    if (this.current % 10 === 0 || this.current === this.total) {
      this.logProgress();
    }
  }

  private logProgress() {
    const percentage = ((this.current / this.total) * 100).toFixed(1);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const rate = ((this.current / (Date.now() - this.startTime)) * 1000).toFixed(1);

    logger.info(
      `${this.taskName}: ${this.current}/${this.total} (${percentage}%) | ` +
        `✓ ${this.successCount} | ✗ ${this.errorCount} | ` +
        `${elapsed}s | ${rate}/s`
    );
  }

  complete() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    logger.success(
      `${this.taskName} complete: ${this.successCount} succeeded, ${this.errorCount} failed in ${duration}s`
    );

    return {
      total: this.total,
      success: this.successCount,
      errors: this.errorCount,
      duration: Number.parseFloat(duration),
    };
  }
}
