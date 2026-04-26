import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import { settingsService } from "@/lib/server/settings/service";

export type SiteLayoutProps = {
  children: React.ReactNode;
};

export async function SiteLayout({ children }: SiteLayoutProps) {
  const { settings } = await settingsService.getSettings();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar settings={settings} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} />
    </div>
  );
}
