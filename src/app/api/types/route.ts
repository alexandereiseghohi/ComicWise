// ═══════════════════════════════════════════════════
// TYPES API - Full CRUD
// ═══════════════════════════════════════════════════

import { createType } from "@/database/mutations/types";
import { getAllTypes } from "@/database/queries/types";
import { createGenericEntity, listGenericEntity, zodToValidationResult } from "@/lib/generic-crud";
import { createTypeSchema, typeFilterSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return listGenericEntity(request, {
    listFn: getAllTypes,
    validateFn: zodToValidationResult(typeFilterSchema),
    entityName: "types",
  });
}

export async function POST(request: NextRequest) {
  return createGenericEntity(request, {
    createFn: createType,
    validateFn: zodToValidationResult(createTypeSchema),
    entityName: "type",
  });
}
