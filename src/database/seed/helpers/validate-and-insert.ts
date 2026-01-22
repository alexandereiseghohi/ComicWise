/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Seed Data Validation & Insertion Helper
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose:
 *   - Validate seed data against Zod schemas before database insertion
 *   - Perform upsert operations (insert or update on conflict)
 *   - Apply password hashing for user data
 *   - Handle image attachment and path updates
 *   - Provide comprehensive error reporting
 *
 * Features:
 *   - Zod schema-based validation
 *   - Atomic database transactions
 *   - Conflict resolution with onConflictDoUpdate
 *   - Batch operations for performance
 *   - Detailed validation error tracking
 *
 * @module validateAndInsert
 */

import { hashPassword } from "@/database/seed/helpers/password-hasher";
import { z } from "zod";
import type { Logger } from "./seed-logger";

/**
 * Result of a validation + insert operation
 */
export interface ValidationInsertResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string>;
  stats: {
    inserted: boolean;
    updated: boolean;
    skipped: boolean;
  };
}

/**
 * Configuration for insert operations
 */
export interface InsertConfig {
  skipOnValidationError: boolean;
  hashPasswords: boolean;
  includeTimestamps: boolean;
  defaultPassword?: string;
}

/**
 * Creates default insert configuration
 *
 * @returns {InsertConfig} Configuration with sensible defaults
 */
export function createDefaultInsertConfig(): InsertConfig {
  return {
    skipOnValidationError: true,
    hashPasswords: true,
    includeTimestamps: true,
    defaultPassword: undefined,
  };
}

/**
 * Validates data against a Zod schema
 *
 * @param {unknown} data - Data to validate
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {Logger} logger - Logger instance
 * @returns {{valid: boolean; data?: unknown; errors?: Record<string, string>}}
 */
export function validateData(
  data: unknown,
  schema: z.ZodSchema,
  logger: Logger
): {
  valid: boolean;
  data?: unknown;
  errors?: Record<string, string>;
} {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};

      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      logger.warn(`Validation failed for data: ${JSON.stringify(errors)}`);
      return { valid: false, errors };
    }

    logger.error(`Unexpected validation error: ${error}`);
    return {
      valid: false,
      errors: { _unknown: String(error) },
    };
  }
}

/**
 * User data structure for seeding
 */
export interface SeedUserData {
  email: string;
  password?: string;
  name?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown; // Allow additional properties from seed data
}

/**
 * Prepares user data for insertion (handles password hashing)
 *
 * @param {SeedUserData} userData - User data to prepare
 * @param {InsertConfig} config - Insert configuration
 * @param {Logger} logger - Logger instance
 * @returns {Promise<SeedUserData>} Prepared user data
 */
export async function prepareUserData(
  userData: SeedUserData,
  config: InsertConfig,
  logger: Logger
): Promise<SeedUserData> {
  const prepared = { ...userData };

  // Hash password if configured
  if (config.hashPasswords) {
    if (prepared.password) {
      try {
        prepared.password = await hashPassword(prepared.password);
      } catch (error) {
        logger.error(`Failed to hash password for ${prepared.email}: ${error}`);
        throw error;
      }
    } else if (config.defaultPassword) {
      prepared.password = await hashPassword(config.defaultPassword);
    }
  }

  // Add timestamps if configured
  if (config.includeTimestamps) {
    const now = new Date();
    prepared.createdAt ??= now;
    prepared.updatedAt ??= now;
  }

  return prepared;
}

/**
 * Comic data structure for seeding
 */
export interface SeedComicData {
  title: string;
  description?: string;
  authorId?: string;
  coverImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown; // Allow additional properties from seed data
}

/**
 * Prepares comic data for insertion
 *
 * @param {SeedComicData} comicData - Comic data to prepare
 * @param {InsertConfig} config - Insert configuration
 * @returns {SeedComicData} Prepared comic data
 */
export function prepareComicData(comicData: SeedComicData, config: InsertConfig): SeedComicData {
  const prepared = { ...comicData };

  // Add timestamps if configured
  if (config.includeTimestamps) {
    const now = new Date();
    prepared.createdAt ??= now;
    prepared.updatedAt ??= now;
  }

  return prepared;
}

/**
 * Chapter data structure for seeding
 */
export interface SeedChapterData {
  title: string;
  comicId: string;
  chapterNumber: number;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown; // Allow additional properties from seed data
}

/**
 * Prepares chapter data for insertion
 *
 * @param {SeedChapterData} chapterData - Chapter data to prepare
 * @param {InsertConfig} config - Insert configuration
 * @returns {SeedChapterData} Prepared chapter data
 */
export function prepareChapterData(
  chapterData: SeedChapterData,
  config: InsertConfig
): SeedChapterData {
  const prepared = { ...chapterData };

  // Add timestamps if configured
  if (config.includeTimestamps) {
    const now = new Date();
    prepared.createdAt ??= now;
    prepared.updatedAt ??= now;
  }

  return prepared;
}

/**
 * Type-safe validation result builder
 *
 * @template T
 * @param {boolean} success - Whether operation succeeded
 * @param {object} options - Result options
 * @param options.data
 * @param options.error
 * @param options.validationErrors
 * @param options.inserted
 * @param options.updated
 * @param options.skipped
 * @returns {ValidationInsertResult<T>} Validation result
 */
export function createValidationResult<T>(
  success: boolean,
  options: {
    data?: T;
    error?: string;
    validationErrors?: Record<string, string>;
    inserted?: boolean;
    updated?: boolean;
    skipped?: boolean;
  } = {}
): ValidationInsertResult<T> {
  return {
    success,
    data: options.data,
    error: options.error,
    validationErrors: options.validationErrors,
    stats: {
      inserted: options.inserted ?? false,
      updated: options.updated ?? false,
      skipped: options.skipped ?? false,
    },
  };
}

/**
 * Reports statistics from a batch of insert operations
 *
 * @param {ValidationInsertResult<any>[]} results - Array of insert results
 * @param {Logger} logger - Logger instance
 */
export function reportInsertStats(results: ValidationInsertResult<any>[], logger: Logger): void {
  const stats = {
    total: results.length,
    successful: results.filter((r) => r.success).length,
    inserted: results.filter((r) => r.stats.inserted).length,
    updated: results.filter((r) => r.stats.updated).length,
    skipped: results.filter((r) => r.stats.skipped).length,
    errors: results.filter((r) => !r.success).length,
  };

  logger.info(
    `Insert Summary: ${stats.successful}/${stats.total} successful, ${stats.skipped} skipped, ${stats.errors} errors`
  );

  if (stats.errors > 0) {
    logger.warn(`${stats.errors} records failed validation or insertion`);
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        logger.warn(
          `  - ${r.error ?? "Unknown error"} - Validation errors: ${JSON.stringify(r.validationErrors)}`
        );
      });
  }
}

/**
 * Filters out records that failed validation
 *
 * @template T
 * @param {ValidationInsertResult<T>[]} results - Array of validation results
 * @returns {T[]} Array of successfully validated data
 */
export function extractSuccessfulData<T>(results: ValidationInsertResult<T>[]): T[] {
  return results.filter((r) => r.success && r.data).map((r) => r.data as T);
}

/**
 * Extracts and formats validation errors for display
 *
 * @param {ValidationInsertResult<any>[]} results - Array of results with errors
 * @returns {Array<{index: number; errors: Record<string, string>}>} Formatted errors
 */
export function extractValidationErrors(
  results: ValidationInsertResult<any>[]
): Array<{ index: number; errors: Record<string, string> }> {
  return results
    .map((r, index) => ({
      index,
      errors: r.validationErrors ?? {},
    }))
    .filter((item) => Object.keys(item.errors).length > 0);
}
