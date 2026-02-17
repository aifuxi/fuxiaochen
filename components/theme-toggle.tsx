"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex h-9 items-center gap-1 rounded-lg border border-border bg-surface px-1",
          className,
        )}
      >
        <div className="h-7 w-7 rounded-md bg-surface-hover" />
        <div className="h-7 w-7 rounded-md bg-surface-hover" />
        <div className="h-7 w-7 rounded-md bg-surface-hover" />
      </div>
    );
  }

  const modes = [
    { name: "light", icon: Sun },
    { name: "system", icon: Monitor },
    { name: "dark", icon: Moon },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-border bg-surface px-1",
        className,
      )}
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = theme === mode.name;

        return (
          <button
            key={mode.name}
            onClick={() => setTheme(mode.name)}
            className={cn(
              `flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200`,
              isActive
                ? "bg-accent text-white"
                : `
                  text-text-secondary
                  hover:bg-surface-hover hover:text-text
                `,
            )}
            aria-label={`Switch to ${mode.name} theme`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
