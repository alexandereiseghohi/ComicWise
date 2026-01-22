// ═══════════════════════════════════════════════════
// ARTIST DETAIL API
// ═══════════════════════════════════════════════════

import { deleteArtist, updateArtist } from "@/database/mutations/artists";
import { getArtistById } from "@/database/queries/artists";
import {
  deleteGenericEntity,
  getGenericEntity,
  updateGenericEntity,
  zodToValidationResult,
} from "@/lib/api/generic-crud";
import { artistIdSchema, updateArtistSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getGenericEntity(id, {
    getFn: async (idValue: string) => getArtistById(Number(idValue)),
    validateFn: zodToValidationResult(artistIdSchema),
    entityName: "artist",
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  return updateGenericEntity(id, body, {
    updateFn: async (idValue: string, data: unknown) =>
      updateArtist(
        Number(idValue),
        data as { name?: string; bio?: string | null; image?: string | null }
      ),
    idValidateFn: zodToValidationResult(artistIdSchema),
    dataValidateFn: zodToValidationResult(updateArtistSchema),
    entityName: "artist",
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteGenericEntity(id, {
    deleteFn: async (artistId: string) => {
      const result = await deleteArtist(Number(artistId));
      return !!result;
    },
    validateFn: zodToValidationResult(artistIdSchema),
    entityName: "artist",
  });
}
