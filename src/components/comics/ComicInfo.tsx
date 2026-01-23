/**
 * ComicInfo Component
 * Detailed information about a comic
 * @component
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Props for ComicInfo component
 */
interface ComicInfoProps {
  /**
   * Comic data
   */
  comic: any;
  /**
   * Related authors
   */
  authors?: Array<{ id: string; name: string }>;
  /**
   * Related genres
   */
  genres?: Array<{ id: string; name: string }>;
}

/**
 * ComicInfo Component
 * Displays detailed information about a comic
 * @param root0
 * @param root0.comic
 * @param root0.authors
 * @param root0.genres
 */
export function ComicInfo({ comic, authors = [], genres = [] }: ComicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authors */}
          {authors.length > 0 && (
            <div>
              <p className="text-sm font-medium">Authors</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {authors.map((author) => (
                  <Badge key={author.id} variant="secondary">
                    {author.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Genres */}
          {genres.length > 0 && (
            <div>
              <p className="text-sm font-medium">Genres</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge key={genre.id} variant="outline">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Release Year */}
          {comic.year && (
            <div>
              <p className="text-sm text-muted-foreground">Release Year: {comic.year}</p>
            </div>
          )}

          {/* Views */}
          {comic.views !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">
                Views: {(comic.views / 1000).toFixed(1)}K
              </p>
            </div>
          )}

          {/* Rating */}
          {comic.rating !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">
                Rating: {comic.rating.toFixed(1)} / 10
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description Card */}
      {comic.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm/relaxed text-muted-foreground">{comic.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
