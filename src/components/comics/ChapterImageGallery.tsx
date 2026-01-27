"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ImageItem = {
  url: string;
  alt?: string;
};

type Props = {
  images: ImageItem[];
  initialIndex?: number;
  className?: string;
};

export default function ChapterImageGallery({ images, initialIndex = 0, className }: Props) {
  const [index, setIndex] = useState<number>(initialIndex || 0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIndex(Math.min(Math.max(0, initialIndex), images.length - 1));
  }, [initialIndex, images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Home") setIndex(0);
      if (e.key === "End") setIndex(images.length - 1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length]);

  const next = () => setIndex((i) => Math.min(i + 1, images.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  if (!images || images.length === 0) {
    return <div className={className}>No pages available.</div>;
  }

  const current = images[index];

  if (!current) {
    return <div className={className}>No pages available.</div>;
  }

  return (
    <div className={className} ref={containerRef}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <button aria-label="Previous page" onClick={prev} disabled={index === 0}>
          ◀
        </button>
        <div style={{ margin: "0 12px" }}>
          Page {index + 1} / {images.length}
        </div>
        <button aria-label="Next page" onClick={next} disabled={index === images.length - 1}>
          ▶
        </button>
      </div>

      <div style={{ textAlign: "center" }}>
        <Image
          src={current.url}
          alt={current.alt || `page-${index + 1}`}
          width={800}
          height={1200}
          style={{ maxWidth: "100%", height: "auto" }}
          priority={index === 0}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to page ${i + 1}`}
            style={{
              width: 48,
              height: 64,
              overflow: "hidden",
              border: i === index ? "2px solid #000" : "1px solid #ccc",
              padding: 0,
            }}
          >
            <Image src={img.url} alt={img.alt || `thumb-${i + 1}`} width={48} height={64} />
          </button>
        ))}
      </div>
    </div>
  );
}
