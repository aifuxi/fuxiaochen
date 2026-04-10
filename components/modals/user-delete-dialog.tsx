"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { UserDto } from "@/lib/user/user-dto";

type UserDeleteDialogProps = NiceModalHocProps & {
  onConfirm: () => Promise<void>;
  user: UserDto;
};

export const UserDeleteDialog = NiceModal.create(({ onConfirm, user }: UserDeleteDialogProps) => {
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
        toast.error("Failed to delete user.");
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
          <DialogTitle className="text-3xl">Delete User</DialogTitle>
          <DialogDescription>
            Remove <span className="text-foreground">{user.name}</span> from the CMS. Linked accounts and active
            sessions for <span className="text-foreground">{user.email}</span> will also be removed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/8 p-4 text-sm leading-6 text-red-100">
          This action cannot be undone. Current linked accounts: {user.accountCount}. Active sessions: {user.sessionCount}.
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button disabled={isSubmitting} onClick={() => modal.remove()} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={() => void handleConfirm()} type="button" variant="destructive">
            {isSubmitting ? "Deleting..." : "Delete User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
