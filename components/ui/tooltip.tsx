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
          <BaseTooltip.Arrow className="ds-tooltip-arrow" aria-hidden="true">
            {/* 沿用 Semi 的圆弧箭头轮廓，由 Base UI 处理方向和锚点定位。 */}
            <svg className="ds-tooltip-arrow-horizontal" width="24" height="7" viewBox="0 0 24 7">
              <path d="M24 0V1C20 1 18.5 2 16.5 4C14.5 6 14 7 12 7C10 7 9.5 6 7.5 4C5.5 2 4 1 0 1V0H24Z" />
            </svg>
            <svg className="ds-tooltip-arrow-vertical" width="7" height="24" viewBox="0 0 7 24">
              <path d="M0 0L1 0C1 4 2 5.5 4 7.5S7 10 7 12S6 14.5 4 16.5S1 20 1 24L0 24L0 0Z" />
            </svg>
          </BaseTooltip.Arrow>
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
