/**
 * Comics DTOs
 * Data Transfer Objects for comic operations
 */

import type { comic } from "@/database/schema";

export type ComicDto = typeof comic.$inferSelect;
export type CreateComicDto = typeof comic.$inferInsert;
export type UpdateComicDto = Partial<CreateComicDto>;

export interface ComicListDto {
  comics: ComicDto[];
  total: number;
  page: number;
  limit: number;
}

export type ComicWithRelationsDto = ComicDto & {
  author?: {
    id: number;
    name: string;
  };
  artist?: {
    id: number;
    name: string;
  };
  type?: {
    id: number;
    name: string;
  };
  genres?: Array<{
    id: number;
    name: string;
  }>;
  chapters?: Array<{
    id: number;
    title: string;
    slug: string;
    chapterNumber: number;
  }>;
};

export interface ComicFiltersDto {
  search?: string;
  status?: string;
  genreIds?: number[];
  typeId?: number;
  authorId?: number;
  artistId?: number;
  rating?: number;
  sortBy?: "title" | "rating" | "views" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export { createComic } from "@/lib/actions/comics";
