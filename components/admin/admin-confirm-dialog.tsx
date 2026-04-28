"use client";

import { useState } from "react";

import NiceModal from "@ebay/nice-modal-react";

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
import { Spinner } from "@/components/ui/spinner";

type AdminConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  title: string;
};

export const AdminConfirmDialog = NiceModal.create(
  ({
    cancelLabel = "取消",
    confirmLabel = "确认删除",
    confirmingLabel = "处理中...",
    description,
    onConfirm,
    title,
  }: AdminConfirmDialogProps) => {
    const modal = NiceModal.useModal();
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    async function handleConfirm() {
      setIsConfirming(true);
      setConfirmError(null);

      try {
        await onConfirm();
        modal.remove();
      } catch (error) {
        setConfirmError(
          error instanceof Error ? error.message : "操作失败，请稍后重试",
        );
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
            {confirmError ? (
              <p className="text-sm text-destructive">{confirmError}</p>
            ) : null}
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
                {isConfirming ? <Spinner data-icon="inline-start" /> : null}
                {isConfirming ? confirmingLabel : confirmLabel}
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
