// ═══════════════════════════════════════════════════
// AUTHORS API - Full CRUD
// ═══════════════════════════════════════════════════

import { createAuthor } from "@/database/mutations/authors";
import { getAllAuthors } from "@/database/queries/authors";
import { createGenericEntity, listGenericEntity, zodToValidationResult } from "@/lib/genericCrud";
import { authorFilterSchema, createAuthorSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return listGenericEntity(request, {
    listFn: getAllAuthors,
    validateFn: zodToValidationResult(authorFilterSchema),
    entityName: "authors",
  });
}

export async function POST(request: NextRequest) {
  return createGenericEntity(request, {
    createFn: createAuthor,
    validateFn: zodToValidationResult(createAuthorSchema),
    entityName: "author",
  });
}
