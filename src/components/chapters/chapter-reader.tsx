"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookmarks, useReader } from "@/hooks/use-stores";
import { ChevronLeft, ChevronRight, Home, List, Maximize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface Comic {
  id: number;
  title: string;
  slug: string;
}

interface Chapter {
  id: number;
  slug: string;
  title: string;
  chapterNumber: number;
}

interface ChapterImage {
  id: number;
  imageUrl: string;
  pageNumber: number;
}

interface ChapterReaderProps {
  comic: Comic;
  chapter: Chapter;
  images: ChapterImage[];
  prevChapter: { slug: string; chapterNumber: number } | null;
  nextChapter: { slug: string; chapterNumber: number } | null;
}

export function ChapterReader({
  comic,
  chapter,
  images,
  prevChapter,
  nextChapter,
}: ChapterReaderProps) {
  const {
    readingMode,
    setReadingMode,
    currentPage,
    setPage,
    setTotalPages,
    fullscreen,
    toggleFullscreen,
    addToHistory,
    setZoom,
    zoom,
  } = useReader();
  const { updateProgress } = useBookmarks();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize reader state
  useEffect(() => {
    setTotalPages(images.length);
    addToHistory(comic.id, chapter.id, 1);
  }, [images.length, comic.id, chapter.id, setTotalPages, addToHistory]);

  // Keyboard navigation for vertical mode
  useEffect(() => {
    if (readingMode !== "vertical") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight, behavior: "smooth" });

          break;

        case "ArrowLeft":
          e.preventDefault();
          window.scrollBy({ top: -window.innerHeight, behavior: "smooth" });

          break;

        case "f":
        case "F":
          e.preventDefault();
          setLightboxOpen(true);

          break;

        // No default
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readingMode]);

  // Auto-save reading progress
  useEffect(() => {
    const page = currentIndex + 1;
    setPage(page);
    updateProgress(comic.id, chapter.id);
    addToHistory(comic.id, chapter.id, page);
  }, [currentIndex, comic.id, chapter.id, setPage, updateProgress, addToHistory]);

  const handleOpenLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }, []);

  const lightboxSlides = images.map((image) => ({
    src: image.imageUrl,
    alt: `Page ${image.pageNumber}`,
    width: 1200,
    height: 1800,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={`/comics/${comic.slug}`}>
              <Button variant="ghost" size="icon">
                <Home className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">{comic.title}</h1>
              <p className="text-sm text-muted-foreground">
                Chapter {chapter.chapterNumber}
                {chapter.title && `: ${chapter.title}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={readingMode}
              onValueChange={(value: "vertical" | "horizontal") => setReadingMode(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>

            {readingMode === "vertical" && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleOpenLightbox(0)}
                title="Fullscreen mode (F)"
              >
                <Maximize2 className="size-4" />
              </Button>
            )}

            <Link href={`/comics/${comic.slug}`}>
              <Button variant="outline" size="icon">
                <List className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="container mx-auto px-4 py-8">
        {images.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No images available for this chapter.</p>
          </div>
        ) : readingMode === "vertical" ? (
          <div className="mx-auto max-w-4xl space-y-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => handleOpenLightbox(index)}
              >
                <Image
                  src={image.imageUrl}
                  alt={`Page ${image.pageNumber}`}
                  width={1200}
                  height={1800}
                  className="h-auto w-full"
                  priority={image.pageNumber <= 3}
                  loading={image.pageNumber <= 3 ? "eager" : "lazy"}
                />
                <div className="absolute right-2 bottom-2 rounded-sm bg-black/50 px-2 py-1 text-xs text-white">
                  Page {image.pageNumber}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <p className="mb-4 text-lg text-muted-foreground">Horizontal mode</p>
              <Button onClick={() => handleOpenLightbox(0)}>Open Gallery</Button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for horizontal/fullscreen mode */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentIndex}
        slides={lightboxSlides}
        plugins={[Zoom, Fullscreen]}
        on={{
          view: ({ index }) => setCurrentIndex(index),
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        carousel={{
          finite: false,
          preload: 2,
        }}
        render={{
          buttonPrev: images.length <= 1 ? () => null : undefined,
          buttonNext: images.length <= 1 ? () => null : undefined,
        }}
      />

      {/* Footer Navigation */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex items-center justify-between p-4">
          {prevChapter ? (
            <Link href={`/comics/${comic.slug}/${prevChapter.chapterNumber}`}>
              <Button variant="outline">
                <ChevronLeft className="mr-2 size-4" />
                Chapter {prevChapter.chapterNumber}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled>
              <ChevronLeft className="mr-2 size-4" />
              No Previous
            </Button>
          )}

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              {images.length} {images.length === 1 ? "page" : "pages"}
            </span>
            {readingMode === "vertical" && (
              <p className="text-xs text-muted-foreground">Press F for fullscreen</p>
            )}
          </div>

          {nextChapter ? (
            <Link href={`/comics/${comic.slug}/${nextChapter.chapterNumber}`}>
              <Button variant="outline">
                Chapter {nextChapter.chapterNumber}
                <ChevronRight className="ml-2 size-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled>
              No Next
              <ChevronRight className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
