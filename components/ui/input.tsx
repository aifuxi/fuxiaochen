"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentPropsWithoutRef<typeof BaseInput> & {
  startAdornment?: React.ReactNode;
};

export const Input = React.forwardRef<React.ElementRef<typeof BaseInput>, InputProps>(
  ({ className, startAdornment, ...props }, ref) => {
    return (
      <div
        className={cn(
          `
            flex h-12 items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 text-sm transition-all
            focus-within:border-primary/60 focus-within:bg-white/7 focus-within:ring-4 focus-within:ring-primary/10
          `,
          className,
        )}
      >
        {startAdornment ? <div className="text-muted">{startAdornment}</div> : null}
        <BaseInput
          ref={ref}
          className={`
            w-full bg-transparent text-foreground outline-none
            placeholder:text-muted
          `}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";
