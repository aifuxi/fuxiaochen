"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { TagDto } from "@/lib/tag/tag-dto";

type TagDeleteDialogProps = NiceModalHocProps & {
  onConfirm: () => Promise<void>;
  tag: TagDto;
};

export const TagDeleteDialog = NiceModal.create(({ onConfirm, tag }: TagDeleteDialogProps) => {
  const modal = NiceModal.useModal();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);

    try {
      await onConfirm();
      modal.remove();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete tag.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={modal.visible} onOpenChange={modal.remove}>
      <DialogContent className={`
        max-w-xl rounded-[1.6rem] p-6
        sm:p-8
      `}>
        <DialogHeader>
          <DialogTitle className="text-3xl">Delete Tag</DialogTitle>
          <DialogDescription>
            Remove <span className="text-foreground">#{tag.name}</span> from the taxonomy. Articles will lose this tag
            association after deletion.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/8 p-4 text-sm leading-6 text-red-100">
          This action cannot be undone. Current usage count: {tag.usageCount}.
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button disabled={isSubmitting} onClick={() => modal.remove()} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={() => void handleConfirm()} type="button" variant="destructive">
            {isSubmitting ? "Deleting..." : "Delete Tag"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
