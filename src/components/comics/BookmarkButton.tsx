"use client";

import { Button } from "@/components/ui/button";
import { useBookmarks, useNotifications } from "@/hooks/useStores";
import { addBookmark, removeBookmark } from "@/lib/actions/bookmark";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface BookmarkButtonProps {
  comicId: number;
  isBookmarked: boolean;
  isAuthenticated: boolean;
}

export function BookmarkButton({ comicId, isBookmarked, isAuthenticated }: BookmarkButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { addBookmark: addToStore, removeBookmark: removeFromStore } = useBookmarks();
  const { success, error } = useNotifications();

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      error("Please log in to bookmark comics");
      router.push("/sign-in");
      return;
    }

    startTransition(async () => {
      try {
        if (isBookmarked) {
          await removeBookmark(comicId);
          removeFromStore(comicId);
          success("Removed from bookmarks");
        } else {
          await addBookmark(comicId);
          addToStore(comicId);
          success("Added to bookmarks");
        }
        router.refresh();
      } catch {
        error("Failed to update bookmark");
      }
    });
  };

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      className="w-full"
      onClick={handleToggleBookmark}
      disabled={isPending}
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="mr-2 size-4" />
          Bookmarked
        </>
      ) : (
        <>
          <Bookmark className="mr-2 size-4" />
          Add to Bookmarks
        </>
      )}
    </Button>
  );
}
