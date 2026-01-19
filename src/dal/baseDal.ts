/**
 * Base Data Access Layer (DAL) - Generic singleton pattern
 * Eliminates repetitive CRUD operations across all DAL classes
 * Reduces cognitive complexity and code duplication
 */

import { logger as baseLogger } from "@/lib/logger";
import type { SQL } from "drizzle-orm";
import type { Logger } from "pino";

export interface ListOptions {
  limit?: number;
  offset?: number;
  search?: string;
  orderBy?: string;
  [key: string]: unknown;
}

/**
 * Abstract base class for all DAL implementations
 * Provides standard CRUD operations with logging and error handling
 *
 * @template TData - The database record type
 * @template TInsert - The insert type for the database
 */
export abstract class BaseDal<TData, TInsert> {
  protected logger: Logger;
  private static instances = new Map<string, BaseDal<unknown, unknown>>();

  constructor(contextName: string) {
    this.logger = baseLogger.child({ context: contextName });
  }

  /**
   * Get or create singleton instance for a DAL class
   * @param key - Unique identifier for the DAL class
   * @param factory - Factory function to create the instance
   */
  protected static getInstance<T extends BaseDal<unknown, unknown>>(
    key: string,
    factory: () => T
  ): T {
    if (!BaseDal.instances.has(key)) {
      BaseDal.instances.set(key, factory());
    }
    return BaseDal.instances.get(key) as T;
  }

  /**
   * Create a new record
   * Must be implemented by subclasses
   */
  abstract create(data: TInsert): Promise<TData | undefined>;

  /**
   * Find a record by ID
   * Must be implemented by subclasses
   */
  abstract findById(id: string | number): Promise<TData | undefined>;

  /**
   * Update a record
   * Must be implemented by subclasses
   */
  abstract update(id: string | number, data: Partial<TInsert>): Promise<TData | undefined>;

  /**
   * Delete a record
   * Must be implemented by subclasses
   */
  abstract delete(id: string | number): Promise<TData | undefined>;

  /**
   * List records with optional filtering and pagination
   * Must be implemented by subclasses
   */
  abstract list(options?: ListOptions): Promise<TData[]>;

  /**
   * Helper: Execute async operation with error logging
   * Reduces boilerplate try-catch blocks
   * @param operation
   * @param operationName
   * @param metadata
   */
  protected async executeWithLogging<T>(
    operation: () => Promise<T>,
    operationName: string,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    try {
      this.logger.debug(metadata, `${operationName} started`);
      const result = await operation();
      this.logger.info(metadata, `${operationName} completed successfully`);
      return result;
    } catch (error) {
      this.logger.error({ error, ...metadata }, `${operationName} failed`);
      throw error;
    }
  }

  /**
   * Helper: Handle array result extraction
   * Commonly used for database operations that return arrays
   * @param result
   */
  protected extractFirst<T>(result: T[]): T | undefined {
    return result?.[0];
  }

  /**
   * Helper: Extract array from database result
   * @param result
   */
  protected extractArray<T>(result: T | T[]): T[] {
    return Array.isArray(result) ? result : [result];
  }

  /**
   * Helper: Build dynamic query conditions
   * Reduces complexity in subclass list methods
   * @param conditions
   * @param conditionBuilders
   */
  protected buildConditions(
    conditions: Record<string, unknown>,
    conditionBuilders: Record<string, (value: unknown) => SQL | undefined>
  ): SQL[] {
    const sqlConditions: SQL[] = [];

    for (const [key, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null && key in conditionBuilders) {
        const condition = (conditionBuilders as any)[key](value);
        if (condition) {
          sqlConditions.push(condition);
        }
      }
    }

    return sqlConditions;
  }
}
