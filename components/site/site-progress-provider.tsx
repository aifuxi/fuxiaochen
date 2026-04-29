"use client";

import { ProgressProvider } from "@bprogress/next/app";

type SiteProgressProviderProps = {
  children: React.ReactNode;
};

export function SiteProgressProvider({ children }: SiteProgressProviderProps) {
  return (
    <ProgressProvider
      height="2px"
      color="var(--foreground)"
      options={{ showSpinner: false }}
      delay={180}
      stopDelay={100}
      disableSameURL
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
