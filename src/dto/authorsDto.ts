/**
 * Authors DTOs
 * Data Transfer Objects for author operations
 */

import type { author } from "@/database/schema";

export type AuthorDto = typeof author.$inferSelect;
export type CreateAuthorDto = typeof author.$inferInsert;
export type UpdateAuthorDto = Partial<CreateAuthorDto>;

export interface AuthorListDto {
  authors: AuthorDto[];
  total: number;
  page: number;
  limit: number;
}

export type AuthorWithComicsDto = AuthorDto & {
  comics?: Array<{
    id: number;
    title: string;
    slug: string;
    coverImage: string;
  }>;
};

export { deleteAuthor, updateAuthor } from "@/lib/actions/authors";
