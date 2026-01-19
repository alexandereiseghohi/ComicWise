import { renderHook, act } from '@testing-library/react';
import { useComicStore } from '../comicStore';

const mockComics = [
  {
    id: 1,
    title: 'Test Comic 1',
    slug: 'test-comic-1',
    description: 'A test comic description',
    coverImage: '/test1.jpg',
    status: 'Ongoing',
    rating: '4.5',
    views: 1000,
    typeId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 2,
    title: 'Another Comic',
    slug: 'another-comic',
    description: 'Another test comic',
    coverImage: '/test2.jpg',
    status: 'Completed',
    rating: '4.0',
    views: 500,
    typeId: 2,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-09'),
  },
];

describe('comicStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useComicStore());
    act(() => {
      result.current.clearFilters();
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useComicStore());

    expect(result.current.comics).toEqual([]);
    expect(result.current.filteredComics).toEqual([]);
    expect(result.current.sortBy).toBe('updated');
    expect(result.current.sortOrder).toBe('desc');
    expect(result.current.currentPage).toBe(1);
  });

  it('should set comics', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    expect(result.current.comics).toEqual(mockComics);
    expect(result.current.filteredComics.length).toBe(2);
  });

  it('should filter comics by search term', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    act(() => {
      result.current.applyFilters({ search: 'another' });
    });

    expect(result.current.filteredComics.length).toBe(1);
    expect(result.current.filteredComics[0].title).toBe('Another Comic');
  });

  it('should filter comics by type', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    act(() => {
      result.current.applyFilters({ typeId: 1 });
    });

    expect(result.current.filteredComics.length).toBe(1);
    expect(result.current.filteredComics[0].typeId).toBe(1);
  });

  it('should filter comics by status', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    act(() => {
      result.current.applyFilters({ status: 'Completed' });
    });

    expect(result.current.filteredComics.length).toBe(1);
    expect(result.current.filteredComics[0].status).toBe('Completed');
  });

  it('should filter comics by minimum rating', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    act(() => {
      result.current.applyFilters({ minRating: 4.3 });
    });

    expect(result.current.filteredComics.length).toBe(1);
    expect(result.current.filteredComics[0].rating).toBe('4.5');
  });

  it('should sort comics by title ascending', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    act(() => {
      result.current.setSorting('title', 'asc');
    });

    expect(result.current.filteredComics[0].title).toBe('Another Comic');
    expect(result.current.filteredComics[1].title).toBe('Test Comic 1');
  });

  it('should sort comics by rating descending', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    act(() => {
      result.current.setSorting('rating', 'desc');
    });

    expect(result.current.filteredComics[0].rating).toBe('4.5');
    expect(result.current.filteredComics[1].rating).toBe('4.0');
  });

  it('should sort comics by views', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    act(() => {
      result.current.setSorting('views', 'desc');
    });

    expect(result.current.filteredComics[0].views).toBe(1000);
    expect(result.current.filteredComics[1].views).toBe(500);
  });

  it('should track recently viewed comics', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.addRecentlyViewed(1);
      result.current.addRecentlyViewed(2);
      result.current.addRecentlyViewed(3);
    });

    expect(result.current.recentlyViewed).toEqual([3, 2, 1]);
  });

  it('should limit recently viewed to 20 items', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      for (let i = 1; i <= 25; i++) {
        result.current.addRecentlyViewed(i);
      }
    });

    expect(result.current.recentlyViewed.length).toBe(20);
    expect(result.current.recentlyViewed[0]).toBe(25);
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    act(() => {
      result.current.applyFilters({ search: 'test', status: 'Ongoing' });
    });

    expect(result.current.filters.search).toBe('test');

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.search).toBe('');
    expect(result.current.filters.status).toBeUndefined();
  });

  it('should calculate total pages correctly', () => {
    const { result } = renderHook(() => useComicStore());

    const manyComics = Array.from({ length: 50 }, (_, i) => ({
      ...mockComics[0],
      id: i + 1,
    }));

    act(() => {
      result.current.setComics(manyComics);
    });

    // With 50 comics and 24 per page, should be 3 pages
    expect(result.current.totalPages).toBe(3);
  });

  it('should set current page', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setPage(5);
    });

    expect(result.current.currentPage).toBe(5);
  });

  it('should combine multiple filters', () => {
    const { result } = renderHook(() => useComicStore());

    act(() => {
      result.current.setComics(mockComics);
    });

    act(() => {
      result.current.applyFilters({
        search: 'comic',
        status: 'Ongoing',
        minRating: 4.0,
      });
    });

    expect(result.current.filteredComics.length).toBe(1);
    expect(result.current.filteredComics[0].status).toBe('Ongoing');
  });
});
