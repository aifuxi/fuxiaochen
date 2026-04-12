import { SiteEffects } from "@/components/layout/site-effects";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteEffects />
      <SiteHeader />
      <main className="pt-12 pb-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
