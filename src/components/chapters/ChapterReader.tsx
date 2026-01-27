/**
 * ChapterReader Component
 * Main chapter reading interface
 * @component
 */

"use client";

import { Card } from "@/components/ui/card";
/**
 * ChapterReader Component
 * Main chapter reading interface
 * @component
 */

("use client");

import { normalizeImagePath } from "@/lib/image-path";
import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Props for ChapterReader component
 */
export interface ChapterReaderProps {
  /**
   * Array of page images
   */
  pages: string[];
  /**
   * Current page index
   */
  initialPage?: number;
  /**
   * Callback when page changes
   */
  onPageChange?(page: number): void;
  /**
   * Is loading pages
   */
  isLoading?: boolean;
}

/**
 * ChapterReader Component
 * Displays chapter pages with zoom and navigation
 */
export default function ChapterReader({
  pages,
  initialPage = 0,
  onPageChange,
  isLoading,
}: ChapterReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading || !pages.length) {
    return (
      <Card className="flex min-h-[600px] items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading pages...</p>
        </div>
      </Card>
    );
  }

  const currentImageUrl = pages[currentPage];

  return (
    <div className="space-y-4">
      {/* Reader Container */}
      <Card className={`overflow-hidden ${isFullscreen ? "fixed inset-0 rounded-none" : ""}`}>
        <div className="relative aspect-9/16 w-full bg-muted sm:aspect-auto sm:min-h-[600px]">
          {currentImageUrl && (
            <Image
              src={normalizeImagePath(currentImageUrl) ?? currentImageUrl}
              alt={`Page ${currentPage + 1}`}
              fill
              className="object-contain"
              style={{ zoom: `${zoom}%` }}
              priority
            />
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            ← Previous
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Next →
          </button>
        </div>

        {/* Page Info */}
        <div className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {pages.length}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="rounded-md border border-input bg-background p-2 text-sm hover:bg-accent"
          >
            −
          </button>
          <span className="w-12 text-center text-sm">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="rounded-md border border-input bg-background p-2 text-sm hover:bg-accent"
          >
            +
          </button>
        </div>

        {/* Fullscreen */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
        >
          {isFullscreen ? "✕ Exit" : "⛶ Fullscreen"}
        </button>
      </div>
    </div>
  );
}
