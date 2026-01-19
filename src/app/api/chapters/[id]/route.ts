// ═══════════════════════════════════════════════════
// CHAPTER DETAIL API - Get, Update, Delete Single Chapter
// ═══════════════════════════════════════════════════

import { deleteChapter, updateChapter } from "@/database/mutations/chapters";
import { getChapter } from "@/database/queries/chapters";
import { chapterIdSchema, updateChapterSchema } from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - Get Chapter by ID
// ═══════════════════════════════════════════════════

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const validation = chapterIdSchema.safeParse({ id: Number.parseInt(id) });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid chapter ID", details: validation.error.issues },
        { status: 400 }
      );
    }

    const chapter = await getChapter(validation.data.id);

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    console.error("Get chapter error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch chapter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// PATCH - Update Chapter
// ═══════════════════════════════════════════════════

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const idValidation = chapterIdSchema.safeParse({ id: Number.parseInt(id) });

    if (!idValidation.success) {
      return NextResponse.json(
        { error: "Invalid chapter ID", details: idValidation.error.issues },
        { status: 400 }
      );
    }

    const validation = updateChapterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updatedChapter = await updateChapter(idValidation.data.id, {
      title: validation.data.title,
      chapterNumber: validation.data.chapterNumber,
      releaseDate: validation.data.releaseDate,
    });

    if (!updatedChapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedChapter,
      message: "Chapter updated successfully",
    });
  } catch (error) {
    console.error("Update chapter error:", error);
    return NextResponse.json(
      {
        error: "Failed to update chapter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// DELETE - Delete Chapter
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

    const validation = chapterIdSchema.safeParse({ id: Number.parseInt(id) });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid chapter ID", details: validation.error.issues },
        { status: 400 }
      );
    }

    const deletedChapter = await deleteChapter(validation.data.id);

    if (!deletedChapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    console.error("Delete chapter error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete chapter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
