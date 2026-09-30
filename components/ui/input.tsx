"use client";

import type { ComponentProps } from "react";

import { Input as BaseInput } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<typeof BaseInput>) {
  return <BaseInput className={cn("ds-input h-11 px-3.5 text-sm", className)} {...props} />;
}
