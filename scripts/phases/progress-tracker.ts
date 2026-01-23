/**
 * Phase Automation System - Progress Tracker
 * Manages persistence of phase completion state across executions
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { PhaseProgress, PhaseStatus } from "./types";

const PROGRESS_FILE = join(process.cwd(), ".phases-progress.json");

export class ProgressTracker {
  private progress: PhaseProgress;

  constructor() {
    this.progress = this.loadProgress();
  }

  private loadProgress(): PhaseProgress {
    if (existsSync(PROGRESS_FILE)) {
      try {
        const data = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
        return data;
      } catch {
        console.warn("⚠️ Failed to load progress file, starting fresh");
      }
    }

    // Initialize empty progress
    return {
      version: "1.0.0",
      lastUpdated: new Date(),
      phases: Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => [
          i + 1,
          {
            status: "pending",
            score: 0,
            tasks: {},
          },
        ])
      ),
    };
  }

  private saveProgress() {
    this.progress.lastUpdated = new Date();
    writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2), "utf-8");
  }

  getPhaseStatus(phaseId: number): PhaseStatus {
    return this.progress.phases[phaseId]?.status || "pending";
  }

  isPhaseCompleted(phaseId: number): boolean {
    const status = this.progress.phases[phaseId]?.status;
    return status === "completed" || status === "skipped";
  }

  setPhaseStatus(phaseId: number, status: PhaseStatus) {
    if (!this.progress.phases[phaseId]) {
      this.progress.phases[phaseId] = {
        status: "pending",
        score: 0,
        tasks: {},
      };
    }

    this.progress.phases[phaseId].status = status;

    if (status === "in-progress") {
      this.progress.phases[phaseId].startedAt = new Date();
    } else if (status === "completed") {
      this.progress.phases[phaseId].completedAt = new Date();
    }

    this.saveProgress();
  }

  setTaskStatus(phaseId: number, taskId: string, status: PhaseStatus) {
    if (!this.progress.phases[phaseId]) {
      this.progress.phases[phaseId] = {
        status: "pending",
        score: 0,
        tasks: {},
      };
    }

    this.progress.phases[phaseId].tasks[taskId] = status;
    this.saveProgress();
  }

  setPhaseScore(phaseId: number, score: number) {
    if (!this.progress.phases[phaseId]) {
      this.progress.phases[phaseId] = {
        status: "pending",
        score: 0,
        tasks: {},
      };
    }

    this.progress.phases[phaseId].score = Math.min(100, Math.max(0, score));
    this.saveProgress();
  }

  addPhaseError(phaseId: number, error: string) {
    if (!this.progress.phases[phaseId]) {
      this.progress.phases[phaseId] = {
        status: "pending",
        score: 0,
        tasks: {},
      };
    }

    if (!this.progress.phases[phaseId].errors) {
      this.progress.phases[phaseId].errors = [];
    }

    this.progress.phases[phaseId].errors.push(error);
    this.saveProgress();
  }

  getProgress(): PhaseProgress {
    return JSON.parse(JSON.stringify(this.progress));
  }

  getCompletedPhaseCount(): number {
    return Object.values(this.progress.phases).filter((p) => p.status === "completed").length;
  }

  getTotalScore(): number {
    const scores = Object.values(this.progress.phases).map((p) => p.score);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  reset() {
    this.progress = {
      version: "1.0.0",
      lastUpdated: new Date(),
      phases: Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => [
          i + 1,
          {
            status: "pending",
            score: 0,
            tasks: {},
          },
        ])
      ),
    };
    this.saveProgress();
  }

  resetPhase(phaseId: number) {
    this.progress.phases[phaseId] = {
      status: "pending",
      score: 0,
      tasks: {},
    };
    this.saveProgress();
  }
}

export const progressTracker = new ProgressTracker();
