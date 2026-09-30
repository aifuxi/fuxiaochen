"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import "./color-input.css";

export function ColorInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return <input {...props} type="color" className={cn("ds-color-input", className)} />;
}
