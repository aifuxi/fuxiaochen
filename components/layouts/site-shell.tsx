import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layouts/site-footer";
import { SiteHeader } from "@/components/layouts/site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-page relative min-h-screen overflow-x-clip bg-bg pt-24">
      <div className="morph-blob morph-blob-1" />
      <div className="morph-blob morph-blob-2" />
      <div className="morph-blob morph-blob-3" />
      <SiteHeader />
      <main className="relative z-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
