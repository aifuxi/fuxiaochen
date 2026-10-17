"use client";

import type { ComponentProps } from "react";

import { Popover as BasePopover } from "@base-ui/react/popover";

import { renderPopupMotion } from "@/components/motion/popup-motion";
import { cn } from "@/lib/utils";

import "./overlays.css";

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverTitle = BasePopover.Title;
export const PopoverDescription = BasePopover.Description;

export function PopoverContent({
  className,
  children,
  render,
  anchor,
  side = "bottom",
  align = "end",
  sideOffset = 12,
  collisionAvoidance,
  ...props
}: ComponentProps<typeof BasePopover.Popup> &
  Pick<
    ComponentProps<typeof BasePopover.Positioner>,
    "anchor" | "side" | "align" | "sideOffset" | "collisionAvoidance"
  >) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        anchor={anchor}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        collisionAvoidance={collisionAvoidance}
        className="z-50"
      >
        <BasePopover.Popup
          className={cn("ds-popover-popup outline-none", className)}
          render={render ?? renderPopupMotion}
          {...props}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
