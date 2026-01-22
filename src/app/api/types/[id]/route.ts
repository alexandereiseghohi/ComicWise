// ═══════════════════════════════════════════════════
// TYPE DETAIL API
// ═══════════════════════════════════════════════════

import { deleteType, updateType } from "@/database/mutations/types";
import { getTypeById } from "@/database/queries/types";
import {
  deleteGenericEntity,
  getGenericEntity,
  updateGenericEntity,
  zodToValidationResult,
} from "@/lib/api/generic-crud";
import { typeIdSchema, updateTypeSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getGenericEntity(id, {
    getFn: async (idValue: string) => getTypeById(Number(idValue)),
    validateFn: zodToValidationResult(typeIdSchema),
    entityName: "type",
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  return updateGenericEntity(id, body, {
    updateFn: async (idValue: string, data: unknown) =>
      updateType(Number(idValue), data as { name?: string; description?: string | null }),
    idValidateFn: zodToValidationResult(typeIdSchema),
    dataValidateFn: zodToValidationResult(updateTypeSchema),
    entityName: "type",
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteGenericEntity(id, {
    deleteFn: async (typeId: string) => {
      const result = await deleteType(Number(typeId));
      return !!result;
    },
    validateFn: zodToValidationResult(typeIdSchema),
    entityName: "type",
  });
}
