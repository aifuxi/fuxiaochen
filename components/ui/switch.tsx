"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as React from "react";

import { cn } from "@/lib/utils";

export const Switch = React.forwardRef<
  React.ElementRef<typeof BaseSwitch.Root>,
  React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>
>(({ className, ...props }, ref) => {
  return (
    <BaseSwitch.Root
      ref={ref}
      className={cn(
        `
          relative flex h-7 w-12 rounded-full border border-white/10 bg-white/8 p-0.5 transition-all
          data-[checked]:border-primary/30 data-[checked]:bg-primary/30
        `,
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb className={`
        size-5 rounded-full bg-white shadow-sm transition-transform
        data-[checked]:translate-x-5
      `} />
    </BaseSwitch.Root>
  );
});

Switch.displayName = "Switch";
