/**
 * Phase Automation System - Type Definitions
 * Provides type safety for phase execution, verification, and tracking
 */

export type PhaseStatus = "pending" | "in-progress" | "completed" | "failed" | "skipped";

export interface Task {
  id: string;
  name: string;
  description?: string;
  execute(): Promise<void>;
  rollback?(): Promise<void>;
}

export interface Verification {
  id: string;
  name: string;
  check(): Promise<boolean>;
  errorMessage?: string;
}

export interface PhaseConfig {
  id: number;
  name: string;
  description: string;
  dependencies: number[];
  tasks: Task[];
  verifications?: Verification[];
}

export interface TaskResult {
  taskId: string;
  name: string;
  status: "success" | "failed" | "skipped";
  duration: number;
  error?: string;
}

export interface PhaseResult {
  phaseId: number;
  phaseName: string;
  status: PhaseStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tasks: TaskResult[];
  verificationsPassed: boolean;
  score: number;
  errors: string[];
}

export interface PhaseProgress {
  version: string;
  lastUpdated: Date;
  phases: Record<number, PhaseProgressItem>;
}

export interface PhaseProgressItem {
  status: PhaseStatus;
  startedAt?: Date;
  completedAt?: Date;
  score: number;
  tasks: Record<string, PhaseStatus>;
  errors?: string[];
}

export interface RunOptions {
  dryRun?: boolean;
  verbose?: boolean;
  skipCompleted?: boolean;
  force?: boolean;
  startPhase?: number;
  endPhase?: number;
}

export interface VerificationResult {
  phaseId: number;
  phaseName: string;
  completed: boolean;
  completedTasks: string[];
  pendingTasks: string[];
  blockers: string[];
  score: number;
  timestamp: Date;
}

export interface FullReport {
  timestamp: Date;
  totalPhases: number;
  completedPhases: number;
  totalScore: number;
  averageScore: number;
  phases: VerificationResult[];
  criticalBlockers: string[];
  nextSteps: string[];
}
