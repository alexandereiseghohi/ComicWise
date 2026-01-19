// ═══════════════════════════════════════════════════
// COMIC DETAIL API - Get, Update, Delete Single Comic
// ═══════════════════════════════════════════════════

import { deleteComic, updateComic } from "@/database/mutations/comics";
import { getComicById } from "@/database/queries/adminComics";
import { comicIdSchema, updateComicSchema } from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - Get Comic by ID
// ═══════════════════════════════════════════════════

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const validation = comicIdSchema.safeParse({ id: Number.parseInt(id) });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid comic ID", details: validation.error.issues },
        { status: 400 }
      );
    }

    const comic = await getComicById(validation.data.id);

    if (!comic) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: comic,
    });
  } catch (error) {
    console.error("Get comic error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch comic",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// PATCH - Update Comic
// ═══════════════════════════════════════════════════

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const idValidation = comicIdSchema.safeParse({ id: Number.parseInt(id) });

    if (!idValidation.success) {
      return NextResponse.json(
        { error: "Invalid comic ID", details: idValidation.error.issues },
        { status: 400 }
      );
    }

    const validation = updateComicSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updatedComic = await updateComic(idValidation.data.id, {
      title: validation.data.title,
      description: validation.data.description,
      coverImage: validation.data.coverImage,
      status: validation.data.status,
      publicationDate: validation.data.publicationDate,
      authorId: validation.data.authorId,
      artistId: validation.data.artistId,
      typeId: validation.data.typeId,
      genreIds: body.genreIds,
    });

    if (!updatedComic) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedComic,
      message: "Comic updated successfully",
    });
  } catch (error) {
    console.error("Update comic error:", error);
    return NextResponse.json(
      {
        error: "Failed to update comic",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// DELETE - Delete Comic
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

    const validation = comicIdSchema.safeParse({ id: Number.parseInt(id) });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid comic ID", details: validation.error.issues },
        { status: 400 }
      );
    }

    const deletedComic = await deleteComic(validation.data.id);

    if (!deletedComic) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Comic deleted successfully",
    });
  } catch (error) {
    console.error("Delete comic error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete comic",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
