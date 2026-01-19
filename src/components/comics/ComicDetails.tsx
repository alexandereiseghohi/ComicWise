"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Calendar, Eye, Palette, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "./BookmarkButton";

interface Comic {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  status: string;
  rating: string | null;
  views: number;
  publicationDate: Date;
  url: string | null;
  serialization: string | null;
  author: { id: number | null; name: string | null } | null;
  artist: { id: number | null; name: string | null } | null;
  type: { id: number | null; name: string | null } | null;
}

interface Chapter {
  id: number;
  slug: string;
  title: string;
  chapterNumber: number;
  releaseDate: Date;
}

interface Genre {
  id: number;
  name: string;
}

interface ComicDetailsProps {
  comic: Comic;
  chapters: Chapter[];
  genres: Genre[];
  isBookmarked: boolean;
  isAuthenticated: boolean;
}

export function ComicDetails({
  comic,
  chapters,
  genres,
  isBookmarked,
  isAuthenticated,
}: ComicDetailsProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <div className="relative aspect-2/3">
              <Image
                src={comic.coverImage}
                alt={comic.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <CardContent className="space-y-4 p-4">
              <BookmarkButton
                comicId={comic.id}
                isBookmarked={isBookmarked}
                isAuthenticated={isAuthenticated}
              />

              {chapters.length > 0 && (
                <Link href={`/comics/${comic.slug}/${chapters[0]!.slug}`}>
                  <Button className="w-full" size="lg">
                    Start Reading
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="mb-2 text-4xl font-bold">{comic.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span>{comic.rating || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="size-4" />
                <span>{comic.views.toLocaleString()} views</span>
              </div>
              <Badge variant="secondary">{comic.status}</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {comic.author?.name && (
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Author:</span>{" "}
                    <span className="font-medium">{comic.author.name}</span>
                  </span>
                </div>
              )}

              {comic.artist?.name && (
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Artist:</span>{" "}
                    <span className="font-medium">{comic.artist.name}</span>
                  </span>
                </div>
              )}

              {comic.type?.name && (
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <span className="font-medium">{comic.type.name}</span>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Published:</span>{" "}
                  <span className="font-medium">
                    {new Date(comic.publicationDate).toLocaleDateString()}
                  </span>
                </span>
              </div>
            </div>

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge key={genre.id} variant="outline">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h2 className="mb-3 text-xl font-semibold">Synopsis</h2>
            <p className="leading-relaxed text-muted-foreground">{comic.description}</p>
          </div>

          <Separator />

          <div>
            <h2 className="mb-4 text-xl font-semibold">Chapters ({chapters.length})</h2>
            {chapters.length === 0 ? (
              <p className="text-muted-foreground">No chapters available yet.</p>
            ) : (
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/comics/${comic.slug}/${chapter.slug}`}
                    className="block"
                  >
                    <Card className="transition-colors hover:bg-accent">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">
                            Chapter {chapter.chapterNumber}: {chapter.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(chapter.releaseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Read
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
