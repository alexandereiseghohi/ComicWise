/**
 * Generic CRUD Operations
 * Provides reusable CRUD functionality for API routes
 */

import { NextResponse } from "next/server";
import type { z } from "zod";

export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string[]>;
}

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

  const entity = await options.getFn(id);

  if (!entity) {
    return NextResponse.json({ error: `${options.entityName} not found` }, { status: 404 });
  }

  return NextResponse.json(entity);
}

interface UpdateEntityOptions {
  updateFn(id: string, data: unknown): Promise<unknown>;
  idValidateFn(data: unknown): ValidationResult;
  dataValidateFn(data: unknown): ValidationResult;
  entityName: string;
}

export async function updateGenericEntity(
  id: string,
  data: unknown,
  options: UpdateEntityOptions
): Promise<NextResponse> {
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

  const updated = await options.updateFn(id, data);

  return NextResponse.json(updated);
}

interface DeleteEntityOptions {
  deleteFn(id: string): Promise<boolean>;
  validateFn(data: unknown): ValidationResult;
  entityName: string;
}

export async function deleteGenericEntity(
  id: string,
  options: DeleteEntityOptions
): Promise<NextResponse> {
  const validation = options.validateFn({ id });

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid ID", details: validation.errors }, { status: 400 });
  }

  const deleted = await options.deleteFn(id);

  if (!deleted) {
    return NextResponse.json({ error: `${options.entityName} not found` }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
