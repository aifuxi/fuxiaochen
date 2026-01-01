"use client";

import * as React from "react";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

import { useTheme } from "@/hooks/use-theme";

export function ModeToggle({
  variant,
}: {
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { toggleTheme } = useTheme();

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX: x, clientY: y } = event;
    toggleTheme({ x, y });
  };

  return (
    <>
      <Button
        variant={variant ?? "outline"}
        size="icon"
        onClick={handleThemeToggle}
      >
        <HugeiconsIcon
          icon={Sun03Icon}
          className={`
            inline-flex size-[1.2rem] scale-100 rotate-0 transition-all
            dark:hidden dark:scale-0 dark:-rotate-90
          `}
        />
        <HugeiconsIcon
          icon={Moon02Icon}
          className={`
            hidden size-[1.2rem] scale-0 rotate-90 transition-all
            dark:inline-flex dark:scale-100 dark:rotate-0
          `}
        />
      </Button>
    </>
  );
}
