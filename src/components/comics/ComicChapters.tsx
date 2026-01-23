/**
 * ComicChapters Component
 * Displays list of chapters for a comic
 * @component
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

/**
 * Props for ComicChapters component
 */
interface ComicChaptersProps {
  /**
   * Comic slug for links
   */
  comicSlug: string;
  /**
   * Array of chapters
   */
  chapters: any[];
  /**
   * Is loading
   */
  isLoading?: boolean;
}

/**
 * ComicChapters Component
 * Displays chapters in a list with links to read
 * @param root0
 * @param root0.comicSlug
 * @param root0.chapters
 * @param root0.isLoading
 */
export function ComicChapters({ comicSlug, chapters, isLoading }: ComicChaptersProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chapters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array.from({ length: 5 })].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-sm bg-muted" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!chapters || chapters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chapters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No chapters available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapters</CardTitle>
        <CardDescription>
          {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {chapters.map((chapter) => (
          <Link key={chapter.id} href={`/comics/${comicSlug}/chapter/${chapter.number}`}>
            <Button variant="ghost" className="w-full justify-between text-left">
              <div>
                <p className="font-medium">Chapter {chapter.number}</p>
                {chapter.title && <p className="text-xs text-muted-foreground">{chapter.title}</p>}
              </div>
              <div className="flex items-center gap-2">
                {chapter.views !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {(chapter.views / 1000).toFixed(0)}K views
                  </span>
                )}
                {chapter.is_premium && (
                  <Badge variant="secondary" className="text-xs">
                    Premium
                  </Badge>
                )}
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
