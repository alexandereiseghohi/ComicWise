// ═══════════════════════════════════════════════════
// COMMENTS API - Full CRUD with Email Notifications
// ═══════════════════════════════════════════════════

import { createComment } from "@/database/mutations/comments";
import { getCommentsByChapter } from "@/database/queries/comments";
import { sendCommentNotificationEmail } from "@/lib/email";
import { createCommentSchema } from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - List Comments with Filtering
// ═══════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;

    const chapterId = searchParams.get("chapterId");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    if (!chapterId) {
      return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
    }

    const offset = (page - 1) * limit;
    const comments = await getCommentsByChapter(Number.parseInt(chapterId), {
      limit,
      offset,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch comments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// POST - Create New Comment
// ═══════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validation = createCommentSchema.safeParse({
      ...body,
      userId: session.user.id,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const newComment = await createComment({
      content: validation.data.content,
      userId: session.user.id,
      chapterId: validation.data.chapterId,
    });

    if (!newComment) {
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }

    // Send email notification (optional - could be to comic author or other users)
    if (body.notifyUsers && body.notifyUsers.length > 0) {
      try {
        Promise.all(
          body.notifyUsers.map((email: string) =>
            sendCommentNotificationEmail({
              userName: body.recipientName || "User",
              userEmail: email,
              commenterName: session.user.name || "Someone",
              commenterAvatar: session.user.image ?? undefined,
              commentText: validation.data.content,
              comicTitle: body.comicTitle || "a comic",
              chapterNumber: body.chapterNumber,
              commentId: newComment.id.toString(),
              commentType: "new",
            })
          )
        ).catch((error) => console.error("Failed to send comment notifications:", error));
      } catch (emailError) {
        console.error("Email notification error:", emailError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: newComment,
        message: "Comment created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      {
        error: "Failed to create comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
