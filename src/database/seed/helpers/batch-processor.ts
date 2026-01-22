/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Batch Processor - Process Large Datasets in Batches
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from "@/database/seed/logger";

export interface BatchProcessorOptions<T, R> {
  batchSize?: number;
  concurrency?: number;
  onBatchComplete?(results: R[], batchIndex: number): void | Promise<void>;
  onError?(error: Error, item: T): void | Promise<void>;
}

export class BatchProcessor<T, R = T> {
  private batchSize: number;
  private concurrency: number;
  private onBatchComplete?: (results: R[], batchIndex: number) => void | Promise<void>;
  private onError?: (error: Error, item: T) => void | Promise<void>;

  constructor(options: BatchProcessorOptions<T, R> = {}) {
    this.batchSize = options.batchSize || 10;
    this.concurrency = options.concurrency || 5;
    this.onBatchComplete = options.onBatchComplete;
    this.onError = options.onError;
  }

  async process(items: T[], processFunction: (item: T, index: number) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    const totalBatches = Math.ceil(items.length / this.batchSize);

    logger.info(
      `Processing ${items.length} items in ${totalBatches} batches (batch size: ${this.batchSize}, concurrency: ${this.concurrency})`
    );

    for (let i = 0; i < items.length; i += this.batchSize) {
      const batchIndex = Math.floor(i / this.batchSize);
      const batch = items.slice(i, i + this.batchSize);

      logger.debug(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} items)`);

      const batchResults = await this.processBatch(batch, processFunction, i);
      results.push(...batchResults);

      if (this.onBatchComplete) {
        await this.onBatchComplete(batchResults, batchIndex);
      }
    }

    return results;
  }

  private async processBatch(
    batch: T[],
    processFunction: (item: T, index: number) => Promise<R>,
    startIndex: number
  ): Promise<R[]> {
    const results: R[] = [];

    // Process in chunks with concurrency limit
    for (let i = 0; i < batch.length; i += this.concurrency) {
      const chunk = batch.slice(i, i + this.concurrency);
      const chunkPromises = chunk.map((item, chunkIndex) =>
        processFunction(item, startIndex + i + chunkIndex).catch((error) => {
          if (this.onError) {
            this.onError(error, item);
          }
          throw error;
        })
      );

      const chunkResults = await Promise.allSettled(chunkPromises);

      for (const result of chunkResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        }
      }
    }

    return results;
  }
}

/**
 * Process items in parallel batches
 * @param items
 * @param processFn
 * @param processFunction
 * @param batchSize
 */
export async function processBatch<T, R>(
  items: T[],
  processFunction: (item: T) => Promise<R>,
  batchSize = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFunction));
    results.push(...batchResults);

    if (i + batchSize < items.length) {
      logger.debug(`Processed ${i + batchSize}/${items.length} items`);
    }
  }

  return results;
}
