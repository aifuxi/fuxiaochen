"use client";

import type { ComponentProps } from "react";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

import "./tooltip.css";

export const Tooltip = BaseTooltip.Root;
export const TooltipProvider = BaseTooltip.Provider;
export const TooltipTrigger = BaseTooltip.Trigger;

export function TooltipContent({
  children,
  className,
  side = "top",
  sideOffset = 12,
  ...props
}: ComponentProps<typeof BaseTooltip.Popup> &
  Pick<ComponentProps<typeof BaseTooltip.Positioner>, "side" | "sideOffset">) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner
        side={side}
        sideOffset={sideOffset}
        collisionPadding={12}
        className="ds-tooltip-positioner"
      >
        <BaseTooltip.Popup className={cn("ds-tooltip", className)} {...props}>
          {children}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
