"use client";

import { Button } from "@/components/ui/button";
import { normalizeImagePath } from "@/lib/image-path";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ImageGalleryProps {
  images: Array<{
    id: number;
    imageUrl: string;
    pageNumber: number;
  }>;
  initialPage?: number;
  comicTitle: string;
  chapterTitle: string;
  onPageChange?(page: number): void;
}

export function ImageGallery({
  images,
  initialPage = 0,
  comicTitle,
  chapterTitle,
  onPageChange,
}: ImageGalleryProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [showUI, setShowUI] = useState(true);
  const [loading, setLoading] = useState(true);

  const handlePrevious = useCallback(() => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
      setLoading(true);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < images.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
      setLoading(true);
    }
  }, [currentPage, images.length, onPageChange]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "+") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleResetZoom();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Auto-hide UI
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowUI(true);
      timeout = setTimeout(() => setShowUI(false), 3000);
    };

    const handleMouseMove = () => resetTimeout();

    resetTimeout();
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const currentImage = images[currentPage];

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Header */}
      <div
        className={cn(
          "absolute top-0 right-0 left-0 z-10 bg-linear-to-b from-black/80 to-transparent p-4 transition-opacity duration-300",
          showUI ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-lg font-semibold">{comicTitle}</h2>
            <p className="text-sm text-gray-300">{chapterTitle}</p>
          </div>
          <div className="text-sm text-white">
            Page {currentPage + 1} of {images.length}
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="flex h-full items-center justify-center overflow-auto">
        <div
          className="relative transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="size-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
          )}
          <Image
            src={
              normalizeImagePath(currentImage?.imageUrl) ??
              currentImage?.imageUrl ??
              "/placeholder-page.png"
            }
            alt={`Page ${currentPage + 1}`}
            width={1200}
            height={1800}
            className="max-h-screen w-auto object-contain"
            priority={currentPage === 0}
            loading={currentPage === 0 ? "eager" : "lazy"}
            onLoad={() => setLoading(false)}
            quality={95}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 z-10 bg-linear-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showUI ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="container mx-auto flex items-center justify-center gap-4">
          {/* Previous Page */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="size-12"
          >
            <ChevronLeft className="size-6" />
          </Button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="size-8 text-white hover:bg-white/20"
            >
              <ZoomOut className="size-4" />
            </Button>

            <span className="min-w-[60px] text-center text-sm text-white">
              {Math.round(zoom * 100)}%
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="size-8 text-white hover:bg-white/20"
            >
              <ZoomIn className="size-4" />
            </Button>
          </div>

          {/* Next Page */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handleNext}
            disabled={currentPage === images.length - 1}
            className="size-12"
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>

        {/* Page Thumbnails */}
        <div className="container mx-auto mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => {
                  setCurrentPage(index);
                  onPageChange?.(index);
                  setLoading(true);
                }}
                className={cn(
                  "relative h-20 w-14 shrink-0 overflow-hidden rounded-sm border-2 transition-all",
                  index === currentPage
                    ? "border-white ring-2 ring-white/50"
                    : "border-white/30 hover:border-white/60"
                )}
              >
                <Image
                  src={normalizeImagePath(image.imageUrl) ?? image.imageUrl}
                  alt={`Page ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
                <div className="absolute right-0 bottom-0 left-0 bg-black/60 py-0.5 text-center text-xs text-white">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div
        className={cn(
          "absolute bottom-24 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm transition-opacity duration-300",
          showUI ? "opacity-100" : "opacity-0"
        )}
      >
        Use arrow keys to navigate • +/- to zoom • Click to toggle UI
      </div>
    </div>
  );
}
