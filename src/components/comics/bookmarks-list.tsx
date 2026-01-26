"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { removeBookmark } from "@/lib/actions/bookmark";
import { normalizeImagePath } from "@/lib/image-path";
import { BookmarkX, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface Bookmark {
  comic: {
    id: number;
    title: string;
    slug: string;
    coverImage: string;
    status: string;
    rating: string | null;
  };
  lastReadChapter: {
    id: number;
    title: string;
    slug: string;
    chapterNumber: number;
  } | null;
  notes: string | null;
  updatedAt: Date;
}

interface BookmarksListProps {
  bookmarks: Bookmark[];
}

export function BookmarksList({ bookmarks }: BookmarksListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemove = async (comicId: number) => {
    startTransition(async () => {
      try {
        await removeBookmark(comicId);
        toast.success("Bookmark removed");
        router.refresh();
      } catch {
        toast.error("Failed to remove bookmark");
      }
    });
  };

  if (bookmarks.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-lg text-muted-foreground">No bookmarks yet</p>
        <Link href="/comics">
          <Button>Browse Comics</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.comic.id} className="overflow-hidden">
          <div className="flex gap-4 p-4">
            <Link href={`/comics/${bookmark.comic.slug}`} className="shrink-0">
              <div className="relative h-32 w-24 overflow-hidden rounded-sm">
                <Image
                  src={normalizeImagePath(bookmark.comic.coverImage) ?? bookmark.comic.coverImage}
                  alt={bookmark.comic.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link href={`/comics/${bookmark.comic.slug}`}>
                  <h3 className="mb-1 line-clamp-2 font-semibold hover:underline">
                    {bookmark.comic.title}
                  </h3>
                </Link>
                <Badge variant="secondary" className="mb-2 text-xs">
                  {bookmark.comic.status}
                </Badge>

                {bookmark.lastReadChapter && (
                  <p className="text-xs text-muted-foreground">
                    Last read: Ch. {bookmark.lastReadChapter.chapterNumber}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {bookmark.lastReadChapter ? (
                  <Link
                    href={`/comics/${bookmark.comic.slug}/${bookmark.lastReadChapter.slug}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Play className="mr-1 size-3" />
                      Continue
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/comics/${bookmark.comic.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Play className="mr-1 size-3" />
                      Start
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(bookmark.comic.id)}
                  disabled={isPending}
                >
                  <BookmarkX className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
