"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      `
        peer h-5 w-5 shrink-0 rounded-lg border border-border bg-surface/50 shadow-sm transition-all duration-200
        hover:border-accent/30
        focus-visible:ring-4 focus-visible:ring-accent/20 focus-visible:outline-none
        disabled:cursor-not-allowed disabled:opacity-50
        data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white
      `,
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
