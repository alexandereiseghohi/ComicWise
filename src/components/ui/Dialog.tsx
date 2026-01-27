import React from "react";

// Lightweight, well-typed placeholders for Dialog primitives used across the app.
// They intentionally do not implement modal behavior — they only provide the
// expected component shapes and props so the app can type-check and render.

export interface DialogProps {
  open?: boolean;
  onOpenChange?(open: boolean): void;
  children?: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ children }) => <>{children}</>;
export const DialogTrigger: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <>{children}</>
);
export const DialogContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
}) => <>{children}</>;
export const DialogHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
}) => <>{children}</>;
export const DialogFooter: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
}) => <>{children}</>;
export const DialogTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
}) => <>{children}</>;
export const DialogDescription: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
}) => <>{children}</>;
export const DialogClose: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <>{children}</>;

export default Dialog;
