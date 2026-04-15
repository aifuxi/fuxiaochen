"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

export const inputFrameClassName =
  "flex h-12 items-center gap-3 rounded-xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-4 text-sm transition-all focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10";

type InputProps = React.ComponentPropsWithoutRef<typeof BaseInput> & {
  startAdornment?: React.ReactNode;
};

export const Input = React.forwardRef<
  React.ElementRef<typeof BaseInput>,
  InputProps
  >(({ className, startAdornment, ...props }, ref) => {
  return (
    <div
      className={cn(inputFrameClassName, className)}
    >
      {startAdornment ? (
        <div className="text-muted">{startAdornment}</div>
      ) : null}
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
});

Input.displayName = "Input";
