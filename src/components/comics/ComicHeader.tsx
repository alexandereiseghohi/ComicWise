/**
 * ComicHeader Component
 * Header section for comic detail pages
 * @component
 */

import { Badge } from "@/components/ui/badge";
import { normalizeImagePath } from "@/lib/image-path";
import Image from "next/image";

/**
 * Props for ComicHeader component
 */
interface ComicHeaderProps {
  /**
   * Comic data
   */
  comic: any;
}

/**
 * ComicHeader Component
 * Displays comic cover image and title
 * @param root0
 * @param root0.comic
 */
export function ComicHeader({ comic }: ComicHeaderProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      {/* Cover Image */}
      {comic.image && (
        <div className="shrink-0">
          <div className="relative aspect-3/4 w-48 overflow-hidden rounded-lg shadow-lg">
            <Image
              src={normalizeImagePath(comic.image) ?? comic.image}
              alt={comic.title ?? "Comic"}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Title and Basic Info */}
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{comic.title}</h1>
          {comic.alternateTitle && (
            <p className="text-sm text-muted-foreground">{comic.alternateTitle}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {comic.type && <Badge variant="default">{comic.type}</Badge>}
          {comic.status && <Badge variant="secondary">{comic.status}</Badge>}
          {comic.rating && <Badge variant="outline">★ {comic.rating.toFixed(1)} / 10</Badge>}
        </div>

        {/* Description */}
        {comic.description && (
          <p className="line-clamp-4 text-sm text-muted-foreground">{comic.description}</p>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
          {comic.year && (
            <div>
              <p className="font-medium">Year</p>
              <p className="text-muted-foreground">{comic.year}</p>
            </div>
          )}
          {comic.views !== undefined && (
            <div>
              <p className="font-medium">Views</p>
              <p className="text-muted-foreground">{(comic.views / 1000).toFixed(1)}K</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
