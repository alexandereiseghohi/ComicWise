// ═══════════════════════════════════════════════════
// COMMENT DETAIL API - Get, Update, Delete Single Comment
// ═══════════════════════════════════════════════════

import { deleteComment, updateComment } from "@/database/mutations/comments";
import { getCommentById } from "@/database/queries/comments";
import { commentIdSchema, updateCommentSchema } from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - Get Comment by ID
// ═══════════════════════════════════════════════════

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const validation = commentIdSchema.safeParse({ id: Number.parseInt(id) });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid comment ID", details: validation.error.issues },
        { status: 400 }
      );
    }

    const comment = await getCommentById(validation.data.id);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Get comment error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// PATCH - Update Comment
// ═══════════════════════════════════════════════════

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const idValidation = commentIdSchema.safeParse({ id: Number.parseInt(id) });

    if (!idValidation.success) {
      return NextResponse.json(
        { error: "Invalid comment ID", details: idValidation.error.issues },
        { status: 400 }
      );
    }

    // Check if user owns the comment or is admin
    const existingComment = await getCommentById(idValidation.data.id);
    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existingComment.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to edit this comment" }, { status: 403 });
    }

    const validation = updateCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updatedComment = await updateComment(idValidation.data.id, {
      content: validation.data.content,
    });

    return NextResponse.json({
      success: true,
      data: updatedComment,
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("Update comment error:", error);
    return NextResponse.json(
      {
        error: "Failed to update comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// DELETE - Delete Comment
// ═══════════════════════════════════════════════════

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const validation = commentIdSchema.safeParse({ id: Number.parseInt(id) });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid comment ID", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if user owns the comment or is admin
    const existingComment = await getCommentById(validation.data.id);
    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existingComment.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to delete this comment" }, { status: 403 });
    }

    await deleteComment(validation.data.id);

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
