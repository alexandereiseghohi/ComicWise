import { renderHook, act } from '@testing-library/react';
import { useBookmarkStore } from '../bookmarkStore';

describe('bookmarkStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useBookmarkStore());
    act(() => {
      result.current.clearAll();
    });
  });

  it('should initialize with empty bookmarks', () => {
    const { result } = renderHook(() => useBookmarkStore());
    
    expect(result.current.bookmarks.size).toBe(0);
  });

  it('should add a bookmark', () => {
    const { result } = renderHook(() => useBookmarkStore());

    act(() => {
      result.current.addBookmark(1);
    });

    expect(result.current.isBookmarked(1)).toBe(true);
    expect(result.current.bookmarks.size).toBe(1);
  });

  it('should remove a bookmark', () => {
    const { result } = renderHook(() => useBookmarkStore());

    act(() => {
      result.current.addBookmark(1);
    });

    expect(result.current.isBookmarked(1)).toBe(true);

    act(() => {
      result.current.removeBookmark(1);
    });

    expect(result.current.isBookmarked(1)).toBe(false);
    expect(result.current.bookmarks.size).toBe(0);
  });

  it('should update reading progress', () => {
    const { result } = renderHook(() => useBookmarkStore());

    act(() => {
      result.current.updateProgress(1, 5);
    });

    expect(result.current.getProgress(1)).toBe(5);
  });

  it('should update progress to latest chapter', () => {
    const { result } = renderHook(() => useBookmarkStore());

    act(() => {
      result.current.updateProgress(1, 3);
    });

    expect(result.current.getProgress(1)).toBe(3);

    act(() => {
      result.current.updateProgress(1, 7);
    });

    expect(result.current.getProgress(1)).toBe(7);
  });

  it('should not update progress to earlier chapter', () => {
    const { result } = renderHook(() => useBookmarkStore());

    act(() => {
      result.current.updateProgress(1, 10);
    });

    act(() => {
      result.current.updateProgress(1, 5);
    });

    expect(result.current.getProgress(1)).toBe(10);
  });

  it('should handle multiple bookmarks', () => {
    const { result } = renderHook(() => useBookmarkStore());

    act(() => {
      result.current.addBookmark(1);
      result.current.addBookmark(2);
      result.current.addBookmark(3);
    });

    expect(result.current.bookmarks.size).toBe(3);
    expect(result.current.isBookmarked(1)).toBe(true);
    expect(result.current.isBookmarked(2)).toBe(true);
    expect(result.current.isBookmarked(3)).toBe(true);
  });

  it('should clear all bookmarks', () => {
    const { result } = renderHook(() => useBookmarkStore());

    act(() => {
      result.current.addBookmark(1);
      result.current.addBookmark(2);
      result.current.updateProgress(1, 5);
    });

    expect(result.current.bookmarks.size).toBe(2);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.bookmarks.size).toBe(0);
    expect(result.current.getProgress(1)).toBeUndefined();
  });

  it('should persist bookmarks in localStorage', () => {
    const { result } = renderHook(() => useBookmarkStore());

    act(() => {
      result.current.addBookmark(1);
      result.current.updateProgress(1, 5);
    });

    const stored = localStorage.getItem('comicwise-bookmarks');
    expect(stored).toBeTruthy();
  });

  it('should return undefined for non-existent progress', () => {
    const { result } = renderHook(() => useBookmarkStore());

    expect(result.current.getProgress(999)).toBeUndefined();
  });
});
