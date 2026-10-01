"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import "./input-group.css";

export function InputGroup({
  className,
  onClick,
  size = "default",
  ...props
}: ComponentProps<"div"> & { size?: "default" | "compact" }) {
  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- 外框仅代理鼠标聚焦，键盘通过原生 input 与 button 导航，不增加焦点停靠点。
    <div
      className={cn("ds-input-group", size === "compact" && "ds-control-compact", className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest("button, input, a, [role='button']")) return;
        event.currentTarget.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();
      }}
      {...props}
    />
  );
}

export function InputGroupInput({ className, ...props }: ComponentProps<typeof Input>) {
  return <Input className={cn("ds-input-group-control", className)} {...props} />;
}

export function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: ComponentProps<"div"> & { align?: "inline-start" | "inline-end" }) {
  return <div className={cn("ds-input-group-addon", className)} data-align={align} {...props} />;
}

export function InputGroupButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("ds-input-group-button", className)}
      {...props}
    />
  );
}
