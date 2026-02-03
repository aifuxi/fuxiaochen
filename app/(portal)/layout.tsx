import { BackToTop } from "@/components/cyberpunk/back-to-top";
import { NeonFooter } from "@/components/cyberpunk/neon-footer";
import { NeonHeader } from "@/components/cyberpunk/neon-header";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NeonHeader />
      {children}
      <NeonFooter />
      <BackToTop />
    </>
  );
}
