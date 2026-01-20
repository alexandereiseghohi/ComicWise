/**
 * Reader Store - Manages chapter reading state
 *
 * Features:
 * - Reading progress tracking
 * - Reader settings
 * - Page navigation
 * - Reading mode preferences
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ReaderState {
  // Reading progress
  currentPage: number;
  totalPages: number;

  // Reader settings
  readingMode: "vertical" | "horizontal" | "webtoon";
  pageLayout: "single" | "double";
  imageQuality: "original" | "high" | "medium" | "low";
  autoScroll: boolean;
  autoScrollSpeed: number;

  // UI settings
  showPageNumbers: boolean;
  showProgress: boolean;
  fullscreen: boolean;
  zoom: number;

  // Navigation
  history: Array<{ comicId: number; chapterId: number; page: number }>;

  // Actions
  setPage(page: number): void;
  setTotalPages(total: number): void;
  nextPage(): void;
  prevPage(): void;

  setReadingMode(mode: ReaderState["readingMode"]): void;
  setPageLayout(layout: ReaderState["pageLayout"]): void;
  setImageQuality(quality: ReaderState["imageQuality"]): void;
  setAutoScroll(enabled: boolean): void;
  setAutoScrollSpeed(speed: number): void;

  togglePageNumbers(): void;
  toggleProgress(): void;
  toggleFullscreen(): void;
  setZoom(zoom: number): void;

  addToHistory(comicId: number, chapterId: number, page: number): void;
  clearHistory(): void;

  reset(): void;
}

const initialState = {
  currentPage: 1,
  totalPages: 0,
  readingMode: "vertical" as const,
  pageLayout: "single" as const,
  imageQuality: "high" as const,
  autoScroll: false,
  autoScrollSpeed: 1,
  showPageNumbers: true,
  showProgress: true,
  fullscreen: false,
  zoom: 100,
  history: [],
};

export const useReaderStore = create<ReaderState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setPage: (page) => set({ currentPage: page }),

        setTotalPages: (total) => set({ totalPages: total }),

        nextPage: () =>
          set((state) => ({
            currentPage: Math.min(state.currentPage + 1, state.totalPages),
          })),

        prevPage: () =>
          set((state) => ({
            currentPage: Math.max(state.currentPage - 1, 1),
          })),

        setReadingMode: (mode) => set({ readingMode: mode }),

        setPageLayout: (layout) => set({ pageLayout: layout }),

        setImageQuality: (quality) => set({ imageQuality: quality }),

        setAutoScroll: (enabled) => set({ autoScroll: enabled }),

        setAutoScrollSpeed: (speed) => set({ autoScrollSpeed: speed }),

        togglePageNumbers: () => set((state) => ({ showPageNumbers: !state.showPageNumbers })),

        toggleProgress: () => set((state) => ({ showProgress: !state.showProgress })),

        toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),

        setZoom: (zoom) => set({ zoom: Math.max(50, Math.min(200, zoom)) }),

        addToHistory: (comicId, chapterId, page) =>
          set((state) => ({
            history: [
              { comicId, chapterId, page },
              ...state.history.filter((h) => !(h.comicId === comicId && h.chapterId === chapterId)),
            ].slice(0, 50), // Keep last 50
          })),

        clearHistory: () => set({ history: [] }),

        reset: () => set(initialState),
      }),
      {
        name: "comicwise-reader",
        partialize: (state) => ({
          readingMode: state.readingMode,
          pageLayout: state.pageLayout,
          imageQuality: state.imageQuality,
          autoScroll: state.autoScroll,
          autoScrollSpeed: state.autoScrollSpeed,
          showPageNumbers: state.showPageNumbers,
          showProgress: state.showProgress,
          zoom: state.zoom,
          history: state.history,
        }),
      }
    ),
    { name: "comicwise-reader" }
  )
);
