import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export type SiteLayoutProps = {
  children: React.ReactNode;
};

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
