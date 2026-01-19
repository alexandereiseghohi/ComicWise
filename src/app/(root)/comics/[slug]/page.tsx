import { BookmarkButton } from "@/components/comics/BookmarkButton";
import { ComicCard } from "@/components/layout/ComicCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getComic, getRecommendedComics } from "@/database/queries";
import { auth } from "@/lib/auth";
import { BookOpen, Calendar, Eye, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatDate } from "utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function ComicDetails({ comicSlug }: { comicSlug: string }) {
  const [comic, session] = await Promise.all([
    getComic(comicSlug),
    auth(),
  ]);

  if (!comic) {
    notFound();
  }

  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id;
  
  // Check if comic is bookmarked by user
  let isBookmarked = false;
  if (userId && comic.bookmarks) {
    isBookmarked = comic.bookmarks.some((bookmark: { userId: number }) => bookmark.userId === Number(userId));
  }

  return (
    <>
      {/* Comic Header */}
      <div
        className={`
          grid gap-8
          md:grid-cols-[300px_1fr]
        `}
      >
        {/* Cover Image */}
        <div
          className={`
            relative aspect-2/3 overflow-hidden rounded-lg
            md:aspect-auto md:h-[450px]
          `}
        >
          <Image
            src={comic.coverImage || "/placeholder-comic.png"}
            alt={comic.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1
              className={`
                mb-2 text-3xl font-bold
                md:text-4xl
              `}
            >
              {comic.title}
            </h1>
            <div
              className={`
                flex flex-wrap items-center gap-2 text-sm text-muted-foreground
              `}
            >
              {comic.author && <span>By {comic.author.name}</span>}
              {comic.artist && <span>• Art by {comic.artist.name}</span>}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Star className="size-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{comic.rating}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="size-5" />
              <span>{Number(comic.views)} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-5" />
              <span>{formatDate(comic.publicationDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-5" />
              <span>{comic.chapters?.length || 0} chapters</span>
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{comic.status}</Badge>
              {comic.type && <Badge variant="outline">{comic.type.name}</Badge>}
            </div>
            {comic.genres && comic.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {comic.genres.map((genre: { id: number; name: string }) => (
                  <Badge key={genre.id} variant="outline">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {comic.chapters && comic.chapters.length > 0 && (
              <Link href={`/comics/${comic.slug}/${comic.chapters[0]?.chapterNumber ?? 1}`}>
                <Button size="lg">Start Reading</Button>
              </Link>
            )}
            <BookmarkButton 
              comicId={comic.id} 
              isBookmarked={isBookmarked}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 font-semibold">Synopsis</h2>
            <p className="leading-relaxed text-muted-foreground">{comic.description}</p>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <section className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Chapters</h2>
        <div className="space-y-2">
          {comic.chapters?.map(
            (chapter: { id: number; title: string; releaseDate: Date; views: number }) => (
              <Link key={chapter.id} href={`/comics/${comic.id}/read/${chapter.id}`}>
                <Card
                  className={`
                    transition-colors
                    hover:bg-muted
                  `}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-medium">{chapter.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(chapter.releaseDate)}
                      </p>
                    </div>
                    <div
                      className={`
                        flex items-center gap-2 text-sm text-muted-foreground
                      `}
                    >
                      <Eye className="size-4" />
                      <span>{Number(chapter.views)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          )}
        </div>
      </section>
    </>
  );
}

async function RecommendedComics({ comicSlug }: { comicSlug: string }) {
  const recommended = await getRecommendedComics(comicSlug, 4);

  if (recommended.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">You Might Also Like</h2>
      <div
        className={`
          grid grid-cols-2 gap-4
          md:grid-cols-4
        `}
      >
        {recommended.map((comic) => (
          <ComicCard key={comic.slug} comic={comic} authorName={null} typeName={comic.typeName} />
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className={`
        grid gap-8
        md:grid-cols-[300px_1fr]
      `}
    >
      <Skeleton
        className={`
          aspect-2/3
          md:h-[450px]
        `}
      />
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

export default async function ComicDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const comicSlug = String(slug);

  if (!comicSlug) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <ComicDetails comicSlug={comicSlug} />
      </Suspense>

      <Suspense>
        <RecommendedComics comicSlug={comicSlug} />
      </Suspense>
    </div>
  );
}
