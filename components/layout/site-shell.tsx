import { SiteEffects } from "@/components/layout/site-effects";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteEffects />
      <SiteHeader />
      <main className="pt-24 pb-20">{children}</main>
      <SiteFooter />
    </div>
  );
}
