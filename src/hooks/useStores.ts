/**
 * Custom hooks for store integration
 * Provides convenient access to Zustand stores with proper typing
 */

import { useAuthStore } from '@/stores/authStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useComicStore } from '@/stores/comicStore';
import { useReaderStore } from '@/stores/readerStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useUIStore } from '@/stores/uiStore';

// Re-export all stores
export { 
  useAuthStore, 
  useBookmarkStore, 
  useComicStore, 
  useReaderStore, 
  useNotificationStore,
  useUIStore 
};

// Auth hooks
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  return { user, isAuthenticated, isLoading, setUser, logout, updateUser, setLoading };
};

// Bookmark hooks
export const useBookmarks = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const isBookmarked = useBookmarkStore((state) => state.isBookmarked);
  const updateProgress = useBookmarkStore((state) => state.updateProgress);
  const getProgress = useBookmarkStore((state) => state.getProgress);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, updateProgress, getProgress };
};

// Comic hooks
export const useComics = () => {
  const comics = useComicStore((state) => state.comics);
  const filteredComics = useComicStore((state) => state.filteredComics);
  const filters = useComicStore((state) => state.filters);
  const sortBy = useComicStore((state) => state.sortBy);
  const sortOrder = useComicStore((state) => state.sortOrder);
  const currentPage = useComicStore((state) => state.currentPage);
  const totalPages = useComicStore((state) => state.totalPages);
  const itemsPerPage = useComicStore((state) => state.itemsPerPage);
  
  const setComics = useComicStore((state) => state.setComics);
  const applyFilters = useComicStore((state) => state.applyFilters);
  const setSorting = useComicStore((state) => state.setSorting);
  const setPage = useComicStore((state) => state.setPage);
  const addRecentlyViewed = useComicStore((state) => state.addRecentlyViewed);
  const clearFilters = useComicStore((state) => state.clearFilters);

  return {
    comics,
    filteredComics,
    filters,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    itemsPerPage,
    setComics,
    applyFilters,
    setSorting,
    setPage,
    addRecentlyViewed,
    clearFilters,
  };
};

// Reader hooks
export const useReader = () => {
  const currentPage = useReaderStore((state) => state.currentPage);
  const totalPages = useReaderStore((state) => state.totalPages);
  const readingMode = useReaderStore((state) => state.readingMode);
  const pageLayout = useReaderStore((state) => state.pageLayout);
  const imageQuality = useReaderStore((state) => state.imageQuality);
  const autoScroll = useReaderStore((state) => state.autoScroll);
  const fullscreen = useReaderStore((state) => state.fullscreen);
  const zoom = useReaderStore((state) => state.zoom);

  const setPage = useReaderStore((state) => state.setPage);
  const setTotalPages = useReaderStore((state) => state.setTotalPages);
  const nextPage = useReaderStore((state) => state.nextPage);
  const prevPage = useReaderStore((state) => state.prevPage);
  const setReadingMode = useReaderStore((state) => state.setReadingMode);
  const setPageLayout = useReaderStore((state) => state.setPageLayout);
  const toggleFullscreen = useReaderStore((state) => state.toggleFullscreen);
  const setZoom = useReaderStore((state) => state.setZoom);
  const addToHistory = useReaderStore((state) => state.addToHistory);
  const reset = useReaderStore((state) => state.reset);

  return {
    currentPage,
    totalPages,
    readingMode,
    pageLayout,
    imageQuality,
    autoScroll,
    fullscreen,
    zoom,
    setPage,
    setTotalPages,
    nextPage,
    prevPage,
    setReadingMode,
    setPageLayout,
    toggleFullscreen,
    setZoom,
    addToHistory,
    reset,
  };
};

// Notification hooks
export const useNotifications = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const toasts = useNotificationStore((state) => state.toasts);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const addNotification = useNotificationStore((state) => state.addNotification);
  const addToast = useNotificationStore((state) => state.addToast);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const removeToast = useNotificationStore((state) => state.removeToast);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  
  const success = useNotificationStore((state) => state.success);
  const error = useNotificationStore((state) => state.error);
  const warning = useNotificationStore((state) => state.warning);
  const info = useNotificationStore((state) => state.info);

  return {
    notifications,
    toasts,
    unreadCount,
    addNotification,
    addToast,
    removeNotification,
    removeToast,
    markAsRead,
    markAllAsRead,
    success,
    error,
    warning,
    info,
  };
};

// UI hooks
export const useUI = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const theme = useUIStore((state) => state.theme);
  const activeModal = useUIStore((state) => state.activeModal);
  const searchOpen = useUIStore((state) => state.searchOpen);

  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const setTheme = useUIStore((state) => state.setTheme);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const toggleSearch = useUIStore((state) => state.toggleSearch);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);

  return {
    sidebarOpen,
    theme,
    activeModal,
    searchOpen,
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    openModal,
    closeModal,
    toggleSearch,
    setSearchOpen,
  };
};
