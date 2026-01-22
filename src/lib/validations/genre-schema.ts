/**
 * Genre Validation Schema
 * Zod validation schemas for Genre entity
 * ⚠️ DEPRECATED: Use schemas from @/lib/validations/index.ts instead
 * This file maintained for backward compatibility only
 */

import { createGenreSchema, updateGenreSchema } from "@/lib/validations/index";

// Re-export with legacy names for backward compatibility
export const insertGenreSchema = createGenreSchema;
export { updateGenreSchema };

export interface InsertGenre {
  name: string;
  description?: string;
}
export type UpdateGenre = Partial<InsertGenre>;
