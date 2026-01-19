import { renderHook, act } from '@testing-library/react';
import { useNotificationStore } from '../notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useNotificationStore());
    act(() => {
      result.current.clearAll();
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useNotificationStore());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.toasts).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should add a notification', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        title: 'Test Notification',
        message: 'This is a test',
        type: 'info',
      });
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it('should add a toast notification', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addToast({
        title: 'Toast',
        message: 'Test toast',
        type: 'success',
      });
    });

    expect(result.current.toasts.length).toBe(1);
  });

  it('should remove a notification', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        title: 'Test',
        message: 'Test',
        type: 'info',
      });
    });

    const notificationId = result.current.notifications[0]?.id;

    act(() => {
      if (notificationId) {
        result.current.removeNotification(notificationId);
      }
    });

    expect(result.current.notifications.length).toBe(0);
  });

  it('should mark notification as read', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        title: 'Test',
        message: 'Test',
        type: 'info',
      });
    });

    expect(result.current.unreadCount).toBe(1);

    const notificationId = result.current.notifications[0]?.id;

    act(() => {
      if (notificationId) {
        result.current.markAsRead(notificationId);
      }
    });

    expect(result.current.notifications[0]?.read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should mark all notifications as read', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        title: 'Test 1',
        message: 'Test',
        type: 'info',
      });
      result.current.addNotification({
        title: 'Test 2',
        message: 'Test',
        type: 'info',
      });
    });

    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });

  it('should use success convenience method', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.success('Success!', 'Operation completed');
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0]?.type).toBe('success');
    expect(result.current.toasts[0]?.title).toBe('Success!');
  });

  it('should use error convenience method', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.error('Error!', 'Something went wrong');
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0]?.type).toBe('error');
  });

  it('should use warning convenience method', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.warning('Warning!', 'Please be careful');
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0]?.type).toBe('warning');
  });

  it('should use info convenience method', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.info('Info', 'Just so you know');
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0]?.type).toBe('info');
  });

  it('should auto-dismiss toast after duration', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.success('Test', 'Test message', 3000);
    });

    expect(result.current.toasts.length).toBe(1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.toasts.length).toBe(0);
  });

  it('should not auto-dismiss toast if duration is 0', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.success('Test', 'Test message', 0);
    });

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.toasts.length).toBe(1);
  });

  it('should clear all notifications and toasts', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        title: 'Test',
        message: 'Test',
        type: 'info',
      });
      result.current.success('Toast', 'Test');
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.toasts.length).toBe(1);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications.length).toBe(0);
    expect(result.current.toasts.length).toBe(0);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should calculate unread count correctly', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        title: 'Test 1',
        message: 'Test',
        type: 'info',
      });
      result.current.addNotification({
        title: 'Test 2',
        message: 'Test',
        type: 'info',
      });
    });

    expect(result.current.unreadCount).toBe(2);
  });

  it('should handle multiple toasts', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.success('Success 1', 'Message 1');
      result.current.error('Error 1', 'Message 2');
      result.current.warning('Warning 1', 'Message 3');
    });

    expect(result.current.toasts.length).toBe(3);
  });

  it('should remove specific toast', () => {
    const { result } = renderHook(() => useNotificationStore());

    let toastId: string | undefined;

    act(() => {
      result.current.success('Test', 'Message');
      toastId = result.current.toasts[0]?.id;
    });

    expect(result.current.toasts.length).toBe(1);

    act(() => {
      if (toastId) {
        result.current.removeToast(toastId);
      }
    });

    expect(result.current.toasts.length).toBe(0);
  });
});
