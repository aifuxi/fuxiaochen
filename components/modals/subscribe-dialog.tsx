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
            <DialogTitle>模拟订阅已捕获</DialogTitle>
            <DialogDescription>
              首个版本不存储任何订阅者。此弹窗用于验证 NiceModal + Base UI
              弹窗流程，为后续的认证和 CMS 操作做准备。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-8 rounded-2xl border border-white/8 bg-white/4 p-5 text-sm text-muted">
            提交的邮箱：{" "}
            <span className="text-foreground">{email || "未提供"}</span>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => modal.remove()} variant="primary">
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
