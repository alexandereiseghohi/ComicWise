"use client";

type Props = {
  pageIndex: number;
  pageCount: number;
  onNext: () => void;
  onPrev: () => void;
  onToggleFullscreen?: () => void;
};

export default function ReaderControls({
  pageIndex,
  pageCount,
  onNext,
  onPrev,
  onToggleFullscreen,
}: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button aria-label="Previous" onClick={onPrev} disabled={pageIndex === 0}>
        ◀ Prev
      </button>
      <div>
        {pageIndex + 1} / {pageCount}
      </div>
      <button aria-label="Next" onClick={onNext} disabled={pageIndex === pageCount - 1}>
        Next ▶
      </button>
      {onToggleFullscreen ? (
        <button aria-label="Toggle fullscreen" onClick={onToggleFullscreen}>
          Fullscreen
        </button>
      ) : null}
    </div>
  );
}
