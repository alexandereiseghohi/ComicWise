/**
 * Chapter Validation Schema
 * Zod validation schemas for chapter entity
 * ⚠️ DEPRECATED: Use schemas from @/lib/validations/index.ts instead
 * This file maintained for backward compatibility only
 */

import { createChapterSchema, updateChapterSchema } from "@/lib/validations/index";

// Re-export with legacy names for backward compatibility
export const insertChapterSchema = createChapterSchema;
export { updateChapterSchema };

export interface InsertChapter {
  title: string;
  chapterNumber: number;
  releaseDate: Date;
  comicId: number;
  views?: number;
}
export type UpdateChapter = Partial<InsertChapter>;
