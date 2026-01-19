// ═══════════════════════════════════════════════════
// ARTISTS API - Full CRUD
// ═══════════════════════════════════════════════════

import { createArtist } from "@/database/mutations/artists";
import { getAllArtists } from "@/database/queries/artists";
import { createGenericEntity, listGenericEntity, zodToValidationResult } from "@/lib/genericCrud";
import { artistFilterSchema, createArtistSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return listGenericEntity(request, {
    listFn: getAllArtists,
    validateFn: zodToValidationResult(artistFilterSchema),
    entityName: "artists",
  });
}

export async function POST(request: NextRequest) {
  return createGenericEntity(request, {
    createFn: createArtist,
    validateFn: zodToValidationResult(createArtistSchema),
    entityName: "artist",
  });
}
