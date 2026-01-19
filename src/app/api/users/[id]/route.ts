// ═══════════════════════════════════════════════════
// USER DETAIL API - Get, Update, Delete Single User
// ═══════════════════════════════════════════════════

import { deleteUser, updateUser } from "@/database/mutations/users";
import { getUserById } from "@/database/queries/users";
import { updateUserSchema, userIdSchema } from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - Get User by ID
// ═══════════════════════════════════════════════════

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.id !== (await params).id)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const validation = userIdSchema.safeParse({ id });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid user ID", details: validation.error.issues },
        { status: 400 }
      );
    }

    const user = await getUserById(validation.data.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// PATCH - Update User
// ═══════════════════════════════════════════════════

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || (session.user.role !== "admin" && session.user.id !== id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const idValidation = userIdSchema.safeParse({ id });

    if (!idValidation.success) {
      return NextResponse.json(
        { error: "Invalid user ID", details: idValidation.error.issues },
        { status: 400 }
      );
    }

    // Non-admin users can't change their role
    if (session.user.role !== "admin" && body.role) {
      return NextResponse.json({ error: "Cannot change own role" }, { status: 403 });
    }

    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(idValidation.data.id, {
      name: validation.data.name,
      email: validation.data.email,
      role: validation.data.role,
      image: validation.data.image,
      emailVerified: validation.data.emailVerified,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        error: "Failed to update user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// DELETE - Delete User
// ═══════════════════════════════════════════════════

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const validation = userIdSchema.safeParse({ id });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid user ID", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Prevent deleting self
    if (session.user.id === id) {
      return NextResponse.json({ error: "Cannot delete own account" }, { status: 403 });
    }

    const deletedUser = await deleteUser(validation.data.id);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
