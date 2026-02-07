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
          `
            h-9 w-24 rounded-full bg-gray-100
            dark:bg-gray-800
          `,
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
        "glass-panel flex items-center rounded-full p-1",
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
              `
                relative flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all duration-300
                hover:text-[var(--text-color)]
              `,
              isActive &&
                `
                  bg-white text-black shadow-sm
                  dark:bg-[var(--accent-color)] dark:text-white
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
