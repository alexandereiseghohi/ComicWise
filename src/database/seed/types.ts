/**
 * Enhanced Dynamic Seeding System - Core Types & Interfaces
 *
 * @module SeedTypes
 * @description Comprehensive type definitions for the dynamic seeding system
 */

import type { z } from "zod";

// ═══════════════════════════════════════════════════
// CORE SEED OPTIONS
// ═══════════════════════════════════════════════════

export interface SeedOptions {
  /** Batch size for bulk operations */
  batchSize?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Dry run mode (no actual inserts) */
  dryRun?: boolean;
  /** Skip Zod validation */
  skipValidation?: boolean;
  /** Skip image downloads */
  skipImageDownload?: boolean;
  /** Force overwrite existing records */
  forceOverwrite?: boolean;
  /** Transaction mode */
  useTransaction?: boolean;
}

// ═══════════════════════════════════════════════════
// SEED RESULT TRACKING
// ═══════════════════════════════════════════════════

export interface SeedResult {
  /** Records successfully inserted */
  inserted: number;
  /** Records successfully updated */
  updated: number;
  /** Records skipped (already exist) */
  skipped: number;
  /** Records with errors */
  errors: number;
  /** Execution duration in ms */
  duration: number;
  /** Detailed error messages */
  errorDetails?: Array<{ record: unknown; error: string }>;
}

// ═══════════════════════════════════════════════════
// DATA SOURCE CONFIGURATION
// ═══════════════════════════════════════════════════

export interface DataSourceConfig {
  /** Entity name (users, comics, chapters, etc.) */
  entity: string;
  /** JSON file paths (supports glob patterns) */
  sources: string[];
  /** Optional Zod schema for validation */
  schema?: z.ZodType<unknown>;
  /** Transformation function before seeding */
  transform?(data: unknown): unknown;
  /** Unique identifier field */
  uniqueField?: string;
}

// ═══════════════════════════════════════════════════
// SEEDER INTERFACE
// ═══════════════════════════════════════════════════

export interface ISeeder<T = unknown> {
  /** Entity name */
  readonly entity: string;

  /** Validate data against schema */
  validate(data: unknown[]): T[];

  /** Transform data if needed */
  transform(data: T[]): T[];

  /** Seed data to database */
  seed(data: T[], options?: SeedOptions): Promise<SeedResult>;

  /** Clear all data for this entity */
  clear(): Promise<void>;
}

// ═══════════════════════════════════════════════════
// CLI CONFIGURATION
// ═══════════════════════════════════════════════════

export interface CLIConfig {
  enabled: {
    users: boolean;
    comics: boolean;
    chapters: boolean;
    all: boolean;
  };
  options: SeedOptions;
  mode: "seed" | "clear" | "reset";
}

// ═══════════════════════════════════════════════════
// PROGRESS TRACKING
// ═══════════════════════════════════════════════════

export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  entity: string;
  operation: "validating" | "transforming" | "inserting" | "updating";
}

export type ProgressCallback = (info: ProgressInfo) => void;

// ═══════════════════════════════════════════════════
// VALIDATION ERROR
// ═══════════════════════════════════════════════════

export interface ValidationError {
  index: number;
  data: unknown;
  errors: z.ZodIssue[];
}

// ═══════════════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════════════

export type { z as ZodType };
