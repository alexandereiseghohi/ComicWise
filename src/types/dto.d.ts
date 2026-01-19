// ═══════════════════════════════════════════════════
// DTO TYPES - Data Transfer Objects
// ═══════════════════════════════════════════════════

import type { ActionResponse } from "@/types/api";

/**
 * Base DTO interface
 */
export interface BaseDto {
  id: number | string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Create DTO - Omit system fields
 */
export type CreateDto<T extends BaseDto> = Omit<T, "id" | "createdAt" | "updatedAt">;

/**
 * Update DTO - Partial of Create DTO
 */
export type UpdateDto<T extends BaseDto> = Partial<CreateDto<T>>;

/**
 * DTO Action Response
 */
export type DtoActionResponse<T = unknown> = ActionResponse<T>;

/**
 * DTO List Response
 */
export interface DtoListResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

/**
 * DTO Operation Result
 */
export interface DtoOperationResult {
  success: boolean;
  message?: string;
  error?: string;
}
