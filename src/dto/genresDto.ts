/**
 * Genres DTOs
 * Data Transfer Objects for genre operations
 */

import type { genre } from "@/database/schema";

export type GenreDto = typeof genre.$inferSelect;
export type CreateGenreDto = typeof genre.$inferInsert;
export type UpdateGenreDto = Partial<CreateGenreDto>;

export interface GenreListDto {
  genres: GenreDto[];
  total: number;
  page: number;
  limit: number;
}

export type GenreWithComicsDto = GenreDto & {
  comics?: Array<{
    id: number;
    title: string;
    slug: string;
    coverImage: string;
  }>;
  comicCount?: number;
};

export { deleteGenre, updateGenre } from "@/lib/actions/genresTypes";
