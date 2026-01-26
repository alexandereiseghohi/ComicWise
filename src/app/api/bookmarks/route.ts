// ═══════════════════════════════════════════════════
// BOOKMARKS API - Full CRUD
// ═══════════════════════════════════════════════════

import {
  addBookmark,
  removeBookmark,
  updateBookmarkNotes,
  updateReadingProgress,
} from "@/database/mutations/bookmarks";
import { getUserBookmarks } from "@/database/queries/bookmarks";
import { createBookmarkSchema, updateBookmarkSchema } from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - List User Bookmarks
// ═══════════════════════════════════════════════════

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await getUserBookmarks(session.user.id);

    return NextResponse.json({
      success: true,
      data: bookmarks,
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bookmarks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// POST - Create/Add Bookmark
// ═══════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validation = createBookmarkSchema.safeParse({
      ...body,
      userId: session.user.id,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const comicId =
      typeof validation.data.comicId === "string"
        ? Number.parseInt(validation.data.comicId, 10)
        : validation.data.comicId;

    const lastReadChapterId =
      validation.data.lastReadChapterId === undefined || validation.data.lastReadChapterId === null
        ? undefined
        : typeof validation.data.lastReadChapterId === "string"
          ? Number.parseInt(validation.data.lastReadChapterId, 10)
          : validation.data.lastReadChapterId;

    const bookmark = await addBookmark(session.user.id, comicId, lastReadChapterId);

    return NextResponse.json(
      {
        success: true,
        data: bookmark,
        message: "Bookmark added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create bookmark error:", error);
    return NextResponse.json(
      {
        error: "Failed to create bookmark",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// PATCH - Update Bookmark (Progress or Notes)
// ═══════════════════════════════════════════════════

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { comicId, lastReadChapterId, notes } = body;

    if (!comicId) {
      return NextResponse.json({ error: "Comic ID is required" }, { status: 400 });
    }

    const validation = updateBookmarkSchema.safeParse({
      lastReadChapterId,
      notes,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    let updatedBookmark;

    if (validation.data.lastReadChapterId !== undefined) {
      // normalize comicId to number before calling mutation
      const comicIdNum = typeof comicId === "string" ? Number.parseInt(comicId, 10) : comicId;
      const lastReadChapterIdNum =
        typeof validation.data.lastReadChapterId === "string"
          ? Number.parseInt(validation.data.lastReadChapterId, 10)
          : validation.data.lastReadChapterId;
      updatedBookmark = await updateReadingProgress(
        session.user.id,
        comicIdNum,
        lastReadChapterIdNum
      );
    } else if (validation.data.notes !== undefined) {
      const comicIdNum = typeof comicId === "string" ? Number.parseInt(comicId, 10) : comicId;
      updatedBookmark = await updateBookmarkNotes(
        session.user.id,
        comicIdNum,
        validation.data.notes
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBookmark,
      message: "Bookmark updated successfully",
    });
  } catch (error) {
    console.error("Update bookmark error:", error);
    return NextResponse.json(
      {
        error: "Failed to update bookmark",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// DELETE - Remove Bookmark
// ═══════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const comicId = searchParams.get("comicId");

    if (!comicId) {
      return NextResponse.json({ error: "Comic ID is required" }, { status: 400 });
    }

    const deletedBookmark = await removeBookmark(session.user.id, Number.parseInt(comicId));

    if (!deletedBookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete bookmark",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
