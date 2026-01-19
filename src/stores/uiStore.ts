import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar(): void;
  setSidebarOpen(open: boolean): void;

  theme: "light" | "dark" | "system";
  setTheme(theme: "light" | "dark" | "system"): void;

  readingMode: "single" | "double" | "long-strip";
  setReadingMode(mode: "single" | "double" | "long-strip"): void;

  activeModal: string | null;
  openModal(modalId: string): void;
  closeModal(): void;

  searchOpen: boolean;
  toggleSearch(): void;
  setSearchOpen(open: boolean): void;
}
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        toggleSidebar: () =>
          set((state: { sidebarOpen: boolean }) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

        theme: "system",
        setTheme: (theme: "light" | "dark" | "system") => set({ theme }),

        readingMode: "single",
        setReadingMode: (mode: "single" | "double" | "long-strip") => set({ readingMode: mode }),

        activeModal: null,
        openModal: (modalId: string) => set({ activeModal: modalId }),
        closeModal: () => set({ activeModal: null }),

        searchOpen: false,
        toggleSearch: () =>
          set((state: { searchOpen: boolean }) => ({ searchOpen: !state.searchOpen })),
        setSearchOpen: (open: boolean) => set({ searchOpen: open }),
      }),
      {
        name: "ui-store",
        partialize: (state) => ({
          theme: state.theme,
          readingMode: state.readingMode,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: "comicwise-ui" }
  )
);
