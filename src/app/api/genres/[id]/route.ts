// ═══════════════════════════════════════════════════
// GENRE DETAIL API
// ═══════════════════════════════════════════════════

import { deleteGenre, updateGenre } from "@/database/mutations/genres";
import { getGenreById } from "@/database/queries/genres";
import {
  deleteGenericEntity,
  getGenericEntity,
  updateGenericEntity,
  zodToValidationResult,
} from "@/lib/generic-crud";
import { genreIdSchema, updateGenreSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getGenericEntity(id, {
    getFn: getGenreById,
    validateFn: zodToValidationResult(genreIdSchema),
    entityName: "genre",
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  return updateGenericEntity(id, body, {
    updateFn: updateGenre,
    idValidateFn: zodToValidationResult(genreIdSchema),
    dataValidateFn: zodToValidationResult(updateGenreSchema),
    entityName: "genre",
  });
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteGenericEntity(id, {
    deleteFn: async (genreId: number) => {
      const result = await deleteGenre(genreId);
      // Return true if deleted, false otherwise
      return !!result;
    },
    validateFn: zodToValidationResult(genreIdSchema),
    entityName: "genre",
  });
}
