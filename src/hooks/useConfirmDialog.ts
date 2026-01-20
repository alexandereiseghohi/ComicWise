"use client";

import { useCallback, useState } from "react";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm(): void | Promise<void>;
  onCancel?(): void;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (options?.onConfirm) {
      await options.onConfirm();
    }
    setIsOpen(false);
    setOptions(null);
  }, [options]);

  const handleCancel = useCallback(() => {
    if (options?.onCancel) {
      options.onCancel();
    }
    setIsOpen(false);
    setOptions(null);
  }, [options]);

  return {
    confirm,
    isOpen,
    options,
    handleConfirm,
    handleCancel,
    close: () => {
      setIsOpen(false);
      setOptions(null);
    },
  };
}
