// ═══════════════════════════════════════════════════
// CHAPTERS API - Full CRUD with Filtering & Pagination
// ═══════════════════════════════════════════════════

import { env } from "@/appConfig";
import { createChapter } from "@/database/mutations/chapters";
import { getUsersBookmarkedComic } from "@/database/queries/bookmarks";
import { getAllChapters } from "@/database/queries/chapters";
import { sendNewChapterNotification } from "@/lib/email";
import { chapterFilterSchema, createChapterSchema } from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - List Chapters with Filtering & Pagination
// ═══════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;

    const filters = {
      comicId: searchParams.get("comicId")
        ? Number.parseInt(searchParams.get("comicId")!)
        : undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 12,
      sortBy: searchParams.get("sortBy") ?? "chapterNumber",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "asc",
    };

    const validation = chapterFilterSchema.safeParse(filters);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await getAllChapters(validation.data);

    return NextResponse.json({
      success: true,
      data: result.chapters,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("Get chapters error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch chapters",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// POST - Create New Chapter
// ═══════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = createChapterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const comicIdNum =
      typeof validation.data.comicId === "string"
        ? Number.parseInt(validation.data.comicId, 10)
        : validation.data.comicId;

    const newChapter = await createChapter({
      title: validation.data.title,
      chapterNumber: validation.data.chapterNumber,
      releaseDate: validation.data.releaseDate,
      comicId: comicIdNum,
    });

    if (!newChapter) {
      return NextResponse.json({ error: "Failed to create chapter" }, { status: 500 });
    }

    // Send email notifications to users who bookmarked this comic
    if (body.sendNotifications !== false) {
      try {
        const bookmarkedUsers = await getUsersBookmarkedComic(comicIdNum);

        // Send notifications asynchronously
        Promise.all(
          bookmarkedUsers.map((user: any) =>
            sendNewChapterNotification({
              to: user.email,
              userName: user.name ?? "Reader",
              comicTitle: body.comicTitle ?? "Comic",
              chapterTitle: newChapter.title,
              chapterNumber: newChapter.chapterNumber,
              chapterUrl: `${env.NEXT_PUBLIC_APP_URL}/comics/${validation.data.comicId}/chapters/${newChapter.id}`,
            })
          )
        ).catch((error) => console.error("Failed to send notifications:", error));
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the request if emails fail
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: newChapter,
        message: "Chapter created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json(
      {
        error: "Failed to create chapter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
