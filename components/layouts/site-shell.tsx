import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layouts/site-footer";
import { SiteHeader } from "@/components/layouts/site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg">
      <div
        className={`
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_top_left,rgb(16_185_129_/_0.12),transparent_24%),radial-gradient(circle_at_80%_10%,rgb(255_255_255_/_0.05),transparent_18%)]
        `}
      />
      <SiteHeader />
      <main className="relative z-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
