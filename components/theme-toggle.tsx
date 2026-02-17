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
          "h-12 w-32 rounded-lg border border-border bg-surface",
          className,
        )}
      />
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
        "flex items-center rounded-lg border border-border bg-surface p-1",
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
              "relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300",
              isActive
                ? "bg-accent text-white shadow-md"
                : `
                  text-text-secondary
                  hover:bg-surface/50 hover:text-text
                `,
            )}
            aria-label={`Switch to ${mode.name} theme`}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
