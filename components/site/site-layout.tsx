import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import { getCachedSiteSettings } from "@/lib/server/settings/service";
import type { SiteSettings } from "@/lib/settings/types";

export type SiteLayoutProps = {
  children: React.ReactNode;
  settings?: SiteSettings;
};

export async function SiteLayout({
  children,
  settings: initialSettings,
}: SiteLayoutProps) {
  const settings = initialSettings ?? (await getCachedSiteSettings()).settings;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar settings={settings} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} />
    </div>
  );
}
