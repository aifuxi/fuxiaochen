"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FriendLinkDto } from "@/lib/friend-link/friend-link-dto";

type FriendLinkDeleteDialogProps = NiceModalHocProps & {
  friendLink: FriendLinkDto;
  onConfirm: () => Promise<void>;
};

export const FriendLinkDeleteDialog = NiceModal.create(
  ({ friendLink, onConfirm }: FriendLinkDeleteDialogProps) => {
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
          toast.error("Failed to delete friend link.");
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
            <DialogTitle className="text-3xl">Delete Friend Link</DialogTitle>
            <DialogDescription>
              Remove <span className="text-foreground">{friendLink.siteName}</span> from the friends directory.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/8 p-4 text-sm leading-6 text-red-100">
            This action cannot be undone. URL: {friendLink.siteUrl}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button disabled={isSubmitting} onClick={() => modal.remove()} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={() => void handleConfirm()} type="button" variant="destructive">
              {isSubmitting ? "Deleting..." : "Delete Friend Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
