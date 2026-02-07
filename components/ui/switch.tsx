"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        `
          peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent shadow-sm
          transition-all duration-300 outline-none
          focus-visible:ring-4 focus-visible:ring-[var(--accent-color)]/20
          disabled:cursor-not-allowed disabled:opacity-50
          data-[state=checked]:bg-[var(--accent-color)]
          data-[state=unchecked]:bg-[var(--glass-border)]
        `,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          `
            pointer-events-none block size-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-300
            data-[state=checked]:translate-x-5
            data-[state=unchecked]:translate-x-0.5
          `,
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
