/**
 * Author Validation Schema
 * Zod validation schemas for author entity
 * ⚠️ DEPRECATED: Use schemas from @/lib/validations/index.ts instead
 * This file maintained for backward compatibility only
 */

import { createAuthorSchema, updateAuthorSchema } from "@/lib/validations/index";

// Re-export with legacy names for backward compatibility
export const insertAuthorSchema = createAuthorSchema;
export const authorIdSchema = createAuthorSchema;
export { updateAuthorSchema };

export interface InsertAuthor {
  name: string;
  bio?: string;
  image?: string;
}
export type UpdateAuthor = Partial<InsertAuthor>;
