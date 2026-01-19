/**
 * Store Index - Central export for all Zustand stores
 * 
 * Usage:
 * import { useAuthStore, useComicStore } from '@/stores';
 */

export { useAuthStore } from './authStore';
export { useBookmarkStore } from './bookmarkStore';
export { useComicStore } from './comicStore';
export { useNotificationStore } from './notificationStore';
export { useReaderStore } from './readerStore';
export { useUIStore } from './uiStore';

// Re-export types
export type { Notification, NotificationType } from './notificationStore';
