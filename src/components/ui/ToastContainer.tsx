"use client";

import { useEffect } from "react";
import { useNotifications } from "@/hooks/useStores";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useNotifications();

  useEffect(() => {
    // Auto-remove toasts after their duration
    const timers: NodeJS.Timeout[] = [];
    
    toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4 md:p-6">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    action?: {
      label: string;
      onClick(): void;
    };
  };
  onClose(): void;
}

function Toast({ toast, onClose }: ToastProps) {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
    error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        "animate-in slide-in-from-right pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all",
        colors[toast.type]
      )}
    >
      <div className="flex gap-3 p-4">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message && (
            <p className="text-sm opacity-90">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                onClose();
              }}
              className="mt-2 text-sm font-medium underline underline-offset-2 hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}
