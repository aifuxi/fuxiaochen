"use client";

import { ThemeProvider } from "next-themes";

import { ProgressProvider } from "@bprogress/next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { HeroUIProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HeroUIProvider>
            <ProgressProvider
              height="3px"
              color="var(--primary)"
              options={{ showSpinner: true }}
              shallowRouting
            >
              {children}
            </ProgressProvider>
          </HeroUIProvider>
        </ThemeProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
