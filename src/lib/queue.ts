import { env } from "@/appConfig";
import type { SendEmailParams } from "@/lib/email";
import { sendEmail } from "@/lib/email";
import type { Job } from "bullmq";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

// ═══════════════════════════════════════════════════
// REDIS CONNECTION
// ═══════════════════════════════════════════════════

const connection = new IORedis({
  host: env.REDIS_HOST ?? "localhost",
  port: Number(env.REDIS_PORT ?? "6379"),
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
});

// ═══════════════════════════════════════════════════
// EMAIL QUEUE
// ═══════════════════════════════════════════════════

export const emailQueue = new Queue("emails", {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: "exponential", // Exponential backoff: 1s, 2s, 4s
      delay: 1000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// ═══════════════════════════════════════════════════
// EMAIL WORKER
// ═══════════════════════════════════════════════════

const emailWorker = new Worker(
  "emails",
  async (job: Job<SendEmailParams>) => {
    const { to, subject, html, text } = job.data;

    try {
      console.log(`[EmailWorker] Processing email job ${job.id} to ${to}`);
      const result = await sendEmail({ to, subject, html, text });

      if (!result.success) {
        throw new Error(result.error ?? "Failed to send email");
      }

      console.log(`[EmailWorker] Successfully sent email ${job.id} to ${to}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`[EmailWorker] Failed to send email ${job.id}:`, error);
      throw error; // Re-throw to trigger retry
    }
  },
  {
    connection: connection as any,
    concurrency: 5, // Process up to 5 emails concurrently
  }
);

// ═══════════════════════════════════════════════════
// WORKER EVENT LISTENERS
// ═══════════════════════════════════════════════════

emailWorker.on("completed", (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});

emailWorker.on("error", (err) => {
  console.error("[EmailWorker] Worker error:", err);
});

// ═══════════════════════════════════════════════════
// QUEUE HELPERS
// ═══════════════════════════════════════════════════

/**
 * Add an email to the queue
 * @param params
 * @param priority
 */
export async function queueEmail(params: SendEmailParams, priority: number = 0) {
  try {
    const job = await emailQueue.add("send-email", params, {
      priority, // Lower number = higher priority (0 is highest)
    });

    console.log(`[EmailQueue] Added email job ${job.id} to queue`);
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("[EmailQueue] Failed to add email to queue:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Add a high-priority email to the queue (processes first)
 * @param params
 */
export async function queueUrgentEmail(params: SendEmailParams) {
  return queueEmail(params, 0);
}

/**
 * Add a normal email to the queue
 * @param params
 */
export async function queueNormalEmail(params: SendEmailParams) {
  return queueEmail(params, 5);
}

/**
 * Add a low-priority email to the queue (processes last)
 * @param params
 */
export async function queueLowPriorityEmail(params: SendEmailParams) {
  return queueEmail(params, 10);
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  } catch (error) {
    console.error("[EmailQueue] Failed to get queue stats:", error);
    return null;
  }
}

/**
 * Clear completed jobs from the queue
 */
export async function clearCompletedJobs() {
  try {
    await emailQueue.clean(0, 1000, "completed");
    console.log("[EmailQueue] Cleared completed jobs");
    return { success: true };
  } catch (error) {
    console.error("[EmailQueue] Failed to clear completed jobs:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Clear failed jobs from the queue
 */
export async function clearFailedJobs() {
  try {
    await emailQueue.clean(0, 1000, "failed");
    console.log("[EmailQueue] Cleared failed jobs");
    return { success: true };
  } catch (error) {
    console.error("[EmailQueue] Failed to clear failed jobs:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Graceful shutdown
 */
export async function shutdownQueue() {
  try {
    await emailWorker.close();
    await emailQueue.close();
    await connection.quit();
    console.log("[EmailQueue] Graceful shutdown completed");
  } catch (error) {
    console.error("[EmailQueue] Error during shutdown:", error);
  }
}

// ═══════════════════════════════════════════════════
// PROCESS EXIT HANDLERS
// ═══════════════════════════════════════════════════

process.on("SIGTERM", shutdownQueue);
process.on("SIGINT", shutdownQueue);
