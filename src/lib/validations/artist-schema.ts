/**
 * Artist Validation Schema
 * Zod validation schemas for Artist entity
 * ⚠️ DEPRECATED: Use schemas from @/lib/validations/index.ts instead
 * This file maintained for backward compatibility only
 */

import { createArtistSchema, updateArtistSchema } from "@/lib/validations/index";

// Re-export with legacy names for backward compatibility
export const insertArtistSchema = createArtistSchema;
export const ArtistIdSchema = createArtistSchema;
export { updateArtistSchema };

export interface InsertArtist {
  name: string;
  bio?: string;
  image?: string;
}
export type UpdateArtist = Partial<InsertArtist>;
