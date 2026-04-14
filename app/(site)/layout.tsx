import { BackToTop } from "@/components/ui/back-to-top";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="pt-[var(--header-height)]">{children}</div>
      <Footer />
      <BackToTop />
    </>
  );
}
