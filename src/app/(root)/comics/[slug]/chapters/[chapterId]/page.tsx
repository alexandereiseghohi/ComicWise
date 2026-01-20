/**
 * Chapter Reader Page
 *
 * Full-screen chapter reader with:
 * - Image/content display
 * - Navigation between chapters
 * - Reading progress tracking
 * - Comments and ratings
 *
 * @route GET /comics/[slug]/chapters/[chapterId]
 * @param slug Comic slug
 * @param chapterId Chapter ID
 *
 * @returns Chapter reader interface
 */

"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  MessageSquare,
  Minimize2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ChapterImage {
  id: string;
  url: string;
  order: number;
}

interface ChapterDetail {
  id: string;
  number: number;
  title: string;
  content: string;
  images: ChapterImage[];
  publishedAt: string;
  previousChapterId?: string;
  nextChapterId?: string;
  comicSlug: string;
  comicTitle: string;
}

interface ChapterReaderProps {
  params: {
    slug: string;
    chapterId: string;
  };
}

/**
 * Fetch chapter detail from API
 */
async function fetchChapterDetail(slug: string, chapterId: string): Promise<ChapterDetail> {
  const response = await fetch(`/api/comics/${slug}/chapters/${chapterId}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) throw new Error("Failed to fetch chapter");
  return response.json();
}

/**
 * Chapter Reader Component
 */
export default function ChapterReaderPage({ params }: ChapterReaderProps) {
  const { slug, chapterId } = params;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: chapter,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chapter", slug, chapterId],
    queryFn: () => fetchChapterDetail(slug, chapterId),
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">Error loading chapter</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`/comics/${slug}`}>Back to Comic</Link>
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

  if (!chapter) return null;

  const currentImage = chapter.images[currentImageIndex];
  const hasMultipleImages = chapter.images.length > 1;

  return (
    <div className={`${isFullscreen ? "fullscreen" : ""} bg-black min-h-screen`}>
      {/* Header */}
      {!isFullscreen && (
        <div className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <Link href={`/comics/${slug}`} className="text-sm text-blue-400 hover:underline">
                ← {chapter.comicTitle}
              </Link>
              <h1 className="text-xl font-bold mt-2">
                Chapter {chapter.number}: {chapter.title}
              </h1>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-gray-800"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Reader */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        {currentImage && (
          <div className="relative max-w-4xl w-full aspect-auto">
            <Image
              src={currentImage.url}
              alt={`Page ${currentImageIndex + 1}`}
              width={1200}
              height={1600}
              priority
              className="w-full h-auto rounded-lg"
            />

            {/* Navigation Buttons (Overlay) */}
            {hasMultipleImages && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    setCurrentImageIndex(Math.min(chapter.images.length - 1, currentImageIndex + 1))
                  }
                  disabled={currentImageIndex === chapter.images.length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      {!isFullscreen && (
        <div className="bg-gray-900 border-t border-gray-800 sticky bottom-0 z-10">
          <div className="container mx-auto px-4 py-6">
            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="text-center text-gray-400 mb-4">
                <p>
                  Page {currentImageIndex + 1} of {chapter.images.length}
                </p>
              </div>
            )}

            {/* Chapter Navigation */}
            <div className="flex items-center justify-between gap-4">
              {chapter.previousChapterId ? (
                <Link
                  href={`/comics/${slug}/chapters/${chapter.previousChapterId}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous Chapter
                  </Button>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              <Link href={`/comics/${slug}`}>
                <Button variant="ghost" className="text-gray-400">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments
                </Button>
              </Link>

              {chapter.nextChapterId ? (
                <Link href={`/comics/${slug}/chapters/${chapter.nextChapterId}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Next Chapter
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
