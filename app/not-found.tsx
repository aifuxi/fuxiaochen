import { SiteLayout } from "@/components/site/site-layout";
import { SiteNotFoundStatus } from "@/components/site/site-not-found-status";

export default async function NotFound() {
  return (
    <SiteLayout>
      <SiteNotFoundStatus />
    </SiteLayout>
  );
}
