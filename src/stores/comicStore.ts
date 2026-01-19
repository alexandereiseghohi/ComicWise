/**
 * Comic Store - Manages comics data and filtering
 * 
 * Features:
 * - Comics list state
 * - Filters and sorting
 * - Search functionality
 * - Pagination
 * - Recently viewed
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ComicState {
  comics: any[];
  filteredComics: any[];
  filters: {
    search: string;
    genreIds: number[];
    typeId?: number;
    status?: string;
    minRating?: number;
  };
  sortBy: 'title' | 'rating' | 'views' | 'updated' | 'created';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  recentlyViewed: number[];
  
  // Actions
  setComics(comics: any[]): void;
  applyFilters(filters: Partial<ComicState['filters']>): void;
  setSorting(sortBy: ComicState['sortBy'], sortOrder: ComicState['sortOrder']): void;
  setPage(page: number): void;
  addRecentlyViewed(comicId: number): void;
  clearFilters(): void;
}

const initialFilters = {
  search: '',
  genreIds: [],
  typeId: undefined,
  status: undefined,
  minRating: undefined,
};

export const useComicStore = create<ComicState>()(
  devtools(
    persist(
      (set, get) => ({
        comics: [],
        filteredComics: [],
        filters: initialFilters,
        sortBy: 'updated',
        sortOrder: 'desc',
        currentPage: 1,
        itemsPerPage: 24,
        totalPages: 1,
        recentlyViewed: [],

        setComics: (comics) => {
          set({ comics, filteredComics: comics });
          get().applyFilters({});
        },

        applyFilters: (newFilters) => {
          const filters = { ...get().filters, ...newFilters };
          const { comics, sortBy, sortOrder } = get();

          let filtered = [...comics];

          // Apply search
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(
              (comic) =>
                comic.title.toLowerCase().includes(search) ||
                comic.description?.toLowerCase().includes(search)
            );
          }

          // Apply genre filter - simplified
          if (filters.genreIds && filters.genreIds.length > 0) {
            // This would need to be implemented with proper genre relationships
            // For now, skip genre filtering in store
          }

          // Apply type filter
          if (filters.typeId) {
            filtered = filtered.filter((comic) => comic.typeId === filters.typeId);
          }

          // Apply status filter
          if (filters.status) {
            filtered = filtered.filter((comic) => comic.status === filters.status);
          }

          // Apply rating filter
          if (filters.minRating) {
            filtered = filtered.filter(
              (comic) => Number(comic.rating) >= filters.minRating!
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
              case 'title':
                comparison = a.title.localeCompare(b.title);
                break;
              case 'rating':
                comparison = Number(a.rating) - Number(b.rating);
                break;
              case 'views':
                comparison = a.views - b.views;
                break;
              case 'updated':
                comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                break;
              case 'created':
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
          });

          const totalPages = Math.ceil(filtered.length / get().itemsPerPage);

          set({
            filters,
            filteredComics: filtered,
            totalPages,
            currentPage: 1,
          });
        },

        setSorting: (sortBy, sortOrder) => {
          set({ sortBy, sortOrder });
          get().applyFilters({});
        },

        setPage: (page) => set({ currentPage: page }),

        addRecentlyViewed: (comicId) =>
          set((state) => {
            const recentlyViewed = [
              comicId,
              ...state.recentlyViewed.filter((id) => id !== comicId),
            ].slice(0, 20); // Keep last 20
            return { recentlyViewed };
          }),

        clearFilters: () => {
          set({ filters: initialFilters });
          get().applyFilters({});
        },
      }),
      {
        name: 'comicwise-comics',
        partialize: (state) => ({
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          itemsPerPage: state.itemsPerPage,
          recentlyViewed: state.recentlyViewed,
        }),
      }
    ),
    { name: 'comicwise-comics' }
  )
);
