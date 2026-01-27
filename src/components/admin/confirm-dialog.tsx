import React from "react";

type Props = {
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: string;
};

export const ConfirmDialog: React.FC<Props> = ({
  title,
  description,
  onConfirm,
  onCancel,
  children,
  open,
  onOpenChange,
  confirmText,
  cancelText,
}) => {
  return (
    <div>
      {children}
      <div style={{ display: "none" }}>
        <h3>{title}</h3>
        <p>{description}</p>
        <button onClick={onConfirm}>{confirmText ?? "Confirm"}</button>
        <button onClick={onCancel}>{cancelText ?? "Cancel"}</button>
      </div>
    </div>
  );
};

export default ConfirmDialog;
