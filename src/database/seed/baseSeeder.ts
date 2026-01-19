/**
 * Enhanced Base Seeder
 *
 * @module BaseSeeder
 * @description Abstract base class for all seeders with common functionality
 */

import { db as database } from "@/database/db";
import type { PgTable } from "drizzle-orm/pg-core";
import type { z } from "zod";
import { DataLoader } from "./dataLoader";
import { logger } from "./logger";
import type { ISeeder, SeedOptions, SeedResult } from "./types";

// ═══════════════════════════════════════════════════
// ABSTRACT BASE SEEDER
// ═══════════════════════════════════════════════════

export abstract class BaseSeeder<T = unknown> implements ISeeder<T> {
  protected readonly dataLoader: DataLoader<T>;

  constructor(
    public readonly entity: string,
    protected readonly table: PgTable,
    protected readonly schema?: z.ZodType<T>,
    protected readonly defaultOptions: SeedOptions = {}
  ) {
    this.dataLoader = new DataLoader<T>(entity, schema);
  }

  /**
   * Get data sources (files to load from)
   */
  protected abstract getDataSources(): string[];

  /**
   * Prepare data for insertion (transform if needed)
   */
  protected abstract prepareData(item: T): unknown;

  /**
   * Get unique field for upsert logic
   */
  protected abstract getUniqueField(): string;

  /**
   * Validate data against schema
   * @param data
   */
  validate(data: unknown[]): T[] {
    if (!this.schema || this.defaultOptions.skipValidation) {
      return data as T[];
    }

    return data.map((item) => {
      try {
        return this.schema!.parse(item);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`Validation error: ${errorMessage}`);
        throw error;
      }
    });
  }

  /**
   * Transform data (default: no transformation)
   * @param data
   */
  transform(data: T[]): T[] {
    return data;
  }

  /**
   * Main seeding logic
   * @param data
   * @param options
   */
  async seed(data?: T[], options: SeedOptions = {}): Promise<SeedResult> {
    const options_ = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    logger.section(`Seeding ${this.entity}`);

    try {
      // Load data if not provided
      let records = data || [];
      if (records.length === 0) {
        const sources = this.getDataSources();
        logger.info(`Loading data from sources: ${sources.join(", ")}`);
        records = await this.dataLoader.load(sources);
      }

      if (records.length === 0) {
        logger.warn(`No ${this.entity} data found`);
        return {
          inserted: 0,
          updated: 0,
          skipped: 0,
          errors: 0,
          duration: Date.now() - startTime,
        };
      }

      // Validate
      if (!options_.skipValidation && this.schema) {
        logger.info(`Validating ${records.length} records...`);
        records = this.validate(records);
      }

      // Transform
      logger.info(`Transforming ${records.length} records...`);
      records = this.transform(records);

      // Dry run check
      if (options_.dryRun) {
        logger.info(`DRY RUN: Would insert ${records.length} records`);
        return {
          inserted: 0,
          updated: 0,
          skipped: records.length,
          errors: 0,
          duration: Date.now() - startTime,
        };
      }

      // Insert with batching
      const result = await this.batchInsert(records, options_);

      logger.success(
        `${this.entity}: ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`
      );

      return {
        ...result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to seed ${this.entity}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Batch insert with progress tracking
   * @param records
   * @param options
   */
  protected async batchInsert(
    records: T[],
    options: SeedOptions
  ): Promise<Omit<SeedResult, "duration">> {
    const batchSize = options.batchSize || 100;
    const batches = this.createBatches(records, batchSize);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    logger.info(`Processing ${batches.length} batches (size: ${batchSize})...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        const result = await this.insertBatch(batch || [], options);
        inserted += result.inserted;
        updated += result.updated;
        skipped += result.skipped;
        errors += result.errors;

        if (options.verbose) {
          logger.info(
            `Batch ${i + 1}/${batches.length}: +${result.inserted} inserted, +${result.updated} updated`
          );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Batch ${i + 1} failed: ${errorMessage}`);
        errors += (batch || []).length;
      }
    }

    return { inserted, updated, skipped, errors };
  }

  /**
   * Insert a single batch
   */
  protected abstract insertBatch(
    batch: T[],
    options: SeedOptions
  ): Promise<Omit<SeedResult, "duration">>;

  /**
   * Clear all data for this entity
   */
  async clear(): Promise<void> {
    logger.info(`Clearing ${this.entity} table...`);
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    await database.delete(this.table);
    logger.success(`${this.entity} table cleared`);
  }

  /**
   * Create batches from array
   * @param items
   * @param batchSize
   */
  protected createBatches<R>(items: R[], batchSize: number): R[][] {
    const batches: R[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Execute in transaction
   * @param callback
   */
  protected async executeInTransaction<R>(callback: (tx: unknown) => Promise<R>): Promise<R> {
    return database.transaction(callback);
  }
}

// ═══════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════

export { database, logger };
