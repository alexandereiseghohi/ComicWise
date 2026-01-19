/**
 * Seeder Helper Utilities
 * Extracted common functionality used by seeders to reduce complexity
 *
 * Provides:
 * - Data validation and transformation
 * - Upsert logic with deduplication
 * - Image handling and caching
 * - Logging and error tracking
 */

import { logger } from "@/database/seed/logger";
import type { z } from "zod";

/**
 * Validate data against a Zod schema
 * Returns validation result with typed data or error details
 * @param data
 * @param schema
 * @param context
 */
export async function validateData<T>(
  data: unknown,
  schema: z.ZodType<T>,
  context: string
): Promise<{ valid: true; data: T } | { valid: false; error: string }> {
  try {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errorMessage = result.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      logger.warn(`Validation failed for ${context}: ${errorMessage}`);
      return { valid: false, error: errorMessage };
    }
    return { valid: true, data: result.data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown validation error";
    logger.warn(`Validation error for ${context}: ${errorMessage}`);
    return { valid: false, error: errorMessage };
  }
}

/**
 * Process data in batches to avoid memory issues
 * Useful for large JSON files
 * @param items
 * @param processor
 * @param batchSize
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (items: T[]) => Promise<R>,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    try {
      const result = await processor(batch);
      results.push(result);
    } catch (error) {
      logger.error(
        `Batch processing error at index ${i}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  return results;
}

/**
 * Create upsert logic - insert or update if exists
 * Returns { created: boolean; id: any }
 */
export interface UpsertResult {
  created: boolean;
  id: string | number;
  operation: "insert" | "update" | "skip";
}

/**
 * Dedup items by a unique field
 * Keeps first occurrence, removes duplicates
 * @param items
 * @param uniqueField
 */
export function deduplicateByField<T extends Record<K, unknown>, K extends string>(
  items: T[],
  uniqueField: K
): T[] {
  const seen = new Set<unknown>();
  return items.filter((item) => {
    const value = item[uniqueField];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Safe type conversion with logging
 * @param value
 * @param context
 * @param defaultValue
 */
export function safeParseInt(value: unknown, context: string, defaultValue: number = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  logger.warn(`Failed to parse int for ${context}, using default: ${defaultValue}`);
  return defaultValue;
}

/**
 * Safe string conversion
 * @param value
 * @param defaultValue
 */
export function safeParseString(value: unknown, defaultValue: string = ""): string {
  if (typeof value === "string") return value;
  if (value !== null && value !== undefined) return String(value);
  return defaultValue;
}

/**
 * Extract unique items from array of objects
 * Useful for extracting authors/artists from comics data
 * @param items
 * @param field
 * @param idField
 */
export function extractUniqueEntities<T extends Record<K, any>, K extends string>(
  items: T[],
  field: K,
  idField?: string
): Map<unknown, any> {
  const map = new Map<unknown, any>();
  for (const item of items) {
    const entity = item[field];
    if (entity && typeof entity === "object") {
      const idValue = idField ? entity[idField] : entity.name || entity.id;
      if (!map.has(idValue)) {
        map.set(idValue, entity);
      }
    }
  }
  return map;
}

/**
 * Log seeding progress
 * @param context
 * @param stats
 * @param stats.processed
 * @param stats.created
 * @param stats.updated
 * @param stats.skipped
 * @param stats.errors
 * @param total
 */
export function logProgress(
  context: string,
  stats: { processed: number; created: number; updated: number; skipped: number; errors: number },
  total: number
): void {
  const percentage = ((stats.processed / total) * 100).toFixed(1);
  logger.info(
    `${context}: ${stats.processed}/${total} (${percentage}%) - Created: ${stats.created}, Updated: ${stats.updated}, Skipped: ${stats.skipped}, Errors: ${stats.errors}`
  );
}
