"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function NeonSwitch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        `
          peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-all
          duration-300
          focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2
          focus-visible:ring-offset-black focus-visible:outline-none
          disabled:cursor-not-allowed disabled:opacity-50
          data-[state=checked]:border-neon-cyan data-[state=checked]:bg-neon-cyan/10
          data-[state=checked]:shadow-[0_0_10px_rgba(0,255,255,0.3)]
          data-[state=unchecked]:border-white/20 data-[state=unchecked]:bg-black/40
        `,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          `
            pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform duration-300
            data-[state=checked]:translate-x-5 data-[state=checked]:bg-neon-cyan
            data-[state=checked]:shadow-[0_0_10px_#00ffff]
            data-[state=unchecked]:translate-x-1 data-[state=unchecked]:bg-gray-400
          `,
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { NeonSwitch };
