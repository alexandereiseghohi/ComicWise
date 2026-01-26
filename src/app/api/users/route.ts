// ═══════════════════════════════════════════════════
// USERS API - Full CRUD with Filtering & Pagination
// ═══════════════════════════════════════════════════

import { createUser } from "@/database/mutations/users";
import { getAllUsers } from "@/database/queries/users";
import { createUserSchema, userFilterSchema } from "@/lib/validations";
import { auth } from "auth";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - List Users with Filtering & Pagination
// ═══════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;

    const filters = {
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") as "user" | "admin" | "moderator" | undefined,
      emailVerified:
        searchParams.get("emailVerified") === "true"
          ? true
          : searchParams.get("emailVerified") === "false"
            ? false
            : undefined,
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 12,
      sortBy: searchParams.get("sortBy") ?? "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
    };

    const validation = userFilterSchema.safeParse(filters);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await getAllUsers(validation.data);

    return NextResponse.json({
      success: true,
      data: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// POST - Create New User
// ═══════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validation.data.password, 10);

    const newUser = await createUser({
      name: validation.data.name,
      email: validation.data.email,
      password: hashedPassword,
      role: validation.data.role,
      image: validation.data.image,
    });

    if (!newUser) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        data: userWithoutPassword,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
