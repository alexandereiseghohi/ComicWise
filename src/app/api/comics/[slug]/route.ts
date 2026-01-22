// ═══════════════════════════════════════════════════
// COMIC DETAIL API - Get, Update, Delete Single Comic
// ═══════════════════════════════════════════════════

import { deleteComic, updateComic } from "@/database/mutations/comics";
import { getComicBySlug } from "@/database/queries/admin-comics";
import { comicIdSchema, comicSlugSchema, updateComicSchema } from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - Get Comic by ID
// ═══════════════════════════════════════════════════

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const validation = comicSlugSchema.safeParse({ slug });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid comic slug", details: validation.error.issues },
        { status: 400 }
      );
    }

    const comic = await getComicBySlug(validation.data.slug);

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    const slugValidation = comicIdSchema.safeParse({ id: slug });

    if (!slugValidation.success) {
      return NextResponse.json(
        { error: "Invalid comic ID", details: slugValidation.error.issues },
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

    const updatedComic = await updateComic(slugValidation.data.id, {
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const validation = comicIdSchema.safeParse({ id: slug });

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
