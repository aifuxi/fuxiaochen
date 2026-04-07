"use client";

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import * as React from "react";

import { cn } from "@/lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseSeparator>) {
  return (
    <BaseSeparator
      className={cn(
        orientation === "horizontal" ? "h-px w-full bg-white/8" : "h-full w-px bg-white/8",
        className,
      )}
      orientation={orientation}
      {...props}
    />
  );
}
