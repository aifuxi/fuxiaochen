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
          "h-12 w-32 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)]",
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
        "glass-panel flex items-center rounded-full border-[var(--glass-border)] p-1",
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
                ? "bg-[var(--accent-color)] text-white shadow-md"
                : `
                  text-[var(--text-color-secondary)]
                  hover:bg-[var(--glass-bg)]/50 hover:text-[var(--text-color)]
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
