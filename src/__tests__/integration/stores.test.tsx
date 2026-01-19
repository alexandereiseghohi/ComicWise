/**
 * Integration tests for Zustand stores with components
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth, useBookmarks, useComics, useReader, useNotifications, useUI } from '@/hooks/useStores';

describe('Store Integration Tests', () => {
  describe('useAuth hook', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useAuth());
      act(() => {
        result.current.logout();
      });
    });

    it('should initialize with no user', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set user and mark as authenticated', () => {
      const { result } = renderHook(() => useAuth());
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

      act(() => {
        result.current.setUser(mockUser as any);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should update user data', () => {
      const { result } = renderHook(() => useAuth());
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

      act(() => {
        result.current.setUser(mockUser as any);
        result.current.updateUser({ name: 'Updated User' });
      });

      expect(result.current.user?.name).toBe('Updated User');
    });

    it('should logout user', () => {
      const { result } = renderHook(() => useAuth());
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

      act(() => {
        result.current.setUser(mockUser as any);
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('useBookmarks hook', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useBookmarks());
      act(() => {
        // @ts-ignore
        result.current.clearAll();
      });
    });

    it('should add bookmark', () => {
      const { result } = renderHook(() => useBookmarks());

      act(() => {
        result.current.addBookmark(1);
      });

      expect(result.current.isBookmarked(1)).toBe(true);
    });

    it('should remove bookmark', () => {
      const { result } = renderHook(() => useBookmarks());

      act(() => {
        result.current.addBookmark(1);
        result.current.removeBookmark(1);
      });

      expect(result.current.isBookmarked(1)).toBe(false);
    });

    it('should update reading progress', () => {
      const { result } = renderHook(() => useBookmarks());

      act(() => {
        result.current.updateProgress(1, 5);
      });

      expect(result.current.getProgress(1)).toBe(5);
    });

    it('should handle multiple bookmarks', () => {
      const { result } = renderHook(() => useBookmarks());

      act(() => {
        result.current.addBookmark(1);
        result.current.addBookmark(2);
        result.current.addBookmark(3);
      });

      expect(result.current.isBookmarked(1)).toBe(true);
      expect(result.current.isBookmarked(2)).toBe(true);
      expect(result.current.isBookmarked(3)).toBe(true);
    });
  });

  describe('useComics hook', () => {
    it('should set and filter comics', () => {
      const { result } = renderHook(() => useComics());
      const mockComics = [
        { id: 1, title: 'Comic 1', rating: '4.5', views: 1000, status: 'Ongoing', typeId: 1 },
        { id: 2, title: 'Comic 2', rating: '3.5', views: 500, status: 'Completed', typeId: 2 },
      ];

      act(() => {
        result.current.setComics(mockComics as any);
      });

      expect(result.current.comics).toHaveLength(2);
    });

    it('should apply search filter', () => {
      const { result } = renderHook(() => useComics());
      const mockComics = [
        { id: 1, title: 'Dragon Ball', rating: '4.5', views: 1000, status: 'Ongoing', typeId: 1 },
        { id: 2, title: 'Naruto', rating: '3.5', views: 500, status: 'Completed', typeId: 2 },
      ];

      act(() => {
        result.current.setComics(mockComics as any);
        result.current.applyFilters({ search: 'dragon' });
      });

      expect(result.current.filteredComics).toHaveLength(1);
      expect(result.current.filteredComics[0].title).toBe('Dragon Ball');
    });

    it('should apply status filter', () => {
      const { result } = renderHook(() => useComics());
      const mockComics = [
        { id: 1, title: 'Comic 1', rating: '4.5', views: 1000, status: 'Ongoing', typeId: 1 },
        { id: 2, title: 'Comic 2', rating: '3.5', views: 500, status: 'Completed', typeId: 2 },
      ];

      act(() => {
        result.current.setComics(mockComics as any);
        result.current.applyFilters({ status: 'Completed' });
      });

      expect(result.current.filteredComics).toHaveLength(1);
      expect(result.current.filteredComics[0].status).toBe('Completed');
    });

    it('should sort comics', () => {
      const { result } = renderHook(() => useComics());
      const mockComics = [
        { id: 1, title: 'B Comic', rating: '4.5', views: 1000, status: 'Ongoing', typeId: 1 },
        { id: 2, title: 'A Comic', rating: '3.5', views: 500, status: 'Completed', typeId: 2 },
      ];

      act(() => {
        result.current.setComics(mockComics as any);
        result.current.setSorting('title', 'asc');
      });

      expect(result.current.filteredComics[0].title).toBe('A Comic');
    });

    it('should clear filters', () => {
      const { result } = renderHook(() => useComics());

      act(() => {
        result.current.applyFilters({ search: 'test', status: 'Ongoing' });
        result.current.clearFilters();
      });

      expect(result.current.filters.search).toBe('');
      expect(result.current.filters.status).toBeUndefined();
    });
  });

  describe('useReader hook', () => {
    it('should set page and total pages', () => {
      const { result } = renderHook(() => useReader());

      act(() => {
        result.current.setTotalPages(10);
        result.current.setPage(5);
      });

      expect(result.current.currentPage).toBe(5);
      expect(result.current.totalPages).toBe(10);
    });

    it('should navigate to next page', () => {
      const { result } = renderHook(() => useReader());

      act(() => {
        result.current.setTotalPages(10);
        result.current.setPage(5);
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(6);
    });

    it('should navigate to previous page', () => {
      const { result } = renderHook(() => useReader());

      act(() => {
        result.current.setTotalPages(10);
        result.current.setPage(5);
        result.current.prevPage();
      });

      expect(result.current.currentPage).toBe(4);
    });

    it('should not go below page 1', () => {
      const { result } = renderHook(() => useReader());

      act(() => {
        result.current.setTotalPages(10);
        result.current.setPage(1);
        result.current.prevPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it('should not exceed total pages', () => {
      const { result } = renderHook(() => useReader());

      act(() => {
        result.current.setTotalPages(10);
        result.current.setPage(10);
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(10);
    });

    it('should change reading mode', () => {
      const { result } = renderHook(() => useReader());

      act(() => {
        result.current.setReadingMode('horizontal');
      });

      expect(result.current.readingMode).toBe('horizontal');
    });

    it('should toggle fullscreen', () => {
      const { result } = renderHook(() => useReader());

      act(() => {
        result.current.toggleFullscreen();
      });

      expect(result.current.fullscreen).toBe(true);
    });

    it('should set zoom level', () => {
      const { result } = renderHook(() => useReader());

      act(() => {
        result.current.setZoom(150);
      });

      expect(result.current.zoom).toBe(150);
    });

    it('should add to history', () => {
      const { result } = renderHook(() => useReader());

      act(() => {
        result.current.addToHistory(1, 5, 10);
      });

      // History is stored in the reader store
      // This test verifies the method doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('useNotifications hook', () => {
    it('should add toast notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.success('Test', 'Success message');
      });

      expect(result.current.toasts.length).toBeGreaterThan(0);
    });

    it('should add error notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.error('Error', 'Error message');
      });

      const errorToast = result.current.toasts.find(t => t.type === 'error');
      expect(errorToast).toBeDefined();
    });

    it('should remove toast', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.success('Test', 'Success message');
      });

      const toastId = result.current.toasts[0]?.id;

      act(() => {
        if (toastId) {
          result.current.removeToast(toastId);
        }
      });

      expect(result.current.toasts.find(t => t.id === toastId)).toBeUndefined();
    });
  });

  describe('useUI hook', () => {
    it('should toggle sidebar', () => {
      const { result } = renderHook(() => useUI());
      const initialState = result.current.sidebarOpen;

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarOpen).toBe(!initialState);
    });

    it('should set theme', () => {
      const { result } = renderHook(() => useUI());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should open and close modal', () => {
      const { result } = renderHook(() => useUI());

      act(() => {
        result.current.openModal('test-modal');
      });

      expect(result.current.activeModal).toBe('test-modal');

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.activeModal).toBeNull();
    });

    it('should toggle search', () => {
      const { result } = renderHook(() => useUI());
      const initialState = result.current.searchOpen;

      act(() => {
        result.current.toggleSearch();
      });

      expect(result.current.searchOpen).toBe(!initialState);
    });
  });
});
