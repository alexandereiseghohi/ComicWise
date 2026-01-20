/**
 * Comic Detail Page
 *
 * Displays detailed information about a specific comic including:
 * - Cover image and metadata
 * - Description and genres
 * - Chapter list with reading progress
 * - Rating and reviews
 * - Bookmark functionality
 *
 * @route GET /comics/[slug]
 * @param slug Comic slug identifier
 *
 * @returns Comic detail page with chapters and metadata
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Calendar, Heart, Loader2, Star, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ComicDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  rating: number;
  coverImage: string | null;
  genres: Array<{ name: string }>;
  author: { name: string } | null;
  artist: { name: string } | null;
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    publishedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

interface ComicDetailPageProps {
  params: {
    slug: string;
  };
}

/**
 * Fetch comic detail from API
 */
async function fetchComicDetail(slug: string): Promise<ComicDetail> {
  const response = await fetch(`/api/comics/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) throw new Error("Failed to fetch comic");
  return response.json();
}

/**
 * Comic Detail Page Component
 */
export default function ComicDetailPage({ params }: ComicDetailPageProps) {
  const { slug } = params;
  const [isBookmarked, setIsBookmarked] = useState(false);

  const {
    data: comic,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comic", slug],
    queryFn: () => fetchComicDetail(slug),
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">Error loading comic</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/comics">Back to Comics</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!comic) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/comics" className="text-sm text-blue-600 hover:underline">
            ← Back to Comics
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Cover Image and Actions */}
          <div className="md:col-span-1">
            <Card>
              {/* Cover Image */}
              <div className="relative w-full aspect-[3/4] bg-gray-200 rounded-t-lg overflow-hidden">
                {comic.coverImage ? (
                  <Image src={comic.coverImage} alt={comic.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-400 to-pink-600">
                    <BookOpen className="w-12 h-12 text-white opacity-50" />
                  </div>
                )}
              </div>

              <CardContent className="pt-6 space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="font-semibold">{comic.rating.toFixed(1)}/10</p>
                    <p className="text-sm text-gray-600">Based on votes</p>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge
                  className="w-full justify-center py-2 text-base"
                  variant={
                    comic.status === "ongoing"
                      ? "default"
                      : comic.status === "completed"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {comic.status.charAt(0).toUpperCase() + comic.status.slice(1)}
                </Badge>

                {/* Bookmark Button */}
                <Button
                  className="w-full"
                  variant={isBookmarked ? "default" : "outline"}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>

                {/* Read Button */}
                {comic.chapters.length > 0 && (
                  <Link
                    href={`/comics/${slug}/chapters/${comic.chapters[0]?.id}`}
                    className="w-full"
                  >
                    <Button className="w-full" variant="default">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read First Chapter
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Info Cards */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {comic.author && (
                  <div>
                    <p className="font-semibold text-gray-600">Author</p>
                    <p>{comic.author.name}</p>
                  </div>
                )}
                {comic.artist && (
                  <div>
                    <p className="font-semibold text-gray-600">Artist</p>
                    <p>{comic.artist.name}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-600">Chapters</p>
                  <p>{comic.chapters.length}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Views</p>
                  <p>{comic.viewCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Updated</p>
                  <p>{new Date(comic.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Description and Chapters */}
          <div className="md:col-span-2 space-y-6">
            {/* Title and Genres */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{comic.title}</h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {comic.genres.map((genre) => (
                  <Badge key={genre.name} variant="outline">
                    <Tag className="w-3 h-3 mr-1" />
                    {genre.name}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{comic.description}</p>
              </div>
            </div>

            {/* Tabs: Chapters, Reviews, etc */}
            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chapters">Chapters ({comic.chapters.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              {/* Chapters Tab */}
              <TabsContent value="chapters" className="space-y-2">
                {comic.chapters.length > 0 ? (
                  <div className="grid gap-2">
                    {comic.chapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        href={`/comics/${slug}/chapters/${chapter.id}`}
                        className="block"
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="flex items-center justify-between py-4">
                            <div>
                              <p className="font-semibold">Chapter {chapter.number}</p>
                              <p className="text-sm text-gray-600">{chapter.title}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(chapter.publishedAt).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 py-8 text-center">No chapters available yet</p>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardContent className="py-8 text-center text-gray-600">
                    <p>Reviews coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments">
                <Card>
                  <CardContent className="py-8 text-center text-gray-600">
                    <p>Comments coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
