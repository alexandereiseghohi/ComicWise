import { act, renderHook } from "@testing-library/react";
import { useReaderStore } from "../readerStore";

describe("readerStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useReaderStore());
    act(() => {
      result.current.reset();
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useReaderStore());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.readingMode).toBe("vertical");
    expect(result.current.pageLayout).toBe("single");
    expect(result.current.imageQuality).toBe("high");
    expect(result.current.fullscreen).toBe(false);
    expect(result.current.zoom).toBe(100);
  });

  it("should set current page", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setPage(5);
    });

    expect(result.current.currentPage).toBe(5);
  });

  it("should set total pages", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setTotalPages(50);
    });

    expect(result.current.totalPages).toBe(50);
  });

  it("should navigate to next page", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setTotalPages(10);
      result.current.setPage(5);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(6);
  });

  it("should not go beyond total pages", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setTotalPages(10);
      result.current.setPage(10);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(10);
  });

  it("should navigate to previous page", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setPage(5);
    });

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(4);
  });

  it("should not go below page 1", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setPage(1);
    });

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("should change reading mode", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setReadingMode("horizontal");
    });

    expect(result.current.readingMode).toBe("horizontal");

    act(() => {
      result.current.setReadingMode("webtoon");
    });

    expect(result.current.readingMode).toBe("webtoon");
  });

  it("should change page layout", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setPageLayout("double");
    });

    expect(result.current.pageLayout).toBe("double");
  });

  it("should change image quality", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setImageQuality("original");
    });

    expect(result.current.imageQuality).toBe("original");
  });

  it("should toggle fullscreen", () => {
    const { result } = renderHook(() => useReaderStore());

    expect(result.current.fullscreen).toBe(false);

    act(() => {
      result.current.toggleFullscreen();
    });

    expect(result.current.fullscreen).toBe(true);

    act(() => {
      result.current.toggleFullscreen();
    });

    expect(result.current.fullscreen).toBe(false);
  });

  it("should set zoom level", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setZoom(150);
    });

    expect(result.current.zoom).toBe(150);
  });

  it("should toggle page numbers", () => {
    const { result } = renderHook(() => useReaderStore());

    expect(result.current.showPageNumbers).toBe(true);

    act(() => {
      result.current.togglePageNumbers();
    });

    expect(result.current.showPageNumbers).toBe(false);
  });

  it("should toggle progress indicator", () => {
    const { result } = renderHook(() => useReaderStore());

    expect(result.current.showProgress).toBe(true);

    act(() => {
      result.current.toggleProgress();
    });

    expect(result.current.showProgress).toBe(false);
  });

  it("should add to reading history", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.addToHistory(1, 5, 10);
    });

    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0]).toEqual({
      comicId: 1,
      chapterId: 5,
      page: 10,
    });
  });

  it("should limit history to 50 items", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      for (let i = 1; i <= 60; i++) {
        result.current.addToHistory(i, i, i);
      }
    });

    expect(result.current.history.length).toBe(50);
  });

  it("should clear history", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.addToHistory(1, 5, 10);
      result.current.addToHistory(2, 6, 11);
    });

    expect(result.current.history.length).toBe(2);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history.length).toBe(0);
  });

  it("should reset all settings", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setPage(10);
      result.current.setReadingMode("horizontal");
      result.current.setZoom(150);
      result.current.toggleFullscreen();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.readingMode).toBe("vertical");
    expect(result.current.zoom).toBe(100);
    expect(result.current.fullscreen).toBe(false);
  });

  it("should enable and configure auto-scroll", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setAutoScroll(true);
      result.current.setAutoScrollSpeed(5);
    });

    expect(result.current.autoScroll).toBe(true);
    expect(result.current.autoScrollSpeed).toBe(5);
  });

  it("should persist settings in localStorage", () => {
    const { result } = renderHook(() => useReaderStore());

    act(() => {
      result.current.setReadingMode("webtoon");
      result.current.setImageQuality("original");
    });

    const stored = localStorage.getItem("comicwise-reader");
    expect(stored).toBeTruthy();
  });
});
