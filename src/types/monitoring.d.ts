// ═══════════════════════════════════════════════════
// MONITORING TYPES - System Health & Metrics
// ═══════════════════════════════════════════════════

/**
 * System health status
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy";

/**
 * System health check result
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  services: Record<string, ServiceHealthCheck>;
  metrics?: SystemMetrics;
}

/**
 * Service health check
 */
export interface ServiceHealthCheck {
  status: "up" | "down" | "degraded";
  message?: string;
  latency?: number;
  lastChecked: string;
  details?: Record<string, unknown>;
}

/**
 * System metrics
 */
export interface SystemMetrics {
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk?: DiskMetrics;
  network?: NetworkMetrics;
}

/**
 * CPU metrics
 */
export interface CpuMetrics {
  usage: number;
  loadAverage: number[];
  cores: number;
}

/**
 * Memory metrics
 */
export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

/**
 * Disk metrics
 */
export interface DiskMetrics {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

/**
 * Network metrics
 */
export interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  requestsPerSecond: number;
}

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

/**
 * Error tracking
 */
export interface ErrorTracking {
  id: string;
  message: string;
  stack?: string;
  level: "error" | "warning" | "info";
  timestamp: string;
  context?: Record<string, unknown>;
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * CI/CD status
 */
export interface CiCdStatus {
  workflowName: string;
  status: "success" | "failure" | "pending" | "cancelled";
  branch: string;
  commit: string;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  jobs: CiCdJob[];
}

/**
 * CI/CD job
 */
export interface CiCdJob {
  name: string;
  status: "success" | "failure" | "pending" | "skipped";
  startedAt: string;
  completedAt?: string;
  duration?: number;
  steps: CiCdStep[];
}

/**
 * CI/CD step
 */
export interface CiCdStep {
  name: string;
  status: "success" | "failure" | "pending" | "skipped";
  output?: string;
  duration?: number;
}
