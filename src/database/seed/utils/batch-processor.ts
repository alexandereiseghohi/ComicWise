/**
 * Batch Processor Utility
 * Provides efficient batch processing for large datasets
 */

import { logger } from "@/database/seed/logger";

export interface BatchProcessorOptions {
  batchSize?: number;
  concurrency?: number;
  onProgress?(processed: number, total: number): void;
  onError?(error: unknown, item: unknown): void;
}

export class BatchProcessor<T, R = void> {
  private readonly batchSize: number;
  private readonly concurrency: number;
  private readonly onProgress?: (processed: number, total: number) => void;
  private readonly onError?: (error: unknown, item: T) => void;

  constructor(options: BatchProcessorOptions = {}) {
    this.batchSize = options.batchSize ?? 100;
    this.concurrency = options.concurrency ?? 5;
    this.onProgress = options.onProgress;
    this.onError = options.onError;
  }

  /**
   * Process items in batches with concurrency control
   * @param items
   * @param processor
   */
  async process(items: T[], processor: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    const batches: T[][] = this.createBatches(items);

    logger.info(`Processing ${items.length} items in ${batches.length} batches`);

    for (let i = 0; i < batches.length; i++) {
      const batch: T[] | undefined = batches[i];
      if (!batch) {
        continue;
      }
      logger.info(`Processing batch ${i + 1}/${batches.length} (${batch.length} items)`);

      const batchResults = await this.processBatch(batch, processor);
      results.push(...batchResults);

      this.onProgress?.(results.length, items.length);
    }

    return results;
  }

  /**
   * Process items in batches with transaction support
   * @param items
   * @param processor
   */
  async processInTransaction<TResult>(
    items: T[],
    processor: (batch: T[]) => Promise<TResult>
  ): Promise<TResult[]> {
    const batches = this.createBatches(items);
    const results: TResult[] = [];

    logger.info(`Processing ${items.length} items in ${batches.length} batches (transactional)`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      if (!batch) {
        continue;
      }
      logger.info(`Processing batch ${i + 1}/${batches.length} (${batch.length} items)`);

      try {
        const result = await processor(batch);
        results.push(result);
        this.onProgress?.((i + 1) * this.batchSize, items.length);
      } catch (error) {
        logger.error(`Batch ${i + 1} failed: ${error}`);
        throw error;
      }
    }

    return results;
  }

  /**
   * Process a single batch with concurrency control
   * @param batch
   * @param processor
   */
  private async processBatch(batch: T[], processor: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    const chunks = this.createConcurrentChunks(batch);

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(chunk.map(processor));

      for (let i = 0; i < chunkResults.length; i++) {
        const result = chunkResults[i];
        if (!result) {
          continue;
        }

        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          const item = chunk[i];
          if (item !== undefined) {
            this.onError?.(result.reason, item);
          }
        }
      }
    }

    return results;
  }

  /**
   * Create batches from items
   * @param items
   */
  private createBatches(items: T[]): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += this.batchSize) {
      batches.push(items.slice(i, i + this.batchSize));
    }
    return batches;
  }

  /**
   * Create concurrent chunks for processing
   * @param items
   */
  private createConcurrentChunks(items: T[]): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += this.concurrency) {
      chunks.push(items.slice(i, i + this.concurrency));
    }
    return chunks;
  }
}

/**
 * Helper function for simple batch processing
 * @param items
 * @param processor
 * @param options
 */
export async function processBatch<T, R = void>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options?: BatchProcessorOptions
): Promise<R[]> {
  const batchProcessor = new BatchProcessor<T, R>(options);
  return batchProcessor.process(items, processor);
}

/**
 * Helper function for transactional batch processing
 * @param items
 * @param processor
 * @param options
 */
export async function processBatchInTransaction<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R>,
  options?: BatchProcessorOptions
): Promise<R[]> {
  const batchProcessor = new BatchProcessor<T, R>(options);
  return batchProcessor.processInTransaction(items, processor);
}
