"use client";

import { deleteComicAction } from "@/app/actions/admin/comics";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { Trash2 } from "lucide-react";
import { redirect } from "next/navigation";

interface DeleteComicButtonProps {
  comicId: number;
}

export function DeleteComicButton({ comicId }: DeleteComicButtonProps) {
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog();

  return (
    <>
      {options && (
        <ConfirmDialog
          open={isOpen}
          onOpenChange={(open) => !open && handleCancel()}
          title={options.title}
          description={options.description}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          variant={options.variant}
          onConfirm={handleConfirm}
        />
      )}
      <Button
        variant="destructive"
        onClick={() =>
          confirm(
            {
              title: "Delete Comic",
              description:
                "Are you sure you want to delete this comic? This will also delete all associated chapters and cannot be undone.",
              confirmText: "Delete",
              cancelText: "Cancel",
              variant: "destructive",
            },
            async () => {
              const result = await deleteComicAction(comicId);
              if (result.success) {
                redirect("/admin/comics");
              }
            }
          )
        }
      >
        <Trash2 className="mr-2 size-4" />
        Delete Comic
      </Button>
    </>
  );
}
