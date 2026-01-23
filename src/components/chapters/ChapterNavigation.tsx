/**
 * ChapterNavigation Component
 * Navigation between chapters
 * @component
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

/**
 * Props for ChapterNavigation component
 */
interface ChapterNavigationProps {
  /**
   * Comic slug
   */
  comicSlug: string;
  /**
   * Current chapter number
   */
  currentChapter: number;
  /**
   * Total chapters
   */
  totalChapters: number;
  /**
   * Previous chapter number
   */
  previousChapter?: number;
  /**
   * Next chapter number
   */
  nextChapter?: number;
}

/**
 * ChapterNavigation Component
 * Allows navigation between chapters
 * @param root0
 * @param root0.comicSlug
 * @param root0.currentChapter
 * @param root0.totalChapters
 * @param root0.previousChapter
 * @param root0.nextChapter
 */
export function ChapterNavigation({
  comicSlug,
  currentChapter,
  totalChapters,
  previousChapter,
  nextChapter,
}: ChapterNavigationProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {previousChapter !== undefined ? (
          <Link href={`/comics/${comicSlug}/chapter/${previousChapter}`}>
            <Button variant="outline">← Previous Chapter</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>
            ← Previous Chapter
          </Button>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium">Chapter {currentChapter}</p>
          <p className="text-xs">
            {currentChapter} of {totalChapters}
          </p>
        </div>

        {nextChapter !== undefined ? (
          <Link href={`/comics/${comicSlug}/chapter/${nextChapter}`}>
            <Button variant="outline">Next Chapter →</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>
            Next Chapter →
          </Button>
        )}
      </div>
    </Card>
  );
}
