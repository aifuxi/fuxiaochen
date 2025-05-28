"use client";

import * as React from "react";

import { ThemeProvider, ThemeProviderProps } from "next-themes";

export function NextThemesProvider({ children, ...props }: ThemeProviderProps) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
