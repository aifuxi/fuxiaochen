"use client";

import React from "react";
import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserDto } from "@/lib/user/user-dto";

type UserDeleteDialogProps = NiceModalHocProps & {
  onConfirm: () => Promise<void>;
  user: UserDto;
};

export const UserDeleteDialog = NiceModal.create(
  ({ onConfirm, user }: UserDeleteDialogProps) => {
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
          toast.error("删除用户失败。");
        }
      } finally {
        setIsSubmitting(false);
      }
    }

    return (
      <Dialog open={modal.visible} onOpenChange={modal.remove}>
        <DialogContent
          className={`
            max-w-xl rounded-4xl p-6
            sm:p-8
          `}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl">删除用户</DialogTitle>
            <DialogDescription>
              从 CMS 中移除 <span className="text-foreground">{user.name}</span>。
              <span className="text-foreground">{user.email}</span> 的关联账号和活跃会话也将被移除。
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/8 p-4 text-sm leading-6 text-red-100">
            此操作无法撤销。当前关联账号：{user.accountCount}。活跃会话：{user.sessionCount}。
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button
              disabled={isSubmitting}
              onClick={() => modal.remove()}
              type="button"
              variant="outline"
            >
              取消
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() => void handleConfirm()}
              type="button"
              variant="destructive"
            >
              {isSubmitting ? "删除中..." : "删除用户"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
