/**
 * Store Index - Central export for all Zustand stores
 *
 * Usage:
 * import { useAuthStore, useComicStore } from '@/stores';
 */

export { useAuthStore } from "./auth-store";
export { useBookmarkStore } from "./bookmark-store";
export { useComicStore } from "./comic-store";
export { useNotificationStore } from "./notification-store";
export { useReaderStore } from "./reader-store";
export { useUIStore } from "./ui-store";

// Re-export types
export type { Notification, NotificationType } from "./notification-store";
