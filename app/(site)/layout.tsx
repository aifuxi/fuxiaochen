import { SiteShell } from "@/components/layout/site-shell";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
