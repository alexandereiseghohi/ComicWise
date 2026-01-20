"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface CrudModalProps {
  /**
   * Modal title
   */
  title: string;
  /**
   * Modal description
   */
  description?: string;
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose(): void;
  /**
   * Modal content (form children)
   */
  children: ReactNode;
  /**
   * Submit button label
   * @default "Save"
   */
  submitLabel?: string;
  /**
   * Callback when submit is clicked
   */
  onSubmit?(e: React.FormEvent): void | Promise<void>;
  /**
   * Whether the submit button is loading
   */
  isLoading?: boolean;
  /**
   * Size of the modal
   * @default "default"
   */
  size?: "sm" | "default" | "lg" | "xl";
}

/**
 * Generic CRUD Modal Component
 * Used for create/edit/delete operations in admin panels
 *
 * @param root0
 * @param root0.title
 * @param root0.description
 * @param root0.isOpen
 * @param root0.onClose
 * @param root0.children
 * @param root0.submitLabel
 * @param root0.onSubmit
 * @param root0.isLoading
 * @param root0.size
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * return (
 *   <>
 *     <Button onClick={() => setIsOpen(true)}>Create Comic</Button>
 *
 *     <CrudModal
 *       title="Create Comic"
 *       description="Add a new comic to the database"
 *       isOpen={isOpen}
 *       onClose={() => setIsOpen(false)}
 *       onSubmit={handleSubmit}
 *     >
 *
 *     </CrudModal>
 *   </>
 * );
 * ```
 */
export function CrudModal({
  title,
  description,
  isOpen,
  onClose,
  children,
  submitLabel = "Save",
  onSubmit,
  isLoading = false,
  size = "default",
}: CrudModalProps) {
  const sizeClasses = {
    sm: "max-w-md",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      try {
        await onSubmit(e);
      } catch (error) {
        console.error("Modal submission error:", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {children}

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Confirmation Modal for dangerous actions
 * Used for delete confirmations
 * @param root0
 * @param root0.title
 * @param root0.description
 * @param root0.isOpen
 * @param root0.onClose
 * @param root0.onConfirm
 * @param root0.isLoading
 * @param root0.isDangerous
 * @param root0.confirmLabel
 */
export function ConfirmationModal({
  title,
  description,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  isDangerous = true,
  confirmLabel = "Confirm",
}: {
  title: string;
  description: string;
  isOpen: boolean;
  onClose(): void;
  onConfirm(): void | Promise<void>;
  isLoading?: boolean;
  isDangerous?: boolean;
  confirmLabel?: string;
}) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Confirmation error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDangerous ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && (
              <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
