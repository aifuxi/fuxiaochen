"use client";

import { useTheme } from "next-themes";

import { Bell, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const { setTheme, theme } = useTheme();

  return (
    <header className="glass-panel relative z-20 flex h-16 items-center justify-between border-b border-white/10 px-6">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-xl tracking-wider text-white">
          <span className="mr-2 text-neon-purple">/</span>
          Dashboard
        </h1>
        {/* Breadcrumb-like decorative path */}
        <div
          className={`
            hidden items-center gap-2 font-mono text-xs text-gray-500
            md:flex
          `}
        >
          <span>root</span>
          <span>&gt;</span>
          <span className="text-neon-cyan">admin</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={`
            group relative text-gray-400
            hover:bg-white/5 hover:text-neon-cyan
          `}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 animate-pulse rounded-full bg-neon-magenta" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={`
            text-gray-400
            hover:bg-white/5 hover:text-neon-cyan
          `}
        >
          <Sun
            className={`
              h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all
              dark:scale-0 dark:-rotate-90
            `}
          />
          <Moon
            className={`
              absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all
              dark:scale-100 dark:rotate-0
            `}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
