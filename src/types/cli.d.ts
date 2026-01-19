// ═══════════════════════════════════════════════════
// CLI TYPES - Command Line Interface
// ═══════════════════════════════════════════════════

/**
 * CLI command
 */
export interface CliCommand {
  name: string;
  description: string;
  category: CliCommandCategory;
  aliases?: string[];
  options?: CliCommandOption[];
  action(...args: any[]): Promise<void> | void;
  examples?: string[];
}

/**
 * CLI command category
 */
export type CliCommandCategory =
  | "build"
  | "database"
  | "development"
  | "deployment"
  | "testing"
  | "monitoring"
  | "cache"
  | "queue"
  | "email"
  | "upload"
  | "maintenance"
  | "utilities";

/**
 * CLI command option
 */
export interface CliCommandOption {
  flag: string;
  description: string;
  required?: boolean;
  default?: string | number | boolean;
  choices?: string[];
}

/**
 * CLI output formatter
 */
export interface CliFormatter {
  success(message: string): void;
  error(message: string): void;
  warning(message: string): void;
  info(message: string): void;
  table(data: Record<string, unknown>[]): void;
  json(data: unknown): void;
}

/**
 * CLI progress indicator
 */
export interface CliProgress {
  start(total: number, message?: string): void;
  update(current: number, message?: string): void;
  increment(message?: string): void;
  stop(message?: string): void;
}

/**
 * Script metadata
 */
export interface ScriptMetadata {
  name: string;
  description: string;
  category: CliCommandCategory;
  tags: string[];
  author?: string;
  version?: string;
  examples?: string[];
  dependencies?: string[];
}

/**
 * Workflow step
 */
export interface WorkflowStep {
  name: string;
  description: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  optional?: boolean;
  retryOnFail?: boolean;
  timeout?: number;
}

/**
 * Workflow definition
 */
export interface WorkflowDefinition {
  name: string;
  description: string;
  steps: WorkflowStep[];
  onSuccess?: string;
  onFailure?: string;
}
