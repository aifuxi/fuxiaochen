"use client";

import { useState } from "react";

import NiceModal from "@ebay/nice-modal-react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type AdminConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  title: string;
};

export const AdminConfirmDialog = NiceModal.create(
  ({
    cancelLabel = "取消",
    confirmLabel = "确认删除",
    description,
    onConfirm,
    title,
  }: AdminConfirmDialogProps) => {
    const modal = NiceModal.useModal();
    const [isConfirming, setIsConfirming] = useState(false);

    async function handleConfirm() {
      setIsConfirming(true);

      try {
        await onConfirm();
        modal.remove();
      } catch {
        setIsConfirming(false);
      }
    }

    return (
      <AlertDialog
        open={modal.visible}
        onOpenChange={(open) => {
          if (!open && !isConfirming) {
            modal.remove();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirming}>
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                disabled={isConfirming}
                onClick={(event) => {
                  event.preventDefault();
                  void handleConfirm();
                }}
              >
                {isConfirming && <Loader2 className="animate-spin" />}
                {confirmLabel}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);

export function showAdminConfirmDialog(options: AdminConfirmDialogProps) {
  return NiceModal.show(AdminConfirmDialog, options);
}
