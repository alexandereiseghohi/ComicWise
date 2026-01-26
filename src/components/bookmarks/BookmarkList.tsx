/**
 * BookmarkList Component
 * Display list of bookmarked comics
 * @component
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { normalizeImagePath } from "@/lib/image-path";
import Image from "next/image";
import Link from "next/link";

/**
 * Props for BookmarkList component
 */
interface BookmarkListProps {
  /**
   * Array of bookmarks
   */
  bookmarks: any[];
  /**
   * Is loading
   */
  isLoading?: boolean;
}

/**
 * Bookmark status styles
 */
const statusStyles: Record<string, string> = {
  reading: "bg-blue-100 text-blue-800",
  plan_to_read: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  dropped: "bg-gray-100 text-gray-800",
};

/**
 * BookmarkList Component
 * Displays bookmarked comics in a list
 * @param root0
 * @param root0.bookmarks
 * @param root0.isLoading
 */
export function BookmarkList({ bookmarks, isLoading }: BookmarkListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array.from({ length: 5 })].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <p className="text-center text-muted-foreground">
            No bookmarks yet. Start bookmarking comics!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <Link key={bookmark.id} href={`/comics/${bookmark.comic?.slug}`}>
          <Card className="cursor-pointer overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-0">
              <div className="flex gap-4 p-4">
                {/* Comic Image */}
                {bookmark.comic?.image && (
                  <div className="shrink-0">
                    <div className="relative aspect-3/4 w-20 overflow-hidden rounded-sm">
                      <Image
                        src={normalizeImagePath(bookmark.comic.image) ?? bookmark.comic.image}
                        alt={bookmark.comic.title ?? "Comic"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="line-clamp-2 font-semibold">{bookmark.comic?.title}</h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {bookmark.comic?.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={statusStyles[bookmark.status ?? "reading"]}>
                      {bookmark.status?.replaceAll("_", " ").toUpperCase()}
                    </Badge>
                    {bookmark.comic?.rating && (
                      <span className="text-xs text-yellow-600">
                        ★ {bookmark.comic.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
