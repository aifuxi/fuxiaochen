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
import type { CommentDto } from "@/lib/comment/comment-dto";

type CommentDeleteDialogProps = NiceModalHocProps & {
  comment: CommentDto;
  onConfirm: () => Promise<void>;
};

export const CommentDeleteDialog = NiceModal.create(
  ({ comment, onConfirm }: CommentDeleteDialogProps) => {
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
          toast.error("删除评论失败。");
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
            <DialogTitle className="text-3xl">删除评论</DialogTitle>
            <DialogDescription>
              从审核队列中移除 <span className="text-foreground">{comment.authorName}</span> 的评论。
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/8 p-4 text-sm leading-6 text-red-100">
            此操作无法撤销。文章：{comment.article.title}
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
              {isSubmitting ? "删除中..." : "删除评论"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
