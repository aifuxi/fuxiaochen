"use client";

import { ThemeProvider } from "next-themes";

import { ProgressProvider } from "@bprogress/next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { HeroUIProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/tooltip";

import { getQueryClient } from "@/lib/get-query-client";

import { ToasterComponent } from "./toast";

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
              <TooltipProvider>
                {children}
                <ToasterComponent />
              </TooltipProvider>
            </ProgressProvider>
          </HeroUIProvider>
        </ThemeProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
