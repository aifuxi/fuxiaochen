"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof BaseCheckbox.Root>,
  React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>
>(({ className, ...props }, ref) => {
  return (
    <BaseCheckbox.Root
      ref={ref}
      className={cn(
        `
          flex size-5 items-center justify-center rounded-md border border-white/14 bg-white/5 text-primary
          transition-all outline-none
          data-[checked]:border-primary/40 data-[checked]:bg-primary/18
        `,
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator>
        <Check className="size-3.5" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
});

Checkbox.displayName = "Checkbox";
