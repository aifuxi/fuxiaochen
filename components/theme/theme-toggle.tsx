"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useTheme } from "./theme-provider";

export function ThemeToggle({
  className,
  size = "compact",
  variant = "ghost",
  showLabel = false,
}: {
  className?: string;
  size?: "sm" | "compact" | "form";
  variant?: "ghost" | "secondary";
  showLabel?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const label = theme === "dark" ? "切换到浅色模式" : "切换到深色模式";
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("theme-toggle", !showLabel && "theme-toggle-icon", className)}
      aria-label={label}
      title={label}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
      {showLabel && (theme === "dark" ? "浅色" : "深色")}
    </Button>
  );
}
