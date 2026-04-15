"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as React from "react";

import { cn } from "@/lib/utils";

export const switchRootClassName =
  "relative flex h-7 w-12 rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-0.5 transition-all data-[checked]:border-primary/30";
export const switchThumbClassName =
  "size-5 rounded-[10px] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] shadow-sm transition-transform data-[checked]:translate-x-5 data-[checked]:border-primary/30";

export const Switch = React.forwardRef<
  React.ElementRef<typeof BaseSwitch.Root>,
  React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>
>(({ className, ...props }, ref) => {
  return (
    <BaseSwitch.Root
      ref={ref}
      className={cn(switchRootClassName, className)}
      {...props}
    >
      <BaseSwitch.Thumb className={switchThumbClassName} />
    </BaseSwitch.Root>
  );
});

Switch.displayName = "Switch";
