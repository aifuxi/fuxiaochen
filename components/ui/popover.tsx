"use client";

import type { ComponentProps } from "react";

import { Popover as BasePopover } from "@base-ui/react/popover";

import { renderPopupMotion } from "@/components/motion/popup-motion";
import { cn } from "@/lib/utils";

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverTitle = BasePopover.Title;
export const PopoverDescription = BasePopover.Description;

export function PopoverContent({
  className,
  children,
  render,
  ...props
}: ComponentProps<typeof BasePopover.Popup>) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner align="end" sideOffset={12} collisionPadding={12} className="z-50">
        <BasePopover.Popup
          className={cn(
            "ds-popover-popup rounded-[var(--radius-lg)] bg-[var(--color-surface)] outline-none",
            className,
          )}
          render={render ?? renderPopupMotion}
          {...props}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
