import { CmsDashboardOverview } from "@/components/blocks/cms-dashboard-overview";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsDashboardPage() {
  return (
    <CmsShell description="A snapshot of publishing throughput, moderation state, and editorial system health." title="Dashboard">
      <CmsDashboardOverview />
    </CmsShell>
  );
}
