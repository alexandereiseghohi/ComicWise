// ═══════════════════════════════════════════════════
// QUEUE TYPES - Background Jobs
// ═══════════════════════════════════════════════════

/**
 * Job status
 */
export type JobStatus = "waiting" | "active" | "completed" | "failed" | "delayed" | "paused";

/**
 * Job priority
 */
export type JobPriority = "low" | "normal" | "high" | "critical";

/**
 * Queue job
 */
export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  opts?: QueueJobOptions;
  status: JobStatus;
  progress?: number;
  returnValue?: unknown;
  failedReason?: string;
  stacktrace?: string[];
  attemptsMade: number;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
}

/**
 * Queue job options
 */
export interface QueueJobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: number | { type: string; delay: number };
  lifo?: boolean;
  timeout?: number;
  jobId?: string;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  stackTraceLimit?: number;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

/**
 * Email job data
 */
export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    encoding?: string;
  }>;
}

/**
 * Image processing job data
 */
export interface ImageProcessingJobData {
  sourceUrl: string;
  operations: Array<{
    type: "resize" | "crop" | "compress" | "watermark";
    params: Record<string, unknown>;
  }>;
  outputFormat?: "jpeg" | "png" | "webp" | "avif";
  quality?: number;
}

/**
 * Notification job data
 */
export interface NotificationJobData {
  userId: string;
  type: "email" | "push" | "sms";
  title: string;
  message: string;
  data?: Record<string, unknown>;
}
