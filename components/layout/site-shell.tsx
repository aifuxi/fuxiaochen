import { SiteFooter } from "@/components/layout/site-footer";
import { SiteEffects } from "@/components/layout/site-effects";
import { SiteHeader } from "@/components/layout/site-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="morph-blob top-20 left-0 h-72 w-72 bg-primary/10" />
      <div className="morph-blob right-8 bottom-16 h-80 w-80 bg-primary/8" />
      <SiteEffects />
      <SiteHeader />
      <main className="pt-12 pb-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
