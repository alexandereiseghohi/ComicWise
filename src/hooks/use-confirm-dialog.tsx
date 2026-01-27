import { useCallback, useRef, useState } from "react";

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: string;
};

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | undefined>(undefined);
  const pendingRef = useRef<((v: boolean) => void) | null>(null);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      pendingRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    try {
      options?.onConfirm?.();
      pendingRef.current?.(true);
    } finally {
      pendingRef.current = null;
      setOpen(false);
      setOptions(undefined);
    }
  }, [options]);

  const handleCancel = useCallback(() => {
    try {
      options?.onCancel?.();
      pendingRef.current?.(false);
    } finally {
      pendingRef.current = null;
      setOpen(false);
      setOptions(undefined);
    }
  }, [options]);

  return {
    confirm,
    isOpen: open,
    open,
    show,
    hide,
    options,
    handleConfirm,
    handleCancel,
  };
}

export default useConfirmDialog;
