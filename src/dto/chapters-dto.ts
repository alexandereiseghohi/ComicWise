/**
 * Chapters DTOs
 * Data Transfer Objects for chapter operations
 */

import type { chapter } from "@/database/schema";

export type ChapterDto = typeof chapter.$inferSelect;
export type CreateChapterDto = typeof chapter.$inferInsert;
export type UpdateChapterDto = Partial<CreateChapterDto>;

export interface ChapterListDto {
  chapters: ChapterDto[];
  total: number;
  page: number;
  limit: number;
}

export type ChapterWithImagesDto = ChapterDto & {
  images?: Array<{
    id: number;
    imageUrl: string;
    pageNumber: number;
  }>;
};

export interface ChapterNavigationDto {
  current: ChapterDto;
  previous?: ChapterDto;
  next?: ChapterDto;
}

export { deleteChapter, updateChapter } from "@/lib/actions/chapters";
