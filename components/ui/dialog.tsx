"use client";

import type { ComponentProps } from "react";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

import "./overlays.css";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogTitle({ className, ...props }: ComponentProps<typeof BaseDialog.Title>) {
  return <BaseDialog.Title className={cn("ds-dialog-title", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Description>) {
  return <BaseDialog.Description className={cn("ds-dialog-description", className)} {...props} />;
}

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
      <BaseDialog.Backdrop className="ds-dialog-backdrop fixed inset-0 z-50" />
      <BaseDialog.Viewport
        className={cn(
          "fixed inset-0 z-50 flex",
          placement === "right" ? "items-stretch justify-end" : "items-center justify-center p-5",
        )}
      >
        <BaseDialog.Popup
          className={cn("ds-dialog-popup w-full max-w-md p-6 outline-none", className)}
          {...props}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}
