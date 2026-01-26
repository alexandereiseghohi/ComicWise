import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { normalizeImagePath } from "@/lib/image-path";
import type { Comic } from "@/types";
import { Eye, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ComicCardProps {
  comic: Partial<Comic> & {
    slug: string;
    title: string;
    coverImage: string;
    rating?: string | null;
  };
  authorName?: string | null;
  typeName?: string | null;
}

export function ComicCard({ comic, authorName, typeName }: ComicCardProps) {
  return (
    <Link href={`/comics/${comic.slug}`}>
      <Card
        className={`
          group overflow-hidden transition-all
          hover:shadow-lg
        `}
      >
        <div className="relative aspect-2/3 overflow-hidden">
          <Image
            src={
              normalizeImagePath(comic.coverImage ?? "/placeholder-comic.jpg") ??
              "/placeholder-comic.jpg"
            }
            alt={comic.title}
            fill
            className={`
              object-cover transition-transform
              group-hover:scale-105
            `}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {comic.status && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              {comic.status}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-semibold">{comic.title}</h3>
          {authorName && <p className="mt-1 text-sm text-muted-foreground">{authorName}</p>}
          {typeName && <p className="mt-1 text-xs text-muted-foreground">{typeName}</p>}
        </CardContent>

        <CardFooter
          className={`
            flex items-center gap-4 p-4 pt-0 text-sm text-muted-foreground
          `}
        >
          {comic.rating && (
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span>{comic.rating}</span>
            </div>
          )}
          {comic.views !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="size-4" />
              <span>{Number(comic.views)}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
