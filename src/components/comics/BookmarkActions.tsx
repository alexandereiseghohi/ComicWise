"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { addBookmark, removeBookmark, updateBookmarkStatus } from "@/lib/actions/bookmark";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export type BookmarkStatus = "Reading" | "PlanToRead" | "Completed" | "Dropped" | "OnHold";

interface BookmarkActionsProps {
  comicId: number;
  comicSlug: string;
  isBookmarked: boolean;
  currentStatus?: BookmarkStatus;
  isAuthenticated: boolean;
}

const STATUS_LABELS: Record<BookmarkStatus, string> = {
  Reading: "Reading",
  PlanToRead: "Plan to Read",
  Completed: "Completed",
  Dropped: "Dropped",
  OnHold: "On Hold",
};

export function BookmarkActions({
  comicId,
  comicSlug,
  isBookmarked,
  currentStatus,
  isAuthenticated,
}: BookmarkActionsProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [status, setStatus] = useState<BookmarkStatus | undefined>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleAddBookmark = (selectedStatus: BookmarkStatus) => {
    if (!isAuthenticated) {
      toast.error("Please log in to bookmark comics");
      router.push("/sign-in");
      return;
    }

    startTransition(async () => {
      // Optimistic update
      const previousBookmarked = bookmarked;
      const previousStatus = status;

      setBookmarked(true);
      setStatus(selectedStatus);

      try {
        const result = await addBookmark(comicId, selectedStatus);

        if (result.success) {
          toast.success(`Added to ${STATUS_LABELS[selectedStatus]}!`);
          router.refresh();
        } else {
          // Revert on failure
          setBookmarked(previousBookmarked);
          setStatus(previousStatus);
          toast.error(result.error || "Failed to add bookmark");
        }
      } catch (error) {
        // Revert on error
        setBookmarked(previousBookmarked);
        setStatus(previousStatus);
        toast.error("Failed to add bookmark");
        console.error("Bookmark error:", error);
      }
    });
  };

  const handleRemoveBookmark = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to manage bookmarks");
      return;
    }

    startTransition(async () => {
      // Optimistic update
      const previousBookmarked = bookmarked;
      const previousStatus = status;

      setBookmarked(false);
      setStatus(undefined);

      try {
        const result = await removeBookmark(comicId);

        if (result.success) {
          toast.success("Removed from bookmarks");
          router.refresh();
        } else {
          // Revert on failure
          setBookmarked(previousBookmarked);
          setStatus(previousStatus);
          toast.error(result.error || "Failed to remove bookmark");
        }
      } catch (error) {
        // Revert on error
        setBookmarked(previousBookmarked);
        setStatus(previousStatus);
        toast.error("Failed to remove bookmark");
        console.error("Remove bookmark error:", error);
      }
    });
  };

  const handleChangeStatus = (newStatus: BookmarkStatus) => {
    if (!isAuthenticated) {
      toast.error("Please log in to manage bookmarks");
      return;
    }

    startTransition(async () => {
      const previousStatus = status;
      setStatus(newStatus);

      try {
        const result = await updateBookmarkStatus(comicId, newStatus);

        if (result.success) {
          toast.success(`Changed to ${STATUS_LABELS[newStatus]}`);
          router.refresh();
        } else {
          setStatus(previousStatus);
          toast.error(result.error || "Failed to update status");
        }
      } catch (error) {
        setStatus(previousStatus);
        toast.error("Failed to update status");
        console.error("Update status error:", error);
      }
    });
  };

  if (bookmarked && status) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          onClick={handleRemoveBookmark}
          disabled={isPending}
          className="flex-1 gap-2"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <BookmarkCheck className="size-4" />
          )}
          {STATUS_LABELS[status]}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending}>
              Change
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["Reading", "PlanToRead", "Completed", "Dropped", "OnHold"] as const).map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => handleChangeStatus(s)}
                disabled={s === status}
              >
                {STATUS_LABELS[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isPending || !isAuthenticated} className="w-full gap-2">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Bookmark className="size-4" />
          )}
          Add to Bookmarks
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["Reading", "PlanToRead", "Completed", "OnHold"] as const).map((s) => (
          <DropdownMenuItem key={s} onClick={() => handleAddBookmark(s)}>
            {STATUS_LABELS[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
