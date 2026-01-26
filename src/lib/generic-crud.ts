// ═══════════════════════════════════════════════════
// GENRES, TYPES, AUTHORS, ARTISTS API ROUTES
// Shared Implementation for Similar Entities
// ═══════════════════════════════════════════════════

import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ZodSchema } from "zod";

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { errors: unknown[] } };

/**
 * Convert Zod SafeParseResult to ValidationResult format
 * @param schema
 */
export function zodToValidationResult<T>(
  schema: ZodSchema<T>
): (data: unknown) => ValidationResult<T> {
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

// Generic CRUD functions
export async function createGenericEntity<TInput, TOutput>(
  request: NextRequest,
  {
    createFn,
    validateFn,
    entityName,
  }: {
    createFn(data: TInput): Promise<TOutput>;
    validateFn(data: unknown): ValidationResult<TInput>;
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
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const result = await createFn(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: `${entityName} created successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Create ${entityName} error:`, error);
    return NextResponse.json(
      {
        error: `Failed to create ${entityName}`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function listGenericEntity<TFilters, TOutput>(
  request: NextRequest,
  {
    listFn,
    validateFn,
    entityName,
  }: {
    listFn(
      filters: TFilters
    ): Promise<
      TOutput | { items: TOutput; page: number; limit: number; total: number; totalPages: number }
    >;
    validateFn(data: unknown): ValidationResult<TFilters>;
    entityName: string;
  }
): Promise<NextResponse> {
  try {
    const searchParams = new URL(request.url).searchParams;

    const filters = {
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50,
      sortBy: searchParams.get("sortBy") ?? "name",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "asc",
    };

    const validation = validateFn(filters);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const result = await listFn(validation.data);

    // Check if result has pagination structure
    const isPaginated =
      typeof result === "object" && result !== null && "items" in result && "page" in result;

    return NextResponse.json({
      success: true,
      data: isPaginated ? (result as { items: TOutput }).items : result,
      pagination: isPaginated
        ? {
            page: (result as { page: number }).page,
            limit: (result as { limit: number }).limit,
            total: (result as { total: number }).total,
            totalPages: (result as { totalPages: number }).totalPages,
          }
        : undefined,
    });
  } catch (error) {
    console.error(`List ${entityName} error:`, error);
    return NextResponse.json(
      {
        error: `Failed to fetch ${entityName}`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function getGenericEntity<TOutput>(
  id: string,
  {
    getFn,
    validateFn,
    entityName,
  }: {
    getFn(id: number): Promise<TOutput | null>;
    validateFn(data: unknown): ValidationResult<{ id: number }>;
    entityName: string;
  }
): Promise<NextResponse> {
  try {
    const validation = validateFn({ id: Number.parseInt(id) });

    if (!validation.success) {
      return NextResponse.json(
        { error: `Invalid ${entityName} ID`, details: validation.error.errors },
        { status: 400 }
      );
    }

    const result = await getFn(validation.data.id);

    if (!result) {
      return NextResponse.json({ error: `${entityName} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(`Get ${entityName} error:`, error);
    return NextResponse.json(
      {
        error: `Failed to fetch ${entityName}`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function updateGenericEntity<TInput, TOutput>(
  id: string,
  body: unknown,
  {
    updateFn,
    idValidateFn,
    dataValidateFn,
    entityName,
    requireAdmin = true,
  }: {
    updateFn(id: number, data: TInput): Promise<TOutput | null>;
    idValidateFn(data: unknown): ValidationResult<{ id: number }>;
    dataValidateFn(data: unknown): ValidationResult<TInput>;
    entityName: string;
    requireAdmin?: boolean;
  }
): Promise<NextResponse> {
  try {
    if (requireAdmin) {
      const session = await auth();
      if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const idValidation = idValidateFn({ id: Number.parseInt(id) });

    if (!idValidation.success) {
      return NextResponse.json(
        { error: `Invalid ${entityName} ID`, details: idValidation.error.errors },
        { status: 400 }
      );
    }

    const validation = dataValidateFn(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const result = await updateFn(idValidation.data.id, validation.data);

    if (!result) {
      return NextResponse.json({ error: `${entityName} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${entityName} updated successfully`,
    });
  } catch (error) {
    console.error(`Update ${entityName} error:`, error);
    return NextResponse.json(
      {
        error: `Failed to update ${entityName}`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function deleteGenericEntity(
  id: string,
  {
    deleteFn,
    validateFn,
    entityName,
  }: {
    deleteFn(id: number): Promise<boolean | { success: boolean }>;
    validateFn(data: unknown): ValidationResult<{ id: number }>;
    entityName: string;
  }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = validateFn({ id: Number.parseInt(id) });

    if (!validation.success) {
      return NextResponse.json(
        { error: `Invalid ${entityName} ID`, details: validation.error.errors },
        { status: 400 }
      );
    }

    const result = await deleteFn(validation.data.id);

    if (!result) {
      return NextResponse.json({ error: `${entityName} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `${entityName} deleted successfully`,
    });
  } catch (error) {
    console.error(`Delete ${entityName} error:`, error);
    return NextResponse.json(
      {
        error: `Failed to delete ${entityName}`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
