"use client";

import * as React from "react";

import { useTheme } from "next-themes";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun
            className={`
              inline-flex size-[1.2rem] scale-100 rotate-0 transition-all
              dark:hidden dark:scale-0 dark:-rotate-90
            `}
          />
          <Moon
            className={`
              hidden size-[1.2rem] scale-0 rotate-90 transition-all
              dark:inline-flex dark:scale-100 dark:rotate-0
            `}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setTheme("light");
          }}
        >
          浅色
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setTheme("dark");
          }}
        >
          深色
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setTheme("system");
          }}
        >
          跟随系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
