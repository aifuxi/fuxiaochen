import { SiteLayout } from "@/components/site/site-layout";

export default function SiteRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
