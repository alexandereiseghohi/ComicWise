/**
 * Comment DTOs
 * Data Transfer Objects for comment operations
 */

import type { comment } from "@/database/schema";

export type CommentDto = typeof comment.$inferSelect;
export type CreateCommentDto = typeof comment.$inferInsert;
export type UpdateCommentDto = Partial<CreateCommentDto>;

export interface CommentListDto {
  comments: CommentDto[];
  total: number;
  page: number;
  limit: number;
}

export type CommentWithUserDto = CommentDto & {
  user?: {
    id: string;
    name: string;
    image?: string | null;
  };
  replies?: CommentDto[];
  replyCount?: number;
};
