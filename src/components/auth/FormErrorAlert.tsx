"use client";

import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface FormErrorAlertProps {
  /**
   * Error message to display
   */
  message?: string;
  /**
   * Whether the alert is visible
   * @default true
   */
  visible?: boolean;
  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;
  /**
   * Delay before auto-dismissing (ms)
   * @default undefined (no auto-dismiss)
   */
  autoDismissDelay?: number;
}

/**
 * Form Error Alert Component
 * Displays validation or submission errors with dismissible alert
 *
 * @example
 * ```tsx
 * const [error, setError] = useState<string | undefined>();
 *
 * return (
 *   <>
 *     <FormErrorAlert
 *       message={error}
 *       visible={!!error}
 *       onDismiss={() => setError(undefined)}
 *       autoDismissDelay={5000}
 *     />
 *     <form>...</form>
 *   </>
 * );
 * ```
 */
export function FormErrorAlert({
  message,
  visible = true,
  onDismiss,
  autoDismissDelay,
}: FormErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(visible);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Auto-dismiss after delay
  if (autoDismissDelay && isVisible && message) {
    const timer = setTimeout(handleDismiss, autoDismissDelay);
    return () => clearTimeout(timer);
  }

  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      <AlertCircle className="mt-0.5 size-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-destructive/60 hover:text-destructive"
        aria-label="Dismiss error"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/**
 * Generic Alert Component
 * Used for success, info, and warning messages
 */
export function FormAlert({
  message,
  type = "info",
  visible = true,
  onDismiss,
  autoDismissDelay,
}: {
  message?: string;
  type?: "success" | "warning" | "info";
  visible?: boolean;
  onDismiss?: () => void;
  autoDismissDelay?: number;
}) {
  const [isVisible, setIsVisible] = useState(visible);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (autoDismissDelay && isVisible && message) {
    const timer = setTimeout(handleDismiss, autoDismissDelay);
    return () => clearTimeout(timer);
  }

  if (!isVisible || !message) {
    return null;
  }

  const typeConfig = {
    success: {
      bgColor: "bg-green-50 border-green-200",
      textColor: "text-green-900",
      icon: "✓",
    },
    warning: {
      bgColor: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-900",
      icon: "⚠",
    },
    info: {
      bgColor: "bg-blue-50 border-blue-200",
      textColor: "text-blue-900",
      icon: "ℹ",
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border ${config.bgColor} p-4 ${config.textColor}`}
    >
      <div className="mt-0.5 flex-shrink-0 text-lg">{config.icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className={`flex-shrink-0 opacity-60 hover:opacity-100`}
        aria-label="Dismiss alert"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
