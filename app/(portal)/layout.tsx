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
      <div
        className={`
          pointer-events-none fixed inset-0 mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] bg-center
          opacity-20
        `}
      />
      <div className="pointer-events-none fixed inset-0 bg-cyber-black/50" />

      <NeonHeader />
      {children}
      <NeonFooter />
      <BackToTop />
    </>
  );
}
