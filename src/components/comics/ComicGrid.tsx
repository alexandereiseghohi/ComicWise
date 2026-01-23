/**
 * ComicGrid Component
 * Displays comics in a responsive grid layout
 * @component
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

/**
 * Props for ComicGrid component
 */
interface ComicGridProps {
  /**
   * Array of comics to display
   */
  comics: any[];
  /**
   * Is the grid loading
   */
  isLoading?: boolean;
}

/**
 * ComicGrid Component
 * Displays a grid of comic cards with images and metadata
 * @param root0
 * @param root0.comics
 * @param root0.isLoading
 */
export function ComicGrid({ comics, isLoading }: ComicGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array.from({ length: 8 })].map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="aspect-3/4 rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-4 rounded-sm bg-muted" />
              <div className="h-3 w-24 rounded-sm bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!comics || comics.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-center text-muted-foreground">No comics found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {comics.map((comic) => (
        <Link key={comic.id} href={`/comics/${comic.slug}`}>
          <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-0">
              {comic.image && (
                <div className="relative aspect-3/4 overflow-hidden bg-muted">
                  <Image
                    src={comic.image}
                    alt={comic.title || "Comic"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
            </CardContent>
            <CardHeader className="space-y-2 py-3">
              <h3 className="line-clamp-2 text-sm/tight font-semibold">{comic.title}</h3>
              {comic.rating && (
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  ★ {comic.rating.toFixed(1)}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {comic.type && (
                  <Badge variant="secondary" className="text-xs">
                    {comic.type}
                  </Badge>
                )}
                {comic.status && (
                  <Badge variant="outline" className="text-xs">
                    {comic.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
