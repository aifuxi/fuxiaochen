"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SubscribeDialogProps = NiceModalHocProps & {
  email: string;
};

export const SubscribeDialog = NiceModal.create(
  ({ email }: SubscribeDialogProps) => {
    const modal = NiceModal.useModal();

    return (
      <Dialog open={modal.visible} onOpenChange={modal.remove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mock subscription captured</DialogTitle>
            <DialogDescription>
              The first pass stores no subscribers yet. This modal exists to
              prove the NiceModal + Base UI dialog flow for future auth and CMS
              actions.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-8 rounded-2xl border border-white/8 bg-white/4 p-5 text-sm text-muted">
            Submitted email:{" "}
            <span className="text-foreground">{email || "not provided"}</span>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => modal.remove()} variant="primary">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
