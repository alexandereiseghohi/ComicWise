"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { normalizeImagePath } from "@/lib/image-path";
import { useComicStore } from "@/stores";
import { Eye, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Comic {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  status: string;
  rating: string | null;
  views: number;
}

interface ComicCardProps {
  comic: Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  const addRecentlyViewed = useComicStore((state) => state.addRecentlyViewed);

  const handleClick = () => {
    addRecentlyViewed(comic.id);
  };

  return (
    <Link href={`/comics/${comic.slug}`} onClick={handleClick}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-2/3 overflow-hidden">
          <Image
            src={normalizeImagePath(comic.coverImage) ?? "/placeholder-comic.jpg"}
            alt={comic.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {comic.status}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold">{comic.title}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="size-3 fill-yellow-400 text-yellow-400" />
              <span>{comic.rating ?? "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="size-3" />
              <span>{comic.views.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
