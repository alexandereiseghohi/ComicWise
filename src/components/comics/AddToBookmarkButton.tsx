/**
 * AddToBookmarkButton Component
 * Button to add a comic to bookmarks
 * @component
 */

"use client";

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

/**
 * Props for AddToBookmarkButton
 */
interface AddToBookmarkButtonProps {
  /**
   * Comic ID
   */
  comicId: string;
  /**
   * Is already bookmarked
   */
  isBookmarked?: boolean;
  /**
   * Callback when bookmark status changes
   */
  onBookmarkChange?(isBookmarked: boolean): void;
}

/**
 * AddToBookmarkButton Component
 * Allows users to bookmark comics
 * @param root0
 * @param root0.comicId
 * @param root0.isBookmarked
 * @param root0.onBookmarkChange
 */
export function AddToBookmarkButton({
  comicId,
  isBookmarked = false,
  onBookmarkChange,
}: AddToBookmarkButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleClick = async () => {
    if (!session?.user) {
      // Redirect to login
      window.location.href = "/sign-in";
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(bookmarked ? `/api/bookmarks/${comicId}` : "/api/bookmarks", {
        method: bookmarked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comicId }),
      });

      if (response.ok) {
        setBookmarked(!bookmarked);
        onBookmarkChange?.(!bookmarked);
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={bookmarked ? "default" : "outline"}
      className="gap-2"
    >
      <Bookmark className="size-4" fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "Bookmarked" : "Add Bookmark"}
    </Button>
  );
}
