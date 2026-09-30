"use client";

import type { ComponentProps } from "react";

import { Input as BaseInput } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<typeof BaseInput>) {
  return (
    <BaseInput className={cn("ds-input h-10 rounded-lg px-3 text-sm", className)} {...props} />
  );
}
