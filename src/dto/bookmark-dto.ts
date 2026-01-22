/**
 * Bookmark DTOs
 * Data Transfer Objects for bookmark operations
 */

import type { bookmark } from "@/database/schema";

export type BookmarkDto = typeof bookmark.$inferSelect;
export type CreateBookmarkDto = typeof bookmark.$inferInsert;
export type UpdateBookmarkDto = Partial<CreateBookmarkDto>;

export interface BookmarkListDto {
  bookmarks: BookmarkDto[];
  total: number;
  page: number;
  limit: number;
}

export type BookmarkWithComicDto = BookmarkDto & {
  comic?: {
    id: number;
    title: string;
    slug: string;
    coverImage: string;
    author?: {
      id: number;
      name: string;
    };
  };
  lastReadChapter?: {
    id: number;
    title: string;
    chapterNumber: number;
  };
};
