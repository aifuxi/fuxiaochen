"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/72 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <BaseDialog.Popup
          className={cn(
            `
              relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-zinc-950/96 p-8
              shadow-[0_30px_120px_rgba(0,0,0,0.55)] card-surface outline-none
            `,
            className,
          )}
          {...props}
        >
          {children}
          <BaseDialog.Close className={`
            absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/6 text-muted
            transition-colors
            hover:bg-white/10 hover:text-foreground
          `}>
            <X className="size-4" />
          </BaseDialog.Close>
        </BaseDialog.Popup>
      </div>
    </BaseDialog.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseDialog.Title>) {
  return <BaseDialog.Title className={cn("font-serif text-4xl tracking-[-0.05em]", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Description>) {
  return <BaseDialog.Description className={cn("text-sm leading-6 text-muted", className)} {...props} />;
}
