/**
 * Types DTOs
 * Data Transfer Objects for type operations
 */

import type { type as typeTable } from "@/database/schema";

export type TypeDto = typeof typeTable.$inferSelect;
export type CreateTypeDto = typeof typeTable.$inferInsert;
export type UpdateTypeDto = Partial<CreateTypeDto>;

export interface TypeListDto {
  types: TypeDto[];
  total: number;
  page: number;
  limit: number;
}

export type TypeWithComicsDto = TypeDto & {
  comics?: Array<{
    id: number;
    title: string;
    slug: string;
    coverImage: string;
  }>;
  comicCount?: number;
};

export { deleteType, updateType } from "@/lib/actions/genres-types";
