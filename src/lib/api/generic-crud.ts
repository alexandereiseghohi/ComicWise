/**
 * Generic CRUD Operations for API Routes
 * Unified implementation combining GenericCrud.ts and genericCrud.ts
 */

import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { z, ZodSchema } from "zod";

export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string[]>;
}

type TypedValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { errors: unknown[] } };

/**
 * Convert Zod schema to validation result format
 * @param schema
 */
export function zodToValidationResult<T extends z.ZodTypeAny>(
  schema: T
): (data: unknown) => ValidationResult {
  return (data: unknown): ValidationResult => {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true };
    }

    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    }

    return {
      success: false,
      errors,
    };
  };
}

/**
 * Typed version for validation with data
 * @param schema
 */
export function zodToTypedValidationResult<T>(
  schema: ZodSchema<T>
): (data: unknown) => TypedValidationResult<T> {
  return (data: unknown) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: { errors: result.error.issues },
    };
  };
}

// ═══════════════════════════════════════════════════
// GET Entity
// ═══════════════════════════════════════════════════

interface GetEntityOptions {
  getFn(id: string): Promise<unknown | null>;
  validateFn(data: unknown): ValidationResult;
  entityName: string;
}

export async function getGenericEntity(
  id: string,
  options: GetEntityOptions
): Promise<NextResponse> {
  const validation = options.validateFn({ id });

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid ID", details: validation.errors }, { status: 400 });
  }

  try {
    const entity = await options.getFn(id);

    if (!entity) {
      return NextResponse.json({ error: `${options.entityName} not found` }, { status: 404 });
    }

    return NextResponse.json(entity);
  } catch (error) {
    console.error(`Error fetching ${options.entityName}:`, error);
    return NextResponse.json({ error: `Failed to fetch ${options.entityName}` }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════
// CREATE Entity
// ═══════════════════════════════════════════════════

export async function createGenericEntity<TInput, TOutput>(
  request: NextRequest,
  {
    createFn,
    validateFn,
    entityName,
  }: {
    createFn(data: TInput): Promise<TOutput>;
    validateFn(data: unknown): TypedValidationResult<TInput>;
    entityName: string;
  }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateFn(body);

    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    const entity = await createFn(validation.data);
    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    console.error(`Error creating ${entityName}:`, error);
    return NextResponse.json({ error: `Failed to create ${entityName}` }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════
// UPDATE Entity
// ═══════════════════════════════════════════════════

interface UpdateEntityOptions<T> {
  updateFn(id: string, data: T): Promise<unknown>;
  idValidateFn(data: unknown): ValidationResult;
  dataValidateFn(data: unknown): ValidationResult;
  entityName: string;
}

export async function updateGenericEntity<T>(
  id: string,
  data: T,
  options: UpdateEntityOptions<T>
): Promise<NextResponse> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idValidation = options.idValidateFn({ id });
  if (!idValidation.success) {
    return NextResponse.json(
      { error: "Invalid ID", details: idValidation.errors },
      { status: 400 }
    );
  }

  const dataValidation = options.dataValidateFn(data);
  if (!dataValidation.success) {
    return NextResponse.json(
      { error: "Invalid data", details: dataValidation.errors },
      { status: 400 }
    );
  }

  try {
    const updatedEntity = await options.updateFn(id, data);
    return NextResponse.json(updatedEntity);
  } catch (error) {
    console.error(`Error updating ${options.entityName}:`, error);
    return NextResponse.json({ error: `Failed to update ${options.entityName}` }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════
// DELETE Entity
// ═══════════════════════════════════════════════════

interface DeleteEntityOptions {
  deleteFn(id: string): Promise<boolean>;
  validateFn(data: unknown): ValidationResult;
  entityName: string;
}

export async function deleteGenericEntity(
  id: string,
  options: DeleteEntityOptions
): Promise<NextResponse> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const validation = options.validateFn({ id });
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid ID", details: validation.errors }, { status: 400 });
  }

  try {
    const deleted = await options.deleteFn(id);

    if (!deleted) {
      return NextResponse.json(
        { error: `${options.entityName} not found or could not be deleted` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${options.entityName}:`, error);
    return NextResponse.json({ error: `Failed to delete ${options.entityName}` }, { status: 500 });
  }
}
