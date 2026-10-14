"use client";

import type { ComponentProps } from "react";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;
export const DialogTitle = BaseDialog.Title;
export const DialogDescription = BaseDialog.Description;

export function DialogContent({
  className,
  children,
  placement = "center",
  portalClassName,
  ...props
}: ComponentProps<typeof BaseDialog.Popup> & {
  placement?: "center" | "right";
  /** 为浮层整体提供局部样式作用域，不改变默认挂载位置。 */
  portalClassName?: string;
}) {
  return (
    <BaseDialog.Portal className={portalClassName}>
      <BaseDialog.Backdrop className="ds-dialog-backdrop fixed inset-0 z-50 bg-black/70 backdrop-blur-[3px]" />
      <BaseDialog.Viewport
        className={cn(
          "fixed inset-0 z-50 flex",
          placement === "right" ? "items-stretch justify-end" : "items-center justify-center p-5",
        )}
      >
        <BaseDialog.Popup
          className={cn(
            "ds-dialog-popup w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}
