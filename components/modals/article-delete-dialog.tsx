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
import type { ArticleListItemDto } from "@/lib/article/article-dto";

type ArticleDeleteDialogProps = NiceModalHocProps & {
  article: ArticleListItemDto;
  onConfirm: () => Promise<void>;
};

export const ArticleDeleteDialog = NiceModal.create(
  ({ article, onConfirm }: ArticleDeleteDialogProps) => {
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
          toast.error("删除文章失败。");
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
            <DialogTitle className="text-3xl">删除文章</DialogTitle>
            <DialogDescription>
              从 CMS 中移除 <span className="text-foreground">{article.title}</span>。
              此操作同时会移除相关的标签关联和版本记录。
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/8 p-4 text-sm leading-6 text-red-100">
            此操作无法撤销。Slug: {article.slug}
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
              {isSubmitting ? "删除中..." : "删除文章"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
