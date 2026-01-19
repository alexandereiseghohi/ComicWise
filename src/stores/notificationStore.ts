/**
 * Notification Store - Manages notifications and toasts
 * 
 * Features:
 * - Toast notifications
 * - System notifications
 * - Notification preferences
 * - Notification history
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick(): void;
  };
}

interface NotificationState {
  notifications: Notification[];
  toasts: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void;
  addToast(toast: Omit<Notification, 'id' | 'timestamp' | 'read'>): void;
  removeNotification(id: string): void;
  removeToast(id: string): void;
  markAsRead(id: string): void;
  markAllAsRead(): void;
  clearAll(): void;
  
  // Convenience methods
  success(title: string, message?: string, duration?: number): void;
  error(title: string, message?: string, duration?: number): void;
  warning(title: string, message?: string, duration?: number): void;
  info(title: string, message?: string, duration?: number): void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      toasts: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        }));
      },

      addToast: (toast) => {
        const newToast: Notification = {
          ...toast,
          id: `toast-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          read: true,
          duration: toast.duration || 3000,
        };

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-remove toast after duration
        if (newToast.duration) {
          setTimeout(() => {
            get().removeToast(newToast.id);
          }, newToast.duration);
        }
      },

      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read
              ? state.unreadCount - 1
              : state.unreadCount,
          };
        }),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      clearAll: () =>
        set({
          notifications: [],
          toasts: [],
          unreadCount: 0,
        }),

      // Convenience methods
      success: (title, message, duration) =>
        get().addToast({ type: 'success', title, message, duration }),

      error: (title, message, duration) =>
        get().addToast({ type: 'error', title, message, duration }),

      warning: (title, message, duration) =>
        get().addToast({ type: 'warning', title, message, duration }),

      info: (title, message, duration) =>
        get().addToast({ type: 'info', title, message, duration }),
    }),
    { name: 'comicwise-notifications' }
  )
);
